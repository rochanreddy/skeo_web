import crypto from 'node:crypto'
import type { Collection } from 'mongodb'
import { mongoDb } from '@/lib/db/mongo'
import type { CheckoutItem } from '@/lib/checkoutItems'
import type { PaymentMethod } from '@/lib/payments/cashfree'

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
  /** Recorded by hand in the admin — money taken off the website, through a
   *  Cashfree payment link or otherwise. Absent on website orders. */
  manual?: ManualPayment
  /** Which monthly cohort ("2026-08"), set from the admin. Not the month they
   *  paid in: someone paying late in August can still start in September. */
  batch?: string
  /** The deal behind the payment: the list price, what this buyer was sold it
   *  for, and which instalment this payment is. */
  deal?: { actualPrice?: number; soldPrice?: number; cycle?: number }
}

export type ManualPayment = {
  /** What they paid for, as written — a course's name, or anything else. */
  program: string
  /** Asked to give them the LMS login (and playbooks) for `items`. Without it
   *  the payment is only recorded, and nothing is sent. */
  access: boolean
  /** Checked against Cashfree: amount and payer came from the gateway. */
  verified: boolean
  verifiedAt?: Date
  verifiedVia?: 'payment' | 'order' | 'link'
  cfOrderId?: string
  cfPaymentId?: string
  /** Typed off the Cashfree dashboard, unchecked. Kept apart from
   *  cfPaymentId so a number nobody checked never passes for a confirmed one. */
  txnId?: string
  method?: PaymentMethod | null
  note?: string
  addedAt: Date
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
