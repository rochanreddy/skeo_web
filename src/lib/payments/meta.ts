import crypto from 'node:crypto'
import type { OrderDoc } from '@/lib/payments/orders'

/**
 * Meta Conversions API — the server's copy of the checkout and the sale.
 *
 * The browser pixel misses buyers: ad blockers, iOS privacy, a tab closed on
 * Cashfree's page. The server sees every order and every PAID answer, so it
 * sends the same two events itself, and Meta keeps one of each pair because
 * both copies carry the same event_id:
 *
 *   InitiateCheckout  event_id "ic_<orderId>"  — when the order is created
 *   Purchase          event_id "<orderId>"     — when Cashfree says PAID
 *
 * Off until META_CAPI_TOKEN and NEXT_PUBLIC_META_PIXEL_ID are set. Never
 * throws: a failed event is logged and the payment carries on as before.
 *
 *   NEXT_PUBLIC_META_PIXEL_ID  the dataset (pixel) id — also loads the pixel
 *   META_CAPI_TOKEN            Events Manager → dataset → Settings → Conversions
 *                              API → Generate access token. Vercel only.
 *   META_TEST_EVENT_CODE       optional; sends events to Events Manager's Test tab
 *   META_VALUE_EXCLUDES_GST    "1" reports value as price ÷ 1.18 (see metaValue)
 */

const pixelId = () => (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim()
const token = () => (process.env.META_CAPI_TOKEN || '').trim()
const graph = () => (process.env.META_GRAPH_VERSION || 'v23.0').trim()

export const metaConfigured = () => /^\d{6,20}$/.test(pixelId()) && Boolean(token())

/**
 * The value Meta is told a sale was worth. Prices include GST; with
 * META_VALUE_EXCLUDES_GST=1 the value is the price before tax, so return on ad
 * spend is measured on revenue skeo keeps. The browser is handed this same
 * figure (metaCustomData), so the two copies of an event never disagree.
 */
export function metaValue(amount: number): number {
  const n = Number(amount) || 0
  return process.env.META_VALUE_EXCLUDES_GST === '1' ? Math.round((n / 1.18) * 100) / 100 : n
}

/** What the buyer's browser told us when the order was made — see metaContextFrom. */
export type MetaContext = { ip?: string; ua?: string; fbp?: string; fbc?: string; url?: string }

/** The custom_data both copies of an event share: money, order number, what was bought. */
export function metaCustomData(order: Pick<OrderDoc, '_id' | 'items' | 'amount' | 'title'>) {
  return {
    currency: 'INR',
    value: metaValue(order.amount),
    order_id: order._id,
    content_ids: [...order.items],
    content_name: order.title || order.items.join(', '),
    content_type: 'product',
    num_items: order.items.length,
  }
}

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

/* Meta matches on hashes of normalised values: lower-case email, the phone
   as digits with its country code, names lower-case without punctuation. */
function userData(order: OrderDoc) {
  const email = order.contact.email.trim().toLowerCase()
  const digits = order.contact.phone.replace(/\D/g, '')
  const phone = digits.length === 10 ? `91${digits}` : digits
  const words = order.contact.name.toLowerCase().replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean)
  const ctx = order.meta || {}
  return {
    ...(email ? { em: [sha(email)] } : {}),
    ...(phone ? { ph: [sha(phone)] } : {}),
    ...(words[0] ? { fn: [sha(words[0])] } : {}),
    // Last word only: "Asha K. Rao" is surname "rao".
    ...(words.length > 1 ? { ln: [sha(words[words.length - 1])] } : {}),
    ...(email ? { external_id: [sha(email)] } : {}),
    // Sent as they are: Meta needs the raw values to match the browser.
    ...(ctx.ip ? { client_ip_address: ctx.ip } : {}),
    ...(ctx.ua ? { client_user_agent: ctx.ua } : {}),
    ...(ctx.fbp ? { fbp: ctx.fbp } : {}),
    ...(ctx.fbc ? { fbc: ctx.fbc } : {}),
  }
}

type Result = { ok: true } | { ok: false; skipped?: string; error?: string }

async function send(eventName: 'InitiateCheckout' | 'Purchase', eventId: string, order: OrderDoc): Promise<Result> {
  if (!metaConfigured()) return { ok: false, skipped: 'not configured' }
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    ...(order.meta?.url ? { event_source_url: order.meta.url } : {}),
    user_data: userData(order),
    custom_data: metaCustomData(order),
  }
  const test = (process.env.META_TEST_EVENT_CODE || '').trim()
  try {
    const res = await fetch(`https://graph.facebook.com/${graph()}/${pixelId()}/events?access_token=${encodeURIComponent(token())}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], ...(test ? { test_event_code: test } : {}) }),
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[meta] ${eventName} ${eventId} rejected: ${res.status} ${detail.slice(0, 300)}`)
      return { ok: false, error: `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    console.error(`[meta] ${eventName} ${eventId} failed:`, err instanceof Error ? err.message : err)
    return { ok: false, error: 'network' }
  }
}

export const sendInitiateCheckout = (order: OrderDoc) => send('InitiateCheckout', `ic_${order._id}`, order)
export const sendPurchase = (order: OrderDoc) => send('Purchase', order._id, order)

/**
 * The buyer's browser, kept on the order so the Purchase — sent later, often
 * from Cashfree's webhook where there is no browser — can still be matched to
 * the person who clicked the ad. Only well-formed values are kept.
 */
export function metaContextFrom(request: Request, body: Record<string, unknown> | null): MetaContext {
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const fbp = s(body?.fbp)
  const fbc = s(body?.fbc)
  const url = s(body?.pageUrl)
  const ctx: MetaContext = {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    ua: (request.headers.get('user-agent') || '').slice(0, 500),
    fbp: /^fb\.\d\.\d+\.\d+$/.test(fbp) ? fbp : '',
    fbc: /^fb\.\d\.\d+\.[\w-]{1,500}$/.test(fbc) ? fbc : '',
    url: /^https:\/\/(www\.)?skeoai\.com\//.test(url) ? url.slice(0, 1000) : '',
  }
  for (const k of Object.keys(ctx) as (keyof MetaContext)[]) if (!ctx[k]) delete ctx[k]
  return ctx
}
