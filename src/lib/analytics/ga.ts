import { CHECKOUT_ROWS } from '@/lib/checkoutItems'
import type { EventProps, EventType } from './events'

/**
 * Google Analytics 4, alongside the site's own event log.
 *
 * The admin dashboard stays the source of truth for orders and revenue — it is
 * built from events the server stamps itself. GA is here for what it does that
 * the dashboard cannot: where visitors came from, which campaign, which city,
 * and an audience Google Ads can be pointed at.
 *
 * Nothing new has to be instrumented. `track()` already names every moment
 * that matters, so this file only translates those moments into the event
 * names GA's own reports understand.
 *
 * On for the live site only. `npm run dev` and Vercel preview deployments send
 * nothing, so neither your own clicks while developing nor a branch preview
 * show up as visitors.
 */

/** skeo's GA4 web stream (www.skeoai.com). Public: it is in every page's HTML. */
const DEFAULT_GA_ID = 'G-0PHT0YQ7ME'

const live = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'

/** NEXT_PUBLIC_GA_ID overrides the stream above; set it to an empty string to
 *  switch Google Analytics off without a code change. */
export const GA_ID = (process.env.NEXT_PUBLIC_GA_ID ?? (live ? DEFAULT_GA_ID : '')).trim()

/** A measurement id looks like G-XXXXXXXXXX; anything else is treated as unset. */
export const gaEnabled = /^G-[A-Z0-9]{6,}$/.test(GA_ID)

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type Params = Record<string, unknown>

/** The operator reading /admin is not a visitor — same rule as <Analytics />. */
const onAdmin = () => window.location.pathname.startsWith('/admin')

/**
 * Queues one event. Goes through the gtag() the layout defines in <head>, so
 * an event fired before gtag.js has finished downloading waits in the queue
 * rather than being lost.
 */
export function gaEvent(name: string, params?: Params): void {
  if (!gaEnabled || typeof window === 'undefined') return
  if (typeof window.gtag !== 'function' || onAdmin()) return
  try {
    window.gtag('event', name, params)
  } catch {
    // Analytics must never be the reason a click fails.
  }
}

const asKeys = (value: EventProps[string]): string[] =>
  Array.isArray(value) ? value : typeof value === 'string' ? [value] : []

/** A cart, in the shape GA's ecommerce reports expect. Prices are rupees. */
function cart(keys: readonly string[]): Params {
  const items = keys.map((key) => {
    const row = CHECKOUT_ROWS.find((r) => r.key === key)
    return { item_id: key, item_name: row?.title ?? key, price: row?.amount ?? 0, quantity: 1 }
  })
  return { currency: 'INR', value: items.reduce((sum, item) => sum + item.price, 0), items }
}

/**
 * The site's own events, renamed for GA.
 *
 * Only the tool keys and amounts cross over. Email, name and phone are on
 * several of these events for the dashboard's benefit and are deliberately
 * dropped here: Google's terms forbid sending it anything that identifies a
 * person, and the property can be suspended for it.
 *
 * `pageview` is absent on purpose — GA counts page views itself, on load and
 * on every client-side navigation. `purchase` is absent too: the site's own
 * purchase event is written by the server, so GA's is sent from the thank-you
 * page instead (see gaPurchase).
 */
export function forwardToGa(type: EventType, props?: EventProps): void {
  if (!gaEnabled) return
  switch (type) {
    case 'signup':
      return gaEvent('sign_up', { method: 'email' })
    case 'signin':
      return gaEvent('login', { method: 'email' })
    case 'module_add':
      return gaEvent('add_to_cart', cart(asKeys(props?.module)))
    case 'module_remove':
      return gaEvent('remove_from_cart', cart(asKeys(props?.module)))
    case 'checkout_intent':
      return gaEvent('begin_checkout', cart(asKeys(props?.modules)))
    case 'verify_sent':
      return gaEvent('verify_sent', cart(asKeys(props?.modules)))
    case 'verify_ok':
      // A verified phone and email is the moment a visitor becomes a lead.
      return gaEvent('generate_lead', { ...cart(asKeys(props?.modules)), lead_source: 'checkout_verified' })
    case 'checkout_view':
      return gaEvent('checkout_view', cart(asKeys(props?.modules)))
    case 'lead':
      return gaEvent('generate_lead', { lead_source: 'enquiry' })
    case 'lms_open':
      return gaEvent('lms_open', { target: props?.target })
    case 'next_interest':
      return gaEvent('next_interest', { item_id: props?.module })
    default:
      return undefined
  }
}

/**
 * A completed payment, sent once per order.
 *
 * The thank-you page polls and can be reloaded, so the order id is remembered
 * in localStorage: without that a buyer refreshing the page would be counted
 * as a second sale. GA also de-duplicates on transaction_id, but only within
 * one session.
 */
export function gaPurchase(order: { orderId: string; items: readonly string[]; amount: number }): void {
  if (!gaEnabled || typeof window === 'undefined') return
  const key = `skeo.ga.purchase.${order.orderId}`
  try {
    if (window.localStorage.getItem(key)) return
    window.localStorage.setItem(key, '1')
  } catch {
    // No storage: send it anyway. A possible double count beats a missing sale.
  }
  gaEvent('purchase', { ...cart(order.items), transaction_id: order.orderId, value: order.amount })
}
