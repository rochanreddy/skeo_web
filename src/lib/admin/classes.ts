import crypto from 'node:crypto'
import type { Collection } from 'mongodb'
import { mongoDb } from '@/lib/db/mongo'
import { ordersCollection, type OrderDoc } from '@/lib/payments/orders'
import { isAllAccess, isCheckoutItem, type CheckoutItem } from '@/lib/checkoutItems'
import { meetingIdFromLink, meetingParticipants, pastInstances, pastMeeting, type Participant } from './zoom'

/**
 * Class attendance — menler's Attendance tab, for skeo. Server-only.
 *
 * Menler compares a class against the people who registered for its free
 * campaign. skeo has no campaigns; its classes are for a course, so the
 * expected room is everyone who paid for that course — or for Everything AI or
 * Early Access, which include every course.
 *
 * A class is one Zoom session linked to one course. The session is pinned by
 * its uuid when it was picked from the account's list: a meeting id alone
 * resolves to "the latest run of that room", and rooms get reused for sound
 * checks.
 */

export type ClassDoc = {
  _id: string
  title: string
  course: CheckoutItem
  meetingId: string
  /** The exact occurrence; empty when only a meeting id was pasted. */
  uuid: string
  startTime: string | null
  createdAt: Date
}

export async function classesCollection(): Promise<Collection<ClassDoc>> {
  return (await mongoDb()).collection<ClassDoc>('classes')
}

export type AdminClass = Omit<ClassDoc, '_id' | 'createdAt'> & { id: string; createdAt: string; registered: number }

const PAID: OrderDoc['status'][] = ['paid', 'provisioned']

/** Does this order pay for a seat in a class of `course`? */
export function coversCourse(items: readonly CheckoutItem[], course: CheckoutItem): boolean {
  if (isAllAccess(items)) return true
  return course !== 'member' && course !== 'earlyaccess' && items.includes(course)
}

export type Registrant = { name: string; email: string; phone: string; items: CheckoutItem[]; paidAt: string | null }

/** Everyone who paid for `course`, one row per email, their latest order winning. */
export async function registrantsFor(course: CheckoutItem): Promise<Registrant[]> {
  const orders = await (await ordersCollection()).find({ status: { $in: PAID } }).sort({ paidAt: -1, createdAt: -1 }).toArray()
  const byEmail = new Map<string, Registrant>()
  for (const o of orders) {
    const email = o.contact.email.trim().toLowerCase()
    if (!email || byEmail.has(email) || !coversCourse(o.items, course)) continue
    byEmail.set(email, { name: o.contact.name, email, phone: o.contact.phone, items: o.items, paidAt: o.paidAt?.toISOString() ?? null })
  }
  return [...byEmail.values()]
}

export async function listClasses(): Promise<AdminClass[]> {
  const docs = await (await classesCollection()).find({}).toArray()
  // The registered count costs one read of the orders, shared by every course.
  const counts = new Map<CheckoutItem, number>()
  for (const course of new Set(docs.map((d) => d.course))) counts.set(course, (await registrantsFor(course)).length)
  return docs
    .map(({ _id, createdAt, ...d }) => ({ ...d, id: _id, createdAt: createdAt.toISOString(), registered: counts.get(d.course) ?? 0 }))
    .sort((a, b) => Date.parse(b.startTime ?? b.createdAt) - Date.parse(a.startTime ?? a.createdAt))
}

/** Validated input for a new class or a change to one. */
export function parseClassInput(body: Record<string, unknown>, partial = false) {
  const out: Partial<Pick<ClassDoc, 'title' | 'course' | 'meetingId' | 'uuid' | 'startTime'>> = {}
  if (body.course !== undefined || !partial) {
    if (!isCheckoutItem(body.course)) return { error: 'Choose which course this class is for.' }
    out.course = body.course
  }
  if (body.link !== undefined || !partial) {
    const meetingId = meetingIdFromLink(String(body.link ?? ''))
    if (!meetingId) return { error: 'Pick a Zoom session, or paste its meeting ID (e.g. 823 5894 9022).' }
    out.meetingId = meetingId
    out.uuid = typeof body.uuid === 'string' ? body.uuid.trim() : ''
    out.startTime = typeof body.startTime === 'string' && !Number.isNaN(Date.parse(body.startTime)) ? new Date(body.startTime).toISOString() : null
  }
  if (typeof body.title === 'string') out.title = body.title.trim().slice(0, 160)
  else if (!partial) out.title = ''
  return { value: out }
}

export async function createClass(input: Omit<ClassDoc, '_id' | 'createdAt'>): Promise<string> {
  const id = `cls_${crypto.randomBytes(6).toString('hex')}`
  await (await classesCollection()).insertOne({ ...input, _id: id, createdAt: new Date() })
  return id
}

export type AttendanceRow = {
  name: string
  email: string
  phone: string
  joinedAt: string | null
  leftAt: string | null
  minutes: number
  sessions: number
  registered: boolean
  attended: boolean
}

export type Attendance = {
  uuid: string
  /** Set when there is nothing to count: 'no-sessions' (Zoom has no finished
   *  run yet) or 'no-attendance' (it ran with nobody in it). */
  empty: '' | 'no-sessions' | 'no-attendance'
  meeting: { topic: string; startTime: string | null; durationMinutes: number | null; zoomTotal: number | null } | null
  rows: AttendanceRow[]
  summary: { attended: number; registered: number; noShows: number; walkIns: number; avgMinutes: number }
  instances: { uuid: string; startTime: string }[]
}

export class WrongSessionError extends Error {}

/**
 * Who was in the class, matched on email against who paid for its course.
 *
 * `requestedUuid` comes from the browser's occurrence picker and is checked
 * against the class's own meeting id before anybody is read out of it — Zoom
 * will report on any uuid the token can see, and another class's room matched
 * against these buyers would make every attendee look like a walk-in.
 */
export async function attendanceFor(cls: ClassDoc, requestedUuid = ''): Promise<Attendance> {
  const instances = (await pastInstances(cls.meetingId)).map((i) => ({ uuid: i.uuid, startTime: i.start_time }))
  const nothing = (empty: Attendance['empty'], uuid = ''): Attendance => ({
    uuid, empty, meeting: null, rows: [], instances,
    summary: { attended: 0, registered: 0, noShows: 0, walkIns: 0, avgMinutes: 0 },
  })

  let uuid = requestedUuid || cls.uuid || instances[0]?.uuid || ''
  if (!uuid) uuid = (await pastMeeting(cls.meetingId).catch(() => null))?.uuid ?? ''
  if (!uuid) return nothing('no-sessions')

  const meeting = await pastMeeting(uuid).catch(() => null)
  if (requestedUuid && requestedUuid !== cls.uuid && !(meeting && String(meeting.id) === cls.meetingId)) {
    throw new WrongSessionError('That session belongs to a different Zoom meeting, so it is not this class.')
  }

  const people: Participant[] = await meetingParticipants(uuid)
  if (!people.length) return nothing('no-attendance', uuid)

  const registrants = await registrantsFor(cls.course)
  const byEmail = new Map(registrants.map((r) => [r.email, r]))
  const seen = new Set<string>()
  const rows: AttendanceRow[] = people.map((p) => {
    const buyer = p.email ? byEmail.get(p.email) : undefined
    if (buyer) seen.add(buyer.email)
    return {
      name: buyer?.name || p.name,
      email: p.email || '',
      phone: buyer?.phone || '',
      joinedAt: p.joinedAt,
      leftAt: p.leftAt,
      minutes: p.minutes,
      sessions: p.sessions,
      registered: Boolean(buyer),
      attended: true,
    }
  })
  // Buyers Zoom never saw — the list to follow up.
  const noShows: AttendanceRow[] = registrants
    .filter((r) => !seen.has(r.email))
    .map((r) => ({ name: r.name, email: r.email, phone: r.phone, joinedAt: null, leftAt: null, minutes: 0, sessions: 0, registered: true, attended: false }))

  const total = rows.reduce((n, r) => n + r.minutes, 0)
  return {
    uuid,
    empty: '',
    meeting: meeting
      ? { topic: meeting.topic ?? '', startTime: meeting.start_time ?? null, durationMinutes: meeting.duration ?? null, zoomTotal: meeting.participants_count ?? null }
      : null,
    rows: [...rows, ...noShows],
    summary: {
      attended: rows.length,
      registered: registrants.length,
      noShows: noShows.length,
      walkIns: rows.filter((r) => !r.registered).length,
      avgMinutes: rows.length ? Math.round(total / rows.length) : 0,
    },
    instances,
  }
}
