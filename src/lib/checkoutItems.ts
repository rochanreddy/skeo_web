import { MODULE_KEYS, MODULE_ROWS, PLANS, type ModuleKey, type ModuleRow } from '@/lib/plans'

/**
 * Everything a checkout can hold: the individual tools, or the whole of skeo.
 *
 * Shared by the browser (to draw the order) and the server (to charge for it).
 * The server never takes an amount from the browser — it takes these keys and
 * prices them here, so a tampered request can change what is bought but never
 * what it costs.
 */
export type CheckoutItem = ModuleKey | 'member' | 'earlyaccess'

export const CHECKOUT_ITEMS: readonly CheckoutItem[] = [...MODULE_KEYS, 'member', 'earlyaccess']

/** The plans that unlock everything: Everything AI, and its early-access
 *  price from /early-access. Each is sold on its own — it already includes
 *  every tool. */
export const isAllAccess = (items: readonly string[]) => items.includes('member') || items.includes('earlyaccess')

export const isCheckoutItem = (value: unknown): value is CheckoutItem =>
  typeof value === 'string' && (CHECKOUT_ITEMS as readonly string[]).includes(value)

/** Everything AI as a row, so the checkout can list it the way it lists a tool. */
const MEMBER_ROW: Omit<ModuleRow, 'key'> & { key: 'member' } = {
  key: 'member',
  title: PLANS.member.title,
  subtitle: 'Every tool, every batch — including the ones added later',
  amount: PLANS.member.amount,
  marks: ['claude', 'chatgpt', 'gemini', 'n8n', 'lovable'],
}

const EARLY_ROW: Omit<ModuleRow, 'key'> & { key: 'earlyaccess' } = {
  key: 'earlyaccess',
  title: PLANS.earlyaccess.title,
  subtitle: 'Everything in skeo, at the early-access price',
  amount: PLANS.earlyaccess.amount,
  marks: ['claude', 'chatgpt', 'gemini', 'n8n', 'lovable'],
}

export type CheckoutRow = Omit<ModuleRow, 'key'> & { key: CheckoutItem }

export const CHECKOUT_ROWS: readonly CheckoutRow[] = [...MODULE_ROWS, MEMBER_ROW, EARLY_ROW]

/**
 * The cart as it will be charged: known keys only, no repeats, and Everything
 * AI on its own — it already includes every tool, so charging for both would
 * be charging twice for the same thing.
 */
export function normaliseItems(items: readonly unknown[]): CheckoutItem[] {
  const known = [...new Set(items.filter(isCheckoutItem))]
  if (known.includes('earlyaccess')) return ['earlyaccess']
  return known.includes('member') ? ['member'] : known
}

/** Rupees, from the keys alone. */
export function priceOf(items: readonly CheckoutItem[]): number {
  return normaliseItems(items).reduce((sum, key) => sum + (CHECKOUT_ROWS.find((r) => r.key === key)?.amount ?? 0), 0)
}
