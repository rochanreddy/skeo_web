import type { CSSProperties } from 'react'

/**
 * One icon per stage — learn, build, monetize. Minimal line art, each with a
 * small loop of its own (the ring sweeps, the blocks assemble, the bars grow),
 * driven by keyframes in globals.css so there is no animation library and
 * reduced-motion visitors land on the finished frame.
 */

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const step = (n: number) => ({ '--i': n }) as CSSProperties

/** Learn: a lesson playing, its progress sweeping round the ring. */
function LearnIcon() {
  return (
    <svg {...common} className="pi pi-learn">
      <circle className="ring" cx="12" cy="12" r="8.6" />
      <path className="play" d="M10.2 8.4 15.8 12l-5.6 3.6Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Build: the pieces arriving one after another. */
function BuildIcon() {
  const blocks = [
    { x: 3.4, y: 3.4, i: 0 },
    { x: 13.2, y: 3.4, i: 1 },
    { x: 3.4, y: 13.2, i: 2 },
    { x: 13.2, y: 13.2, i: 3 },
  ]
  return (
    <svg {...common} className="pi pi-build">
      {blocks.map((block) => (
        <rect key={block.i} className="block" x={block.x} y={block.y} width="7.4" height="7.4" rx="1.8" style={step(block.i)} />
      ))}
    </svg>
  )
}

/** Monetize: the work starting to pay. */
function MonetizeIcon() {
  const bars = [
    { x: 4.4, y: 13.4, h: 6.2, i: 0 },
    { x: 10.4, y: 9.6, h: 10, i: 1 },
    { x: 16.4, y: 5.6, h: 14, i: 2 },
  ]
  return (
    <svg {...common} className="pi pi-monetize">
      {bars.map((bar) => (
        <rect key={bar.i} className="bar" x={bar.x} y={bar.y} width="3.2" height={bar.h} rx="1.6" style={step(bar.i)} />
      ))}
    </svg>
  )
}

const ICONS = {
  learn: LearnIcon,
  build: BuildIcon,
  monetize: MonetizeIcon,
} as const

export type ProjectIconName = keyof typeof ICONS

export function ProjectIcon({ name }: { name: ProjectIconName }) {
  const Icon = ICONS[name]
  return <Icon />
}
