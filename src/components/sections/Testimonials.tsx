import { Reveal } from '@/components/Reveal'
import { LogoRail } from '@/components/sections/LogoRail'
import { testimonials } from '@/lib/content'

/* The initials that stand in for a face.
 *
 * Initials rather than photographs: a portrait on a testimonial is a claim
 * that this is what the person looks like, and there is no photograph of any
 * of them to make that claim with. The mark is the same one the hero's proof
 * row uses, so it reads as this site's way of showing a person rather than as
 * a missing image.
 *
 * Takes the first letter of the first two words, so "Priya Shah" gives PS and
 * a single-word name still gives something. */
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

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
        <LogoRail className="quote-rail" speed={0.35} direction="right">
          {testimonials.map((item) => (
            <article key={item.name} className="quote">
              <div className="stars" role="img" aria-label="Rated 5 out of 5">
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote>“{item.quote}”</blockquote>
              <footer>
                <span className="quote-avatar" aria-hidden="true">
                  {initials(item.name)}
                </span>
                <span className="quote-who">
                  <b>{item.name}</b>
                  <span>{item.role}</span>
                </span>
              </footer>
            </article>
          ))}
        </LogoRail>
      </Reveal>
    </section>
  )
}
