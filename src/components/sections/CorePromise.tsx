import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/ui/count-up'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { promiseStats } from '@/lib/content'

export function CorePromise() {
  return (
    <section className="promise" aria-labelledby="promise-title">
      <div className="wrap">
        <Reveal className="promise-inner">
          <span className="eyebrow">THE SKEO WAY</span>
          <h2 id="promise-title">
            One platform. <em>Every AI tool.</em>
          </h2>
          <p>
            skeo brings every major AI tool into one structured system of short challenges.
            <br />
            So you build real skills, not just watch them.
          </p>
          <div className="promise-stats reveal-stagger">
            {promiseStats.map((stat) => (
              <SpotlightCard className="stat-chip" key={stat.label}>
                <b>
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </b>
                <span className="stat-label">{stat.label}</span>
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
