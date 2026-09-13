export type PlanKey = 'claude' | 'playbooks' | 'library' | 'member' | 'teams'

export type Plan = {
  eyebrow: string
  title: string
  /** Rupees. Every price in this codebase is stored in the base currency and
   *  converted for display — see lib/currency. */
  amount: number
  period: string
  billing: 'one-time' | 'monthly' | 'custom'
  features: readonly string[]
  cta: string
}

export const PLANS: Record<PlanKey, Plan> = {
  claude: {
    eyebrow: 'CLAUDE COURSE',
    title: 'Claude Course',
    amount: 699,
    period: '/ one-time',
    billing: 'one-time',
    features: ['Prompts that hold up', 'Long-document research', 'Certificate on completion'],
    cta: 'Confirm and start this tool',
  },
  playbooks: {
    eyebrow: 'CLAUDE PLAYBOOKS',
    title: 'Claude Playbooks',
    amount: 99,
    period: '/ one-time',
    billing: 'one-time',
    features: ['Everyday work and coding', 'Research and design', 'Workflows you can reuse'],
    cta: 'Confirm and start this tool',
  },
  library: {
    eyebrow: 'AI LIBRARY',
    title: 'AI Library',
    amount: 99,
    period: '/ one-time',
    billing: 'one-time',
    features: ['Ready-to-use resources', 'Workflows and prompts', 'Guides for every tool'],
    cta: 'Confirm and start this tool',
  },
  member: {
    eyebrow: 'ALL ACCESS',
    title: 'Everything AI. One Access',
    amount: 799,
    period: '/ one-time',
    billing: 'one-time',
    features: [
      'All AI tool modules',
      'Beginner to Advanced Learning Paths',
      'Build Real World Projects',
      'Get Certified',
      'Job & Freelancing Board access',
      'Expert Sessions & Community',
    ],
    cta: 'Get everything',
  },
  teams: {
    eyebrow: 'TEAMS PLAN',
    title: 'Build together',
    amount: 0,
    period: 'Custom pricing',
    billing: 'custom',
    features: ['Everything in All Access', 'Team dashboards', 'Custom learning paths'],
    cta: 'Request a quote',
  },
}

/** The individually purchasable items, in the order the pricing card lists them. */
export const MODULE_KEYS = ['claude', 'playbooks', 'library'] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]

/** `marks` names the logos shown beside the title. */
export type ModuleRow = {
  key: ModuleKey
  title: string
  subtitle: string
  /** Rupees — see lib/currency for how this reaches a reader. */
  amount: number
  marks: readonly ('claude' | 'chatgpt' | 'gemini' | 'n8n' | 'lovable')[]
}

export const MODULE_ROWS: ModuleRow[] = [
  {
    key: 'claude',
    title: 'Claude Course',
    subtitle:
      'Master Claude across Chat, Cowork, Code, automations, vibe coding, research and more in one practical course',
    amount: 699,
    marks: ['claude'],
  },
  {
    key: 'playbooks',
    title: 'Claude Playbooks',
    subtitle: 'From everyday work to coding, research, design, and workflows',
    amount: 99,
    marks: ['claude'],
  },
  {
    key: 'library',
    title: 'AI Library',
    subtitle: 'Ready-to-use resources, workflows, prompts and guides to help you get more from AI',
    amount: 99,
    marks: [],
  },
]

/* The row at the foot of the list that cannot be bought yet.
 *
 * It is deliberately NOT a ModuleRow: nothing here has a price, a key or an
 * Add button, and giving it one would put a thing that cannot be sold into the
 * cart, the checkout session and the order record. It exists because the list
 * would otherwise read as the whole catalogue, and the whole catalogue is the
 * reason to come back. */
export const COMING_SOON = {
  title: 'ChatGPT, Gemini, n8n, Lovable and more',
  subtitle: 'We’re adding more of the tools you need to build your AI-native toolkit',
  marks: ['chatgpt', 'gemini', 'n8n', 'lovable'],
} as const

/** The base currency, for the internal figures — orders, revenue, averages.
 *  Reader-facing prices go through lib/currency instead, which converts. */
export const money = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`
