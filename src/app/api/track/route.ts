import { NextResponse } from 'next/server'
import { append } from '@/lib/analytics/store'
import {
  isEventType,
  normalizePath,
  randomId,
  sanitizeProps,
  type AnalyticsEvent,
  type DeviceKind,
} from '@/lib/analytics/events'

/**
 * The one endpoint the site writes to.
 *
 * It is deliberately unauthenticated — every visitor has to be able to post a
 * pageview — so it treats its input as hostile: known event types only, capped
 * string lengths, a server-stamped timestamp, and a per-IP ceiling so nobody
 * can inflate the dashboard or fill the disk.
 *
 * `lms_login` is the exception: it claims something the browser cannot know, so
 * it is only accepted from a caller holding LMS_WEBHOOK_SECRET.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT = 120
const RATE_WINDOW_MS = 60_000

const buckets = new Map<string, { count: number; start: number }>()

function overLimit(ip: string, now: number): boolean {
  const bucket = buckets.get(ip)
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    buckets.set(ip, { count: 1, start: now })
    // Keep the map from growing without bound on a busy day.
    if (buckets.size > 5000) {
      for (const [key, value] of buckets) {
        if (now - value.start > RATE_WINDOW_MS) buckets.delete(key)
      }
    }
    return false
  }
  bucket.count++
  return bucket.count > RATE_LIMIT
}

function deviceFrom(userAgent: string | null): DeviceKind {
  if (!userAgent) return 'desktop'
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return 'tablet'
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

const clientIp = (headers: Headers) =>
  headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'local'

/** Ids are ours; anything else is treated as a stranger's. */
const safeId = (value: unknown): string | null =>
  typeof value === 'string' && /^[a-f0-9]{8,40}$/.test(value) ? value : null

export async function POST(request: Request) {
  const now = Date.now()
  const ip = clientIp(request.headers)

  if (overLimit(ip, now)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ ok: false, error: 'bad_payload' }, { status: 400 })
  }

  const input = payload as Record<string, unknown>
  if (!isEventType(input.type)) {
    return NextResponse.json({ ok: false, error: 'unknown_type' }, { status: 400 })
  }

  // A browser can say it clicked a link to the LMS. Only the LMS can say
  // somebody actually signed in there.
  if (input.type === 'lms_login') {
    const secret = process.env.LMS_WEBHOOK_SECRET
    const offered = request.headers.get('x-skeo-key')
    if (!secret || offered !== secret) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }
  }

  const event: AnalyticsEvent = {
    id: randomId(),
    type: input.type,
    // Stamped here, never by the client: a wrong clock on one laptop would
    // otherwise drop events into the wrong day, or the far future.
    at: now,
    visitorId: safeId(input.visitorId) ?? `anon-${randomId().slice(0, 8)}`,
    sessionId: safeId(input.sessionId) ?? '',
    path: normalizePath(input.path),
    referrer: typeof input.referrer === 'string' ? input.referrer.slice(0, 300) : undefined,
    device: deviceFrom(request.headers.get('user-agent')),
    props: sanitizeProps(input.props),
  }

  try {
    await append(event)
  } catch {
    // A failed write must not break the page that sent it.
    return NextResponse.json({ ok: false, error: 'store_unavailable' }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
