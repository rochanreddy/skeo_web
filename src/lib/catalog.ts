import { announcement, faq, hero, offer as offerDefaults, pricing, valueStack } from '@/lib/earlyAccess'
import { COMING_SOON, MODULE_ROWS, PLANS, type ModuleRow, type Plan, type PlanKey } from '@/lib/plans'

/**
 * Everything on the site that can be edited from Sanity, in one object.
 *
 * The code still decides what EXISTS — which plans there are, their keys, the
 * logos beside them, what the LMS unlocks for each. Sanity only overrides the
 * words and numbers on things that already exist. Adding a new course is a code
 * change; renaming one or changing its price is not.
 *
 * `defaultCatalog` is the code's own copy (lib/plans, lib/earlyAccess). It is
 * what the site runs on when Sanity is not configured, cannot be reached, or
 * sends a value that fails the checks in lib/cms — so the site never shows a
 * blank where a price should be.
 *
 * Pure and isomorphic: the server reads it to render and to charge, and the
 * browser gets the same object through CatalogProvider, so the cart and the
 * server can never price the same thing differently.
 */

export type CampaignCopy = {
  /** The anchor price shown struck through, in rupees. */
  was: number
  /** ISO timestamp with offset. The order route stops selling Early Access after it. */
  endsAt: string
  terms: string
  announcement: { lead: string; cta: string }
  hero: { lines: readonly string[]; lede: string; cta: string; checks: readonly string[] }
  valueStack: readonly string[]
  pricing: { plan: string; items: readonly string[]; cta: string; small: string }
  faq: readonly { q: string; a: string }[]
}

export type Catalog = {
  plans: Record<PlanKey, Plan>
  modules: ModuleRow[]
  /** Only the words are editable; the logos are code. */
  comingSoon: Omit<typeof COMING_SOON, 'title' | 'subtitle'> & { title: string; subtitle: string }
  campaign: CampaignCopy
}

export const defaultCatalog: Catalog = {
  plans: PLANS,
  modules: MODULE_ROWS,
  comingSoon: COMING_SOON,
  campaign: {
    was: offerDefaults.was,
    endsAt: offerDefaults.endsAt,
    terms: offerDefaults.terms,
    announcement: { lead: announcement.lead, cta: announcement.cta },
    hero: { lines: hero.lines, lede: hero.lede, cta: hero.cta, checks: hero.checks },
    valueStack: valueStack.items,
    pricing: { plan: pricing.plan, items: pricing.items, cta: pricing.cta, small: pricing.small },
    faq: faq.items,
  },
}

/** The Early Access offer as the page and the order route both see it. */
export function offerOf(c: Catalog) {
  return { price: c.plans.earlyaccess.amount, was: c.campaign.was, endsAt: c.campaign.endsAt, terms: c.campaign.terms }
}

export const savePctOf = (c: Catalog) => Math.round((1 - c.plans.earlyaccess.amount / c.campaign.was) * 100)

export const offerEndedFor = (c: Catalog, now = Date.now()) => now >= Date.parse(c.campaign.endsAt)
