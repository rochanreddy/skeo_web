import { Reveal } from '@/components/Reveal'
import { comparison } from '@/lib/content'

export function Comparison() {
  return (
    <section className="section wrap comparison" id="why" aria-labelledby="why-title">
      <Reveal className="section-intro">
        <span className="eyebrow">WHY SKEO</span>
        <h2 id="why-title">
          Traditional course
          <br />
          vs. skeo
        </h2>
        <p>
          Traditional courses help you learn.
          <br />
          skeo helps you learn, build, prove your skills, and turn them into real opportunities.
        </p>
      </Reveal>
      <Reveal className="compare-grid" delay={1}>
        <div className="compare-column old">
          <span className="column-title">Traditional course</span>
          {comparison.legacy.map((item) => (
            <div key={item}>
              {item}
              <b aria-hidden="true">✕</b>
            </div>
          ))}
        </div>
        <div className="compare-column new">
          <span className="column-title">
            skeo <i aria-hidden="true">✦</i>
          </span>
          {comparison.skeo.map((item) => (
            <div key={item}>
              {item}
              <b aria-hidden="true">✓</b>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
