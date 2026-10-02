import crypto from 'node:crypto'

/**
 * Cashfree Payment Gateway, over raw HTTPS — ported from menler.in's server,
 * where the same calls take real money today.
 *
 * Env (server only): CASHFREE_ENV (SANDBOX | PRODUCTION), CASHFREE_APP_ID,
 * CASHFREE_SECRET_KEY. The secret never reaches the browser; the browser only
 * ever sees the payment_session_id an order hands back.
 */

const env = () => (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase()
// CASHFREE_API_BASE exists for the end-to-end test, which points this at a
// stand-in Cashfree on localhost. Leave it unset everywhere real.
const base = () =>
  process.env.CASHFREE_API_BASE ||
  (env() === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg')
const API_VERSION = '2023-08-01'

export const cashfreeMode = (): 'production' | 'sandbox' => (env() === 'PRODUCTION' ? 'production' : 'sandbox')

export const cashfreeConfigured = () => Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY)

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': process.env.CASHFREE_APP_ID || '',
    'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
  }
}

class CashfreeError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, { ...init, headers: headers(), signal: AbortSignal.timeout(20_000) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new CashfreeError((data as { message?: string })?.message || `Cashfree ${res.status}`, res.status)
  return data as T
}

export type CashfreeOrder = {
  order_id: string
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED' | 'TERMINATION_REQUESTED' | string
  order_amount: number
  payment_session_id?: string
  cf_order_id?: string | number
}

export function createCashfreeOrder(input: {
  orderId: string
  amount: number
  customer: { id: string; name: string; email: string; phone: string }
  returnUrl: string
  notifyUrl: string
}): Promise<CashfreeOrder> {
  return call<CashfreeOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: input.customer.id,
        customer_phone: input.customer.phone,
        customer_name: input.customer.name,
        customer_email: input.customer.email,
      },
      order_meta: { return_url: input.returnUrl, notify_url: input.notifyUrl },
    }),
  })
}

/** The order as Cashfree has it now — PAID is the only status that means money. */
export const getCashfreeOrder = (orderId: string) =>
  call<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`)

/**
 * Cashfree signs each webhook as base64(HMAC-SHA256(timestamp + rawBody,
 * secret)). The RAW body — re-serialised JSON would not match byte for byte.
 */
export function verifyWebhookSignature(signature: string | null, rawBody: string, timestamp: string | null): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY
  if (!signature || !timestamp || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('base64')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Cashfree wants a 10-digit Indian number; the form accepts any format. */
export function cashfreePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

/** Cashfree's customer_id allows letters, digits and _ -; derived from the email
 *  so one buyer is one customer across orders, without the address itself. */
export const cashfreeCustomerId = (email: string) =>
  `c_${crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 24)}`

/* ------------------------------------------------------------------------ *
 * Looking a payment up — for payments recorded by hand in the admin
 * (menler's server/utils/cashfree.js, ported).
 * ------------------------------------------------------------------------ */

type CfPayment = {
  cf_payment_id?: string | number
  order_id?: string
  payment_status?: string
  payment_amount?: number
  payment_time?: string
  payment_group?: string
  payment_method?: Record<string, Record<string, string> | undefined>
  bank_reference?: string
}
type CfOrderDetail = CashfreeOrder & {
  created_at?: string
  customer_details?: { customer_name?: string; customer_email?: string; customer_phone?: string }
}

/** Payments made against an order; each carries cf_payment_id, the transaction id the dashboard shows. */
const getCashfreePayments = async (orderId: string) => {
  const data = await call<CfPayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)
  return Array.isArray(data) ? data : []
}

const isSuccess = (p: CfPayment) => String(p.payment_status || '').toUpperCase() === 'SUCCESS'

export type PaymentMethod = { label: string; emi: boolean; detail: string; bank: string; reference: string }

const GROUP_LABELS: Record<string, string> = {
  credit_card: 'Credit card',
  debit_card: 'Debit card',
  net_banking: 'Net banking',
  upi: 'UPI',
  wallet: 'Wallet',
  pay_later: 'Pay later',
  paypal: 'PayPal',
  bank_transfer: 'Bank transfer',
}
const titleise = (s: string) => String(s || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()

/** How a payment was made: the group says card / UPI / EMI, the method holds the instrument's details. */
export function describePayment(p: CfPayment | null): PaymentMethod | null {
  if (!p) return null
  const group = String(p.payment_group || '').toLowerCase()
  const method = p.payment_method && typeof p.payment_method === 'object' ? p.payment_method : {}
  const kind = Object.keys(method)[0] || ''
  const d = (method[kind] && typeof method[kind] === 'object' ? method[kind] : {}) as Record<string, string>
  const emi = /emi/.test(group) || /emi/.test(kind)
  // Bank names pass through as Cashfree sends them: title-casing turns HDFC into "Hdfc".
  const bank = String(d.card_bank_name || d.netbanking_bank_name || '').trim() || (d.provider ? titleise(d.provider) : '')
  const detail = [
    bank,
    d.card_network && `${titleise(d.card_network)}${d.card_type ? ` ${d.card_type.replace(/_/g, ' ')}` : ''}`,
    d.card_number && `••${String(d.card_number).slice(-4)}`,
    d.upi_id,
  ]
    .filter(Boolean)
    .join(' · ')
  return {
    label: emi ? (/cardless/.test(group + kind) ? 'Cardless EMI' : 'EMI') : GROUP_LABELS[group] || titleise(kind) || 'Cashfree',
    emi,
    detail,
    bank,
    reference: p.bank_reference ? String(p.bank_reference) : '',
  }
}

export type FoundPayment = {
  orderId: string
  cfPaymentId: string
  amount: number
  paidAt: string | null
  method: PaymentMethod | null
  customer: { name: string; email: string; phone: string }
}

function normalise(order: CfOrderDetail | null, p: CfPayment): FoundPayment {
  return {
    orderId: order?.order_id || p.order_id || '',
    cfPaymentId: p.cf_payment_id ? String(p.cf_payment_id) : '',
    amount: Number(p.payment_amount ?? order?.order_amount ?? 0),
    paidAt: p.payment_time || order?.created_at || null,
    method: describePayment(p),
    customer: {
      name: order?.customer_details?.customer_name || '',
      email: (order?.customer_details?.customer_email || '').toLowerCase(),
      phone: order?.customer_details?.customer_phone || '',
    },
  }
}

/** A bare transaction id, if the account serves that route; null when it does not. */
async function paymentById(id: string): Promise<CfPayment | null> {
  for (const path of [`/payments/${encodeURIComponent(id)}`, `/orders/payments/${encodeURIComponent(id)}`]) {
    try {
      const data = await call<CfPayment | CfPayment[]>(path)
      const p = Array.isArray(data) ? data[0] : data
      if (p?.cf_payment_id && p.order_id) return p
    } catch {
      /* route unavailable — fall through */
    }
  }
  return null
}

const status = (err: unknown) => (err instanceof CashfreeError ? err.status : 0)

/**
 * Resolve whatever reference an admin has to hand — an order id, a
 * payment-link id, or a transaction id — into a successful Cashfree payment.
 * Auth and network failures throw; "not there" and "not paid" come back as
 * `{ found: false, detail }` for the admin to read.
 */
export async function findCashfreePayment(reference: string): Promise<{ found: true; via: 'payment' | 'order' | 'link'; payment: FoundPayment } | { found: false; detail: string }> {
  const ref = reference.trim()
  if (!ref) return { found: false, detail: 'Paste a Cashfree Order ID or Transaction ID.' }

  // 0. A bare number is a transaction id; resolve it without an order if the account allows.
  if (/^\d{6,}$/.test(ref)) {
    const p = await paymentById(ref)
    if (p) {
      if (!isSuccess(p)) return { found: false, detail: `Transaction ${ref} exists but its status is ${p.payment_status || 'unknown'}, not SUCCESS.` }
      const order = await call<CfOrderDetail>(`/orders/${encodeURIComponent(String(p.order_id))}`).catch(() => null)
      return { found: true, via: 'payment', payment: normalise(order, p) }
    }
  }

  // 1. An order id.
  try {
    const order = await call<CfOrderDetail>(`/orders/${encodeURIComponent(ref)}`)
    if (order?.order_id) {
      const paid = (await getCashfreePayments(ref).catch(() => [])).find(isSuccess)
      if (paid) return { found: true, via: 'order', payment: normalise(order, paid) }
      return { found: false, detail: `Order ${ref} exists but has no successful payment (status ${order.order_status || 'unknown'}).` }
    }
  } catch (err) {
    if (status(err) && status(err) !== 404) throw err
  }

  // 2. A payment-link id.
  try {
    const link = await call<{ link_id?: string; link_status?: string }>(`/links/${encodeURIComponent(ref)}`)
    if (link?.link_id) {
      const orders = await call<CfOrderDetail[]>(`/links/${encodeURIComponent(ref)}/orders`).catch(() => [])
      for (const o of Array.isArray(orders) ? orders : []) {
        const paid = (await getCashfreePayments(o.order_id).catch(() => [])).find(isSuccess)
        if (paid) return { found: true, via: 'link', payment: normalise(o, paid) }
      }
      return { found: false, detail: `Payment link ${ref} exists but nobody has paid it yet (status ${link.link_status || 'unknown'}).` }
    }
  } catch (err) {
    if (status(err) && status(err) !== 404) throw err
  }

  if (/^\d{6,}$/.test(ref)) {
    return { found: false, detail: `Cashfree wouldn’t return transaction ${ref} on its own. Open it in the Cashfree dashboard and paste the Order ID from that same row instead — that always works.` }
  }
  return { found: false, detail: `Nothing in Cashfree matches “${ref}”.` }
}
