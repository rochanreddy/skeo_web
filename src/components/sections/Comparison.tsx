import { Reveal } from '@/components/Reveal'
import { comparison } from '@/lib/content'

export function Comparison() {
  return (
    <section className="section wrap comparison" id="why" aria-labelledby="why-title">
      <Reveal className="section-intro">
        <span className="eyebrow">WHY SKILLORA</span>
        <h2 id="why-title">
          Traditional course
          <br />
          vs. your platform.
        </h2>
        <p>
          The future of work won’t reward people who just know the theory. It will reward the people who can make AI
          useful.
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
            Your platform <i aria-hidden="true">✦</i>
          </span>
          {comparison.skillora.map((item) => (
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
