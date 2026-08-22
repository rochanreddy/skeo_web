export type PlanKey = 'challenge14' | 'challenge28' | 'challengeContent' | 'member' | 'teams'

export type Plan = {
  eyebrow: string
  title: string
  price: string
  period: string
  /** Numeric price used for structured data; null for custom pricing. */
  amount: number | null
  billing: 'one-time' | 'monthly' | 'custom'
  features: readonly string[]
  cta: string
}

export const PLANS: Record<PlanKey, Plan> = {
  challenge14: {
    eyebrow: '14-DAY AI CHALLENGE',
    title: '14-Day AI Challenge',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['Claude & generative AI tools', '14 daily practical builds', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  challenge28: {
    eyebrow: '28-DAY AI TOOLS CHALLENGE',
    title: '28-Day AI Tools Challenge',
    price: '$19',
    period: '/ one-time',
    amount: 19,
    billing: 'one-time',
    features: ['10+ AI tools — LLMs, automation, more', '28 daily practical builds', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  challengeContent: {
    eyebrow: 'AI CONTENT CREATION CHALLENGE',
    title: 'AI Content Creation Challenge',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['AI-assisted content workflows', '14 daily practical builds', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  member: {
    eyebrow: 'ALL ACCESS',
    title: 'Go all-in on AI',
    price: '$19',
    period: '/ month',
    amount: 19,
    billing: 'monthly',
    features: [
      'All challenges & modules',
      'Certificates & portfolio',
      'Job & Freelancing Board access',
      'Weekly expert sessions',
    ],
    cta: 'Start 7-day free trial',
  },
  teams: {
    eyebrow: 'TEAMS PLAN',
    title: 'Build together',
    price: 'Custom',
    period: 'pricing',
    amount: null,
    billing: 'custom',
    features: ['Everything in All Access', 'Team dashboards', 'Custom learning paths'],
    cta: 'Request a quote',
  },
}

/** The individually purchasable modules, in the order the pricing table lists them. */
export const MODULE_KEYS = ['challenge14', 'challenge28', 'challengeContent'] as const

export const MODULE_ROWS: { key: PlanKey; title: string; subtitle: string; price: string }[] = [
  { key: 'challenge14', title: '14-Day AI Challenge', subtitle: 'Claude & generative AI tools', price: '$9' },
  { key: 'challenge28', title: '28-Day AI Tools Challenge', subtitle: '10+ AI tools, end to end', price: '$19' },
  {
    key: 'challengeContent',
    title: 'AI Content Creation Challenge',
    subtitle: 'Content workflows & visuals',
    price: '$9',
  },
]
