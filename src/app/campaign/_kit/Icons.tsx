import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Globe,
  Hammer,
  Infinity as InfinityIcon,
  Palette,
  PenLine,
  Search,
  Star,
  Timer,
  TrendingUp,
  Wallet,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

/**
 * The campaign variants' icons: lucide's line glyphs, the same family the main
 * campaign page draws with, in place of emoji — which render differently on
 * every phone and read as placeholder.
 */

const GLYPHS: Record<string, LucideIcon> = {
  write: PenLine,
  research: Search,
  design: Palette,
  automate: Workflow,
  web: Globe,
  work: BriefcaseBusiness,
  time: Timer,
  money: Wallet,
  job: TrendingUp,
  build: Hammer,
  certificate: BadgeCheck,
  forever: InfinityIcon,
}

export function Glyph({ name, className }: { name: string; className?: string }) {
  const G = GLYPHS[name] ?? Check
  return <G className={className} strokeWidth={1.75} aria-hidden="true" />
}

/** A tick for lists, sized by the surrounding text. */
export function Tick({ className = 'kit-tick' }: { className?: string }) {
  return <Check className={className} strokeWidth={2.5} aria-hidden="true" />
}

/** Five stars, drawn — not five ★ characters in whatever font the phone has. */
export function Stars({ className = 'kit-stars' }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="Rated 5 out of 5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      ))}
    </span>
  )
}
