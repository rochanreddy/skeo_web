import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Buy, FaqList, KitFooter, variantMeta } from '../_kit/Kit'
import { SeatsText, TimeLeft } from '../_kit/Live'
import { endsOn, faqs, included, modules, price, product, was } from '../_kit/facts'
import './explained.css'

/**
 * Variant: EXPLAINER — a guided story for someone confused by AI.
 *
 * It earns the click by teaching first: the words people hear and do not
 * understand, an ordinary day with and without AI, then the program as a
 * journey in four stages built from the real curriculum, and an honest
 * "is this for you" that also says who it is not for. Trust first, ask second.
 */

export const metadata = variantMeta(
  '/campaign/ai-explained',
  `AI explained in plain words — and how to learn it · ${product}`,
  'Confused by AI? Here is what the words mean, what it changes in an ordinary day, and a step-by-step way to learn it for a one-time ₹499.',
)

const words = [
  { term: 'AI', plain: 'Software that can write, answer questions, and make things when you ask in plain language.', like: 'a very fast assistant who has read most of the internet.' },
  { term: 'ChatGPT, Claude, Gemini', plain: 'The best-known AI assistants. You type a request; they reply.', like: 'three different brands of the same kind of helper.' },
  { term: 'Prompt', plain: 'What you type to the AI. Better prompts get much better answers.', like: 'a clear brief to a new colleague.' },
  { term: 'Automation', plain: 'Setting a task to run by itself — every day, every new email, every new form.', like: 'a standing instruction that never forgets.' },
  { term: 'AI agent', plain: 'An AI that can take several steps on its own: look something up, decide, then act.', like: 'an intern you can hand a whole task to.' },
  { term: 'No-code', plain: 'Building websites and apps by describing them, without writing code.', like: 'telling an architect what you want instead of laying bricks.' },
]

const day = [
  { task: 'An important email', before: 'Twenty minutes rewording the same three lines.', after: 'Ask for a draft in your tone, fix one line, send.' },
  { task: 'Understanding a new topic', before: 'Fifteen tabs open and still unsure what matters.', after: 'A clear summary with sources, and follow-up questions answered.' },
  { task: 'A poster or social post', before: 'Wait for a designer, or settle for something plain.', after: 'Make three options yourself and pick the best.' },
  { task: 'The same report every week', before: 'Copy, paste, format — again.', after: 'It builds itself and lands in your inbox.' },
]

const stages = [
  { name: 'Understand it', when: 'Start here', mods: [0, 1] },
  { name: 'Use it for real work', when: 'Then', mods: [2, 3] },
  { name: 'Make work run itself', when: 'Next', mods: [4, 5] },
  { name: 'Build and ship', when: 'Finally', mods: [6, 7] },
]

const yes = ['You have heard about AI but never really used it', 'You tried ChatGPT and got average answers', 'You want to learn by doing, with projects to show', 'You want one place for all of it, at one fair price']
const no = ['You want a shortcut that needs no practice at all', 'You are an AI researcher looking for advanced theory']

export default function ExplainedPage() {
  return (
    <div className="vg">
      <header className="vg-top">
        <Link className="vg-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <div className="vg-top-actions">
          <ThemeToggle />
          <Buy className="button button-small">Start for {price}</Buy>
        </div>
      </header>

      <main>
        <section className="vg-hero">
          <div className="vg-wrap">
            <p className="vg-kicker">A plain-English guide</p>
            <h1>
              Confused by AI?
              <br />
              <span>Start here.</span>
            </h1>
            <p className="vg-lede">
              Everyone is talking about AI and most explanations assume you already understand it. This page doesn&rsquo;t. Five minutes from now you&rsquo;ll
              know what it is, what it can do for you, and one simple way to learn it properly.
            </p>
            <nav className="vg-toc" aria-label="On this page">
              <a href="#words">The words, explained</a>
              <a href="#day">An ordinary day, with AI</a>
              <a href="#journey">How you learn it</a>
              <a href="#fit">Is it for you?</a>
            </nav>
          </div>
        </section>

        <section className="vg-sec" id="words">
          <div className="vg-wrap">
            <h2>The words, explained.</h2>
            <p className="vg-sub">The six terms you keep hearing — and what they actually mean.</p>
            <dl className="vg-words">
              {words.map((w) => (
                <div key={w.term}>
                  <dt>{w.term}</dt>
                  <dd>
                    {w.plain}
                    <span>Think of it as {w.like}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="vg-sec vg-sec-tint" id="day">
          <div className="vg-wrap">
            <h2>An ordinary day, with and without AI.</h2>
            <p className="vg-sub">Not science fiction — four things you might do this week.</p>
            <div className="vg-day">
              <div className="vg-day-head" aria-hidden="true">
                <span />
                <span>Without AI</span>
                <span>With AI, used well</span>
              </div>
              {day.map((d) => (
                <div key={d.task} className="vg-day-row">
                  <b>{d.task}</b>
                  <p className="vg-before">
                    <span className="vg-mobile-label">Without AI: </span>
                    {d.before}
                  </p>
                  <p className="vg-after">
                    <span className="vg-mobile-label">With AI: </span>
                    {d.after}
                  </p>
                </div>
              ))}
            </div>
            <p className="vg-callout">
              The catch: AI only works this well when you know <b>how to ask</b> and <b>which tool to use</b>. That is the part people skip — and the part this
              program teaches.
            </p>
          </div>
        </section>

        <section className="vg-sec" id="journey">
          <div className="vg-wrap">
            <h2>How you learn it, step by step.</h2>
            <p className="vg-sub">
              {product} takes you through four stages. Each one ends with something you have built — not just something you have watched.
            </p>
            <ol className="vg-journey">
              {stages.map((s, i) => (
                <li key={s.name}>
                  <span className="vg-j-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <span className="vg-j-when">{s.when}</span>
                    <h3>{s.name}</h3>
                    <ul>
                      {s.mods.map((m) => (
                        <li key={m}>
                          <b>{modules[m].title}</b>
                          <span>
                            {modules[m].learn.slice(0, 3).join(', ')} · you build <i>{modules[m].build}</i>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
              <li className="vg-j-end">
                <span className="vg-j-num" aria-hidden="true">
                  ★
                </span>
                <div>
                  <span className="vg-j-when">And then</span>
                  <h3>Get certified, get work</h3>
                  <p>Earn your certificate from the projects you built, and use the job board to apply what you learned.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="vg-sec vg-sec-tint" id="fit">
          <div className="vg-wrap">
            <h2>Is this for you? An honest answer.</h2>
            <div className="vg-fit">
              <div className="vg-fit-yes">
                <h3>A good fit if…</h3>
                <ul>
                  {yes.map((y) => (
                    <li key={y}>{y}</li>
                  ))}
                </ul>
              </div>
              <div className="vg-fit-no">
                <h3>Probably not if…</h3>
                <ul>
                  {no.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="vg-sec" id="join">
          <div className="vg-wrap">
            <div className="vg-offer">
              <div>
                <p className="vg-kicker">If it is for you</p>
                <h2>Everything above, for one payment.</h2>
                <ul>
                  {included.map((i) => (
                    <li key={i.title}>{i.title}</li>
                  ))}
                </ul>
              </div>
              <div className="vg-offer-buy">
                <p className="vg-offer-price">
                  <b>{price}</b>
                  <s>{was}</s>
                </p>
                <p className="vg-offer-terms">One time · lifetime access · Early Access price until {endsOn}</p>
                <Buy className="button vg-btn">Start learning — {price}</Buy>
                <p className="vg-offer-live">
                  <SeatsText className="vg-seats" />
                  <span>
                    Ends in <TimeLeft className="vg-time" />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="vg-sec vg-sec-faq">
          <div className="vg-wrap vg-narrow">
            <h2>Still have questions?</h2>
            <FaqList items={faqs} />
          </div>
        </section>
      </main>

      <KitFooter />
    </div>
  )
}
