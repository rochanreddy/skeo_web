import type { ReactNode } from 'react'

/**
 * The "What you'll build" icons, drawn from lucide's own geometry but split
 * into the parts that move, so each one acts out what it stands for when its
 * card is hovered (or, on touch screens, as the card scrolls in — PlayOnView
 * adds .is-play): the clapper snaps shut and opens again, the brush paints a
 * stroke, the mic sends out sound, the bot blinks, the workflow passes a
 * signal along, the agent's circuit lights up, the web app loads, and the
 * briefcase lifts its handle. The motion lives in early-access.css (.bi-*).
 */

const ICONS: Record<string, ReactNode> = {
  /* Content studio — a clapperboard; the top bar is hinged at its left end. */
  content: (
    <>
      <g className="bi-clap-top">
        <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" />
        <path d="m6.18 5.276 3.1 3.899" />
        <path d="m12.296 3.464 3.02 3.956" />
      </g>
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  /* Design system — a paintbrush leaving a stroke of paint. */
  design: (
    <>
      <path className="bi-paint" d="m14.622 17.897-10.68-2.913" />
      <g className="bi-brush">
        <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
        <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
      </g>
    </>
  ),
  /* AI voice — a mic with sound going out either side. */
  voice: (
    <>
      <g className="bi-mic">
        <rect x="9" y="2" width="6" height="13" rx="3" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v3" />
      </g>
      <path className="bi-wave bi-wave-l" d="M2.6 8.2a8 8 0 0 0 0 7.6" />
      <path className="bi-wave bi-wave-r" d="M21.4 8.2a8 8 0 0 1 0 7.6" />
    </>
  ),
  /* AI bot — blinks, and its antenna wiggles. */
  bot: (
    <>
      <path className="bi-antenna" d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <g className="bi-eyes">
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </g>
    </>
  ),
  /* Automation — a signal runs from one step to the next. */
  flow: (
    <>
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <path className="bi-signal" d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect className="bi-step" width="8" height="8" x="13" y="13" rx="2" />
    </>
  ),
  /* AI agent — a brain whose circuit lights up, line by line. */
  agent: (
    <>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <g className="bi-circuit">
        <path className="bi-c1" d="M12 8h8" />
        <path className="bi-c2" d="M16 8V5a2 2 0 0 1 2-2" />
        <path className="bi-c3" d="M12 13h4" />
        <path className="bi-c4" d="M12 18h6a2 2 0 0 1 2 2v1" />
      </g>
      <g className="bi-nodes">
        <circle cx="16" cy="13" r=".5" />
        <circle cx="18" cy="3" r=".5" />
        <circle cx="20" cy="21" r=".5" />
        <circle cx="20" cy="8" r=".5" />
      </g>
    </>
  ),
  /* Web app — a window whose content loads in. */
  globe: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <path d="M6 4v4" />
      <path d="M10 4v4" />
      <path className="bi-load bi-load-1" d="M6 12h12" />
      <path className="bi-load bi-load-2" d="M6 16h7" />
    </>
  ),
  /* Portfolio — a briefcase lifting its handle. */
  folder: (
    <>
      <path className="bi-handle" d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <g className="bi-case">
        <rect width="20" height="14" x="2" y="6" rx="2" />
        <path d="M22 13a18.15 18.15 0 0 1-20 0" />
        <path d="M12 12h.01" />
      </g>
    </>
  ),
}

export function BuildIcon({ kind }: { kind: string }) {
  return (
    <svg
      className={`ea-b-glyph bi bi-${kind}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[kind] ?? ICONS.globe}
    </svg>
  )
}
