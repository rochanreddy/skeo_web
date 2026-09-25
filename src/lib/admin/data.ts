import type { Collection } from 'mongodb'
import { mongoDb } from '@/lib/db/mongo'
import { readEvents } from '@/lib/analytics/store'
import { ordersCollection, type OrderDoc } from '@/lib/payments/orders'
import type { CheckoutItem } from '@/lib/checkoutItems'

/**
 * What the admin panel's Orders, Playbooks and Leads tabs read. Server-only.
 *
 * Orders come from the orders collection (the real record, written at payment
 * time); leads from the analytics events (the verify step at checkout); and
 * playbook delivery from what the LMS reported sending, stored on each order —
 * plus the sends an admin made by hand to someone with no website order.
 */

/** The playbook sets, as the LMS names them (server/utils/playbooks.js). */
export const PLAYBOOK_SETS = {
  claude: 'Claude Playbooks',
  ai: 'AI Library',
} as const
export type PlaybookSet = keyof typeof PLAYBOOK_SETS
export const isPlaybookSet = (v: unknown): v is PlaybookSet => typeof v === 'string' && v in PLAYBOOK_SETS

/** Which sets an order pays for — the LMS's rule, mirrored. */
export function setsFor(items: readonly CheckoutItem[]): PlaybookSet[] {
  const out: PlaybookSet[] = []
  if (items.includes('playbooks') || items.includes('member')) out.push('claude')
  if (items.includes('library') || items.includes('member')) out.push('ai')
  return out
}

/**
 * Has a set been delivered, given the part keys sent ("ai#1/2", "ai#2/2")?
 * Only when every part of it has gone: half an AI Library is not delivered.
 */
export function delivery(parts: readonly string[], set: PlaybookSet) {
  const mine = parts.filter((p) => p.startsWith(`${set}#`))
  const total = Math.max(0, ...mine.map((p) => Number(p.split('/')[1]) || 0))
  const got = new Set(mine.map((p) => Number(p.slice(p.indexOf('#') + 1).split('/')[0])))
  const sent = total > 0 && Array.from({ length: total }, (_, i) => i + 1).every((n) => got.has(n))
  return { sent, partsSent: got.size, total }
}

const PAID: OrderDoc['status'][] = ['paid', 'provisioned']

export type AdminOrder = {
  orderId: string
  createdAt: string
  paidAt: string | null
  name: string
  email: string
  phone: string
  items: CheckoutItem[]
  amount: number
  status: 'created' | 'paid' | 'provisioned'
  /** The LMS made (or found) the account and sent the login mail. */
  lmsDone: boolean
  lmsAccountCreated: boolean
  batches: string[]
  playbooks: { set: PlaybookSet; label: string; sent: boolean; partsSent: number; total: number }[]
  lastError: string
  warnings: string[]
}

function toAdmin(o: OrderDoc): AdminOrder {
  const parts = o.provision?.playbookParts ?? []
  return {
    orderId: o._id,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    name: o.contact.name,
    email: o.contact.email,
    phone: o.contact.phone,
    items: o.items,
    amount: o.amount,
    status: o.status,
    lmsDone: o.status === 'provisioned',
    lmsAccountCreated: Boolean(o.provision?.created),
    batches: o.provision?.batches ?? [],
    playbooks: setsFor(o.items).map((set) => ({ set, label: PLAYBOOK_SETS[set], ...delivery(parts, set) })),
    lastError: o.provision?.lastError ?? '',
    warnings: o.provision?.warnings ?? [],
  }
}

/** Every order, newest first. Unpaid ones included — an order someone opened
 *  and abandoned at Cashfree is still worth seeing. */
export async function listOrders(limit = 500): Promise<AdminOrder[]> {
  const orders = await ordersCollection()
  const rows = await orders.find({}).sort({ createdAt: -1 }).limit(limit).toArray()
  return rows.map(toAdmin)
}

/* ------------------------------------------------------------------------ *
 * Playbooks
 * ------------------------------------------------------------------------ */

/** A send made by hand to someone with no website order (paid another way). */
export type ManualSend = { _id?: unknown; email: string; name: string; sets: PlaybookSet[]; parts: string[]; at: Date }

export async function manualSends(): Promise<Collection<ManualSend>> {
  return (await mongoDb()).collection<ManualSend>('playbook_sends')
}

export type PlaybookRow = {
  /** 'order' — bought on the website; 'manual' — sent by hand from the admin. */
  source: 'order' | 'manual'
  orderId: string | null
  name: string
  email: string
  phone: string
  at: string
  playbooks: AdminOrder['playbooks']
  /** Last time anything was sent to them for this row. */
  lastSentAt: string | null
}

/** Everyone who should have playbooks, and whether they have them. */
export async function playbookRows(): Promise<PlaybookRow[]> {
  const orders = await ordersCollection()
  const paid = await orders
    .find({ status: { $in: PAID }, items: { $in: ['playbooks', 'library', 'member'] } })
    .sort({ paidAt: -1 })
    .toArray()
  const fromOrders: PlaybookRow[] = paid.map((o) => {
    const a = toAdmin(o)
    const last = o.playbookSends?.length ? o.playbookSends[o.playbookSends.length - 1].at : o.provisionedAt ?? null
    return {
      source: 'order',
      orderId: a.orderId,
      name: a.name,
      email: a.email,
      phone: a.phone,
      at: (o.paidAt ?? o.createdAt).toISOString(),
      playbooks: a.playbooks,
      lastSentAt: last && a.playbooks.some((p) => p.sent) ? new Date(last).toISOString() : null,
    }
  })

  const sends = await (await manualSends()).find({}).sort({ at: -1 }).limit(500).toArray()
  const fromManual: PlaybookRow[] = sends.map((s) => ({
    source: 'manual',
    orderId: null,
    name: s.name,
    email: s.email,
    phone: '',
    at: s.at.toISOString(),
    playbooks: s.sets.map((set) => ({ set, label: PLAYBOOK_SETS[set], ...delivery(s.parts, set) })),
    lastSentAt: s.at.toISOString(),
  }))

  return [...fromOrders, ...fromManual]
}

/* ------------------------------------------------------------------------ *
 * Leads
 * ------------------------------------------------------------------------ */

export type Lead = {
  name: string
  email: string
  phone: string
  items: string[]
  at: string
  /** Has any paid order under this email. */
  paid: boolean
  orderId: string | null
  amount: number
}

/**
 * Everyone who verified their phone at checkout — one row per email, their
 * latest attempt — and whether they went on to pay. The ones who did not are
 * the call-back list.
 */
export async function listLeads(): Promise<Lead[]> {
  const events = await readEvents()
  const latest = new Map<string, Lead>()
  for (const e of events) {
    if (e.type !== 'verify_ok' || e.demo) continue
    const email = String(e.props?.email ?? '').trim().toLowerCase()
    if (!email) continue
    const prev = latest.get(email)
    if (prev && Date.parse(prev.at) >= e.at) continue
    const modules = e.props?.modules
    latest.set(email, {
      name: String(e.props?.name ?? ''),
      email,
      phone: String(e.props?.phone ?? ''),
      items: Array.isArray(modules) ? modules.map(String) : [],
      at: new Date(e.at).toISOString(),
      paid: false,
      orderId: null,
      amount: 0,
    })
  }

  const orders = await ordersCollection()
  const paid = await orders
    .find({ status: { $in: PAID } })
    .project<{ _id: string; contact: OrderDoc['contact']; amount: number }>({ contact: 1, amount: 1 })
    .toArray()
  for (const o of paid) {
    const lead = latest.get(o.contact.email.toLowerCase())
    if (lead) {
      lead.paid = true
      lead.orderId = o._id
      lead.amount = o.amount
      if (!lead.phone) lead.phone = o.contact.phone
    }
  }
  return [...latest.values()].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}

/* ------------------------------------------------------------------------ *
 * The LMS, on the admin's behalf
 * ------------------------------------------------------------------------ */

/** POST to the LMS with the shared secret. Throws with the LMS's own message. */
export async function lmsPost<T>(path: string, body: unknown): Promise<T> {
  const base = (process.env.SKEO_LMS_API_URL || '').replace(/\/+$/, '')
  const secret = process.env.SKEO_PROVISION_SECRET || ''
  if (!base || !secret) throw new Error('SKEO_LMS_API_URL / SKEO_PROVISION_SECRET are not set.')
  const res = await fetch(`${base}/api/skeo${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body),
    // Up to three mails with PDFs attached; each can take a few seconds.
    signal: AbortSignal.timeout(90_000),
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || `LMS ${res.status}`)
  return data
}
