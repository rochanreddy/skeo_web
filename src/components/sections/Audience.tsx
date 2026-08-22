import { Reveal } from '@/components/Reveal'
import { audiences } from '@/lib/content'

export function Audience() {
  return (
    <section className="section who" id="who" aria-labelledby="who-title">
      <div className="wrap">
        <Reveal className="center-heading">
          <span className="eyebrow">BUILT FOR</span>
          <h2 id="who-title">
            Whoever you are,
            <br />
            however you got here.
          </h2>
        </Reveal>
        <div className="who-grid">
          {audiences.map((audience, i) => (
            <Reveal className="who-card" key={audience.title} delay={(i % 3) as 0 | 1 | 2}>
              <b>{audience.title}</b>
              <span>{audience.body}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
