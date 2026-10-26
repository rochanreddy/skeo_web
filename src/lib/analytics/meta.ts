import type { EventProps, EventType } from './events'

/**
 * The Meta Pixel, alongside GA4 and the site's own event log.
 *
 * Three moments are what Meta's ads optimise on, and each is sent from the
 * component that owns it:
 *
 *   ViewContent       a course page opens               <MetaViewContent />
 *   InitiateCheckout  the order exists, Cashfree opens  lib/payment.ts
 *   Purchase          Cashfree has confirmed the money  /thank-you
 *
 * The last two carry the order number as their event id ("ic_<order>" and
 * "<order>"), and the server sends the same two events with the same ids
 * (lib/payments/meta.ts) — so Meta counts each once, whichever copy arrives,
 * and a refreshed thank-you page is not a second sale.
 *
 * On for the live site only, like GA, and only once NEXT_PUBLIC_META_PIXEL_ID
 * is set in Vercel. No personal details are sent from the browser: the server
 * sends them hashed.
 */

const live = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'

export const META_PIXEL_ID = (live ? process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '' : '').trim()
export const metaEnabled = /^\d{6,20}$/.test(META_PIXEL_ID)

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** The order's money and contents, exactly as the server reports them to Meta. */
export type MetaOrder = {
  currency: string
  value: number
  order_id: string
  content_ids: string[]
  content_name: string
  content_type: string
  num_items: number
}

const onAdmin = () => window.location.pathname.startsWith('/admin')

export function metaTrack(event: string, params?: Record<string, unknown>, eventID?: string): void {
  if (!metaEnabled || typeof window === 'undefined') return
  if (typeof window.fbq !== 'function' || onAdmin()) return
  try {
    if (eventID) window.fbq('track', event, params ?? {}, { eventID })
    else window.fbq('track', event, params ?? {})
  } catch {
    // Analytics must never be the reason a click fails.
  }
}

/** The site's own events that Meta also wants. Everything else stays with GA and the dashboard. */
export function forwardToMeta(type: EventType, props?: EventProps): void {
  if (!metaEnabled) return
  switch (type) {
    case 'pageview':
      // The base code does not fire one itself, so this is the only PageView:
      // on first load and on every client-side navigation.
      return metaTrack('PageView')
    case 'module_add':
      return metaTrack('AddToCart', { content_ids: [String(props?.module ?? '')], content_type: 'product' })
    case 'verify_ok':
      // A verified phone and email: the visitor is now a lead.
      return metaTrack('Lead', { content_ids: Array.isArray(props?.modules) ? props.modules : [] })
    default:
      return undefined
  }
}

export function metaViewContent(item: { ids: string[]; name: string; value: number }): void {
  metaTrack('ViewContent', { content_ids: item.ids, content_name: item.name, content_type: 'product', value: item.value, currency: 'INR' })
}

export function metaInitiateCheckout(order: MetaOrder | undefined): void {
  if (!order?.order_id) return
  const { order_id: orderId, ...params } = order
  metaTrack('InitiateCheckout', params, `ic_${orderId}`)
}

export function metaPurchase(order: MetaOrder | undefined): void {
  if (!order?.order_id) return
  metaTrack('Purchase', order, order.order_id)
}

const cookie = (name: string) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : ''
}

/**
 * What the server needs to match a sale to an ad click: the pixel's browser
 * id and click id cookies, and the page the order was placed from. With no
 * _fbc cookie but an fbclid in the address (the pixel had not loaded yet), the
 * click id is built the way the pixel would build it.
 */
export function metaContext(): { fbp?: string; fbc?: string; pageUrl: string } {
  if (typeof window === 'undefined') return { pageUrl: '' }
  let fbc = cookie('_fbc')
  if (!fbc) {
    const clid = new URLSearchParams(window.location.search).get('fbclid')
    if (clid) fbc = `fb.1.${Date.now()}.${clid}`
  }
  const fbp = cookie('_fbp')
  return { ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}), pageUrl: window.location.href }
}
