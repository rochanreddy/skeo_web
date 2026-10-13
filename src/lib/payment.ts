import type { CheckoutItem } from '@/lib/checkoutItems'
import type { CheckoutContact } from '@/lib/checkoutSession'
import { sessionId, visitorId } from '@/lib/analytics/track'
import { apiError, friendlyError, reportError, type Stage } from '@/lib/friendlyError'

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

/* `retry` says whether pressing Pay again can help: yes for a dropped
   connection or a slow server, no for "Early Access has ended". */
type StartResult = { ok: true } | { ok: false; error: string; retry: boolean }

function failed(stage: Stage, err: unknown): StartResult {
  const f = friendlyError(err, stage)
  reportError(stage, err, f)
  return { ok: false, error: f.message, retry: f.retry }
}

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
  let res: Response
  try {
    res = await fetch('/api/checkout/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, visitorId: visitorId(), sessionId: sessionId() }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    return failed('order', apiError(timedOut ? 'The server took too long to respond.' : 'Could not reach skeo.', { kind: timedOut ? 'timeout' : 'network' }))
  }
  const session = (await res.json().catch(() => ({}))) as { paymentSessionId?: string; mode?: 'sandbox' | 'production'; error?: string }
  if (!res.ok || !session.paymentSessionId) {
    return failed('order', apiError(session.error || 'Could not start the payment.', { kind: 'http', status: res.ok ? 502 : res.status }))
  }

  try {
    await loadSdk()
    const cashfree = window.Cashfree!({ mode: session.mode === 'production' ? 'production' : 'sandbox' })
    // _self: the payment page replaces this one, and Cashfree's return_url
    // brings the buyer to /thank-you. Nothing after this line runs on success.
    await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: '_self' })
    return { ok: true }
  } catch (err) {
    return failed('payment', err)
  }
}
