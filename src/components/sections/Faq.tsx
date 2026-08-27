import { Reveal } from '@/components/Reveal'
import { VideoDialog } from '@/components/ui/video-dialog'
import { faqs, walkthrough } from '@/lib/content'

/**
 * Two columns: the pitch over the walkthrough on the left, the questions on the
 * right. The two used to stretch to a shared height, with the video as the
 * flexible element — so opening an answer grew the accordion and the video grew
 * with it. Now the columns start together and end independently, the poster
 * holds a fixed 16:9, and the left side sticks while the questions scroll past.
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
        <p>Straight answers on how skeo works, what you walk away with, and what it costs.</p>
        <VideoDialog src={walkthrough.src} label={walkthrough.label} duration={walkthrough.duration} />
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
      </Reveal>
    </section>
  )
}
