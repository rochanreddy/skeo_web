import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Buy, FaqList, KitFooter, variantMeta } from '../_kit/Kit'
import { SeatsText, TimeLeft } from '../_kit/Live'
import { endsOn, faqs, included, outcomes, price, product, was, whatItIs } from '../_kit/facts'
import './simple.css'

/**
 * Variant: SIMPLE.
 *
 * For someone who has never used AI and is not sure what they are looking at.
 * One column, big type, plain words, one kind of button. Each section answers
 * one question a beginner actually asks, in the order they ask it: what is
 * this, is it for me, what will I be able to do, how does it work, what does
 * it cost. No jargon without an explanation next to it.
 */

export const metadata = variantMeta(
  '/campaign/ai-simple',
  `Learn AI from zero — ${product} for ${price}`,
  'Never used AI? Everything AI teaches you, step by step and in plain words, to use ChatGPT, Claude and more for real work.',
)

const steps = [
  { title: 'Join once', body: `Pay ${price} one time. No monthly fees.` },
  { title: 'Get your login', body: 'It arrives by email straight away. Open the first lesson the same day.' },
  { title: 'Learn at your pace', body: 'One step at a time, online. Pause and come back whenever you like.' },
  { title: 'Build and show it', body: 'Finish real projects, earn your certificate, and apply to jobs.' },
]

const forWho = ['Students who want a head start', 'Working people who want to do more in less time', 'Business owners who want help with marketing and admin', 'Anyone curious about AI — no tech background needed']

export default function SimplePage() {
  return (
    <div className="vs">
      <header className="vs-top">
        <Link className="vs-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <div className="vs-top-actions">
          <ThemeToggle />
          <Buy className="button button-small">Join for {price}</Buy>
        </div>
      </header>

      <main className="vs-main">
        <section className="vs-hero">
          <p className="vs-kicker">For complete beginners</p>
          <h1>Learn to use AI — even if you have never used it before.</h1>
          <p className="vs-lede">{whatItIs}</p>
          <div className="vs-cta">
            <Buy className="button vs-btn">Join for {price}</Buy>
            <p>
              One-time payment · <s>{was}</s> · offer ends {endsOn}
            </p>
          </div>
        </section>

        <section className="vs-sec" aria-labelledby="vs-ai">
          <h2 id="vs-ai">First: what is AI, really?</h2>
          <p>
            AI tools like <b>ChatGPT</b>, <b>Claude</b> and <b>Gemini</b> are helpers you talk to in plain English. You type what you want — <i>“write a polite
            email asking for leave”</i> — and they write it in seconds.
          </p>
          <p>
            They are easy to start and hard to use <em>well</em>. Most people try once, get an average answer, and stop. This program shows you how to get
            great answers, every time, and how to use them for real work.
          </p>
        </section>

        <section className="vs-sec" aria-labelledby="vs-who">
          <h2 id="vs-who">Is this for me?</h2>
          <p>Yes, if you are one of these:</p>
          <ul className="vs-ticks">
            {forWho.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="vs-note">You do not need to know coding. You only need a phone or laptop and the internet.</p>
        </section>

        <section className="vs-sec" aria-labelledby="vs-do">
          <h2 id="vs-do">What you will be able to do</h2>
          <ul className="vs-outcomes">
            {outcomes.map((o) => (
              <li key={o.title}>
                <span aria-hidden="true">{o.icon}</span>
                <div>
                  <b>{o.title}</b>
                  <p>{o.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="vs-sec" aria-labelledby="vs-how">
          <h2 id="vs-how">How it works</h2>
          <ol className="vs-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span aria-hidden="true">{i + 1}</span>
                <div>
                  <b>{s.title}</b>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="vs-sec vs-price" aria-labelledby="vs-cost">
          <h2 id="vs-cost">What it costs</h2>
          <p className="vs-amount">
            <b>{price}</b> <s>{was}</s>
          </p>
          <p>Once. Not per month. You keep it for life.</p>
          <ul className="vs-included">
            {included.map((i) => (
              <li key={i.title}>{i.title}</li>
            ))}
          </ul>
          <Buy className="button vs-btn">Join for {price}</Buy>
          <p className="vs-urgent">
            Early Access price ends in <TimeLeft className="vs-time" />
            <SeatsText className="vs-seats" />
          </p>
        </section>

        <section className="vs-sec" aria-labelledby="vs-faq">
          <h2 id="vs-faq">Questions people ask</h2>
          <FaqList items={faqs} />
        </section>

        <section className="vs-end">
          <h2>Ready to start?</h2>
          <p>Your login arrives straight after you pay — you can begin today.</p>
          <Buy className="button vs-btn">Join for {price}</Buy>
        </section>
      </main>

      <KitFooter />
    </div>
  )
}
