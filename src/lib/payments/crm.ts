import type { OrderDoc } from '@/lib/payments/orders'
import { metaValue } from '@/lib/payments/meta'

/**
 * The sale, recorded in the CRM (Amplifeed) — who bought, what, for how much,
 * and the order number to find it by in Cashfree.
 *
 * Sent once, by the caller that moved the order to paid (finalize.ts). Off
 * until AMPLIFEED_WEBHOOK_URL and AMPLIFEED_WEBHOOK_SECRET are set in Vercel —
 * the inbound lead-source URL and secret from Amplifeed for skeo. Never throws:
 * a CRM outage must not make a payment look unhandled.
 */
export async function sendSaleToCrm(order: OrderDoc): Promise<void> {
  const url = (process.env.AMPLIFEED_WEBHOOK_URL || '').trim()
  const secret = (process.env.AMPLIFEED_WEBHOOK_SECRET || '').trim()
  if (!url || !secret) return

  const digits = order.contact.phone.replace(/\D/g, '')
  const payload = {
    name: order.contact.name,
    email: order.contact.email,
    phone: digits.length === 10 ? `+91${digits}` : order.contact.phone,
    lead_source: 'Website',
    lead_sub_source: 'skeo-purchase',
    source: 'skeo-purchase',
    channel: 'web',
    communication_optin: true,
    lead_quality: 'verified',
    page_url: order.meta?.url,
    // The sale itself.
    program: order.items.join(', '),
    course: order.title || order.items.join(', '),
    order_id: order._id,
    paid_amount: order.amount,
    // What Meta was told the sale was worth, so the two can be reconciled.
    reported_value: metaValue(order.amount),
    currency: 'INR',
    payment_status: 'paid',
    checkout_completed: true,
    checkout_at: order.paidAt ?? new Date(),
    submitted_at: order.createdAt,
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': secret },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8_000),
      })
      if (res.ok) return
      // A 4xx will not get better by asking again.
      if (res.status < 500 && res.status !== 429) {
        console.error(`[crm] ${order._id}: Amplifeed ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`)
        return
      }
    } catch (err) {
      if (attempt === 3) console.error(`[crm] ${order._id}: Amplifeed unreachable:`, err instanceof Error ? err.message : err)
    }
    await new Promise((r) => setTimeout(r, 500 * attempt))
  }
}
