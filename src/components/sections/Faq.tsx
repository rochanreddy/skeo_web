import { Reveal } from '@/components/Reveal'
import { faqs } from '@/lib/content'

/**
 * Two columns of equal height: copy over a walkthrough on the left, the
 * questions as one panel on the right. Both stretch to the same line — the
 * video grows into whatever the questions leave, and the panel's footer link
 * is pinned to its bottom edge, so neither side ends short of the other.
 */
export function Faq() {
  return (
    <section className="section faq wrap" id="faq" aria-labelledby="faq-title">
      <Reveal className="faq-intro">
        <span className="eyebrow">QUESTIONS, ANSWERED</span>
        <h2 id="faq-title">
          You’re probably
          <br />
          wondering.
        </h2>
        <p>Straight answers on how Skeo works, what you walk away with, and what it costs.</p>
        {/* Placeholder for the walkthrough: drop a <video src … poster …> inside
            this button once the cut exists — it already fills the frame. */}
        <button type="button" className="faq-video" aria-label="Play the Skeo walkthrough — video coming soon">
          <span className="faq-video-play" aria-hidden="true">
            ▶
          </span>
          <span className="faq-video-label">
            Watch how Skeo works <b>2 MIN</b>
          </span>
        </button>
      </Reveal>

      <Reveal className="faq-list" delay={1}>
        {faqs.map((faq, i) => (
          <details key={faq.q} open={i === 0} name="faq">
            <summary>
              <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
              <span>{faq.q}</span>
              <b aria-hidden="true">+</b>
            </summary>
            <p>{faq.a}</p>
          </details>
        ))}
        <p className="faq-foot">
          Still not sure? <a href="/contact">Talk to a human ↗</a>
        </p>
      </Reveal>
    </section>
  )
}
