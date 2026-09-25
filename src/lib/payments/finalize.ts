import { append } from '@/lib/analytics/store'
import { randomId } from '@/lib/analytics/events'
import { getCashfreeOrder } from '@/lib/payments/cashfree'
import { ordersCollection, type OrderDoc } from '@/lib/payments/orders'

/**
 * After a payment: make sure it is real, record it once, and hand the buyer to
 * the LMS. Called by the Cashfree webhook and by /thank-you, in either order,
 * any number of times.
 *
 * Nothing here trusts the browser. The only thing that moves an order to
 * "paid" is Cashfree itself answering PAID for it, asked from this server.
 */

export type FinalState =
  | { status: 'unknown' }
  | { status: 'pending' | 'failed'; order: OrderDoc }
  | { status: 'paid' | 'provisioned'; order: OrderDoc }

export async function finalizeOrder(orderId: string): Promise<FinalState> {
  const orders = await ordersCollection()
  let order = await orders.findOne({ _id: orderId })
  if (!order) return { status: 'unknown' }
  if (order.status === 'provisioned') return { status: 'provisioned', order }

  if (order.status === 'created') {
    const cf = await getCashfreeOrder(orderId)
    if (cf.order_status !== 'PAID') {
      return { status: cf.order_status === 'ACTIVE' ? 'pending' : 'failed', order }
    }
    // The amount was set by this server when the order was made, so a
    // mismatch means something is badly wrong — stop rather than provision.
    if (Math.round(Number(cf.order_amount)) !== Math.round(order.amount)) {
      console.error(`[orders] ${orderId}: Cashfree says ₹${cf.order_amount}, order says ₹${order.amount}. Not provisioning.`)
      return { status: 'failed', order }
    }
    const won = await orders.findOneAndUpdate(
      { _id: orderId, status: 'created' },
      { $set: { status: 'paid', paidAt: new Date() } },
      { returnDocument: 'after' },
    )
    if (won) {
      // The sale, recorded once, by the one caller that moved it to paid. The
      // same shape the browser used to send, so the dashboard reads it as it
      // always has — only now it cannot be sent without the money.
      await append({
        id: randomId(),
        type: 'purchase',
        at: Date.now(),
        visitorId: order.visitorId || 'server',
        sessionId: order.sessionId || 'server',
        path: '/checkout',
        props: {
          orderId,
          modules: order.items,
          amount: order.amount,
          email: order.contact.email,
          name: order.contact.name,
        },
      }).catch((err) => console.error(`[orders] ${orderId}: purchase event not recorded:`, err))
    }
    order = (await orders.findOne({ _id: orderId }))!
    if (order.status === 'provisioned') return { status: 'provisioned', order }
  }

  // Paid, not yet in the LMS.
  try {
    const result = await provisionInLms(order)
    if (result === 'busy') return { status: 'paid', order }
    const done = await orders.findOneAndUpdate(
      { _id: orderId, status: 'paid' },
      {
        $set: {
          status: 'provisioned',
          provisionedAt: new Date(),
          'provision.created': result.created,
          'provision.batches': result.batches,
          'provision.warnings': result.warnings,
          'provision.lastError': '',
        },
        $inc: { 'provision.attempts': 1 },
      },
      { returnDocument: 'after' },
    )
    if (result.warnings.length) console.warn(`[orders] ${orderId}:`, result.warnings.join(' | '))
    return { status: 'provisioned', order: done ?? order }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[orders] ${orderId}: LMS provisioning failed:`, message)
    await orders.updateOne({ _id: orderId }, { $set: { 'provision.lastError': message.slice(0, 500) }, $inc: { 'provision.attempts': 1 } })
    return { status: 'paid', order }
  }
}

type LmsResult = { created: boolean; batches: string[]; warnings: string[] }

/**
 * The LMS makes the account, enrols it and sends the login mail. It is safe to
 * ask twice for one order — it answers the second time without acting — so
 * this simply asks until it gets a yes.
 */
async function provisionInLms(order: OrderDoc): Promise<LmsResult | 'busy'> {
  const base = (process.env.SKEO_LMS_API_URL || '').replace(/\/+$/, '')
  const secret = process.env.SKEO_PROVISION_SECRET || ''
  if (!base || !secret) throw new Error('SKEO_LMS_API_URL / SKEO_PROVISION_SECRET are not set.')

  const res = await fetch(`${base}/api/skeo/provision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      orderId: order._id,
      email: order.contact.email,
      name: order.contact.name,
      phone: order.contact.phone,
      items: order.items,
    }),
    signal: AbortSignal.timeout(25_000),
  })
  // Another request for this same order is mid-flight on the LMS. Not an
  // error — the next confirmation will find it done.
  if (res.status === 409) return 'busy'
  const body = (await res.json().catch(() => ({}))) as Partial<LmsResult> & { error?: string }
  if (!res.ok) throw new Error(`LMS ${res.status}: ${body.error || 'no detail'}`)
  return { created: Boolean(body.created), batches: body.batches ?? [], warnings: body.warnings ?? [] }
}
