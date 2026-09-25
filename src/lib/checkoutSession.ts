import { isCheckoutItem, normaliseItems, type CheckoutItem } from '@/lib/checkoutItems'

/**
 * The hand-off between the three steps of buying a tool: the cart on the
 * pricing card, the OTP screen that verifies who is buying, and /checkout.
 *
 * It lives in sessionStorage rather than the URL because the contact details
 * are personal — the tab that verified is the only tab that can check out, and
 * closing it drops everything. The real order is minted on the server when
 * the buyer presses Pay (app/api/checkout/order).
 */

const KEY = 'skeo.checkout'

export type CheckoutContact = {
  name: string
  email: string
  phone: string
}

export type CheckoutSession = {
  /** The tools, or Everything AI on its own — see lib/checkoutItems. */
  modules: CheckoutItem[]
  contact: CheckoutContact
  /** Epoch ms the OTP was accepted — /checkout refuses a stale verification. */
  verifiedAt: number
}

/** A verification is good for one sitting, not for a tab left open overnight. */
const MAX_AGE_MS = 30 * 60 * 1000

export function saveCheckoutSession(session: CheckoutSession) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // Private-mode or a full quota: the checkout guard sends them back to the
    // cart rather than half-loading an order we cannot describe.
  }
}

/** Returns null for anything missing, malformed, empty or expired. */
export function readCheckoutSession(): CheckoutSession | null {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(KEY)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { modules, contact, verifiedAt } = parsed as Partial<CheckoutSession>

    if (!Array.isArray(modules)) return null
    const keys = normaliseItems(modules.filter(isCheckoutItem))
    if (keys.length === 0) return null

    if (!contact || !contact.name || !contact.email || !contact.phone) return null
    if (typeof verifiedAt !== 'number' || Date.now() - verifiedAt > MAX_AGE_MS) return null

    return { modules: keys, contact, verifiedAt }
  } catch {
    return null
  }
}

export function clearCheckoutSession() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to clear if storage was unavailable in the first place.
  }
}
