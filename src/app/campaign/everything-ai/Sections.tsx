import type { ReactNode } from 'react'
import { Award, BookOpen, BriefcaseBusiness, FileText, Radio, ReceiptText, Rocket, ShieldCheck, Users, Wrench, Zap } from 'lucide-react'
import { PurchaseButton } from '@/components/ActionButton'
import type { PlanKey } from '@/lib/plans'
import { CertificatePicker } from '@/components/CertificatePicker'
import { Accreditation } from '@/components/sections/Accreditation'
import { Included } from '@/components/sections/Included'
import { JobBoard } from '@/components/sections/JobBoard'
import { ChatGptMark, ClaudeMark, GrokMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { opportunities, testimonials } from '@/lib/content'
import { offerOf, savePctOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { build, certificate, faq as faqCode, inr, jobs, learn, mentors, pricing as pricingCode, reviews } from '@/lib/earlyAccess'
import { BuildIcon } from './BuildIcons'
import { FaqList } from './FaqList'
import { FeaturedReview } from './FeaturedReview'
import { SeatsLeft } from './Live'
import { LevelList } from './ModuleList'
import { PlayOnView } from './PlayOnView'
import { hasToolLogo, ToolLogoMark } from './ToolLogos'

/**
 * Everything below a campaign page's hero, in one place, so every campaign
 * page that sells Early Access tells the same story in the same order:
 *
 *   accreditation → what you'll learn (and the tools) → what you'll build →
 *   certificate → job board → what all you get → mentors → reviews →
 *   the offer → FAQ → final call.
 *
 * Used by /campaign/everything-ai and /campaign/ai-showcase. Render it inside
 * an element with the .ea class (and early-access.css loaded) — every rule
 * here is scoped to it.
 */

/** Every CTA on a page buys the same thing: verify → /checkout → Cashfree.
 *  Early Access unless the page sells one tool (/campaign/<tool>). */
export function Buy({
  children,
  className = 'button ea-cta',
  plan = 'earlyaccess',
}: {
  children: ReactNode
  className?: string
  plan?: PlanKey
}) {
  return (
    <PurchaseButton plan={plan} className={className}>
      {children}
    </PurchaseButton>
  )
}

export function Lines({ lines }: { lines: readonly string[] }) {
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

export function Check() {
  return (
    <svg className="ea-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ToolLogo({ name, mark }: { name: string; mark?: string }) {
  switch (mark) {
    case 'claude':
      return <ClaudeMark className="ea-tool-mark" />
    case 'chatgpt':
      return <ChatGptMark className="ea-tool-mark ea-mono" />
    case 'grok':
      return <GrokMark className="ea-tool-mark ea-mono" />
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

/* The core five in the tools row: always in view, never scrolling away. */
const PINNED = ['Claude', 'ChatGPT', 'Grok', 'n8n', 'Lovable']

/* An icon for each line of the offer, picked by what the line is about. */
export function OfferIcon({ item }: { item: string }) {
  const t = item.toLowerCase()
  const I = t.includes('course')
    ? BookOpen
    : t.includes('project')
      ? Rocket
      : t.includes('tool')
        ? Wrench
        : t.includes('workshop') || t.includes('live')
          ? Radio
          : t.includes('template') || t.includes('resource')
            ? FileText
            : t.includes('community')
              ? Users
              : t.includes('certificate')
                ? Award
                : t.includes('job')
                  ? BriefcaseBusiness
                  : Zap
  return <I className="ea-deal-ico-svg" strokeWidth={1.9} absoluteStrokeWidth aria-hidden="true" />
}

/* "10+ Courses" → the figure picked out from the words. */
export function OfferItem({ item }: { item: string }) {
  const m = item.match(/^(\d[\d,+]*\+?)\s+(.*)$/)
  return m ? (
    <>
      <b>{m[1]}</b> {m[2]}
    </>
  ) : (
    <>{item}</>
  )
}

export const TRUST_ICONS = [ShieldCheck, Zap, ReceiptText]

/** Every section below the hero opens the same way: a small label, one line. */
export function Head({ eyebrow, title }: { eyebrow: string; title: string }) {
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
export function Deco({ kind }: { kind: 'code' | 'marks' | 'prompt' }) {
  if (kind === 'marks') {
    return (
      <div className="ea-deco ea-deco-marks" aria-hidden="true">
        <ClaudeMark className="dm dm-1" />
        <N8nMark className="dm dm-2" />
        <GrokMark className="dm dm-3" />
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
            {'        '}<i>&quot;Grok&quot;</i>, <i>&quot;Lovable&quot;</i>]
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
export function Ornament({ kind }: { kind: 'offer' | 'faq' | 'final' }) {
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

type Review = (typeof testimonials)[number]

/* The review wall's two columns: learners in India on the left, learners
   abroad on the right — read from the city at the end of each role. */
const INDIAN_CITIES = ['Mumbai', 'Bengaluru', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Delhi', 'New Delhi', 'Noida', 'Gurugram', 'Kolkata', 'Kochi', 'Ahmedabad', 'Jaipur', 'India']
const inIndia = (r: Review) => INDIAN_CITIES.includes(r.role.split(',').pop()?.trim() ?? '')
const REVIEWS_INDIA = testimonials.filter(inIndia)
const REVIEWS_ABROAD = testimonials.filter((r) => !inIndia(r))

function ReviewCard({ item, tint, hidden }: { item: Review; tint: number; hidden?: boolean }) {
  return (
    <li className={`ea-rv-card ea-rv-tint-${tint}`} aria-hidden={hidden || undefined}>
      <div className="ea-rv-stars" role="img" aria-label="Rated 5 out of 5">
        ★★★★★
      </div>
      <blockquote>{item.quote}</blockquote>
      <footer>
        <span className="ea-rv-avatar" aria-hidden="true">
          {item.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photo} alt="" loading="lazy" />
                  ) : (
                    initials(item.name)
                  )}
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

/** The sample certificate — the home page's live specimen. */
export function Certificate({
  body = certificate.body,
  points = certificate.points,
  tool,
}: {
  body?: string
  points?: readonly string[]
  /** The certificate shown first, by tool name. */
  tool?: string
}) {
  return (
    <section className="ea-sec ea-sec-soft ea-cert" id="certificate">
      <div className="wrap credential">
        <CertificatePicker initial={tool}>
          {/* "eyebrow" too, so the phone layout lifts it above the heading with it */}
          <span className="eyebrow ea-eyebrow">{certificate.eyebrow}</span>
          <h2>{certificate.title}</h2>
          <p>{body}</p>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <b aria-hidden="true">✓</b> {point}
              </li>
            ))}
          </ul>
        </CertificatePicker>
      </div>
    </section>
  )
}

/** Mentors — three across. */
export function Mentors() {
  return (
    <section className="ea-sec ea-mentors-sec" id="mentors">
      <div className="ea-container">
        <Head eyebrow={mentors.eyebrow} title={mentors.title} />
        <div className="ea-mentors">
          <ul>
            {mentors.people.map((m) => (
              <li key={m.name} className="ea-mentor">
                <span className="ea-avatar">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} />
                  ) : (
                    <span aria-hidden="true">{m.initials}</span>
                  )}
                </span>
                <h3>{m.name}</h3>
                <p className="ea-role">{m.role}</p>
                <p>{m.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Testimonials — a featured quote that changes every five seconds, beside a
 *  wall of the rest; on phones, a row you swipe. */
export function Reviews() {
  return (
    <section className="ea-sec ea-reviews" id="reviews">
      <div className="ea-container">
        <Head eyebrow={reviews.eyebrow} title={reviews.title} />
        <div className="ea-rv">
          <FeaturedReview items={testimonials} />
          {/* Two columns drifting in opposite directions on wide screens;
              one row drifting sideways on phones. Each track holds its
              quotes twice so the loop has no seam; the copy is hidden
              from screen readers. */}
          <div className="ea-rv-wall">
            {/* Left: learners in India. Right: learners abroad. Each column
                drifts at the same pace however many quotes it holds. */}
            {[REVIEWS_INDIA, REVIEWS_ABROAD].map((list, col) => (
              <div key={col} className={`ea-rv-col ea-rv-col-${col}`}>
                <ul className="ea-rv-track" style={{ animationDuration: `${list.length * 9}s` }}>
                  {[0, 1].map((copy) =>
                    list.map((item, i) => (
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
  )
}

export async function CampaignSections() {
  /* The offer block and the FAQ are editable in Sanity; the rest of this copy
     is code. Headings stay code-side so an edit cannot unbalance the layout. */
  const catalog = await getCatalog()
  const offer = offerOf(catalog)
  const savePct = savePctOf(catalog)
  const pricing = { ...pricingCode, ...catalog.campaign.pricing }
  const faq = { ...faqCode, items: catalog.campaign.faq }
  return (
    <div className="ea-flow">
        {/* Accreditation — the home page's strip */}
        <Accreditation />

        {/* 1. What you'll learn — the modules, then the tools */}
        <section className="ea-sec ea-sec-soft" id="learn">
          <Deco kind="marks" />
          <div className="ea-container">
            <Head eyebrow={learn.eyebrow} title={learn.title} />
            <LevelList levels={learn.levels} />
            <div className="ea-toolrow">
              <span className="ea-toolrow-label">{learn.toolsLabel}</span>
              {/* The five core tools stay put on the left; the rest scroll past
                  beside them, right to left. The scrolling list is drawn twice
                  so the loop has no seam; the copy is hidden from screen
                  readers. */}
              <div className="ea-tr">
                <ul className="ea-tr-pins" aria-label="Core tools">
                  {PINNED.map((name) => {
                    const t = learn.tools.find((x) => x.name === name)
                    return (
                      <li key={name} title={name}>
                        <ToolLogo name={name} mark={t && 'mark' in t ? t.mark : undefined} />
                        <span>{name}</span>
                      </li>
                    )
                  })}
                </ul>
                <div className="ea-tr-marquee">
                  <ul>
                    {[0, 1].map((copy) =>
                      learn.tools
                        .filter((t) => !PINNED.includes(t.name))
                        .map((t) => (
                          <li key={`${copy}-${t.name}`} title={t.name} aria-hidden={copy === 1 || undefined}>
                            <ToolLogo name={t.name} mark={'mark' in t ? t.mark : undefined} />
                            <span>{t.name}</span>
                          </li>
                        )),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. What you'll build — each icon acts out what it is on hover */}
        <section className="ea-sec ea-build-sec" id="build">
          <Deco kind="prompt" />
          <div className="ea-container">
            <Head eyebrow={build.eyebrow} title={build.title} />
            <ul className="ea-builds">
              {build.items.map((b) => (
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

        {/* 3. Sample certificate — the home page's live specimen */}
        <Certificate />

        {/* 4. Job board — the home page's dashboard, on every screen */}
        <section className="ea-jobs" id="jobs">
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

        {/* 5. What all you get — the home page's section */}
        <Included />

        {/* 6. Mentors — three across */}
        <Mentors />

        {/* 7. Testimonials — a featured quote that changes every five seconds, beside a wall of the rest */}
        <Reviews />

        {/* 8. The offer */}
        <section className="ea-sec ea-sec-soft" id="offer">
          <Ornament kind="offer" />
          <div className="ea-container">
            <Head eyebrow={pricing.eyebrow} title={pricing.title} />
            <div className="ea-deal">
              <div className="ea-deal-pass">
                <div className="ea-deal-top">
                  <span className="ea-deal-plan">{pricing.plan}</span>
                  <span className="ea-deal-save">{savePct}% OFF</span>
                </div>
                <p className="ea-deal-price">
                  <strong>{inr(offer.price)}</strong>
                  <span>
                    <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
                    <em>one-time</em>
                  </span>
                </p>
                <p className="ea-deal-note">
                  You save <b>{inr(offer.was - offer.price)}</b>
                </p>
                <SeatsLeft />
                <Buy className="button ea-cta ea-deal-cta">{pricing.cta}</Buy>
                <ul className="ea-deal-trust">
                  {pricing.small
                    .split('·')
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .map((x, n) => {
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
                <p className="ea-deal-h">Everything included</p>
                <ul>
                  {pricing.items.map((i) => (
                    <li key={i}>
                      <span className="ea-deal-ico">
                        <OfferIcon item={i} />
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

        {/* 9. FAQ */}
        <section className="ea-sec ea-faq-sec" id="faq">
          <Ornament kind="faq" />
          <div className="ea-container ea-faq-wrap">
            <div className="ea-faq-side">
              <span className="ea-eyebrow">{faq.eyebrow}</span>
              <h2>{faq.title}</h2>
              <p>Everything people ask before they join.</p>
              <div className="ea-faq-help">
                <b>Still have a question?</b>
                <span>Write to us and a real person replies within a day.</span>
                <a href="mailto:support@skeoai.com">support@skeoai.com</a>
              </div>
            </div>
            <FaqList items={faq.items} />
          </div>
        </section>

      <PlayOnView selector=".ea-builds li" />
    </div>
  )
}
