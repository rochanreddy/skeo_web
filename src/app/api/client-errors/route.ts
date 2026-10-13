import { saveClientError } from '@/lib/clientErrors'

/**
 * POST /api/client-errors — the page reports a verify or checkout failure
 * (src/lib/friendlyError). Public by necessity, so it takes only short,
 * known-shape fields and is rate-limited per address: a script can't flood
 * the collection, and a buyer stuck in a retry loop is logged a few times,
 * not a few hundred.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LIMIT = 20
const WINDOW_MS = 10 * 60_000
const hits = new Map<string, { n: number; at: number }>()
function limited(ip: string) {
  const now = Date.now()
  // Keep the map from growing one entry per visitor for the life of the process.
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.at > WINDOW_MS) hits.delete(k)
  const h = hits.get(ip)
  if (!h || now - h.at > WINDOW_MS) {
    hits.set(ip, { n: 1, at: now })
    return false
  }
  h.n += 1
  return h.n > LIMIT
}

const STAGES = new Set(['verify', 'order', 'payment'])
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return new Response(null, { status: 429 })
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const stage = str(b?.stage, 20)
  if (!b || !STAGES.has(stage)) return new Response(null, { status: 400 })
  const doc = {
    stage,
    code: str(b.code, 40),
    message: str(b.message, 300),
    status: Number.isInteger(b.status) ? (b.status as number) : null,
    page: str(b.page, 200),
    userAgent: str(request.headers.get('user-agent'), 200),
  }
  // Also in the Vercel log, beside the server's own errors.
  console.warn(`[client-error] ${doc.stage}/${doc.code} ${doc.page}: ${doc.message}`)
  try {
    await saveClientError(doc)
  } catch (err) {
    console.error('[client-error] save failed', err)
  }
  return new Response(null, { status: 204 })
}
