import { MODULE_ROWS, type ModuleKey } from '@/lib/plans'
import type { AnalyticsEvent, EventType } from './events'
import { referrerSource } from './events'

/**
 * Every number the dashboard prints is computed here, in one pass per section,
 * from the raw event log. Nothing is precomputed on write, so a fix to a
 * definition is retroactive — recount the same events and the history corrects
 * itself.
 */

export type RangeKey = '24h' | '7d' | '30d' | '90d' | 'all'

export const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: '24h', label: '24 hours', days: 1 },
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
]

export const isRangeKey = (value: unknown): value is RangeKey =>
  typeof value === 'string' && RANGES.some((r) => r.key === value)

export type Totals = {
  visitors: number
  newVisitors: number
  returningVisitors: number
  pageviews: number
  sessions: number
  registrations: number
  signins: number
  orders: number
  buyers: number
  revenue: number
  aov: number
  /** Buyers as a share of visitors, as a percentage. */
  conversionRate: number
  lmsActivations: number
  /** Share of buyers who got into the LMS, as a percentage. */
  activationRate: number
  nextInterest: number
  leads: number
  cartAdders: number
  /** Added a module but never paid, inside this window. */
  abandonedCarts: number
  /** What those unpaid carts were worth, at list price. */
  abandonedValue: number
  liveNow: number
}

export type SeriesPoint = {
  /** ISO timestamp of the bucket start. */
  bucket: string
  label: string
  visitors: number
  pageviews: number
  orders: number
  revenue: number
  registrations: number
}

export type FunnelStep = {
  key: string
  label: string
  hint: string
  visitors: number
  /** Share of the step above it, as a percentage. */
  stepRate: number
  /** Share of the very first step, as a percentage. */
  overallRate: number
}

export type ModuleStat = {
  key: ModuleKey
  title: string
  price: string
  added: number
  purchased: number
  revenue: number
  nextInterest: number
  /** Purchases as a share of the people who added it, as a percentage. */
  conversion: number
}

export type OrderRow = {
  orderId: string
  at: number
  email: string
  modules: string[]
  amount: number
  demo: boolean
}

export type PersonRow = {
  at: number
  name: string
  email: string
  kind: 'signup' | 'lead'
  detail?: string
  demo: boolean
}

export type CountRow = { label: string; count: number; share: number }

export type Stats = {
  range: RangeKey
  from: number
  to: number
  generatedAt: number
  totalEvents: number
  demoEvents: number
  /** True once the LMS itself reports sign-ins, rather than us inferring from clicks. */
  lmsReporting: boolean
  totals: Totals
  /** The same window immediately before this one, for the deltas on the cards. */
  previous: Pick<
    Totals,
    | 'visitors'
    | 'orders'
    | 'revenue'
    | 'registrations'
    | 'buyers'
    | 'conversionRate'
    | 'lmsActivations'
    | 'nextInterest'
  >
  series: SeriesPoint[]
  funnel: FunnelStep[]
  modules: ModuleStat[]
  orders: OrderRow[]
  people: PersonRow[]
  topPages: CountRow[]
  devices: CountRow[]
  referrers: CountRow[]
}

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const LIVE_WINDOW_MS = 5 * 60_000

/** List price per module, for pricing carts that never became orders. */
const MODULE_PRICE = new Map<string, number>(MODULE_ROWS.map((row) => [row.key, row.amount]))

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0)

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')
const asNumber = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

export function rangeBounds(range: RangeKey, now: number, earliest: number): { from: number; to: number } {
  const spec = RANGES.find((r) => r.key === range)
  if (!spec || spec.days === null) return { from: earliest, to: now }
  return { from: now - spec.days * DAY_MS, to: now }
}

/** Unique visitor count across whichever events pass the test. */
function uniqueVisitors(events: readonly AnalyticsEvent[], test: (e: AnalyticsEvent) => boolean): number {
  const seen = new Set<string>()
  for (const event of events) if (test(event)) seen.add(event.visitorId)
  return seen.size
}

const typeIs =
  (...types: EventType[]) =>
  (event: AnalyticsEvent) =>
    types.includes(event.type)

function totalsFor(
  events: readonly AnalyticsEvent[],
  opts: { firstSeen: Map<string, number>; from: number; now: number; lmsReporting: boolean },
): Totals {
  const visitors = new Set<string>()
  const sessions = new Set<string>()
  const buyers = new Set<string>()
  const cartAdders = new Set<string>()
  const live = new Set<string>()
  /** Distinct modules each visitor showed intent on, for the abandoned total. */
  const wanted = new Map<string, Set<string>>()
  const lmsVisitors = new Set<string>()
  const nextInterestVisitors = new Set<string>()

  let pageviews = 0
  let registrations = 0
  let signins = 0
  let orders = 0
  let revenue = 0
  let leads = 0

  for (const event of events) {
    visitors.add(event.visitorId)
    if (event.sessionId) sessions.add(event.sessionId)
    if (opts.now - event.at <= LIVE_WINDOW_MS) live.add(event.visitorId)

    switch (event.type) {
      case 'pageview':
        pageviews++
        break
      case 'signup':
        registrations++
        break
      case 'signin':
        signins++
        break
      case 'module_add': {
        cartAdders.add(event.visitorId)
        const key = asString(event.props?.module)
        if (key) {
          if (!wanted.has(event.visitorId)) wanted.set(event.visitorId, new Set())
          wanted.get(event.visitorId)!.add(key)
        }
        break
      }
      case 'purchase':
        orders++
        revenue += asNumber(event.props?.amount)
        buyers.add(event.visitorId)
        break
      case 'lead':
        leads++
        break
      case 'next_interest':
        nextInterestVisitors.add(event.visitorId)
        break
      case 'lms_open':
        // A click is only a stand-in: once the LMS reports real sign-ins, it stops counting.
        if (!opts.lmsReporting) lmsVisitors.add(event.visitorId)
        break
      case 'lms_login':
        lmsVisitors.add(event.visitorId)
        break
      default:
        break
    }
  }

  // "New" means we had never seen this visitor before the window opened.
  let newVisitors = 0
  for (const id of visitors) {
    const first = opts.firstSeen.get(id)
    if (first === undefined || first >= opts.from) newVisitors++
  }

  let abandoned = 0
  let abandonedValue = 0
  for (const id of cartAdders) {
    if (buyers.has(id)) continue
    abandoned++
    for (const key of wanted.get(id) ?? []) abandonedValue += MODULE_PRICE.get(key) ?? 0
  }

  return {
    visitors: visitors.size,
    newVisitors,
    returningVisitors: visitors.size - newVisitors,
    pageviews,
    sessions: sessions.size,
    registrations,
    signins,
    orders,
    buyers: buyers.size,
    revenue: Math.round(revenue * 100) / 100,
    aov: orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0,
    conversionRate: pct(buyers.size, visitors.size),
    lmsActivations: lmsVisitors.size,
    activationRate: pct(lmsVisitors.size, buyers.size),
    nextInterest: nextInterestVisitors.size,
    leads,
    cartAdders: cartAdders.size,
    abandonedCarts: abandoned,
    abandonedValue: Math.round(abandonedValue * 100) / 100,
    liveNow: live.size,
  }
}

function buildSeries(events: readonly AnalyticsEvent[], from: number, to: number, hourly: boolean): SeriesPoint[] {
  const step = hourly ? HOUR_MS : DAY_MS
  const start = Math.floor(from / step) * step
  const buckets = new Map<number, { visitors: Set<string>; point: SeriesPoint }>()

  // Every bucket exists up front, so a quiet day draws a zero instead of
  // vanishing and letting the line lie about its own shape.
  const fmtDay = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
  const fmtHour = new Intl.DateTimeFormat('en', { hour: 'numeric' })

  for (let t = start; t <= to; t += step) {
    const date = new Date(t)
    buckets.set(t, {
      visitors: new Set(),
      point: {
        bucket: date.toISOString(),
        label: hourly ? fmtHour.format(date) : fmtDay.format(date),
        visitors: 0,
        pageviews: 0,
        orders: 0,
        revenue: 0,
        registrations: 0,
      },
    })
  }

  for (const event of events) {
    const key = Math.floor(event.at / step) * step
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.visitors.add(event.visitorId)
    if (event.type === 'pageview') bucket.point.pageviews++
    if (event.type === 'signup') bucket.point.registrations++
    if (event.type === 'purchase') {
      bucket.point.orders++
      bucket.point.revenue += asNumber(event.props?.amount)
    }
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, bucket]) => {
      bucket.point.visitors = bucket.visitors.size
      bucket.point.revenue = Math.round(bucket.point.revenue * 100) / 100
      return bucket.point
    })
}

function buildFunnel(events: readonly AnalyticsEvent[], lmsReporting: boolean): FunnelStep[] {
  const lmsTypes: EventType[] = lmsReporting ? ['lms_login'] : ['lms_login', 'lms_open']
  const steps = [
    { key: 'visit', label: 'Visited', hint: 'Opened any page', test: typeIs('pageview') },
    { key: 'cart', label: 'Picked a module', hint: 'Added at least one to the cart', test: typeIs('module_add') },
    { key: 'intent', label: 'Started checkout', hint: 'Pressed Next on the cart', test: typeIs('checkout_intent') },
    { key: 'verified', label: 'Verified', hint: 'Passed the one-time code', test: typeIs('verify_ok') },
    { key: 'paid', label: 'Paid', hint: 'Completed the order', test: typeIs('purchase') },
    { key: 'lms', label: 'Into the LMS', hint: 'Reached the learning platform', test: typeIs(...lmsTypes) },
  ]

  const counts = steps.map((step) => ({ ...step, visitors: uniqueVisitors(events, step.test) }))
  const top = counts[0]?.visitors ?? 0

  return counts.map((step, i) => ({
    key: step.key,
    label: step.label,
    hint: step.hint,
    visitors: step.visitors,
    stepRate: i === 0 ? 100 : pct(step.visitors, counts[i - 1].visitors),
    overallRate: pct(step.visitors, top),
  }))
}

function buildModules(events: readonly AnalyticsEvent[]): ModuleStat[] {
  const added = new Map<string, Set<string>>()
  const nextInterest = new Map<string, Set<string>>()
  const purchased = new Map<string, number>()
  const revenue = new Map<string, number>()

  for (const event of events) {
    if (event.type === 'module_add') {
      const key = asString(event.props?.module)
      if (!key) continue
      if (!added.has(key)) added.set(key, new Set())
      added.get(key)!.add(event.visitorId)
    } else if (event.type === 'next_interest') {
      const key = asString(event.props?.module)
      if (!key) continue
      if (!nextInterest.has(key)) nextInterest.set(key, new Set())
      nextInterest.get(key)!.add(event.visitorId)
    } else if (event.type === 'purchase') {
      for (const key of asStringList(event.props?.modules)) {
        purchased.set(key, (purchased.get(key) ?? 0) + 1)
        revenue.set(key, (revenue.get(key) ?? 0) + (MODULE_PRICE.get(key) ?? 0))
      }
    }
  }

  return MODULE_ROWS.map((row) => {
    const addedCount = added.get(row.key)?.size ?? 0
    const purchasedCount = purchased.get(row.key) ?? 0
    return {
      key: row.key,
      title: row.title,
      price: row.price,
      added: addedCount,
      purchased: purchasedCount,
      revenue: revenue.get(row.key) ?? 0,
      nextInterest: nextInterest.get(row.key)?.size ?? 0,
      conversion: pct(purchasedCount, addedCount),
    }
  }).sort((a, b) => b.revenue - a.revenue || b.added - a.added)
}

function tally(
  events: readonly AnalyticsEvent[],
  pick: (e: AnalyticsEvent) => string | undefined,
  limit: number,
): CountRow[] {
  const counts = new Map<string, number>()
  let total = 0
  for (const event of events) {
    const label = pick(event)
    if (!label) continue
    counts.set(label, (counts.get(label) ?? 0) + 1)
    total++
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count, share: pct(count, total) }))
}

export function computeStats(
  all: readonly AnalyticsEvent[],
  range: RangeKey,
  now = Date.now(),
  selfHost?: string,
): Stats {
  // Not `all[0].at`: seeded rows are appended after live ones, so the log is
  // not guaranteed to be in order.
  const earliest = all.reduce((min, event) => (event.at < min ? event.at : min), now)
  const { from, to } = rangeBounds(range, now, earliest)
  const span = to - from

  // First sighting per visitor across the whole log, so "new vs returning" is
  // judged against everything we know rather than against the window alone.
  const firstSeen = new Map<string, number>()
  for (const event of all) {
    const seen = firstSeen.get(event.visitorId)
    if (seen === undefined || event.at < seen) firstSeen.set(event.visitorId, event.at)
  }

  const inRange = all.filter((event) => event.at >= from && event.at <= to)
  const prior = all.filter((event) => event.at >= from - span && event.at < from)

  // One real LMS sign-in anywhere in the log means the integration is live, and
  // the whole dashboard stops treating a click-through as a login.
  const lmsReporting = all.some((event) => event.type === 'lms_login')

  const totals = totalsFor(inRange, { firstSeen, from, now, lmsReporting })
  const previousTotals = totalsFor(prior, { firstSeen, from: from - span, now, lmsReporting })

  const orders: OrderRow[] = inRange
    .filter((event) => event.type === 'purchase')
    .map((event) => ({
      orderId: asString(event.props?.orderId) || '—',
      at: event.at,
      email: asString(event.props?.email),
      modules: asStringList(event.props?.modules),
      amount: asNumber(event.props?.amount),
      demo: Boolean(event.demo),
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 25)

  const people: PersonRow[] = inRange
    .filter((event) => event.type === 'signup' || event.type === 'lead')
    .map((event) => ({
      at: event.at,
      name: asString(event.props?.name),
      email: asString(event.props?.email),
      kind: event.type === 'lead' ? ('lead' as const) : ('signup' as const),
      detail: asString(event.props?.plan) || asString(event.props?.background) || undefined,
      demo: Boolean(event.demo),
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 25)

  return {
    range,
    from,
    to,
    generatedAt: now,
    totalEvents: all.length,
    demoEvents: all.reduce((n, event) => n + (event.demo ? 1 : 0), 0),
    lmsReporting,
    totals,
    previous: {
      visitors: previousTotals.visitors,
      orders: previousTotals.orders,
      revenue: previousTotals.revenue,
      registrations: previousTotals.registrations,
      buyers: previousTotals.buyers,
      conversionRate: previousTotals.conversionRate,
      lmsActivations: previousTotals.lmsActivations,
      nextInterest: previousTotals.nextInterest,
    },
    series: buildSeries(inRange, from, to, range === '24h'),
    funnel: buildFunnel(inRange, lmsReporting),
    modules: buildModules(inRange),
    orders,
    people,
    topPages: tally(inRange, (e) => (e.type === 'pageview' ? e.path || '/' : undefined), 8),
    devices: tally(inRange, (e) => (e.type === 'pageview' ? e.device : undefined), 4),
    referrers: tally(inRange, (e) => (e.type === 'pageview' ? referrerSource(e.referrer, selfHost) : undefined), 8),
  }
}
