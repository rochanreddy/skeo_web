import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'
import { Accreditation } from '@/components/sections/Accreditation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatGptMark, ClaudeMark, GrokMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { getCatalog } from '@/lib/cms'
import { inr, learn as learnCode, pricing as pricingCode } from '@/lib/earlyAccess'
import { pageMeta } from '@/lib/seo'
import { TOOL_CAMPAIGNS, TOOL_SLUGS, type ToolSlug } from '@/lib/toolCampaigns'
import { BuildIcon } from '../everything-ai/BuildIcons'
import { FaqList } from '../everything-ai/FaqList'
import { JoinToasts } from '../everything-ai/Live'
import { ModuleList } from '../everything-ai/ModuleList'
import { PlayOnView } from '../everything-ai/PlayOnView'
import {
  Buy,
  Certificate,
  Check,
  Deco,
  Head,
  Lines,
  Mentors,
  OfferIcon,
  OfferItem,
  Ornament,
  Reviews,
  TRUST_ICONS,
} from '../everything-ai/Sections'
import { StickyCta } from '../everything-ai/StickyCta'
import '../everything-ai/early-access.css'

/**
 * /campaign/claude, /campaign/chatgpt, /campaign/grok, /campaign/n8n,
 * /campaign/lovable — one tool's course, sold on its own.
 *
 * The Everything AI page at the size of one tool: the same look, the same
 * order (learn → build → certificate → mentors → reviews → offer → FAQ), the
 * tool's own copy from lib/toolCampaigns. Every button buys this tool's
 * course through the real checkout, at the price its plan sets — the job
 * board and the all-access extras are Everything AI's, so they are not
 * offered here.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return TOOL_SLUGS.map((tool) => ({ tool }))
}

type Props = { params: Promise<{ tool: string }> }

const campaignOf = (tool: string) => (TOOL_SLUGS as string[]).includes(tool) ? TOOL_CAMPAIGNS[tool as ToolSlug] : null

/* The price is in the title, so the title follows the price in Sanity. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = campaignOf((await params).tool)
  if (!c) return {}
  const { plans } = await getCatalog()
  return pageMeta({
    path: `/campaign/${c.slug}`,
    title: `${c.meta.title} · ${inr(plans[c.plan].amount)}`,
    description: c.meta.description,
  })
}

/* The tool's own logo, as the Everything AI page draws it. */
function ToolMark({
  slug,
  className,
  idPrefix,
  mono = true,
}: {
  slug: ToolSlug
  className: string
  idPrefix: string
  /** On the pass's white tiles the one-colour logos are drawn black. */
  mono?: boolean
}): ReactElement {
  const m = mono ? ' ea-pass-mono' : ''
  switch (slug) {
    case 'claude':
      return <ClaudeMark className={className} />
    case 'chatgpt':
      return <ChatGptMark className={`${className}${m}`} />
    case 'grok':
      return <GrokMark className={`${className}${m}`} />
    case 'n8n':
      return <N8nMark className={className} />
    case 'lovable':
      return <LovableMark className={className} idPrefix={idPrefix} />
  }
}

export default async function ToolCampaignPage({ params }: Props) {
  const c = campaignOf((await params).tool)
  if (!c) notFound()
  const { plans } = await getCatalog()
  const plan = plans[c.plan]
  const price = inr(plan.amount)
  const course = `${c.name} Course`
  const trust = pricingCode.small
    .split('·')
    .map((x) => x.trim())
    .filter(Boolean)

  return (
    <div className="ea">
      <header className="wrap ea-header">
        <Link className="brand" href="/" aria-label="skeo home">
          <span>skeo</span>
        </Link>
        <div className="ea-header-actions">
          <ThemeToggle />
          <Buy plan={c.plan} className="button button-small">
            Get Started
          </Buy>
        </div>
      </header>

      <main id="top">
        {/* Hero — the promise on the left, the course itself on the right */}
        <section className="ea-hero-band">
          <div className="ea-hero-glow" aria-hidden="true" />
          <div className="wrap ea-hero">
            <div className="ea-hero-copy">
              <span className="eyebrow ea-chip">
                <span className="ea-dot" aria-hidden="true" />
                {course} · Now Open
              </span>
              <h1>
                <Lines lines={c.hero.lines} />
              </h1>
              <p className="ea-lede">{c.hero.lede}</p>
              <div className="ea-hero-price">
                <p className="ea-price ea-price-big">
                  <strong>{price}</strong>
                </p>
                <span className="ea-once">one-time</span>
              </div>
              <p className="ea-terms">One-time payment · Instant access</p>
              <div className="ea-hero-actions">
                <Buy plan={c.plan}>Get Started</Buy>
                <a className="button button-outline ea-cta ea-ghost" href="#learn">
                  <span className="btn-label">See what’s inside</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
              <ul className="ea-checks">
                {c.hero.checks.map((x) => (
                  <li key={x}>
                    <Check />
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ea-hero-visual">
              <span className="ea-float ea-float-1" aria-hidden="true">
                <ToolMark slug={c.slug} className="ea-float-mark" idPrefix="ea-float-tool" mono={false} />
              </span>

              <article className="ea-pass" aria-label={`The ${course}`}>
                <header className="ea-pass-top">
                  <span className="ea-pass-brand">skeo</span>
                  <span className="ea-pass-tag">{course}</span>
                </header>
                <p className="ea-pass-name">{c.name}</p>
                <p className="ea-pass-price">
                  <strong>{price}</strong>
                </p>
                <ul className="ea-pass-list">
                  {c.pass.map((i) => (
                    <li key={i}>
                      <Check />
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="ea-pass-marks" aria-label={`Tool: ${c.name}`}>
                  <ToolMark slug={c.slug} className="ea-pass-mark" idPrefix="ea-pass-tool" />
                  <span className="ea-pass-tool">{c.name}</span>
                </div>
                <footer className="ea-pass-foot">
                  <span>One-time payment</span>
                  <span>Instant access</span>
                </footer>
              </article>
            </div>
          </div>
        </section>

        <div className="ea-flow">
          <Accreditation />

          {/* 1. What you'll learn */}
          <section className="ea-sec ea-sec-soft ea-tool-learn" id="learn">
            <Deco kind="marks" />
            <div className="ea-container">
              <Head eyebrow={learnCode.eyebrow} title={c.learn.title} />
              <ModuleList modules={c.learn.modules} />
            </div>
          </section>

          {/* 2. What you'll build — each icon acts out what it is on hover */}
          <section className="ea-sec ea-build-sec ea-build-four" id="build">
            <Deco kind="prompt" />
            <div className="ea-container">
              <Head eyebrow="What you’ll build" title={c.build.title} />
              <ul className="ea-builds">
                {c.build.items.map((b) => (
                  <li key={b.title} className={`ea-b-${b.icon}`}>
                    <span className="ea-b-icon" aria-hidden="true">
                      <BuildIcon kind={b.icon} />
                    </span>
                    <h3>{b.title}</h3>
                    <p>{b.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 3. Certificate */}
          <Certificate
            body={c.certificate}
            tool={c.name}
            points={['Verified, tool-specific credential', 'Earned through practical projects', 'Build a profile of proven skills']}
          />

          {/* 4. Mentors */}
          <Mentors />

          {/* 5. Testimonials */}
          <Reviews />

          {/* 6. The offer — one course, one price, no anchor */}
          <section className="ea-sec ea-sec-soft" id="offer">
            <Ornament kind="offer" />
            <div className="ea-container">
              <Head eyebrow="The offer" title={`The ${course}. One price.`} />
              <div className="ea-deal">
                <div className="ea-deal-pass">
                  <div className="ea-deal-top">
                    <span className="ea-deal-plan">{course}</span>
                    <span className="ea-deal-save">One course</span>
                  </div>
                  <p className="ea-deal-price">
                    <strong>{price}</strong>
                    <span>
                      <em>one-time</em>
                    </span>
                  </p>
                  <p className="ea-deal-note">Your login arrives by email straight after payment.</p>
                  <Buy plan={c.plan} className="button ea-cta ea-deal-cta">
                    Get the {course}
                  </Buy>
                  <ul className="ea-deal-trust">
                    {trust.map((x, n) => {
                      const T = TRUST_ICONS[n % TRUST_ICONS.length]
                      return (
                        <li key={x}>
                          <T strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                          {x}
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <div className="ea-deal-list">
                  <p className="ea-deal-h">What’s included</p>
                  <ul>
                    {c.offer.items.map((i) => (
                      <li key={i}>
                        <span className="ea-deal-ico">
                          <OfferIcon item={i.replace(/^\d+ Modules$/, 'course')} />
                        </span>
                        <span>
                          <OfferItem item={i} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 7. FAQ */}
          <section className="ea-sec ea-faq-sec" id="faq">
            <Ornament kind="faq" />
            <div className="ea-container ea-faq-wrap">
              <div className="ea-faq-side">
                <span className="ea-eyebrow">FAQ</span>
                <h2>Quick answers.</h2>
                <p>What people ask before they start the {course}.</p>
                <div className="ea-faq-help">
                  <b>Still have a question?</b>
                  <span>Write to us and a real person replies within a day.</span>
                  <a href="mailto:support@skeoai.com">support@skeoai.com</a>
                </div>
              </div>
              <FaqList items={c.faq} />
            </div>
          </section>

          <PlayOnView selector=".ea-builds li" />
        </div>
      </main>

      {/* A campaign page ends on its ask, not on the site's navigation. */}
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

      <StickyCta plan={c.plan} />
      <JoinToasts />
    </div>
  )
}
