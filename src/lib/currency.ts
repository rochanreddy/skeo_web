'use client'

import { useEffect, useState } from 'react'

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

/* The timezone is the signal, with the language as a fallback: both are on the
   browser already, neither costs a request, and neither is an IP lookup that
   would put a third party between a reader and a price.
   It answers "in India" rather than "abroad" so that anything unreadable —
   a locked-down browser, a stripped Intl — falls back to the home market
   rather than silently charging someone twice. */
const inIndia = () => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (zone) return zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta'
    return (navigator.language || '').toLowerCase().endsWith('-in')
  } catch {
    return true
  }
}

/**
 * India is the home market, so rupees are what the server renders and what the
 * first client pass shows; an overseas reader is switched a beat later.
 *
 * That order is deliberate rather than lazy. The check needs the browser, so
 * running it during render would make the server's HTML and the client's first
 * pass disagree — and React does not repair text that mismatches, so the page
 * can be left showing a price that belongs to neither.
 */
export function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>('INR')

  useEffect(() => {
    if (!inIndia()) setCurrency('USD')
  }, [])

  return currency
}
