'use client'

import { price, useCurrency } from '@/lib/currency'

/**
 * One price, in the reader's money.
 *
 * It exists so that a server-rendered section does not have to become a client
 * component just to show a figure: the section stays on the server and only
 * the number crosses over. See lib/currency for which currency a reader gets
 * and why the answer arrives a beat after the first paint.
 */
export function Price({ inr }: { inr: number }) {
  return <>{price(inr, useCurrency())}</>
}
