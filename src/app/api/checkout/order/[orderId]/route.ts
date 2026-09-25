import { NextResponse } from 'next/server'
import { finalizeOrder } from '@/lib/payments/finalize'

/**
 * GET /api/checkout/order/:orderId — where does this order stand?
 *
 * /thank-you polls this after Cashfree sends the buyer back. It does more than
 * read: it confirms the payment with Cashfree and, if paid, asks the LMS for
 * the account — so a webhook that is late, or never comes, costs nothing.
 * Safe to call any number of times (see lib/payments/finalize.ts).
 *
 * Returns only what the thank-you page shows: the status, what was bought,
 * the amount, and the address the login mail went to.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  if (!/^SKEO-[A-Z0-9]+-[A-F0-9]{10}$/.test(orderId)) {
    return NextResponse.json({ status: 'unknown' }, { status: 404 })
  }
  try {
    const state = await finalizeOrder(orderId)
    if (state.status === 'unknown') return NextResponse.json({ status: 'unknown' }, { status: 404 })
    const { order } = state
    return NextResponse.json({
      status: state.status,
      orderId,
      items: order.items,
      amount: order.amount,
      email: order.contact.email,
    })
  } catch (err) {
    console.error(`[checkout] ${orderId}: status check failed:`, err)
    return NextResponse.json({ status: 'error' }, { status: 502 })
  }
}
