import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { ordersCollection, type OrderDoc } from '@/lib/payments/orders'
import { cashfreeConfigured, findCashfreePayment, type PaymentMethod } from '@/lib/payments/cashfree'
import { finalizeOrder } from '@/lib/payments/finalize'
import { CHECKOUT_ROWS, isCheckoutItem, type CheckoutItem } from '@/lib/checkoutItems'

/**
 * Paid users — menler's Paid users tab, for skeo. Server-only.
 *
 * Every paid order, website or not, plus the means to record money taken off
 * the website (a Cashfree payment link, say). A recorded payment is checked
 * against Cashfree when there is a reference to check — the gateway's amount
 * and payer win over anything typed — and can be saved unverified with a
 * transaction id when there is not, marked as such until someone verifies it.
 *
 * Manual payments live in the orders collection beside website ones, so they
 * count wherever a paid order counts: revenue, class attendance, Early Access
 * seats. Unlike menler, skeo can also give a manual buyer their LMS login and
 * playbooks — but only when the admin asks.
 */

const PAID: OrderDoc['status'][] = ['paid', 'provisioned']

export const programLabel = (items: readonly string[], fallback = '') =>
  items.map((i) => CHECKOUT_ROWS.find((r) => r.key === i)?.title ?? i).join(', ') || fallback

export type PaidRow = {
  id: string
  source: 'website' | 'manual'
  name: string
  email: string
  phone: string
  items: CheckoutItem[]
  program: string
  amount: number
  paidAt: string
  batch: string
  deal: { actualPrice: number | null; soldPrice: number | null; cycle: number | null }
  /** Website payments are confirmed by Cashfree by construction. */
  verified: boolean
  verifiedAt: string | null
  verifiedVia: string
  cfOrderId: string
  transactionId: string
  method: PaymentMethod | null
  note: string
  /** A manual payment the admin asked to give LMS access for. */
  access: boolean
  lmsDone: boolean
  lmsError: string
}

function toRow(o: OrderDoc): PaidRow {
  const m = o.manual
  return {
    id: o._id,
    source: m ? 'manual' : 'website',
    name: o.contact.name,
    email: o.contact.email,
    phone: o.contact.phone,
    items: o.items,
    program: programLabel(o.items, m?.program ?? ''),
    amount: o.amount,
    paidAt: (o.paidAt ?? o.createdAt).toISOString(),
    batch: o.batch ?? '',
    deal: { actualPrice: o.deal?.actualPrice ?? null, soldPrice: o.deal?.soldPrice ?? null, cycle: o.deal?.cycle ?? null },
    verified: m ? m.verified : true,
    verifiedAt: m?.verifiedAt ? m.verifiedAt.toISOString() : null,
    verifiedVia: m?.verifiedVia ?? '',
    cfOrderId: m ? m.cfOrderId ?? '' : o._id,
    transactionId: m?.cfPaymentId || m?.txnId || '',
    method: m?.method ?? null,
    note: m?.note ?? '',
    access: m ? m.access : true,
    lmsDone: o.status === 'provisioned',
    lmsError: o.provision?.lastError ?? '',
  }
}

/** Every paid order, newest first. */
export async function listPaid(): Promise<PaidRow[]> {
  const rows = await (await ordersCollection()).find({ status: { $in: PAID } }).sort({ paidAt: -1, createdAt: -1 }).limit(2000).toArray()
  return rows.map(toRow)
}

export class PaidError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message)
  }
}

/** An API answer for a failure: the PaidError's own status and words, else 503. */
export const failed = (err: unknown, fallback: string) =>
  NextResponse.json({ ok: false, error: err instanceof Error ? err.message : fallback }, { status: err instanceof PaidError ? err.status : 503 })

/** A paid order already holding this Cashfree payment, other than `except`. */
async function holderOf(orderId: string, cfPaymentId: string, except?: string) {
  const or: Record<string, unknown>[] = [{ _id: orderId }, { 'manual.cfOrderId': orderId }]
  if (cfPaymentId) or.push({ 'manual.cfPaymentId': cfPaymentId })
  return (await ordersCollection()).findOne({ $or: or, ...(except ? { _id: { $ne: except } } : {}) })
}

const who = (o: OrderDoc) => o.contact.name || o.contact.email || o._id

/** Read-only: what a reference resolves to, and whether it is already in the list. */
export async function lookupPayment(reference: string) {
  if (!cashfreeConfigured()) throw new PaidError('Cashfree keys are not set on this server, so payments cannot be verified here.', 503)
  const found = await findCashfreePayment(reference)
  if (!found.found) throw new PaidError(found.detail, 404)
  const dupe = await holderOf(found.payment.orderId, found.payment.cfPaymentId)
  return { via: found.via, payment: found.payment, duplicate: dupe ? { id: dupe._id, name: who(dupe) } : null }
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** A positive number, or null for blank; anything else is refused. */
function money(v: unknown, label: string): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) throw new PaidError(`${label} must be a positive amount.`)
  return Math.round(n * 100) / 100
}

export type RecordInput = {
  reference?: string
  unverified?: boolean
  txnId?: string
  name?: string
  email?: string
  phone?: string
  /** A checkout item key, or any other text for something the site does not sell. */
  program?: string
  amount?: number | string
  paidOn?: string
  batch?: string
  actualPrice?: number | string
  soldPrice?: number | string
  cycle?: number | string
  note?: string
  access?: boolean
}

/**
 * Record an off-site payment. The reference is re-checked here rather than
 * trusted from the browser, so the amount comes from Cashfree whenever there
 * is a reference — a typo cannot become a revenue figure.
 */
export async function recordPayment(b: RecordInput) {
  const name = String(b.name ?? '').trim()
  const email = String(b.email ?? '').trim().toLowerCase()
  const phone = String(b.phone ?? '').trim()
  const program = String(b.program ?? '').trim()
  const ref = String(b.reference ?? '').trim()
  const txnId = String(b.txnId ?? '').trim()
  if (!name) throw new PaidError('A name is required.')
  if (!program) throw new PaidError('Pick what they paid for.')
  if (email && !EMAIL.test(email)) throw new PaidError('That email does not look right.')
  // Skipping verification has to be asked for, and leaves a reference behind:
  // a row with nothing to reconcile against a settlement is unauditable.
  if (!ref && b.unverified !== true) throw new PaidError('A Cashfree Order ID is required, or choose to record it unverified.')
  if (!ref && !txnId) throw new PaidError('A Cashfree Transaction ID is required when recording without verification.')

  const items: CheckoutItem[] = isCheckoutItem(program) ? [program] : []
  const access = b.access === true
  if (access && !items.length) throw new PaidError('LMS access can only be given for a skeo course or product.')
  if (access && !email) throw new PaidError('An email is needed to give LMS access — the login is sent there.')

  let amount = Number(b.amount)
  let found: Extract<Awaited<ReturnType<typeof findCashfreePayment>>, { found: true }> | null = null
  if (ref) {
    if (!cashfreeConfigured()) throw new PaidError('Cashfree keys are not set on this server, so the reference cannot be checked.', 503)
    const res = await findCashfreePayment(ref)
    if (!res.found) throw new PaidError(res.detail)
    const dupe = await holderOf(res.payment.orderId, res.payment.cfPaymentId)
    if (dupe) throw new PaidError(`Already recorded — ${who(dupe)} has this payment. Adding it again would double-count revenue.`, 409)
    found = res
    amount = res.payment.amount
  }
  if (!Number.isFinite(amount) || amount <= 0) throw new PaidError('A positive amount is required.')

  const actualPrice = money(b.actualPrice, 'The actual price')
  const soldPrice = money(b.soldPrice, 'The sold price')
  const cycle = b.cycle === '' || b.cycle == null ? null : Number(b.cycle)
  if (cycle !== null && (!Number.isInteger(cycle) || cycle < 1 || cycle > 24)) throw new PaidError('The payment cycle must be 1, 2, 3 …')
  const batch = String(b.batch ?? '').trim()
  if (batch && !MONTH.test(batch)) throw new PaidError('Give the batch as a month, e.g. 2026-08.')
  const paidOn = String(b.paidOn ?? '').trim()
  if (paidOn && !DAY.test(paidOn)) throw new PaidError('The paid-on date does not look right.')

  const p = found?.payment
  const now = new Date()
  const id = `SKEO-M-${Date.now().toString(36).toUpperCase().slice(-6)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  const doc: OrderDoc = {
    _id: id,
    items,
    amount: Math.round(amount * 100) / 100,
    contact: { name, email: email || p?.customer.email || '', phone: phone || p?.customer.phone || '' },
    visitorId: '',
    sessionId: '',
    status: 'paid',
    createdAt: now,
    // A date typed in is that day, noon IST; otherwise Cashfree's time; otherwise now.
    paidAt: paidOn ? new Date(`${paidOn}T12:00:00+05:30`) : p?.paidAt ? new Date(p.paidAt) : now,
    manual: {
      program: items.length ? programLabel(items) : program.slice(0, 120),
      access,
      verified: Boolean(found),
      ...(found
        ? { verifiedAt: now, verifiedVia: found.via, cfOrderId: p!.orderId, cfPaymentId: p!.cfPaymentId, method: p!.method }
        : { txnId }),
      ...(b.note ? { note: String(b.note).trim().slice(0, 500) } : {}),
      addedAt: now,
    },
    ...(batch ? { batch } : {}),
    ...(actualPrice !== null || soldPrice !== null || cycle !== null
      ? { deal: { ...(actualPrice !== null ? { actualPrice } : {}), ...(soldPrice !== null ? { soldPrice } : {}), ...(cycle !== null ? { cycle } : {}) } }
      : {}),
  }
  await (await ordersCollection()).insertOne(doc)

  // The same step a website payment takes after Cashfree says PAID: the LMS
  // makes the account and sends the login mail and any playbooks. If the LMS
  // is down the row stays "paid", and Orders → Verify retries it.
  let lms: 'not asked' | 'done' | 'pending' = 'not asked'
  if (access) lms = (await finalizeOrder(id).catch(() => null))?.status === 'provisioned' ? 'done' : 'pending'
  return { id, verified: Boolean(found), amount: doc.amount, lms }
}

/**
 * Verify a manual row that went in unverified. Cashfree's amount, payer and
 * time replace what was typed — replacing a guess with a fact is the point —
 * and what changed is returned so a corrected figure is noticed.
 */
export async function verifyExisting(id: string, reference: string) {
  if (!cashfreeConfigured()) throw new PaidError('Cashfree keys are not set on this server.', 503)
  const orders = await ordersCollection()
  const order = await orders.findOne({ _id: id })
  if (!order) throw new PaidError('Not found.', 404)
  if (!order.manual) throw new PaidError('Website payments are verified already.')
  if (order.manual.verified) throw new PaidError('This one is already verified.')
  const ref = reference.trim() || order.manual.txnId || ''
  if (!ref) throw new PaidError('Give the Cashfree Order ID for this payment.')

  const found = await findCashfreePayment(ref)
  if (!found.found) throw new PaidError(found.detail)
  const p = found.payment
  const clash = await holderOf(p.orderId, p.cfPaymentId, id)
  if (clash) throw new PaidError(`That payment is already recorded under ${who(clash)}.`, 409)

  const name = p.customer.name || order.contact.name
  await orders.updateOne(
    { _id: id },
    {
      $set: {
        amount: p.amount,
        'contact.name': name,
        ...(p.customer.email ? { 'contact.email': p.customer.email } : {}),
        ...(p.customer.phone ? { 'contact.phone': p.customer.phone } : {}),
        ...(p.paidAt ? { paidAt: new Date(p.paidAt) } : {}),
        'manual.verified': true,
        'manual.verifiedAt': new Date(),
        'manual.verifiedVia': found.via,
        'manual.cfOrderId': p.orderId,
        'manual.cfPaymentId': p.cfPaymentId,
        'manual.method': p.method,
      },
    },
  )
  return {
    changed: {
      amount: order.amount !== p.amount ? { from: order.amount, to: p.amount } : null,
      name: order.contact.name !== name ? { from: order.contact.name, to: name } : null,
    },
  }
}

/** Set or clear a paid order's batch month — website orders too, since checkout never asks. */
export async function setBatch(id: string, raw: string) {
  const batch = raw.trim()
  if (batch && !MONTH.test(batch)) throw new PaidError('Give the batch as a month, e.g. 2026-08.')
  const res = await (await ordersCollection()).updateOne({ _id: id, status: { $in: PAID } }, batch ? { $set: { batch } } : { $unset: { batch: '' } })
  if (!res.matchedCount) throw new PaidError('Not found.', 404)
  return batch
}

/** Remove a manual entry (a typo fix). Website payments cannot be deleted. */
export async function deleteManual(id: string) {
  const orders = await ordersCollection()
  const order = await orders.findOne({ _id: id })
  if (!order) throw new PaidError('Not found.', 404)
  if (!order.manual) throw new PaidError('Only payments added by hand can be deleted.', 403)
  await orders.deleteOne({ _id: id })
}
