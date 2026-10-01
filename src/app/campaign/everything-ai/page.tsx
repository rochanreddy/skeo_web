import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { AppWindow, BriefcaseBusiness, Rocket, Workflow } from 'lucide-react'
import { CertificatePicker } from '@/components/CertificatePicker'
import { JobBoard } from '@/components/sections/JobBoard'
import { opportunities, testimonials } from '@/lib/content'
import {
  announcement,
  build,
  certificate,
  faq,
  finalCta,
  get,
  hero,
  inr,
  jobs,
  learn,
  mentor,
  numbers,
  offer,
  pricing,
  reviews,
  savePct,
  valueStack,
} from '@/lib/earlyAccess'
import { Countdown } from './Countdown'
import { FlowBackdrop } from './FlowBackdrop'
import { JoinToasts, SeatsLeft } from './Live'
import { PlayOnView } from './PlayOnView'
import { StickyCta } from './StickyCta'
import { hasToolLogo, ToolLogoMark } from './ToolLogos'
import './early-access.css'

export const metadata: Metadata = {
  title: `Early Access — everything in skeo for ${inr(offer.price)}`,
  description:
    'Learn the AI tools, build real projects, and become job-ready — 10+ courses, 50+ tools and 20+ projects for a one-time ₹499.',
  alternates: { canonical: '/campaign/everything-ai' },
}

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
  badge: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 13.9 7 22l5-3 5 3-1.5-8.1',
  infinity: 'M7.5 8.5C4.5 8.5 3 10.2 3 12s1.5 3.5 4.5 3.5c3.5 0 5.5-7 9-7 3 0 4.5 1.7 4.5 3.5s-1.5 3.5-4.5 3.5c-3.5 0-5.5-7-9-7',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3',
  flow: 'M4 6h5v5H4zM15 13h5v5h-5zM9 8.5h3.5a2 2 0 0 1 2 2V13M6.5 11v4.5a2 2 0 0 0 2 2H15',
  folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z',
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
      if (mark && hasToolLogo(mark)) return <ToolLogoMark mark={mark} className="ea-tool-mark" />
      return (
        <span className="ea-tool-mark ea-monogram" aria-hidden="true">
          {name[0]}
        </span>
      )
  }
}

/* The "What you'll build" glyphs: lucide's multi-stroke drawings, which read
   as crafted icons where the single-path ones read as placeholders. */
const BUILD_GLYPHS = {
  globe: AppWindow,
  flow: Workflow,
  folder: BriefcaseBusiness,
  rocket: Rocket,
} as const

function BuildGlyph({ kind }: { kind: string }) {
  const G = BUILD_GLYPHS[kind as keyof typeof BUILD_GLYPHS] ?? AppWindow
  return <G className="ea-b-glyph" strokeWidth={1.75} absoluteStrokeWidth />
}

/** Every section below the hero opens the same way: a small label, one line. */
function Head({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="ea-head">
      <span className="ea-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </header>
  )
}

/**
 * Faint background pieces for the wide, quiet sides of a section heading — a
 * line of code, a prompt, the tools themselves. Decoration only: hidden from
 * screen readers, never clickable, and gone below 1024px where there is no
 * empty side to fill.
 */
function Deco({ kind }: { kind: 'code' | 'marks' | 'prompt' }) {
  if (kind === 'marks') {
    return (
      <div className="ea-deco ea-deco-marks" aria-hidden="true">
        <ClaudeMark className="dm dm-1" />
        <N8nMark className="dm dm-2" />
        <GeminiMark className="dm dm-3" />
        <ChatGptMark className="dm dm-4" />
        <LovableMark className="dm dm-5" idPrefix="ea-deco-lovable" />
      </div>
    )
  }
  if (kind === 'code') {
    return (
      <div className="ea-deco" aria-hidden="true">
        <pre className="dc dc-left">
          <code>
            <b>const</b> skill = <b>await</b> learn(<i>&quot;claude&quot;</i>){'\n'}
            <b>const</b> app = build(skill){'\n'}
            ship(app) <u>{'// → live'}</u>
          </code>
        </pre>
        <pre className="dc dc-right">
          <code>
            <u>{'/* your stack */'}</u>{'\n'}
            tools: [<i>&quot;Claude&quot;</i>, <i>&quot;n8n&quot;</i>,{'\n'}
            {'        '}<i>&quot;Gemini&quot;</i>, <i>&quot;Lovable&quot;</i>]
          </code>
        </pre>
      </div>
    )
  }
  if (kind === 'prompt') {
    return (
      <div className="ea-deco" aria-hidden="true">
        <pre className="dc dc-left dc-term">
          <code>
            <b>$</b> claude <i>&quot;turn my idea into a site&quot;</i>{'\n'}
            <u>✓ planned · ✓ built · ✓ deployed</u>
          </code>
        </pre>
        <pre className="dc dc-right dc-term">
          <code>
            <b>you</b> › summarise this report{'\n'}
            <b>ai</b>{'  '}› here are the 5 key points…
          </code>
        </pre>
      </div>
    )
  }
  return null
}

/**
 * The quietest layer: a dot-grid patch, a thin ring, a few sparkles. Used
 * where a section would otherwise be a flat colour with a card on it.
 */
function Ornament({ kind }: { kind: 'offer' | 'faq' | 'final' }) {
  const spark = (cls: string) => (
    <svg className={`orn-spark ${cls}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c.6 4.8 2.2 6.4 7 7-4.8.6-6.4 2.2-7 7-.6-4.8-2.2-6.4-7-7 4.8-.6 6.4-2.2 7-7z" />
    </svg>
  )
  return (
    <div className={`ea-orn ea-orn-${kind}`} aria-hidden="true">
      <span className="orn-dots orn-dots-a" />
      <span className="orn-dots orn-dots-b" />
      <span className="orn-ring orn-ring-a" />
      <span className="orn-ring orn-ring-b" />
      {spark('orn-s1')}
      {spark('orn-s2')}
      {spark('orn-s3')}
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

type Review = (typeof testimonials)[number]

function ReviewCard({ item, tint, hidden }: { item: Review; tint: number; hidden?: boolean }) {
  return (
    <li className={`ea-rv-card ea-rv-tint-${tint}`} aria-hidden={hidden || undefined}>
      <div className="ea-rv-stars" role="img" aria-label="Rated 5 out of 5">
        ★★★★★
      </div>
      <blockquote>{item.quote}</blockquote>
      <footer>
        <span className="ea-rv-avatar" aria-hidden="true">
          {initials(item.name)}
        </span>
        <span>
          <b>{item.name}</b>
          <span>{item.role}</span>
        </span>
      </footer>
    </li>
  )
}

/* "Priya Shah" → "PS" — the home page's stand-in for a face. */
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export default function EarlyAccessPage() {
  return (
    <div className="ea">
      {/* Announcement */}
      {/* Pinned to the top: the offer, the real deadline, and the button. */}
      <div className="ea-announce">
        <div className="wrap ea-announce-inner">
          <p className="ea-announce-text">
            <span className="ea-announce-lead">
              <span aria-hidden="true">🚀 </span>
              {announcement.lead}
              <span className="ea-announce-dot" aria-hidden="true">
                ·
              </span>
            </span>
          </p>
          <Countdown offer={announcement.offer} endsIn={announcement.endsIn} ended={announcement.ended} />
          <span className="ea-announce-seats">
            <SeatsLeft variant="inline" />
          </span>
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
        {/* Hero — the promise on the left, the offer itself on the right */}
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
                <span className="ea-save">{savePct}% OFF</span>
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
                <SeatsLeft />
                <footer className="ea-pass-foot">
                  <span>One-time payment</span>
                  <span>Lifetime access</span>
                </footer>
              </article>
            </div>
          </div>
        </section>

        {/* Numbers — the size of the offer, at a glance */}
        <section className="ea-stats" aria-label="What is included, in numbers">
          <div className="ea-container ea-stats-row">
            {numbers.map((n) => (
              <div key={n.label}>
                <strong>{n.value}</strong>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 1. What you get */}
        <section className="ea-sec" id="inside">
          <Deco kind="code" />
          <div className="ea-container">
            <Head eyebrow={get.eyebrow} title={get.title} />
            <ul className="ea-get">
              {get.items.map((g) => (
                <li key={g.title}>
                  <Icon name={g.icon} />
                  <div>
                    <h3>{g.title}</h3>
                    <p>{g.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. What you'll learn */}
        <section className="ea-sec ea-sec-soft">
          <Deco kind="marks" />
          <div className="ea-container">
            <Head eyebrow={learn.eyebrow} title={learn.title} />
            <ol className="ea-modules">
              {learn.modules.map((m, i) => (
                <li key={m.title}>
                  <span className="ea-mod-num">{pad(i + 1)}</span>
                  <div className="ea-mod-main">
                    <h3>{m.title}</h3>
                    <p>{m.learn.join(' · ')}</p>
                  </div>
                  <p className="ea-mod-build">
                    <span>You build</span>
                    {m.build}
                  </p>
                </li>
              ))}
            </ol>
            <div className="ea-toolrow">
              <span className="ea-toolrow-label">{learn.toolsLabel}</span>
              <ul>
                {learn.tools.map((t) => (
                  <li key={t.name} title={t.name}>
                    <ToolLogo name={t.name} mark={'mark' in t ? t.mark : undefined} />
                    <span>{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="ea-mentor">
              <span className="ea-avatar">
                {mentor.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mentor.photo} alt={mentor.name} />
                ) : (
                  <span aria-hidden="true">{mentor.initials}</span>
                )}
              </span>
              <div>
                <span className="ea-eyebrow">{mentor.eyebrow}</span>
                <h3>{mentor.name}</h3>
                <p className="ea-role">{mentor.role}</p>
                <p>{mentor.bio}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* 3. What you'll build */}
        <section className="ea-sec">
          <Deco kind="prompt" />
          <div className="ea-container">
            <Head eyebrow={build.eyebrow} title={build.title} />
            <ul className="ea-builds">
              {build.items.map((b) => (
                <li key={b.title} className={`ea-b-${b.icon}`}>
                  <span className="ea-b-icon" aria-hidden="true">
                    <BuildGlyph kind={b.icon} />
                  </span>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Sample certificate — the home page's live specimen */}
        <section className="ea-sec ea-sec-soft ea-cert" id="certificate">
          <div className="wrap credential">
            <CertificatePicker>
              {/* "eyebrow" too, so the phone layout lifts it above the heading with it */}
              <span className="eyebrow ea-eyebrow">{certificate.eyebrow}</span>
              <h2>{certificate.title}</h2>
              <p>{certificate.body}</p>
              <ul>
                {certificate.points.map((point) => (
                  <li key={point}>
                    <b aria-hidden="true">✓</b> {point}
                  </li>
                ))}
              </ul>
            </CertificatePicker>
          </div>
        </section>

        {/* 5. Job board — the home page's dashboard, on every screen */}
        <section className="ea-jobs" id="jobs">
          <FlowBackdrop />
          <div className="ea-container">
            <Head eyebrow={jobs.eyebrow} title={jobs.title} />
            <p className="ea-jobs-lede">{jobs.body}</p>
            <ul className="ea-jobs-opps" aria-label="What the board opens up">
              {opportunities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="ea-jobs-desk">
              <JobBoard />
            </div>
            <div className="ea-jobs-cta">
              <Buy className="button button-lime ea-cta">{jobs.cta}</Buy>
            </div>
          </div>
        </section>

        {/* 6. Testimonials — one featured quote beside a wall of the rest;
            on phones, a row you swipe. */}
        <section className="ea-sec ea-reviews" id="reviews">
          <div className="ea-container">
            <Head eyebrow={reviews.eyebrow} title={reviews.title} />
            <div className="ea-rv">
              <figure className="ea-rv-feature">
                <span className="ea-rv-mark" aria-hidden="true">
                  “
                </span>
                <div className="ea-rv-stars" role="img" aria-label="Rated 5 out of 5">
                  ★★★★★
                </div>
                <blockquote>{testimonials[0].quote}</blockquote>
                <figcaption>
                  <span className="ea-rv-avatar" aria-hidden="true">
                    {initials(testimonials[0].name)}
                  </span>
                  <span>
                    <b>{testimonials[0].name}</b>
                    <span>{testimonials[0].role}</span>
                  </span>
                </figcaption>
              </figure>
              {/* Two columns drifting in opposite directions on wide screens;
                  one row drifting sideways on phones. Each track holds its
                  quotes twice so the loop has no seam; the copy is hidden
                  from screen readers. */}
              <div className="ea-rv-wall">
                {[0, 1].map((col) => (
                  <div key={col} className={`ea-rv-col ea-rv-col-${col}`}>
                    <ul className="ea-rv-track">
                      {[0, 1].map((copy) =>
                        testimonials
                          .slice(1)
                          .filter((_, i) => i % 2 === col)
                          .map((item, i) => (
                            <ReviewCard key={`${copy}-${item.name}`} item={item} tint={(i + col) % 3} hidden={copy === 1} />
                          )),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="ea-rv-row">
                <ul className="ea-rv-track">
                  {[0, 1].map((copy) =>
                    testimonials
                      .slice(1)
                      .map((item, i) => <ReviewCard key={`${copy}-${item.name}`} item={item} tint={i % 3} hidden={copy === 1} />),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 7. The offer */}
        <section className="ea-sec ea-sec-soft" id="offer">
          <Ornament kind="offer" />
          <div className="ea-container">
            <Head eyebrow={pricing.eyebrow} title={pricing.title} />
            <div className="ea-offer">
              <div className="ea-offer-price">
                <span className="ea-offer-plan">{pricing.plan}</span>
                <p className="ea-price ea-price-big">
                  <strong>{inr(offer.price)}</strong>
                  <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
                </p>
                <span className="ea-save">{savePct}% OFF</span>
                <SeatsLeft />
                <Buy className="button ea-cta">{pricing.cta}</Buy>
                <p className="ea-offer-small">{pricing.small}</p>
              </div>
              <ul className="ea-offer-list">
                {pricing.items.map((i) => (
                  <li key={i}>
                    <Check />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="ea-sec">
          <Ornament kind="faq" />
          <div className="ea-container">
            <Head eyebrow={faq.eyebrow} title={faq.title} />
            <dl className="ea-faq">
              {faq.items.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Final call to action */}
        <section className="ea-final">
          <Ornament kind="final" />
          <div className="ea-container">
            <h2>
              <Lines lines={finalCta.title} />
            </h2>
            <Buy className="button button-lime ea-cta">{finalCta.cta}</Buy>
            <p className="ea-terms">{finalCta.small}</p>
          </div>
        </section>
      </main>

      {/* A campaign page ends on its ask, not on the site's navigation: only
          what a payment gateway and a careful buyer need to find. */}
      <footer className="ea-foot">
        <div className="ea-container ea-foot-inner">
          <span>© {new Date().getFullYear()} skeo · Menler Learning Systems Private Limited</span>
          <nav aria-label="Policies">
            <Link href="/about#working-with-us">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refund</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>

      <StickyCta />
      <JoinToasts />
      <PlayOnView selector=".ea-builds li" />
    </div>
  )
}
