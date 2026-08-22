export type PlanKey = 'claude' | 'chatgpt' | 'lovable' | 'n8n' | 'member' | 'teams'

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
  claude: {
    eyebrow: 'CLAUDE MODULE',
    title: 'Claude',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['Prompts that hold up', 'Long-document research', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  chatgpt: {
    eyebrow: 'CHATGPT MODULE',
    title: 'ChatGPT',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['Everyday work, done faster', 'Custom GPTs and data analysis', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  lovable: {
    eyebrow: 'LOVABLE MODULE',
    title: 'Lovable',
    price: '$12',
    period: '/ one-time',
    amount: 12,
    billing: 'one-time',
    features: ['Ship a working app from a prompt', 'Iterate without touching code', 'Certificate on completion'],
    cta: 'Confirm and start module',
  },
  n8n: {
    eyebrow: 'N8N MODULE',
    title: 'n8n',
    price: '$12',
    period: '/ one-time',
    amount: 12,
    billing: 'one-time',
    features: ['Automate the busywork', 'Wire AI into real workflows', 'Certificate on completion'],
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

/** The individually purchasable modules, in the order the pricing card lists them. */
export const MODULE_KEYS = ['claude', 'chatgpt', 'lovable', 'n8n'] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

export type ModuleRow = { key: ModuleKey; title: string; subtitle: string; price: string; amount: number }

export const MODULE_ROWS: ModuleRow[] = [
  { key: 'claude', title: 'Claude', subtitle: 'Prompting, research, real deliverables', price: '$9', amount: 9 },
  { key: 'chatgpt', title: 'ChatGPT', subtitle: 'Everyday work, custom GPTs, analysis', price: '$9', amount: 9 },
  { key: 'lovable', title: 'Lovable', subtitle: 'Ship a working app from a prompt', price: '$12', amount: 12 },
  { key: 'n8n', title: 'n8n', subtitle: 'Automations that run without you', price: '$12', amount: 12 },
]

/** Prices are whole dollars everywhere on the page, so no cents formatting. */
export const money = (amount: number) => `$${amount}`
