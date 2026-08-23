import type { ReactElement } from 'react'
import { Reveal } from '@/components/Reveal'
import { TiltCard } from '@/components/sections/TiltCard'
import { featuredTool } from '@/lib/content'
import { site } from '@/lib/site'

const { badge, name, maker, tagline, poster, capsules, facts, blurb, cta } = featuredTool

const iconMap: Record<string, ReactElement> = {
  book: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M10 6v8" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      <circle cx="11" cy="11" r="1" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <path d="M12 12l4 4" />
    </svg>
  ),
}

/**
 * The featured tool on one glass card: the poster restating the pitch on the
 * left, the detail rail on the right. Both panes stretch to the same height, so
 * the card has no dead margin at either end.
 */
export function Tools() {
  return (
    <section className="tools" id="tools" aria-labelledby="tools-title">
      <div className="wrap">
        <Reveal className="tool-shell">
          <TiltCard className="tool-card">
            {/* Decorative restatement of the copy on the right — hidden from screen readers. */}
            <div className="tool-poster" aria-hidden="true">
              <b className="poster-brand">{site.name.toLowerCase()}</b>
              <div className="poster-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="poster-logo" src={poster.logo} alt="" width={168} height={168} />
                <div className="poster-copy">
                  <span className="poster-kicker">✦ {poster.kicker}</span>
                  <p className="poster-title">
                    {poster.lines.map((line) => (
                      <b key={line}>{line}</b>
                    ))}
                  </p>
                  <p className="poster-note">{poster.note}</p>
                </div>
              </div>
              <span className="poster-footer">{poster.footer}</span>
            </div>

            <div className="tool-detail">
              <span className="tool-badge">{badge}</span>
              <h2 id="tools-title">
                {name} <i>{maker}</i>
              </h2>
              <p className="tool-tagline">{tagline}</p>
              <ul className="tool-capsules">
                {capsules.map((capsule) => (
                  <li key={capsule}>{capsule}</li>
                ))}
              </ul>
              <ul className="tool-facts">
                {facts.map((fact) => (
                  <li key={fact.label}>
                    <span aria-hidden="true" className="fact-icon">
                      {iconMap[fact.icon] || fact.icon}
                    </span>{' '}
                    {fact.label}
                  </li>
                ))}
              </ul>
              <p className="tool-blurb">{blurb}</p>
              <a className="button" href={cta.href}>
                <span className="btn-label">{cta.label}</span> <span aria-hidden="true">↗</span>
              </a>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  )
}
