import { Reveal } from '@/components/Reveal'
import { featuredTool } from '@/lib/content'
import { site } from '@/lib/site'

const { badge, name, maker, tagline, poster, capsules, facts, blurb, cta } = featuredTool

export function Tools() {
  return (
    <section className="tools" id="tools" aria-labelledby="tools-title">
      <div className="wrap">
        <Reveal className="tool-card">
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
                  <span aria-hidden="true">{fact.icon}</span> {fact.label}
                </li>
              ))}
            </ul>
            <p className="tool-blurb">{blurb}</p>
            <a className="button" href={cta.href}>
              {cta.label} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
