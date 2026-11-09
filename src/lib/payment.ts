import type { CheckoutItem } from '@/lib/checkoutItems'
import type { CheckoutContact } from '@/lib/checkoutSession'
import { metaContext, metaInitiateCheckout, type MetaOrder } from '@/lib/analytics/meta'
import { sessionId, visitorId } from '@/lib/analytics/track'
import { apiError, friendlyError, reportError, type Stage } from '@/lib/friendlyError'

/**
 * Paying, from the browser's side: ask our server for an order, then hand the
 * buyer to Cashfree's payment popup. When it closes they go on to
 * /thank-you?order_id=…, which asks the server how the order stands.
 *
 * Deliberately NOT here: deciding the price, or deciding the payment worked.
 * The server prices the cart from the item keys, and only Cashfree answering
 * PAID to the server unlocks anything — so nothing in this file can be edited
 * in a browser into a free account.
 */

/* `retry` says whether pressing Pay again can help: yes for a dropped
   connection or a slow server, no for "Early Access has ended". */
type StartResult = { ok: true; orderId: string } | { ok: false; error: string; retry: boolean }

function failed(stage: Stage, err: unknown): StartResult {
  const f = friendlyError(err, stage)
  reportError(stage, err, f)
  return { ok: false, error: f.message, retry: f.retry }
}

type CheckoutResult = { error?: { message?: string } | null; paymentDetails?: unknown } | null | undefined
type CashfreeCheckout = { checkout: (opts: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_modal' }) => Promise<CheckoutResult> }
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

/* `stay`: the campaign pages keep the buyer where they are once Cashfree
   closes and show the result in their own dialog (PaidNotice), rather than
   moving on to /thank-you. */
export async function startPayment(
  order: { items: CheckoutItem[]; contact: CheckoutContact },
  { stay = false }: { stay?: boolean } = {},
): Promise<StartResult> {
  let res: Response
  try {
    res = await fetch('/api/checkout/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // metaContext: the pixel's cookies and this page, so the server's copy of
      // the sale can be matched to the ad click (lib/payments/meta.ts).
      body: JSON.stringify({ ...order, visitorId: visitorId(), sessionId: sessionId(), ...metaContext() }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    return failed('order', apiError(timedOut ? 'The server took too long to respond.' : 'Could not reach skeo.', { kind: timedOut ? 'timeout' : 'network' }))
  }
  const session = (await res.json().catch(() => ({}))) as { orderId?: string; paymentSessionId?: string; mode?: 'sandbox' | 'production'; error?: string; meta?: MetaOrder }
  if (!res.ok || !session.paymentSessionId || !session.orderId) {
    return failed('order', apiError(session.error || 'Could not start the payment.', { kind: 'http', status: res.ok ? 502 : res.status }))
  }

  // The order exists and Cashfree is about to open: the checkout has begun.
  metaInitiateCheckout(session.meta)

  try {
    await loadSdk()
    const cashfree = window.Cashfree!({ mode: session.mode === 'production' ? 'production' : 'sandbox' })
    // _modal: Cashfree opens over this page and the promise settles when it
    // closes. Its result is not the truth: a closed window can follow money
    // that did leave, so the server, which asks Cashfree, has the last word.
    const result = await cashfree.checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: '_modal' })
    if (result?.error && !(await orderIsPaid(session.orderId))) {
      return {
        ok: false,
        retry: true,
        error: 'The payment wasn’t completed. If you approved it in your UPI app, wait a minute before trying again.',
      }
    }
    if (!stay) window.location.assign(`/thank-you?order_id=${encodeURIComponent(session.orderId)}`)
    return { ok: true, orderId: session.orderId }
  } catch (err) {
    return failed('payment', err)
  }
}

async function orderIsPaid(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/checkout/order/${encodeURIComponent(orderId)}`, { cache: 'no-store' })
    const view = (await res.json()) as { status?: string }
    return view.status === 'paid' || view.status === 'provisioned'
  } catch {
    return false
  }
}
