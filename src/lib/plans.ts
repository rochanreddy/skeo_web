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
    eyebrow: 'CLAUDE TOOL',
    title: 'Claude',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['Prompts that hold up', 'Long-document research', 'Certificate on completion'],
    cta: 'Confirm and start this tool',
  },
  chatgpt: {
    eyebrow: 'CONTENT CREATION TOOL',
    title: 'Content Creation',
    price: '$9',
    period: '/ one-time',
    amount: 9,
    billing: 'one-time',
    features: ['Everyday work, done faster', 'Custom GPTs and data analysis', 'Certificate on completion'],
    cta: 'Confirm and start this tool',
  },
  lovable: {
    eyebrow: 'VIBE CODING TOOL',
    title: 'Vibe Coding',
    price: '$12',
    period: '/ one-time',
    amount: 12,
    billing: 'one-time',
    features: ['Ship a working app from a prompt', 'Iterate without touching code', 'Certificate on completion'],
    cta: 'Confirm and start this tool',
  },
  n8n: {
    eyebrow: 'AUTOMATIONS TOOL',
    title: 'Automations',
    price: '$12',
    period: '/ one-time',
    amount: 12,
    billing: 'one-time',
    features: ['Automate the busywork', 'Wire AI into real workflows', 'Certificate on completion'],
    cta: 'Confirm and start this tool',
  },
  member: {
    eyebrow: 'ALL ACCESS',
    title: 'Everything AI. One Access',
    price: '$19',
    period: '/ month',
    amount: 19,
    billing: 'monthly',
    features: [
      'All AI tool modules',
      'Beginner to Advanced Learning Paths',
      'Build Real World Projects',
      'Get Certified',
      'Job & Freelancing Board access',
      'Expert Sessions & Community',
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

/** The individually purchasable tools, in the order the pricing card lists them. */
export const MODULE_KEYS = ['claude', 'chatgpt', 'lovable', 'n8n'] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

/** `marks` names the logos shown beside the tool's title. */
export type ModuleRow = {
  key: ModuleKey
  title: string
  subtitle: string
  price: string
  amount: number
  marks: readonly ('claude' | 'chatgpt' | 'gemini' | 'n8n' | 'lovable')[]
}

export const MODULE_ROWS: ModuleRow[] = [
  {
    key: 'claude',
    title: 'Claude',
    subtitle: 'Beginner to advanced, new ways to work with AI',
    price: '$9',
    amount: 9,
    marks: ['claude'],
  },
  {
    key: 'chatgpt',
    title: 'Content Creation',
    subtitle: 'Create content faster with ChatGPT and Gemini',
    price: '$9',
    amount: 9,
    marks: ['chatgpt', 'gemini'],
  },
  {
    key: 'n8n',
    title: 'Automations',
    subtitle: 'Automate repetitive work with n8n, Make, and Zapier',
    price: '$12',
    amount: 12,
    marks: ['n8n'],
  },
  {
    key: 'lovable',
    title: 'Vibe Coding',
    subtitle: 'Build products with Lovable, AI Studio, and Replit',
    price: '$12',
    amount: 12,
    marks: ['lovable'],
  },
]

/** Prices are whole dollars everywhere on the page, so no cents formatting. */
export const money = (amount: number) => `$${amount}`
