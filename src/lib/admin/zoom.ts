/**
 * Zoom Server-to-Server OAuth + past-meeting reports — menler's
 * server/utils/zoom.js, for skeo's own Zoom account. Server-only.
 *
 * Env: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and ZOOM_USER_ID
 * (the email of the Zoom user who hosts the classes). The app needs the
 * report:read:admin scope, and the account must be on a paid plan — the
 * /report endpoints answer 400 on free, whatever the scopes say.
 */

/* Overridable only so the tests can stand in for Zoom; production leaves them unset. */
const API = process.env.ZOOM_API_BASE || 'https://api.zoom.us/v2'
const OAUTH = process.env.ZOOM_OAUTH_URL || 'https://zoom.us/oauth/token'

export const zoomConfigured = () =>
  Boolean(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET)

export class ZoomError extends Error {
  constructor(message: string, readonly status = 0) {
    super(message)
  }
}

// Tokens last an hour; reuse one until shortly before it expires.
let cached = { token: '', expires: 0 }

async function accessToken(): Promise<string> {
  if (cached.token && Date.now() < cached.expires) return cached.token
  const basic = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${OAUTH}?grant_type=account_credentials&account_id=${encodeURIComponent(process.env.ZOOM_ACCOUNT_ID ?? '')}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
    signal: AbortSignal.timeout(20000),
  })
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; reason?: string; message?: string }
  if (!res.ok || !data.access_token) throw new ZoomError(data.reason || data.message || `Zoom auth failed (${res.status})`, res.status === 400 ? 401 : res.status)
  cached = { token: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 - 60_000 }
  return cached.token
}

async function zoomGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    signal: AbortSignal.timeout(25000),
    cache: 'no-store',
  })
  const data = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) throw new ZoomError(data.message || `Zoom request failed (${res.status})`, res.status)
  return data
}

/** The meeting id in a join link (zoom.us/j/<id>, /w/, /s/, vanity hosts) or a
 *  bare id as Zoom prints it — "823 5894 9022" works as typed. */
export function meetingIdFromLink(link: string): string {
  const m = String(link || '').match(/zoom\.us\/(?:j|w|s|my)\/([A-Za-z0-9]+)/i)
  if (m) return m[1].replace(/\D/g, '') || m[1]
  const digits = String(link || '').replace(/\D/g, '')
  return digits.length >= 9 ? digits : ''
}

/* A meeting UUID can contain "/" or start with one; Zoom needs those
 * double-encoded or the path breaks into a confusing 404. */
const encodeUuid = (uuid: string) =>
  uuid.startsWith('/') || uuid.includes('//') ? encodeURIComponent(encodeURIComponent(uuid)) : encodeURIComponent(uuid)

export type PastMeeting = { id: number | string; uuid: string; topic?: string; start_time?: string; end_time?: string; duration?: number; participants_count?: number }

/** Summary of one past occurrence. A meeting id (not a uuid) gives the latest one. */
export const pastMeeting = (uuidOrId: string) => zoomGet<PastMeeting>(`/past_meetings/${encodeUuid(uuidOrId)}`)

/**
 * Past occurrences of a meeting id, newest first. The instance-listing scope
 * is not offered on every plan, so a refusal is an empty list — the caller
 * falls back to the latest occurrence.
 */
export async function pastInstances(meetingId: string): Promise<{ uuid: string; start_time: string }[]> {
  try {
    const data = await zoomGet<{ meetings?: { uuid: string; start_time: string }[] }>(`/past_meetings/${encodeURIComponent(meetingId)}/instances`)
    return (data.meetings || []).sort((a, b) => (a.start_time < b.start_time ? 1 : -1))
  } catch (err) {
    if (err instanceof ZoomError && [400, 401, 403].includes(err.status)) return []
    throw err
  }
}

export type Participant = { name: string; email: string; sessions: number; joinedAt: string | null; leftAt: string | null; minutes: number }

/**
 * Everyone in one past occurrence. Zoom reports a row per join, so a person
 * who drops and rejoins appears several times; they are merged here into
 * earliest join, latest leave and total minutes connected.
 */
export async function meetingParticipants(uuid: string): Promise<Participant[]> {
  type Row = { name?: string; user_email?: string; join_time?: string; leave_time?: string; duration?: number }
  const rows: Row[] = []
  let token = ''
  do {
    const qs = `page_size=300${token ? `&next_page_token=${encodeURIComponent(token)}` : ''}`
    const data = await zoomGet<{ participants?: Row[]; next_page_token?: string }>(`/report/meetings/${encodeUuid(uuid)}/participants?${qs}`)
    rows.push(...(data.participants || []))
    token = data.next_page_token || ''
  } while (token)

  const byPerson = new Map<string, { name: string; email: string; sessions: number; joined: number; left: number; seconds: number }>()
  for (const p of rows) {
    const email = String(p.user_email || '').trim().toLowerCase()
    const key = email || `name:${String(p.name || '').trim().toLowerCase()}`
    const join = p.join_time ? Date.parse(p.join_time) : NaN
    const leave = p.leave_time ? Date.parse(p.leave_time) : NaN
    const prev = byPerson.get(key)
    if (!prev) {
      byPerson.set(key, { name: p.name || '', email, sessions: 1, joined: join, left: leave, seconds: Number(p.duration || 0) })
      continue
    }
    prev.sessions += 1
    prev.seconds += Number(p.duration || 0)
    if (join < prev.joined || Number.isNaN(prev.joined)) prev.joined = join
    if (leave > prev.left || Number.isNaN(prev.left)) prev.left = leave
    if (!prev.name && p.name) prev.name = p.name
  }

  const iso = (t: number) => (Number.isNaN(t) ? null : new Date(t).toISOString())
  return [...byPerson.values()]
    .sort((a, b) => b.seconds - a.seconds)
    .map((p) => ({ name: p.name, email: p.email, sessions: p.sessions, joinedAt: iso(p.joined), leftAt: iso(p.left), minutes: Math.round(p.seconds / 60) }))
}

export type ZoomSession = { id: string; uuid: string; topic: string; startTime: string; minutes: number; participants: number | null }

/**
 * Every meeting the host finished in the last `days`, newest first, so a class
 * is picked rather than its id hunted down in the Zoom portal. Zoom caps one
 * report query at a month, so a longer window is walked a month at a time.
 */
export async function pastMeetings(days = 90): Promise<ZoomSession[]> {
  // A server-to-server token has no "me", so the host is named explicitly.
  const host = (process.env.ZOOM_USER_ID || '').trim()
  if (!host) throw new ZoomError('Set ZOOM_USER_ID to the email of the Zoom account that hosts the classes.', 400)

  type Row = { id: number; uuid: string; topic?: string; start_time: string; duration: number; participants_count?: number }
  const out: Row[] = []
  const end = Date.now()
  let cursor = end - days * 864e5
  while (cursor < end) {
    const chunkEnd = Math.min(cursor + 29 * 864e5, end)
    const from = new Date(cursor).toISOString().slice(0, 10)
    const to = new Date(chunkEnd).toISOString().slice(0, 10)
    let token = ''
    do {
      const qs = `from=${from}&to=${to}&page_size=300&type=past${token ? `&next_page_token=${encodeURIComponent(token)}` : ''}`
      const data = await zoomGet<{ meetings?: Row[]; next_page_token?: string }>(`/report/users/${encodeURIComponent(host)}/meetings?${qs}`)
      out.push(...(data.meetings || []))
      token = data.next_page_token || ''
    } while (token)
    cursor = chunkEnd + 864e5
  }

  return out
    .map((m) => ({ id: String(m.id), uuid: m.uuid, topic: m.topic || '', startTime: m.start_time, minutes: m.duration, participants: m.participants_count ?? null }))
    .sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
}

/** A Zoom failure, said as something an admin can act on. */
export function explainZoomError(err: unknown): string {
  const msg = err instanceof Error ? err.message : ''
  const status = err instanceof ZoomError ? err.status : 0
  if (status === 400 && /plan|subscription|not.*available/i.test(msg)) {
    return 'Zoom reports need a paid Zoom plan (Pro or above). This account is on a plan that does not expose them.'
  }
  if (status === 401) return 'Zoom rejected the credentials — check ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET.'
  if (status === 403) return 'The Zoom app is missing the report:read:admin scope, or has not been activated.'
  if (status === 404) return 'Zoom has no record of that meeting — it may not have finished yet, or it belongs to a different Zoom account.'
  return msg || 'Could not reach Zoom.'
}
