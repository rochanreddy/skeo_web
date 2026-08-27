/**
 * Stand-in for the payment gateway. Nothing is charged and no card details are
 * ever collected — the call waits, mints a plausible order id and succeeds, so
 * the checkout screen can be walked end to end.
 *
 * Swapping in a real gateway is contained to this file: /checkout only knows
 * `payForOrder` and the shape it returns.
 */

type PayResult = { ok: true; orderId: string } | { ok: false; error: string }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Reads like a real reference so the confirmation screen has something to show. */
function makeOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const noise = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0')
  return `SKEO-${stamp}-${noise}`
}

export async function payForOrder(_order: { amount: number }): Promise<PayResult> {
  await wait(1200)
  return { ok: true, orderId: makeOrderId() }
}
