import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/payments/cashfree'
import { finalizeOrder } from '@/lib/payments/finalize'

/**
 * POST /api/checkout/webhook — Cashfree telling us about a payment.
 *
 * The signature is checked against the RAW body before anything is read from
 * it, so a forged "PAYMENT_SUCCESS" is a 401 rather than a free account. Even
 * a genuine one is not taken at its word: finalizeOrder asks Cashfree for the
 * order's status itself before acting.
 *
 * The status code is the retry signal. Cashfree retries anything that is not
 * a 2xx, so a paid order the LMS could not yet provision answers 500 — and
 * Cashfree comes back later — while everything settled answers 200.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const raw = await request.text()
  const ok = verifyWebhookSignature(
    request.headers.get('x-webhook-signature'),
    raw,
    request.headers.get('x-webhook-timestamp'),
  )
  if (!ok) return NextResponse.json({ error: 'bad signature' }, { status: 401 })

  let orderId = ''
  try {
    orderId = String(JSON.parse(raw)?.data?.order?.order_id || '')
  } catch {
    return NextResponse.json({ ok: true, ignored: 'unreadable body' })
  }
  if (!orderId.startsWith('SKEO-')) return NextResponse.json({ ok: true, ignored: 'not ours' })

  try {
    const state = await finalizeOrder(orderId)
    if (state.status === 'paid') {
      return NextResponse.json({ ok: false, retry: 'paid, not yet provisioned' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, status: state.status })
  } catch (err) {
    console.error(`[webhook] ${orderId}:`, err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
