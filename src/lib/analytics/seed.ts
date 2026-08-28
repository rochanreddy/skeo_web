import { MODULE_ROWS } from '@/lib/plans'
import { randomId, type AnalyticsEvent, type DeviceKind, type EventProps, type EventType } from './events'

/**
 * Demo traffic, so the dashboard can be judged full rather than empty.
 *
 * Every row it writes carries `demo: true`. The dashboard shows that count in
 * its own banner and offers a one-press clear, so seeded numbers can never be
 * quietly mistaken for real ones.
 */

const DAY_MS = 86_400_000

const FIRST_NAMES = ['Aarav', 'Diya', 'Rohan', 'Meera', 'Kabir', 'Ananya', 'Vihaan', 'Ishita', 'Arjun', 'Sara', 'Neel', 'Priya']
const LAST_NAMES = ['Sharma', 'Iyer', 'Khan', 'Patel', 'Reddy', 'Bose', 'Nair', 'Gupta', 'Menon', 'Das']

const REFERRERS = [
  undefined,
  undefined,
  undefined,
  'https://www.google.com/',
  'https://www.google.com/',
  'https://www.linkedin.com/feed/',
  'https://www.instagram.com/',
  'https://t.co/abc123',
  'https://news.ycombinator.com/',
]

const PATHS = ['/', '/', '/', '/', '/checkout', '/thank-you']
const DEVICES: DeviceKind[] = ['mobile', 'mobile', 'mobile', 'desktop', 'desktop', 'tablet']

/** Seeded so a re-run produces the same shape rather than a new random story. */
function makeRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function generateDemoEvents(days = 30, seed = 20260828): AnalyticsEvent[] {
  const rand = makeRandom(seed)
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))

  const events: AnalyticsEvent[] = []
  const now = Date.now()

  const push = (type: EventType, at: number, visitorId: string, sessionId: string, extra: Partial<AnalyticsEvent> = {}) => {
    events.push({
      id: randomId(),
      type,
      at,
      visitorId,
      sessionId,
      demo: true,
      ...extra,
    })
  }

  // A pool of returning faces, so "new vs returning" is not a flat 100%.
  const regulars = Array.from({ length: 24 }, () => `demo${randomId().slice(0, 12)}`)

  for (let day = days - 1; day >= 0; day--) {
    const dayStart = now - day * DAY_MS
    const weekday = new Date(dayStart).getDay()
    const weekend = weekday === 0 || weekday === 6

    // Traffic grows gently across the window and dips at weekends — a flat line
    // would make every trend arrow read zero and tell you nothing.
    const growth = 1 + (days - day) / (days * 1.6)
    const visits = Math.max(4, Math.round(between(18, 34) * growth * (weekend ? 0.62 : 1)))

    for (let v = 0; v < visits; v++) {
      const returning = rand() < 0.22
      const visitorId = returning ? pick(regulars) : `demo${randomId().slice(0, 12)}`
      const sessionId = randomId().slice(0, 12)
      const device = pick(DEVICES)
      const referrer = pick(REFERRERS)

      // Spread across the day, weighted towards evening.
      const hour = rand() < 0.6 ? between(17, 23) : between(8, 16)
      let at = dayStart - DAY_MS + hour * 3_600_000 + between(0, 3_500_000)
      if (at > now) at = now - between(1, 600_000)

      const common = { path: '/', referrer, device }
      push('pageview', at, visitorId, sessionId, common)

      // A second page for some, so pageviews outrun visitors the way they do.
      if (rand() < 0.35) {
        push('pageview', at + between(20_000, 200_000), visitorId, sessionId, {
          ...common,
          path: pick(PATHS),
        })
      }

      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
      const email = `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@${pick(['gmail.com', 'outlook.com', 'proton.me'])}`

      if (rand() < 0.14) {
        push('signup', at + between(30_000, 300_000), visitorId, sessionId, {
          ...common,
          props: { name, email },
        })
      } else if (rand() < 0.06) {
        push('signin', at + between(10_000, 120_000), visitorId, sessionId, common)
      }

      // ---- The buying funnel, each step losing some of the step above it ----
      if (rand() > 0.28) continue

      const cart = MODULE_ROWS.filter(() => rand() < 0.42)
      if (cart.length === 0) cart.push(pick(MODULE_ROWS))

      let t = at + between(60_000, 400_000)
      for (const row of cart) {
        push('module_add', (t += between(4_000, 30_000)), visitorId, sessionId, {
          ...common,
          props: { module: row.key, price: row.amount },
        })
      }

      // Some fidget: added, then thought better of it.
      if (cart.length > 1 && rand() < 0.18) {
        push('module_remove', (t += between(3_000, 20_000)), visitorId, sessionId, {
          ...common,
          props: { module: cart[cart.length - 1].key },
        })
        cart.pop()
      }

      const amount = cart.reduce((sum, row) => sum + row.amount, 0)
      const moduleKeys = cart.map((row) => row.key)

      if (rand() > 0.56) continue
      push('checkout_intent', (t += between(5_000, 60_000)), visitorId, sessionId, {
        ...common,
        props: { modules: moduleKeys, amount },
      })

      if (rand() > 0.78) continue
      push('verify_sent', (t += between(20_000, 90_000)), visitorId, sessionId, {
        ...common,
        props: { modules: moduleKeys },
      })

      if (rand() > 0.84) continue
      push('verify_ok', (t += between(15_000, 120_000)), visitorId, sessionId, common)
      push('checkout_view', (t += between(2_000, 8_000)), visitorId, sessionId, {
        path: '/checkout',
        referrer,
        device,
        props: { modules: moduleKeys, amount },
      })

      if (rand() > 0.72) continue
      const orderProps: EventProps = {
        orderId: `SKEO-${randomId().slice(0, 6).toUpperCase()}`,
        modules: moduleKeys,
        amount,
        email,
        name,
      }
      push('purchase', (t += between(20_000, 180_000)), visitorId, sessionId, {
        path: '/checkout',
        referrer,
        device,
        props: orderProps,
      })

      // Bought, then actually went and used it.
      if (rand() < 0.68) {
        push('lms_open', (t += between(30_000, 900_000)), visitorId, sessionId, {
          path: '/thank-you',
          device,
          props: { target: rand() < 0.7 ? 'web' : 'mobile' },
        })
      }

      // …and told us what they want next.
      if (rand() < 0.44) {
        const wanted = MODULE_ROWS.filter((row) => !moduleKeys.includes(row.key))
        if (wanted.length > 0) {
          const choice = pick(wanted)
          push('next_interest', (t += between(10_000, 120_000)), visitorId, sessionId, {
            path: '/thank-you',
            device,
            props: { module: choice.key, email },
          })
        }
      }
    }
  }

  // A handful of all-access / teams enquiries across the window.
  for (let i = 0; i < Math.max(3, Math.round(days / 4)); i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    push('lead', now - between(0, days) * DAY_MS - between(0, DAY_MS), `demo${randomId().slice(0, 12)}`, randomId().slice(0, 12), {
      path: '/',
      device: pick(DEVICES),
      props: {
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@company.com`,
        plan: pick(['member', 'teams']),
      },
    })
  }

  return events.sort((a, b) => a.at - b.at)
}
