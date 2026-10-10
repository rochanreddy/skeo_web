import { defaultCatalog, type Catalog } from '@/lib/catalog'
import { MODULE_KEYS, type ModuleKey, type ModuleRow } from '@/lib/plans'

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
 *  price from /campaign/everything-ai. Each is sold on its own — it already includes
 *  every tool. */
export const isAllAccess = (items: readonly string[]) => items.includes('member') || items.includes('earlyaccess')

export const isCheckoutItem = (value: unknown): value is CheckoutItem =>
  typeof value === 'string' && (CHECKOUT_ITEMS as readonly string[]).includes(value)

export type CheckoutRow = Omit<ModuleRow, 'key'> & { key: CheckoutItem }

/**
 * Every row a checkout can show, priced from a catalog — the one the page was
 * rendered with in the browser, the one Sanity has published now on the server.
 * Everything AI and its early-access price are listed the way a tool is.
 */
export function checkoutRows(c: Catalog): readonly CheckoutRow[] {
  return [
    ...c.modules,
    {
      key: 'member',
      title: c.plans.member.title,
      subtitle: 'Every tool, every batch — including the ones added later',
      amount: c.plans.member.amount,
      marks: ['claude', 'chatgpt', 'gemini', 'n8n', 'lovable'],
    },
    {
      key: 'earlyaccess',
      title: c.plans.earlyaccess.title,
      subtitle: 'Everything in skeo, at the early-access price',
      amount: c.plans.earlyaccess.amount,
      marks: ['claude', 'chatgpt', 'gemini', 'n8n', 'lovable'],
    },
  ]
}

/** The code's own rows. For labels in the admin and analytics, which only need
 *  a title per key — never for a price a buyer sees or pays. */
export const CHECKOUT_ROWS = checkoutRows(defaultCatalog)

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

/** Rupees, from the keys alone, at the catalog's prices. The catalog is
 *  required on purpose: the order route must price with what is published now. */
export function priceOf(items: readonly CheckoutItem[], c: Catalog): number {
  const rows = checkoutRows(c)
  return normaliseItems(items).reduce((sum, key) => sum + (rows.find((r) => r.key === key)?.amount ?? 0), 0)
}
