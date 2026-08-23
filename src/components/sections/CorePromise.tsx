import { Reveal } from '@/components/Reveal'
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
            Skeo brings every major AI tool into one structured system of short challenges.
            <br />
            So you build real skills, not just watch them.
          </p>
          <div className="promise-stats reveal-stagger">
            {promiseStats.map((stat) => (
              <div className="stat-chip" key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
