import { NextResponse } from 'next/server'
import { normaliseItems, priceOf } from '@/lib/checkoutItems'
import { validateEmail, validateName, validatePhone } from '@/lib/validation'
import { mongoConfigured } from '@/lib/db/mongo'
import {
  cashfreeConfigured,
  cashfreeCustomerId,
  cashfreeMode,
  cashfreePhone,
  createCashfreeOrder,
} from '@/lib/payments/cashfree'
import { newOrderId, ordersCollection } from '@/lib/payments/orders'

/**
 * POST /api/checkout/order — start paying for a cart.
 *
 * Takes WHAT is being bought and WHO is buying it, never how much: the amount
 * is priced here from the item keys. Returns the Cashfree session the browser
 * opens the payment page with. Nothing is unlocked by this call — only a PAID
 * answer from Cashfree does that (lib/payments/finalize.ts).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Enough for anyone genuinely checking out; not enough to spam Cashfree with
// orders from one address.
const LIMIT = 10
const WINDOW_MS = 10 * 60_000
const hits = new Map<string, { n: number; at: number }>()
function limited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.at > WINDOW_MS) {
    hits.set(ip, { n: 1, at: now })
    return false
  }
  h.n += 1
  return h.n > LIMIT
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })

  if (!cashfreeConfigured() || !mongoConfigured()) {
    return NextResponse.json({ error: 'Payments are not set up yet. Please try again later.' }, { status: 503 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const items = normaliseItems(Array.isArray(body?.items) ? body.items : [])
  const contactIn = (body?.contact ?? {}) as Record<string, unknown>
  const contact = {
    name: str(contactIn.name, 120),
    email: str(contactIn.email, 200).toLowerCase(),
    phone: str(contactIn.phone, 30),
  }

  const problem = !items.length
    ? 'Nothing to pay for.'
    : validateName(contact.name) || validateEmail(contact.email) || validatePhone(contact.phone)
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })

  const amount = priceOf(items)
  const orderId = newOrderId()
  // Cashfree sends the buyer back here and posts the result to the webhook.
  // SITE_URL wins so a preview deployment can still point at production; the
  // request's own origin is right for everything else.
  const origin = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, '')

  const orders = await ordersCollection()
  await orders.insertOne({
    _id: orderId,
    items,
    amount,
    contact,
    visitorId: str(body?.visitorId, 40),
    sessionId: str(body?.sessionId, 40),
    status: 'created',
    createdAt: new Date(),
    provision: { attempts: 0 },
  })

  try {
    const cf = await createCashfreeOrder({
      orderId,
      amount,
      customer: {
        id: cashfreeCustomerId(contact.email),
        name: contact.name,
        email: contact.email,
        phone: cashfreePhone(contact.phone),
      },
      returnUrl: `${origin}/thank-you?order_id={order_id}`,
      notifyUrl: `${origin}/api/checkout/webhook`,
    })
    if (!cf.payment_session_id) throw new Error('Cashfree returned no payment session.')
    await orders.updateOne({ _id: orderId }, { $set: { paymentSessionId: cf.payment_session_id } })
    return NextResponse.json({ orderId, amount, paymentSessionId: cf.payment_session_id, mode: cashfreeMode() })
  } catch (err) {
    console.error(`[checkout] ${orderId}: Cashfree order failed:`, err)
    await orders.deleteOne({ _id: orderId, status: 'created' })
    const message = err instanceof Error ? err.message : ''
    // Cashfree's own wording for a phone or email it rejects is useful to the
    // buyer; anything else is ours to fix, not theirs.
    const detail = /phone|email/i.test(message) ? message : 'Could not start the payment. Please try again.'
    return NextResponse.json({ error: detail }, { status: 502 })
  }
}
