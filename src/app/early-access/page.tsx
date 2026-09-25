import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import { Footer } from '@/components/Footer'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import {
  announcement,
  build,
  curriculum,
  faqs,
  finalCta,
  finalStack,
  hero,
  inr,
  mentor,
  numbers,
  offer,
  steps,
  testimonials,
  tools,
  valueStack,
  whatYouGet,
} from '@/lib/earlyAccess'
import './early-access.css'

export const metadata: Metadata = {
  title: `Early Access — everything in skeo for ${inr(offer.price)}`,
  description:
    'Learn the AI tools, build real projects, and become job-ready — 10+ courses, 50+ tools and 20+ projects for a one-time ₹499.',
  alternates: { canonical: '/early-access' },
}

/* Placeholder testimonials stay off the live site (see earlyAccess.ts). Local
   and Vercel preview builds still draw them, so the layout can be reviewed. */
const showTestimonials = !testimonials.sample || process.env.VERCEL_ENV !== 'production'

/** Every CTA on the page buys the same thing: verify → /checkout → Cashfree. */
function Buy({ children, className = 'button ea-cta' }: { children: ReactNode; className?: string }) {
  return (
    <PurchaseButton plan="earlyaccess" className={className}>
      {children}
    </PurchaseButton>
  )
}

function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="ea-line">
          {line}
        </span>
      ))}
    </>
  )
}

function Price({ big = false }: { big?: boolean }) {
  return (
    <p className={big ? 'ea-price ea-price-big' : 'ea-price'}>
      <strong>{inr(offer.price)}</strong>
      <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
    </p>
  )
}

function Check() {
  return (
    <svg className="ea-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICONS: Record<string, string> = {
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  rocket: 'M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2m-3-3 4 4m-4-4c1-3 4-10 13-11-1 9-8 12-11 13m4-8a1.5 1.5 0 1 0 0-.01',
  live: 'M3 5h18v12H3zM8 21h8M12 17v4M10 9l5 2-5 2z',
  file: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6',
  people: 'M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7',
}

function Icon({ name }: { name: string }) {
  return (
    <svg className="ea-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

function ToolLogo({ name, mark }: { name: string; mark?: string }) {
  switch (mark) {
    case 'claude':
      return <ClaudeMark className="ea-tool-mark" />
    case 'chatgpt':
      return <ChatGptMark className="ea-tool-mark ea-mono" />
    case 'gemini':
      return <GeminiMark className="ea-tool-mark" />
    case 'n8n':
      return <N8nMark className="ea-tool-mark" />
    case 'lovable':
      return <LovableMark className="ea-tool-mark" idPrefix="ea-lovable" />
    default:
      return (
        <span className="ea-tool-mark ea-monogram" aria-hidden="true">
          {name[0]}
        </span>
      )
  }
}

function Heading({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <div className="ea-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{children}</h2>
    </div>
  )
}

/**
 * The small drawing at the top of each outcome card — the thing you end up
 * with, sketched in markup rather than shipped as an image, so it takes the
 * palette and stays sharp. Decorative: the card's title says it in words.
 */
function OutcomeVisual({ kind }: { kind: string }) {
  switch (kind) {
    case 'site':
      return (
        <div className="ov-browser">
          <div className="ov-bar">
            <i />
            <i />
            <i />
            <span className="ov-url">yourname.com</span>
          </div>
          <div className="ov-page">
            <span className="ov-line ov-w60 ov-strong" />
            <span className="ov-line ov-w80" />
            <span className="ov-line ov-w40" />
            <span className="ov-btn" />
          </div>
          <ol className="ov-steps">
            <li>Idea</li>
            <li>Design</li>
            <li className="ov-live">Deploy</li>
          </ol>
        </div>
      )
    case 'app':
      return (
        <div className="ov-chat">
          <p className="ov-msg ov-me">Summarise this report</p>
          <div className="ov-msg ov-ai">
            <ClaudeMark className="ov-ai-mark" />
            <span>
              <span className="ov-line ov-w80" />
              <span className="ov-line ov-w60" />
            </span>
          </div>
          <div className="ov-input">
            Ask anything…
            <b>↑</b>
          </div>
        </div>
      )
    case 'flow':
      return (
        <div className="ov-flow">
          <span className="ov-node">
            <b>⚡</b>New lead
          </span>
          <span className="ov-wire" />
          <span className="ov-node ov-node-ai">
            <ClaudeMark className="ov-node-mark" />
            AI replies
          </span>
          <span className="ov-wire" />
          <span className="ov-node">
            <N8nMark className="ov-node-mark" />
            Sent
          </span>
        </div>
      )
    case 'portfolio':
      return (
        <div className="ov-folio">
          <span className="ov-folio-name">
            <i />
            Your Portfolio
          </span>
          <div className="ov-tiles">
            <span className="ov-tile ov-t1" />
            <span className="ov-tile ov-t2" />
            <span className="ov-tile ov-t3" />
            <span className="ov-tile ov-t4" />
          </div>
        </div>
      )
    default:
      return (
        <div className="ov-launch">
          <span className="ov-status">
            <i />
            Live
          </span>
          <div className="ov-bars">
            {[28, 40, 34, 56, 64, 78, 92].map((h) => (
              <span key={h} style={{ height: `${h}%` }} />
            ))}
          </div>
          <span className="ov-rocket">🚀</span>
        </div>
      )
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

const savePct = Math.round((1 - offer.price / offer.was) * 100)

export default function EarlyAccessPage() {
  return (
    <div className="ea">
      {/* 1. Announcement */}
      <div className="ea-announce">
        <div className="wrap ea-announce-inner">
          <p>
            <span aria-hidden="true">🚀 </span>
            {announcement.text}
          </p>
          <Buy className="ea-announce-cta">{announcement.cta}</Buy>
        </div>
      </div>

      <header className="wrap ea-header">
        <Link className="brand" href="/" aria-label="skeo home">
          <span>skeo</span>
        </Link>
        <div className="ea-header-actions">
          <ThemeToggle />
          <Buy className="button button-small">{hero.cta}</Buy>
        </div>
      </header>

      <main id="top">
        {/* 2. Hero — the promise on the left, the offer itself on the right */}
        <section className="ea-hero-band">
          <div className="ea-hero-glow" aria-hidden="true" />
          <div className="wrap ea-hero">
            <div className="ea-hero-copy">
              <span className="eyebrow ea-chip">
                <span className="ea-dot" aria-hidden="true" />
                Early Access · Now Open
              </span>
              <h1>
                <Lines lines={hero.lines} />
              </h1>
              <p className="ea-lede">{hero.lede}</p>
              <div className="ea-hero-price">
                <Price big />
                <span className="ea-save">Save {savePct}%</span>
              </div>
              <p className="ea-terms">{offer.terms}</p>
              <div className="ea-hero-actions">
                <Buy>{hero.cta}</Buy>
                <a className="button button-outline ea-cta ea-ghost" href="#inside">
                  <span className="btn-label">See what’s inside</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
              <ul className="ea-checks">
                {hero.checks.map((c) => (
                  <li key={c}>
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ea-hero-visual">
              <span className="ea-float ea-float-1" aria-hidden="true">
                <ClaudeMark className="ea-float-mark" />
              </span>
              <span className="ea-float ea-float-2" aria-hidden="true">
                <N8nMark className="ea-float-mark" />
              </span>
              <span className="ea-float ea-float-3" aria-hidden="true">
                <GeminiMark className="ea-float-mark" />
              </span>
              <span className="ea-float ea-float-4" aria-hidden="true">
                <LovableMark className="ea-float-mark" idPrefix="ea-float-lovable" />
              </span>

              <article className="ea-pass" aria-label="The Early Access pass">
                <header className="ea-pass-top">
                  <span className="ea-pass-brand">skeo</span>
                  <span className="ea-pass-tag">Early Access Pass</span>
                </header>
                <p className="ea-pass-name">Everything AI</p>
                <p className="ea-pass-price">
                  <strong>{inr(offer.price)}</strong>
                  <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
                </p>
                <ul className="ea-pass-list">
                  {valueStack.items.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="ea-pass-marks" aria-label="Tools included: Claude, ChatGPT, Gemini, n8n, Lovable and more">
                  <ClaudeMark className="ea-pass-mark" />
                  <ChatGptMark className="ea-pass-mark ea-pass-mono" />
                  <GeminiMark className="ea-pass-mark" />
                  <N8nMark className="ea-pass-mark" />
                  <LovableMark className="ea-pass-mark" idPrefix="ea-pass-lovable" />
                  <span className="ea-pass-more">+45</span>
                </div>
                <footer className="ea-pass-foot">
                  <span>One-time payment</span>
                  <span>Lifetime access</span>
                </footer>
              </article>
            </div>
          </div>
        </section>

        {/* 3. Numbers */}
        <section className="wrap ea-numbers" aria-label="What is included, in numbers">
          {numbers.map((n) => (
            <div key={n.label}>
              <strong>{n.value}</strong>
              <span>{n.label}</span>
            </div>
          ))}
        </section>

        {/* 4. What you get */}
        <section className="section" id="inside">
          <div className="wrap">
            <Heading eyebrow="What you get">
              <Lines lines={whatYouGet.title} />
            </Heading>
            <div className="ea-grid ea-grid-3">
              {whatYouGet.cards.map((c, i) => (
                <article key={c.title} className={`ea-card ea-get ea-tint-${i % 3}`}>
                  <Icon name={c.icon} />
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Build */}
        <section className="ea-band ea-band-ink ea-out-band">
          <div className="wrap">
            <div className="ea-out-head">
              <div>
                <span className="eyebrow">Outcomes</span>
                <h2>
                  <Lines lines={build.title} />
                </h2>
              </div>
              <Buy className="button button-lime ea-cta">{hero.cta}</Buy>
            </div>
            <ol className="ea-out-grid">
              {build.items.map((b, i) => (
                <li key={b.title} className={`ea-out ea-out-${b.visual}`}>
                  <div className="ea-out-visual" aria-hidden="true">
                    <OutcomeVisual kind={b.visual} />
                  </div>
                  <div className="ea-out-text">
                    <span className="ea-out-num">{pad(i + 1)}</span>
                    <h3>{b.title}</h3>
                    <p>{b.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. Tools */}
        <section className="section">
          <div className="wrap">
            <Heading eyebrow="Tools">
              <Lines lines={tools.title} />
            </Heading>
            <ul className="ea-tools">
              {tools.list.map((t) => (
                <li key={t.name}>
                  <ToolLogo name={t.name} mark={'mark' in t ? t.mark : undefined} />
                  {t.name}
                </li>
              ))}
            </ul>
            <p className="ea-note">{tools.note}</p>
          </div>
        </section>

        {/* 7. Curriculum */}
        <section className="ea-band ea-band-soft">
          <div className="wrap">
            <Heading eyebrow="Curriculum">{curriculum.title}</Heading>
            <div className="ea-grid ea-grid-4">
              {curriculum.modules.map((m, i) => (
                <article key={m.title} className="ea-card ea-module">
                  <span className="ea-num">Module {pad(i + 1)}</span>
                  <h3>{m.title}</h3>
                  <ul>
                    {m.learn.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <p className="ea-build">
                    <span>Build</span>
                    {m.build}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. How it works */}
        <section className="section">
          <div className="wrap">
            <Heading eyebrow="How it works">Join. Learn. Build.</Heading>
            <ol className="ea-steps">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="ea-step-num">{pad(i + 1)}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 9. Mentor */}
        <section className="ea-band ea-band-soft">
          <div className="wrap ea-split ea-mentor">
            <div className="ea-split-head">
              <span className="eyebrow">Mentor</span>
              <h2>
                <Lines lines={mentor.title} />
              </h2>
            </div>
            <article className="ea-card ea-mentor-card">
              <span className="ea-avatar" aria-hidden="true">
                {mentor.initials}
              </span>
              <div>
                <h3>{mentor.name}</h3>
                <p className="ea-role">{mentor.role}</p>
                <p>{mentor.bio}</p>
              </div>
            </article>
          </div>
        </section>

        {/* 10. Testimonials — placeholders never reach the live site */}
        {showTestimonials && (
          <section className="section">
            <div className="wrap">
              <Heading eyebrow="Reviews">{testimonials.title}</Heading>
              {testimonials.sample && <p className="ea-sample">Sample reviews — replace before launch. Hidden on the live site.</p>}
              <div className="ea-grid ea-grid-3">
                {testimonials.list.map((t) => (
                  <figure key={t.name} className="ea-card ea-quote">
                    <span className="ea-stars" aria-label="5 out of 5">
                      ★★★★★
                    </span>
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption>
                      {t.name} · {t.role}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 11. Final value stack */}
        <section className="ea-band ea-band-ink">
          <div className="wrap ea-stack">
            <div>
              <span className="eyebrow">Everything included</span>
              <h2>
                <Lines lines={finalStack.title} />
              </h2>
            </div>
            <div className="ea-stack-card">
              <ul>
                {finalStack.items.map((i) => (
                  <li key={i}>
                    <Check />
                    {i}
                  </li>
                ))}
              </ul>
              <Price />
              <p className="ea-terms">{finalStack.note}</p>
              <Buy className="button button-lime ea-cta">{finalStack.cta}</Buy>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className="section">
          <div className="wrap ea-faq">
            <Heading eyebrow="FAQ">Questions, answered.</Heading>
            <div>
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <span className="ea-plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 13. Final CTA */}
        <section className="ea-band ea-band-deep ea-final">
          <div className="wrap">
            <h2>
              <Lines lines={finalCta.title} />
            </h2>
            <Buy className="button button-lime ea-cta">{finalCta.cta}</Buy>
            <p className="ea-terms">{finalCta.small}</p>
          </div>
        </section>
      </main>

      <Footer closing={false} />
    </div>
  )
}
