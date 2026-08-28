/**
 * The vocabulary the site and the admin dashboard share.
 *
 * Everything the dashboard reports is derived from these events and nothing
 * else, so adding a metric starts here: name the moment, emit it from the
 * component that owns that moment, then aggregate it in `aggregate.ts`.
 *
 * This module is imported by both the browser and the server, so it holds
 * types and validation only — no `fs`, no React.
 */

export const EVENT_TYPES = [
  /** A page was opened. The one event the whole traffic column is built on. */
  'pageview',
  /** Account created from the auth dialog. */
  'signup',
  /** Signed back in from the auth dialog. */
  'signin',
  /** A module was ticked on the pricing card — the earliest buying signal. */
  'module_add',
  /** …and un-ticked again. Kept so "added" reflects real intent, not fidgeting. */
  'module_remove',
  /** "Next" pressed on the cart: they have chosen and want to proceed. */
  'checkout_intent',
  /** A one-time code was requested. */
  'verify_sent',
  /** …and accepted. */
  'verify_ok',
  /** /checkout was rendered with a live cart. */
  'checkout_view',
  /** Payment succeeded. Carries the order id, the modules and the amount. */
  'purchase',
  /** A buyer clicked through to the LMS from the thank-you page. */
  'lms_open',
  /**
   * A real sign-in inside the LMS, reported by the LMS itself over
   * POST /api/track with the shared key. Until that is wired up the dashboard
   * falls back to `lms_open`, and says so.
   */
  'lms_login',
  /** A buyer told us which module they want next. */
  'next_interest',
  /** The all-access / teams enquiry form was submitted. */
  'lead',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export type DeviceKind = 'mobile' | 'tablet' | 'desktop'

/** Values a component may attach to an event. Deliberately flat and small. */
export type EventProps = Record<string, string | number | boolean | string[] | undefined>

export type AnalyticsEvent = {
  id: string
  type: EventType
  /** Epoch ms, stamped by the server so a wrong client clock cannot skew a day. */
  at: number
  /** Anonymous, first-party, survives across sessions. Not tied to an identity. */
  visitorId: string
  /** Resets when the tab is closed — what "sessions" counts. */
  sessionId: string
  path?: string
  referrer?: string
  device?: DeviceKind
  props?: EventProps
  /** Set only by the seeder, so demo rows can be shown apart and thrown away. */
  demo?: boolean
}

/** What a client is allowed to send; the server fills in the rest. */
export type IncomingEvent = {
  type: string
  visitorId?: string
  sessionId?: string
  path?: string
  referrer?: string
  props?: EventProps
}

const TYPE_SET = new Set<string>(EVENT_TYPES)

export const isEventType = (value: unknown): value is EventType =>
  typeof value === 'string' && TYPE_SET.has(value)

/** Ids we mint client-side; short, opaque and not derived from anything personal. */
export function randomId(): string {
  const bytes = new Uint8Array(9)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Trims anything a caller sends to what the store will keep: known keys, scalar
 * values, capped lengths. Stops a stray object or a runaway string from ending
 * up on disk.
 */
export function sanitizeProps(input: unknown): EventProps | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return undefined
  const out: EventProps = {}
  let kept = 0
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (kept >= 12) break
    if (key.length > 40) continue
    if (typeof value === 'string') {
      out[key] = value.slice(0, 200)
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value
    } else if (typeof value === 'boolean') {
      out[key] = value
    } else if (Array.isArray(value)) {
      const items = value.filter((v): v is string => typeof v === 'string').slice(0, 12)
      if (items.length === 0) continue
      out[key] = items.map((v) => v.slice(0, 60))
    } else {
      continue
    }
    kept++
  }
  return kept > 0 ? out : undefined
}

/** Query-strings and hashes are noise in a "top pages" table, so they go. */
export function normalizePath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined
  const clean = value.split('?')[0].split('#')[0]
  return clean.length > 1 ? clean.replace(/\/+$/, '') || '/' : '/'
}

/** Referrers collapse to a host — a full URL tells the dashboard nothing extra. */
export function referrerSource(referrer: string | undefined, selfHost?: string): string {
  if (!referrer) return 'Direct'
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (!host || (selfHost && host === selfHost.replace(/^www\./, ''))) return 'Direct'
    return host
  } catch {
    return 'Direct'
  }
}
