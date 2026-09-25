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
