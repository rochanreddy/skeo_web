import type { CSSProperties } from 'react'

/**
 * One icon per stage — learn, build, monetize. Minimal line art, each with a
 * small loop of its own (the cap's tassel swings, the brackets draw in, the
 * bars grow), driven by keyframes in globals.css so there is no animation
 * library and reduced-motion visitors land on the finished frame.
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

/** Learn: a graduation cap, its tassel swinging. */
function LearnIcon() {
  return (
    <svg {...common} className="pi pi-learn">
      <g className="cap">
        <path className="board" d="M12 4.2 21.6 8.5 12 12.8 2.4 8.5Z" />
        <path className="brim" d="M6.6 10.4v4.3c0 .3 2.2 2.5 5.4 2.5s5.4-2.2 5.4-2.5v-4.3" />
      </g>
      <g className="tassel">
        <path d="M19.9 9.3v4.4" />
        <circle cx="19.9" cy="15.1" r="1.3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

/** Build: the angle brackets closing in around the slash. */
function BuildIcon() {
  return (
    <svg {...common} className="pi pi-build">
      <path className="stroke-in slash" d="M13.6 5.6 10.4 18.4" style={step(0)} pathLength={1} />
      <path className="stroke-in left" d="M8.6 8 4.4 12l4.2 4" style={step(1)} pathLength={1} />
      <path className="stroke-in right" d="M15.4 8l4.2 4-4.2 4" style={step(2)} pathLength={1} />
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
