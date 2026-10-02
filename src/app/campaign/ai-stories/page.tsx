import Link from 'next/link'
import { Buy, FaqList, KitFooter, variantMeta } from '../_kit/Kit'
import { SeatsText, TimeLeft } from '../_kit/Live'
import { ToolMark } from '../_kit/ToolMark'
import { endsOn, faqs, price, product, tools, was } from '../_kit/facts'
import { Stories, type Story } from './Stories'
import './stories.css'

/**
 * Variant: STORIES — for people arriving from an Instagram ad, on a phone.
 *
 * The whole pitch is seven cards they tap through, in the format they were
 * just scrolling: one idea a card, big type, a few seconds each. It ends on
 * the price and the button. Under the player, for anyone who wants to read
 * before paying, the plain FAQ.
 */

export const metadata = variantMeta(
  '/campaign/ai-stories',
  `What can AI do for you? 7 cards, 30 seconds · ${product}`,
  'Tap through seven quick cards to see what AI can do for you — and how to learn it, from zero, for a one-time ₹499.',
)

const marks = tools.slice(0, 6)

export default function StoriesPage() {
  const stories: Story[] = [
    {
      key: 'hook',
      tone: 'violet',
      content: (
        <>
          <span className="vt-emoji" aria-hidden="true">
            🤖
          </span>
          <h1>You&rsquo;ve heard about AI.</h1>
          <p>But what can it actually do for you? Tap through — it takes 30 seconds.</p>
          <span className="vt-hint" aria-hidden="true">
            Tap to continue →
          </span>
        </>
      ),
    },
    {
      key: 'write',
      tone: 'peach',
      content: (
        <>
          <span className="vt-emoji" aria-hidden="true">
            ✍️
          </span>
          <h2>It writes for you.</h2>
          <p>Emails, posts, reports, notes — a strong first draft in seconds, in your tone.</p>
          <div className="vt-chat" aria-hidden="true">
            <span className="vt-me">Write a polite email asking for Friday off</span>
            <span className="vt-ai">Hi Priya, I&rsquo;d like to request Friday off for a family event…</span>
          </div>
        </>
      ),
    },
    {
      key: 'research',
      tone: 'mint',
      content: (
        <>
          <span className="vt-emoji" aria-hidden="true">
            🔎
          </span>
          <h2>It explains anything.</h2>
          <p>A new topic, a confusing document, a decision to make — summarised simply, with sources to check.</p>
        </>
      ),
    },
    {
      key: 'make',
      tone: 'sky',
      content: (
        <>
          <span className="vt-emoji" aria-hidden="true">
            🎨⚙️
          </span>
          <h2>It designs and automates.</h2>
          <p>Posters and social posts in minutes. Boring weekly tasks that run on their own.</p>
        </>
      ),
    },
    {
      key: 'learn',
      tone: 'ink',
      content: (
        <>
          <span className="vt-kicker">The catch</span>
          <h2>Only if you know how to use it.</h2>
          <p>
            <b>{product}</b> teaches you — step by step, from zero, no coding needed.
          </p>
          <ul className="vt-stats">
            <li>
              <b>10+</b> courses
            </li>
            <li>
              <b>20+</b> projects
            </li>
            <li>
              <b>50+</b> tools
            </li>
          </ul>
          <div className="vt-marks" aria-label="Including Claude, ChatGPT, Gemini, n8n, Lovable and more">
            {marks.map((t) => (
              <span key={t.name}>
                <ToolMark name={t.name} mark={t.mark} className="vt-mark" id={`s-${t.name}`} />
              </span>
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'proof',
      tone: 'lime',
      content: (
        <>
          <span className="vt-emoji" aria-hidden="true">
            🏅💼
          </span>
          <h2>Then prove it, and use it.</h2>
          <p>Earn a certificate from the projects you build — and apply to 100+ jobs on the job board.</p>
        </>
      ),
    },
    {
      key: 'offer',
      tone: 'offer',
      content: (
        <>
          <span className="vt-kicker">Early Access</span>
          <h2>All of it, once.</h2>
          <p className="vt-price">
            <b>{price}</b>
            <s>{was}</s>
          </p>
          <p>One-time payment · lifetime access · login by email straight away.</p>
          <Buy className="vt-buy">Start for {price}</Buy>
          <p className="vt-small">
            Price ends {endsOn} · <TimeLeft className="vt-time" /> <SeatsText className="vt-seats" />
          </p>
        </>
      ),
    },
  ]

  return (
    <div className="vt">
      <header className="vt-head">
        <Link className="vt-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <Buy className="vt-head-buy" arrow="">
          {price}
        </Buy>
      </header>

      <main>
        <section className="vt-stage" aria-label={`${product} in seven cards`}>
          <Stories stories={stories} />
        </section>

        <section className="vt-more">
          <h2>Prefer to read?</h2>
          <p>
            {product} is an online program by skeo that teaches you to use AI tools — ChatGPT, Claude, Gemini and 50+ more — for real work, step by step.
            Here are the questions people ask first.
          </p>
          <FaqList items={faqs} />
          <Buy className="vt-buy vt-buy-wide">Start for {price}</Buy>
        </section>
      </main>

      <KitFooter />
    </div>
  )
}
