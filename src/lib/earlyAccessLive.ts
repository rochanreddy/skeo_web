import { CHECKOUT_ROWS, type CheckoutItem } from '@/lib/checkoutItems'
import { mongoConfigured } from '@/lib/db/mongo'
import { ordersCollection } from '@/lib/payments/orders'

/**
 * What /early-access shows as live: seats left, and who has just joined.
 * Server-only. Both come from the orders collection and nothing else — no
 * number here is invented, so the page never claims a scarcity or a crowd
 * that is not there.
 *
 *  - Seats: EARLY_ACCESS_SEATS is the real cap. Every paid Early Access order
 *    takes one, and the order route refuses new Early Access orders once none
 *    are left — "Limited Seats" is enforced, not just said.
 *  - Recent joins: paid orders from the last week, shown as first name and
 *    last initial with how long ago. Never an email, a phone or a full name.
 */

const PAID = ['paid', 'provisioned'] as const

/** The cap, from the environment. 0 means no cap, and no counter is shown. */
export function seatCap(): number {
  const n = Math.floor(Number(process.env.EARLY_ACCESS_SEATS ?? 500))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function seatsTaken(): Promise<number> {
  const orders = await ordersCollection()
  return orders.countDocuments({ status: { $in: [...PAID] }, items: 'earlyaccess' })
}

/** How many Early Access seats are left, or null when there is no cap. */
export async function seatsLeft(): Promise<number | null> {
  const cap = seatCap()
  if (!cap) return null
  return Math.max(0, cap - (await seatsTaken()))
}

/** "priya sharma" → "Priya S."; one word stays one word. */
export function publicName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  const first = cap(parts[0])
  return parts.length > 1 ? `${first} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : first
}

/** What they bought, as the page names it. */
export function whatLabel(items: readonly CheckoutItem[]): string {
  if (items.includes('earlyaccess')) return 'Everything AI · Early Access'
  if (items.includes('member')) return 'Everything AI'
  const titles = items.map((k) => CHECKOUT_ROWS.find((r) => r.key === k)?.title).filter(Boolean) as string[]
  if (!titles.length) return 'skeo'
  return titles.length === 1 ? titles[0] : `${titles[0]} + ${titles.length - 1} more`
}

export type Join = { name: string; what: string; at: string }

export async function recentJoins(limit = 8): Promise<Join[]> {
  const orders = await ordersCollection()
  const since = new Date(Date.now() - 7 * 24 * 3600_000)
  const rows = await orders
    .find({ status: { $in: [...PAID] }, paidAt: { $gte: since } })
    .project<{ contact: { name: string }; items: CheckoutItem[]; paidAt: Date }>({ 'contact.name': 1, items: 1, paidAt: 1 })
    .sort({ paidAt: -1 })
    .limit(limit)
    .toArray()
  return rows
    .map((o) => ({ name: publicName(o.contact.name), what: whatLabel(o.items), at: o.paidAt.toISOString() }))
    .filter((j) => j.name)
}

export type LiveStats = { seatsTotal: number | null; seatsLeft: number | null; recent: Join[] }

export async function liveStats(): Promise<LiveStats> {
  if (!mongoConfigured()) return { seatsTotal: null, seatsLeft: null, recent: [] }
  const cap = seatCap()
  const [left, recent] = await Promise.all([seatsLeft(), recentJoins()])
  return { seatsTotal: cap || null, seatsLeft: left, recent }
}
