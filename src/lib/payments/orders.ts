import crypto from 'node:crypto'
import type { Collection } from 'mongodb'
import { mongoDb } from '@/lib/db/mongo'
import type { CheckoutItem } from '@/lib/checkoutItems'

/**
 * Orders, in skeo's own database.
 *
 *   created      — a Cashfree order exists; nobody has paid it yet.
 *   paid         — Cashfree says PAID. The sale is recorded. The LMS account
 *                  may not exist yet (the LMS was down, say) — the order stays
 *                  here until it does, and every later confirmation retries.
 *   provisioned  — the LMS has the account and has sent the login mail.
 *
 * Each step is a compare-and-set on `status`, so the webhook and the buyer's
 * own return to /thank-you — which routinely arrive together — cannot both
 * record the sale or both ask for an account.
 */

export type OrderStatus = 'created' | 'paid' | 'provisioned'

export type OrderDoc = {
  _id: string
  items: CheckoutItem[]
  /** Rupees, priced on the server from `items`. */
  amount: number
  contact: { name: string; email: string; phone: string }
  /** The anonymous analytics ids of the browser that placed it, so the sale is
   *  credited to the visit that led to it. */
  visitorId: string
  sessionId: string
  status: OrderStatus
  paymentSessionId?: string
  createdAt: Date
  paidAt?: Date
  provisionedAt?: Date
  provision?: {
    attempts: number
    lastError?: string
    created?: boolean
    batches?: string[]
    warnings?: string[]
    /** Playbook mails the LMS has sent for this order, as "set#part/parts"
     *  ("ai#2/2"). Updated by the first delivery and by every admin resend. */
    playbookParts?: string[]
  }
  /** Sends made from the admin panel, newest last. */
  playbookSends?: { at: Date; parts: string[] }[]
}

export async function ordersCollection(): Promise<Collection<OrderDoc>> {
  return (await mongoDb()).collection<OrderDoc>('orders')
}

/** Reads like a real reference, and is unguessable enough that holding one is
 *  a fair stand-in for having placed the order. */
export function newOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const noise = crypto.randomBytes(5).toString('hex').toUpperCase()
  return `SKEO-${stamp}-${noise}`
}
