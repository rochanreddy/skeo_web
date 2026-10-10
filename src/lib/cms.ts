import { cache } from 'react'
import { defaultCatalog, type CampaignCopy, type Catalog } from '@/lib/catalog'
import { PLANS, type Plan, type PlanKey } from '@/lib/plans'

/**
 * Reads the editable catalog from Sanity and lays it over the code's defaults.
 *
 * WHY EVERY FIELD IS CHECKED: these numbers are what people are charged. A
 * price typed as 6990 instead of 699, a deadline that does not parse, a feature
 * list emptied by mistake — each would reach the checkout as-is. So each field
 * is accepted only if it passes the same rules the Studio enforces (studio/
 * schemaTypes), and a field that fails falls back to the code's value on its
 * own, with a warning in the logs. One bad field never takes the rest down.
 *
 * The project ID is not a secret — it is in every Studio URL — and the dataset
 * is public-read, so no token is needed: only published documents are visible
 * without one, which is exactly what the site should show. Drafts stay drafts.
 */

const PROJECT_ID = process.env.SANITY_PROJECT_ID || ''
const DATASET = process.env.SANITY_DATASET || 'production'
const API_VERSION = '2025-02-19'

/** Seconds a page may show a catalog before asking Sanity again. */
export const CATALOG_REVALIDATE = 60
export const CATALOG_TAG = 'catalog'

export const cmsConfigured = () => Boolean(PROJECT_ID)

const QUERY = `{
  "plans": *[_type == "plan"]{ key, eyebrow, title, amount, features, subtitle },
  "comingSoon": *[_id == "comingSoon"][0]{ title, subtitle },
  "campaign": *[_id == "campaignEverythingAi"][0]{
    was, endsAt, terms,
    announcement{ lead, cta },
    hero{ lines, lede, cta, checks },
    valueStack,
    pricing{ plan, items, cta, small },
    faq[]{ q, a }
  }
}`

type Raw = {
  plans?: Array<Record<string, unknown>>
  comingSoon?: Record<string, unknown> | null
  campaign?: Record<string, unknown> | null
}

/* ---- Field checks. Each returns the value if it is safe to use, else undefined. */

const MAX_PRICE = 100_000

const text = (v: unknown, max = 300) =>
  typeof v === 'string' && v.trim() && v.trim().length <= max ? v.trim() : undefined

const price = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= MAX_PRICE ? v : undefined)

const list = (v: unknown, maxItems = 12, maxLen = 120) => {
  if (!Array.isArray(v) || !v.length || v.length > maxItems) return undefined
  const items = v.map((x) => text(x, maxLen))
  return items.every(Boolean) ? (items as string[]) : undefined
}

const date = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : undefined)

const obj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

/** Takes `next` when it passed its check, otherwise keeps `fallback` and says so. */
function pick<T>(field: string, next: T | undefined, raw: unknown, fallback: T): T {
  if (next !== undefined) return next
  if (raw !== undefined && raw !== null) console.warn(`[cms] ${field}: rejected ${JSON.stringify(raw)?.slice(0, 80)}, using the code's value`)
  return fallback
}

function mergePlan(key: PlanKey, base: Plan, doc: Record<string, unknown> | undefined): Plan {
  if (!doc) return base
  return {
    ...base,
    eyebrow: pick(`${key}.eyebrow`, text(doc.eyebrow, 40), doc.eyebrow, base.eyebrow),
    title: pick(`${key}.title`, text(doc.title, 80), doc.title, base.title),
    /* A custom-priced plan has no amount to edit. */
    amount: base.billing === 'custom' ? base.amount : pick(`${key}.amount`, price(doc.amount), doc.amount, base.amount),
    features: pick(`${key}.features`, list(doc.features, 10), doc.features, base.features),
  }
}

export function mergeCatalog(raw: Raw, base: Catalog = defaultCatalog): Catalog {
  const docs = new Map((raw.plans ?? []).map((d) => [d.key as string, d]))

  const plans = Object.fromEntries(
    (Object.keys(PLANS) as PlanKey[]).map((key) => [key, mergePlan(key, base.plans[key], docs.get(key))]),
  ) as Record<PlanKey, Plan>

  /* A tool's row on the pricing card shows the same title and price as its
     plan — one number per item, so the card and the checkout cannot drift. */
  const modules = base.modules.map((row) => {
    const doc = docs.get(row.key)
    return {
      ...row,
      title: plans[row.key].title,
      amount: plans[row.key].amount,
      subtitle: doc ? pick(`${row.key}.subtitle`, text(doc.subtitle, 200), doc.subtitle, row.subtitle) : row.subtitle,
    }
  })

  const cs = obj(raw.comingSoon)
  const comingSoon = {
    ...base.comingSoon,
    title: pick('comingSoon.title', text(cs.title, 120), cs.title, base.comingSoon.title),
    subtitle: pick('comingSoon.subtitle', text(cs.subtitle, 200), cs.subtitle, base.comingSoon.subtitle),
  }

  const c = obj(raw.campaign)
  const b = base.campaign
  const ann = obj(c.announcement)
  const hero = obj(c.hero)
  const pr = obj(c.pricing)
  const faqRaw = Array.isArray(c.faq) ? c.faq : undefined
  const faq = faqRaw?.length && faqRaw.length <= 12
    ? faqRaw.map((f) => ({ q: text(obj(f).q, 200), a: text(obj(f).a, 600) }))
    : undefined

  /* The anchor price must sit above the price, or "% OFF" turns negative. */
  const wasRaw = price(c.was)
  const was = wasRaw && wasRaw > plans.earlyaccess.amount ? wasRaw : undefined

  const campaign: CampaignCopy = {
    was: pick('campaign.was', was, c.was, b.was > plans.earlyaccess.amount ? b.was : plans.earlyaccess.amount),
    endsAt: pick('campaign.endsAt', date(c.endsAt), c.endsAt, b.endsAt),
    terms: pick('campaign.terms', text(c.terms, 120), c.terms, b.terms),
    announcement: {
      lead: pick('campaign.announcement.lead', text(ann.lead, 40), ann.lead, b.announcement.lead),
      cta: pick('campaign.announcement.cta', text(ann.cta, 30), ann.cta, b.announcement.cta),
    },
    hero: {
      lines: pick('campaign.hero.lines', list(hero.lines, 4, 60), hero.lines, b.hero.lines),
      lede: pick('campaign.hero.lede', text(hero.lede, 300), hero.lede, b.hero.lede),
      cta: pick('campaign.hero.cta', text(hero.cta, 30), hero.cta, b.hero.cta),
      checks: pick('campaign.hero.checks', list(hero.checks, 6, 40), hero.checks, b.hero.checks),
    },
    valueStack: pick('campaign.valueStack', list(c.valueStack, 12, 40), c.valueStack, b.valueStack),
    pricing: {
      plan: pick('campaign.pricing.plan', text(pr.plan, 80), pr.plan, b.pricing.plan),
      items: pick('campaign.pricing.items', list(pr.items, 14, 40), pr.items, b.pricing.items),
      cta: pick('campaign.pricing.cta', text(pr.cta, 30), pr.cta, b.pricing.cta),
      small: pick('campaign.pricing.small', text(pr.small, 120), pr.small, b.pricing.small),
    },
    faq: pick(
      'campaign.faq',
      faq?.every((f) => f.q && f.a) ? (faq as { q: string; a: string }[]) : undefined,
      c.faq,
      b.faq,
    ),
  }

  return { plans, modules, comingSoon, campaign }
}

async function load(fresh: boolean): Promise<Catalog> {
  if (!PROJECT_ID) return defaultCatalog
  /* The CDN for pages (fast, and pages are cached anyway); the live API for
     the order route, which has to charge the price that is published now. */
  const host = fresh ? 'api.sanity.io' : 'apicdn.sanity.io'
  const url = `https://${PROJECT_ID}.${host}/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}&perspective=published`
  try {
    const res = await fetch(url, {
      ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: CATALOG_REVALIDATE, tags: [CATALOG_TAG] } }),
      signal: AbortSignal.timeout(fresh ? 4000 : 8000),
    })
    if (!res.ok) throw new Error(`Sanity answered ${res.status}`)
    const { result } = (await res.json()) as { result: Raw }
    return mergeCatalog(result ?? {})
  } catch (err) {
    console.error('[cms] could not read the catalog, using the code defaults:', err)
    return defaultCatalog
  }
}

/** For rendering. Cached for CATALOG_REVALIDATE seconds, and once per request. */
export const getCatalog = cache(() => load(false))

/** For charging. Straight from Sanity, never cached. */
export const getCatalogFresh = () => load(true)

