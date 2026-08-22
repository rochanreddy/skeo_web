import { Reveal } from '@/components/Reveal'
import { faqs } from '@/lib/content'

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
        <p>
          Can’t find what you need? <a href="/contact">Talk to a human ↗</a>
        </p>
      </Reveal>
      <Reveal className="faq-list" delay={1}>
        {faqs.map((faq, i) => (
          <details key={faq.q} open={i === 0} name="faq">
            <summary>
              {faq.q}
              <b aria-hidden="true">+</b>
            </summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </Reveal>
    </section>
  )
}
