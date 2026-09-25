import type { CheckoutItem } from '@/lib/checkoutItems'
import type { CheckoutContact } from '@/lib/checkoutSession'
import { sessionId, visitorId } from '@/lib/analytics/track'

/**
 * Paying, from the browser's side: ask our server for an order, then hand the
 * buyer to Cashfree's payment page. Cashfree sends them back to
 * /thank-you?order_id=… when they are done.
 *
 * Deliberately NOT here: deciding the price, or deciding the payment worked.
 * The server prices the cart from the item keys, and only Cashfree answering
 * PAID to the server unlocks anything — so nothing in this file can be edited
 * in a browser into a free account.
 */

type StartResult = { ok: true } | { ok: false; error: string }

type CashfreeCheckout = { checkout: (opts: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' }) => Promise<unknown> }
declare global {
  interface Window {
    Cashfree?: (opts: { mode: 'sandbox' | 'production' }) => CashfreeCheckout
  }
}

const SDK = 'https://sdk.cashfree.com/js/v3/cashfree.js'

function loadSdk(): Promise<void> {
  if (window.Cashfree) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`)
    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Could not load the payment page. Check your connection and try again.')), { once: true })
    if (!existing) {
      script.src = SDK
      script.async = true
      document.head.appendChild(script)
    }
  })
}

export async function startPayment(order: { items: CheckoutItem[]; contact: CheckoutContact }): Promise<StartResult> {
  let session: { paymentSessionId?: string; mode?: 'sandbox' | 'production'; error?: string }
  try {
    const res = await fetch('/api/checkout/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, visitorId: visitorId(), sessionId: sessionId() }),
    })
    session = await res.json()
    if (!res.ok || !session.paymentSessionId) {
      return { ok: false, error: session.error || 'Could not start the payment. Please try again.' }
    }
  } catch {
    return { ok: false, error: 'Could not reach skeo. Check your connection and try again.' }
  }

  try {
    await loadSdk()
    const cashfree = window.Cashfree!({ mode: session.mode === 'production' ? 'production' : 'sandbox' })
    // _self: the payment page replaces this one, and Cashfree's return_url
    // brings the buyer to /thank-you. Nothing after this line runs on success.
    await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: '_self' })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'The payment page did not open. Please try again.' }
  }
}
