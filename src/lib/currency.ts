export type Currency = 'INR' | 'USD'

/**
 * What a seat costs, and in whose money.
 *
 * Every price in this codebase is stored in rupees — that is the base the
 * business actually prices in, and it is what the admin figures and the order
 * records are denominated in. This module is the only place that turns one of
 * those into something a reader sees.
 */

/* Overseas pricing is five times the Indian price in real terms: the rupee
   figure converted at this rate, then multiplied by OVERSEAS_MULTIPLE.
   The rate is a constant rather than a live lookup on purpose. A price that
   moves with the market is worse than one that is a few percent stale, and a
   lookup that fails leaves the page with no price at all — which is the one
   outcome a pricing card must never have. Revisit it when it drifts, by
   editing this line. */
export const INR_PER_USD = 88

/** What an overseas reader pays relative to the home price, in real terms. */
export const OVERSEAS_MULTIPLE = 5

/** Rupees to the dollar figure an overseas reader is shown. */
export const usdFor = (inr: number) =>
  Math.max(1, Math.round((inr / INR_PER_USD) * OVERSEAS_MULTIPLE))

/** A price, written for the reader. */
export const price = (inr: number, currency: Currency) =>
  currency === 'INR' ? `₹${inr.toLocaleString('en-IN')}` : `$${usdFor(inr)}`

/**
 * Rupees for every reader, wherever they are. Checkout charges INR — Cashfree
 * is sent order_currency INR and nothing else — so showing anyone a dollar
 * price would promise a figure the payment page then contradicts. When
 * international payments are enabled on the Cashfree account and orders are
 * really charged in USD, this is the switch to turn back on.
 */
export function useCurrency(): Currency {
  return 'INR'
}
