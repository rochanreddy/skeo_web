import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { finalizeOrder } from '@/lib/payments/finalize'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/:orderId/verify — "Verify with Cashfree".
 *
 * Asks Cashfree for the order's status and, if it is paid, finishes anything
 * left undone: records the sale and asks the LMS for the account and mails.
 * The same step the webhook and the thank-you page run, so it is safe to press
 * any number of times — it is also how a stuck order is retried.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  const { orderId } = await params
  try {
    const state = await finalizeOrder(orderId)
    return NextResponse.json({ ok: true, status: state.status })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not check the order.' }, { status: 502 })
  }
}
