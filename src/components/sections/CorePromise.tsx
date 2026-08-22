import { Reveal } from '@/components/Reveal'
import { promiseStats } from '@/lib/content'

export function CorePromise() {
  return (
    <section className="promise" aria-labelledby="promise-title">
      <div className="wrap">
        <Reveal className="promise-inner">
          <span className="eyebrow">THE SKILLORA WAY</span>
          <h2 id="promise-title">
            One platform.
            <br />
            <em>Every AI tool.</em>
          </h2>
          <p>
            Stop hopping between tutorials. Skillora brings every major AI tool into one structured system of short
            challenges — so you build real skills, not just watch them.
          </p>
          <div className="promise-stats">
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
