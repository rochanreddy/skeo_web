import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Buy, FaqList, KitFooter, variantMeta } from '../_kit/Kit'
import { JoinedToast, SeatsBar, SeatsText, TimeLeft } from '../_kit/Live'
import { endsOn, faqs, included, modules, price, product, quotes, savePct, was } from '../_kit/facts'
import { Stars, Tick } from '../_kit/Icons'
import { Quiz, TimeBack } from './Quiz'
import { StickyBar } from './StickyBar'
import './start.css'

/**
 * Variant: ENGAGEMENT — built for clicks and taps.
 *
 * The hero is a question, not a headline: three taps build a personal plan
 * from the real curriculum, which is the strongest reason to keep going a
 * beginner can be given. Then a slider that turns their own week into hours
 * saved, proof from real people, and the price with its real deadline and real
 * seat count. A sticky bar keeps the button one tap away the whole way down.
 * Urgency here is only ever true: the deadline and seats are the ones the
 * checkout enforces.
 */

export const metadata = variantMeta(
  '/campaign/ai-start',
  `Find your AI path in 3 taps — ${product}`,
  'Answer three quick questions and get your own plan for learning AI — then start it today for a one-time ₹499.',
)

export default function StartPage() {
  return (
    <div className="ve">
      <div className="ve-strip">
        <span className="ve-live" aria-hidden="true" />
        <span>
          Early Access · <b>{savePct}% off</b> ends in
        </span>
        <TimeLeft className="ve-time" />
        <SeatsText className="ve-strip-seats" />
      </div>

      <header className="ve-head">
        <Link className="ve-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <ThemeToggle />
      </header>

      <main>
        <section className="ve-hero">
          <div className="ve-hero-copy">
            <span className="ve-tag">Free · 30 seconds</span>
            <h1>
              Find your AI path in <span>3&nbsp;taps.</span>
            </h1>
            <p>
              Tell us what you want — we&rsquo;ll show you exactly which lessons and projects in {product} get you there. No sign-up needed to see your plan.
            </p>
            <ul className="ve-proof">
              <li>
                <b>10+</b> courses
              </li>
              <li>
                <b>20+</b> projects
              </li>
              <li>
                <b>50+</b> tools
              </li>
              <li>
                <b>100+</b> jobs
              </li>
            </ul>
          </div>
          <Quiz modules={modules} price={price} />
        </section>

        <section className="ve-sec">
          <div className="ve-wrap ve-split">
            <div>
              <span className="ve-eyebrow">Quick maths</span>
              <h2>What is your time worth?</h2>
              <p className="ve-body">
                Most people use AI for one thing: getting time back. Slide to see what that could look like for you — then learn exactly how to do it.
              </p>
            </div>
            <TimeBack />
          </div>
        </section>

        <section className="ve-sec ve-sec-tint">
          <div className="ve-wrap">
            <span className="ve-eyebrow">What people say</span>
            <h2>Real people, real results.</h2>
            <ul className="ve-quotes">
              {quotes.map((q) => (
                <li key={q.name}>
                  <Stars className="ve-stars" />
                  <p>“{q.quote}”</p>
                  <footer>
                    {q.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={q.photo} alt="" loading="lazy" />
                    )}
                    <b>{q.name}</b>
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ve-sec" id="price">
          <div className="ve-wrap">
            <div className="ve-deal">
              <div className="ve-deal-left">
                <span className="ve-eyebrow">Everything included</span>
                <h2>
                  {was} of learning.
                  <br />
                  <span>{price} today.</span>
                </h2>
                <ul>
                  {included.map((i) => (
                    <li key={i.title}>
                      <Tick />
                      <span>
                        <b>{i.title}</b> — {i.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ve-deal-right">
                <p className="ve-deal-price">
                  <s>{was}</s>
                  <b>{price}</b>
                  <span>one time · lifetime access</span>
                </p>
                <Buy className="ve-btn ve-btn-block">Claim my seat</Buy>
                <div className="ve-deal-live">
                  <SeatsText className="ve-seats" />
                  <SeatsBar className="ve-seatbar" />
                  <p>
                    Price goes up after {endsOn}. <TimeLeft className="ve-time ve-time-dark" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ve-sec">
          <div className="ve-wrap ve-narrow">
            <span className="ve-eyebrow">Still wondering?</span>
            <h2>Quick answers.</h2>
            <FaqList items={faqs} />
          </div>
        </section>
      </main>

      <KitFooter />

      {/* One tap away, all the way down. */}
      <StickyBar>
        <div>
          <b>{price}</b> <s>{was}</s>
          <small>
            ends in <TimeLeft className="ve-time" />
          </small>
        </div>
        <Buy className="ve-btn">Start now</Buy>
      </StickyBar>
      <JoinedToast className="kit-toast ve-toast" />
    </div>
  )
}
