/**
 * The four campaign landing pages share one page and differ only in the hero:
 *
 *   /campaign/everything-ai        all tools, pass card
 *   /campaign/everything-ai-intro  all tools, intro video
 *   /campaign/claude               Claude, pass card
 *   /campaign/claude-intro         Claude, intro video
 *
 * This is each hero's copy. All four sell Everything AI at its Early Access
 * price, so the price is passed in rather than written here. The button and
 * the three checks under it still come from the campaign in Sanity.
 */

export type LandingKind = 'all' | 'claude'

const lede =
  'Claude Chat, Cowork, Code, Design and many more. Learn by doing, build real proof of work, and unlock opportunities.'

/* The pass lists these in two columns, filled top to bottom: the numbers on
   the left, what comes with them on the right. */
const items = [
  '1 Platform',
  '50+ Tools',
  '100+ Projects',
  '1 Lakh+ Jobs',
  'Certificate',
  'Top AI Mentors',
  'AI Masterclasses',
  'Community Access',
] as const

export function landingHero(kind: LandingKind, price: string) {
  return kind === 'claude'
    ? {
        /* The second line is the highlighted one. */
        lines: ['Master Claude', `At just ${price}`],
        lede,
        passName: 'Claude',
        items,
        /* What the Claude pass shows in place of the row of tool logos, each
           with its own logo (in /public/logos) — they float round the card too. */
        features: [
          { label: 'Claude Cowork', logo: '/logos/claude-cowork.webp', wide: false },
          { label: 'Claude Code', logo: '/logos/claude-code.webp', wide: true },
          { label: 'Claude Design', logo: '/logos/claude-design.svg', wide: false },
        ],
      }
    : {
        lines: ['Top AI Tools.', 'Learn on the go.', '1 Lakh+ paid projects.'],
        lede,
        passName: 'Everything AI',
        items,
        features: null,
      }
}

/* On these four pages a buyer goes from their details straight to Cashfree:
   no one-time code, no /checkout review. Every other page keeps both. */
const LANDING_PATHS = ['/campaign/everything-ai', '/campaign/everything-ai-intro', '/campaign/claude', '/campaign/claude-intro']

export function paysDirect(pathname: string | null): boolean {
  return pathname !== null && LANDING_PATHS.includes(pathname.replace(/\/+$/, ''))
}
