import Link from 'next/link'
import { CertificatePicker } from '@/components/CertificatePicker'
import { certificate } from '@/lib/earlyAccess'
import { Glyph, Stars, Tick } from '../_kit/Icons'
import { Buy, FaqList, KitFooter, variantMeta } from '../_kit/Kit'
import { JoinedToast, SeatsBar, SeatsText, TimeLeft } from '../_kit/Live'
import { ToolMark } from '../_kit/ToolMark'
import { HeroScene } from './HeroScene'
import { endsOn, faqs, included, modules, outcomes, price, product, quotes, savePct, tools, was, whatItIs } from '../_kit/facts'
import './showcase.css'

/**
 * Variant: SHOWCASE — the best-looking one.
 *
 * Always dark, whatever the site theme: a premium product page in the manner
 * of a launch site. It shows rather than tells — a live-looking AI chat in the
 * hero, the tools sliding past, a bento of what is inside, the curriculum as a
 * path, a certificate to look at. Same facts and the same checkout as every
 * other variant.
 */

export const metadata = variantMeta(
  '/campaign/ai-showcase',
  `${product} — learn AI, build real work · ${price}`,
  'Go from never having used AI to building real projects with it. 10+ courses, 50+ tools, 20+ projects and a certificate, for a one-time ₹499.',
)

const pad = (n: number) => String(n).padStart(2, '0')

export default function ShowcasePage() {
  const marquee = [...tools, ...tools]
  return (
    <div className="vx">
      <div className="vx-bar">
        <span>
          <b>Early Access</b> · {savePct}% off ends in
        </span>
        <TimeLeft className="vx-time" />
        <Buy className="vx-bar-cta" arrow="→">
          Claim {price}
        </Buy>
      </div>

      <header className="vx-head">
        <Link className="vx-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <Buy className="vx-btn vx-btn-ghost vx-btn-sm">Get started</Buy>
      </header>

      <main>
        {/* Hero */}
        <section className="vx-hero">
          <div className="vx-glow" aria-hidden="true" />
          <div className="vx-wrap vx-hero-grid">
            <div className="vx-hero-copy">
              <span className="vx-pill">
                <i aria-hidden="true" /> {product} · Early Access
              </span>
              <h1>
                AI, finally <em>explained.</em>
                <br />
                Then put to work.
              </h1>
              <p className="vx-lede">{whatItIs}</p>
              <div className="vx-hero-cta">
                <Buy className="vx-btn">Start for {price}</Buy>
                <a className="vx-btn vx-btn-ghost" href="#inside">
                  See what&rsquo;s inside <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="vx-fine">
                One-time payment · <s>{was}</s> · price ends {endsOn}
              </p>
            </div>

            <HeroScene />
          </div>
        </section>

        {/* Tools, sliding past */}
        <section className="vx-tools" aria-label="Tools you'll use">
          <p>50+ tools, including</p>
          <div className="vx-marquee">
            <ul>
              {marquee.map((t, i) => (
                <li key={`${t.name}-${i}`} aria-hidden={i >= tools.length || undefined}>
                  <span className="vx-logo">
                    <ToolMark name={t.name} mark={t.mark} className="vx-logo-mark" id={`m${i}`} />
                  </span>
                  {t.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bento: what's inside */}
        <section className="vx-sec" id="inside">
          <div className="vx-wrap">
            <header className="vx-sec-head">
              <span className="vx-eyebrow">What&rsquo;s inside</span>
              <h2>Everything you need. Nothing you don&rsquo;t.</h2>
            </header>
            <div className="vx-bento">
              <article className="vx-tile vx-tile-big">
                <span className="vx-num">10+</span>
                <h3>Courses, from zero</h3>
                <p>Start with what AI is and how to talk to it. End shipping real work with it.</p>
                <ul className="vx-mini-mods" aria-hidden="true">
                  {modules.slice(0, 4).map((m, i) => (
                    <li key={m.title}>
                      <b>{pad(i + 1)}</b> {m.title}
                    </li>
                  ))}
                  <li className="vx-more">+ {modules.length - 4} more</li>
                </ul>
              </article>
              <article className="vx-tile">
                <span className="vx-num">20+</span>
                <h3>Real projects</h3>
                <p>Build, don&rsquo;t just watch — a portfolio you can show.</p>
              </article>
              <article className="vx-tile vx-tile-lime">
                <span className="vx-num">100+</span>
                <h3>Jobs to apply to</h3>
                <p>Put your new skills to work on the job board.</p>
              </article>
              <article className="vx-tile">
                <span className="vx-num">Live</span>
                <h3>Workshops</h3>
                <p>Learn from people who use AI every day.</p>
              </article>
              <article className="vx-tile">
                <span className="vx-tile-icon">
                  <Glyph name="certificate" />
                </span>
                <h3>Certificate</h3>
                <p>Earned through projects — proof of what you built.</p>
              </article>
              <article className="vx-tile vx-tile-wide">
                <span className="vx-tile-icon">
                  <Glyph name="forever" />
                </span>
                <h3>Templates, community, lifetime access</h3>
                <p>Prompts, guides and notes; people to learn with; and it&rsquo;s yours for good.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="vx-sec vx-sec-alt">
          <div className="vx-wrap">
            <header className="vx-sec-head">
              <span className="vx-eyebrow">After the program</span>
              <h2>Things you&rsquo;ll actually be able to do.</h2>
            </header>
            <ul className="vx-outcomes">
              {outcomes.map((o) => (
                <li key={o.title}>
                  <span className="vx-out-icon">
                    <Glyph name={o.icon} />
                  </span>
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Curriculum as a path */}
        <section className="vx-sec">
          <div className="vx-wrap">
            <header className="vx-sec-head">
              <span className="vx-eyebrow">The path</span>
              <h2>Eight steps, from first prompt to live product.</h2>
            </header>
            <ol className="vx-path">
              {modules.map((m, i) => (
                <li key={m.title}>
                  <span className="vx-path-dot" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.learn.join(' · ')}</p>
                    <span className="vx-build">You build: {m.build}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Certificate — the site's own specimen, with the tool pills that rewrite it */}
        <section className="vx-sec vx-sec-alt vx-cert-sec" id="certificate">
          <div className="vx-wrap credential">
            <CertificatePicker>
              {/* "eyebrow" too, so the phone layout lifts it above the heading with it */}
              <span className="eyebrow vx-eyebrow">{certificate.eyebrow}</span>
              <h2>{certificate.title}</h2>
              <p>{certificate.body}</p>
              <ul>
                {certificate.points.map((point) => (
                  <li key={point}>
                    <Tick />
                    {point}
                  </li>
                ))}
              </ul>
            </CertificatePicker>
          </div>
        </section>

        {/* Quotes */}
        <section className="vx-sec">
          <div className="vx-wrap">
            <header className="vx-sec-head">
              <span className="vx-eyebrow">From the community</span>
              <h2>Builders become believers.</h2>
            </header>
            <ul className="vx-quotes">
              {quotes.map((q) => (
                <li key={q.name}>
                  <Stars className="vx-stars" />
                  <p>“{q.quote}”</p>
                  <footer>
                    {q.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={q.photo} alt="" loading="lazy" />
                    )}
                    <span>
                      <b>{q.name}</b>
                      <small>{q.role}</small>
                    </span>
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Price */}
        <section className="vx-sec vx-offer" id="price">
          <div className="vx-wrap">
            <article className="vx-price">
              <span className="vx-eyebrow">One price · everything included</span>
              <p className="vx-price-amt">
                <b>{price}</b>
                <s>{was}</s>
                <span className="vx-off">{savePct}% off</span>
              </p>
              <ul>
                {[...included.map((i) => i.title), 'Lifetime access'].map((t) => (
                  <li key={t}>
                    <Tick />
                    {t}
                  </li>
                ))}
              </ul>
              <Buy className="vx-btn vx-btn-block">Get {product} for {price}</Buy>
              <div className="vx-price-live">
                <SeatsText className="vx-seats" />
                <SeatsBar className="vx-seatbar" />
                <span>
                  Price ends in <TimeLeft className="vx-time" />
                </span>
              </div>
              <p className="vx-fine">One-time payment · instant access · no hidden fees</p>
            </article>
          </div>
        </section>

        <section className="vx-sec">
          <div className="vx-wrap vx-faq-wrap">
            <header className="vx-sec-head">
              <span className="vx-eyebrow">FAQ</span>
              <h2>Quick answers.</h2>
            </header>
            <FaqList items={faqs} />
          </div>
        </section>

        <section className="vx-final">
          <div className="vx-glow vx-glow-low" aria-hidden="true" />
          <h2>
            Stop watching AI happen.
            <br />
            <em>Start using it.</em>
          </h2>
          <Buy className="vx-btn">Start for {price}</Buy>
        </section>
      </main>

      <KitFooter />
      <JoinedToast />
    </div>
  )
}
