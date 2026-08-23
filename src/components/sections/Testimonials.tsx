import { Reveal } from '@/components/Reveal'
import { LogoRail } from '@/components/sections/LogoRail'
import { testimonials } from '@/lib/content'

/**
 * The quotes ride the same continuous rail the logo strip uses, rather than
 * paging three at a time: every testimonial comes past on its own, and the row
 * keeps moving on hover instead of waiting to be clicked.
 */
export function Testimonials() {
  return (
    <section className="section testimonials" id="reviews" aria-labelledby="testimonials-title">
      <div className="wrap">
        <Reveal className="heading-row">
          <div>
            <span className="eyebrow">FROM THE COMMUNITY</span>
            <h2 id="testimonials-title">Builders become believers.</h2>
          </div>
        </Reveal>
      </div>

      {/* Full bleed: the rail should run off both edges, not stop at the column. */}
      <Reveal delay={1}>
        <LogoRail className="quote-rail" speed={0.35}>
          {testimonials.map((item) => (
            <article key={item.name} className="quote">
              <div className="stars" role="img" aria-label="Rated 5 out of 5">
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote>“{item.quote}”</blockquote>
              <footer>
                <b>{item.name}</b>
                <span>{item.role}</span>
              </footer>
            </article>
          ))}
        </LogoRail>
      </Reveal>
    </section>
  )
}
