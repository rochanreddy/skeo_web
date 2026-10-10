import type { ReactNode } from 'react'
import { AppWindow, BriefcaseBusiness, Rocket, Workflow } from 'lucide-react'
import { PurchaseButton } from '@/components/ActionButton'
import { CertificatePicker } from '@/components/CertificatePicker'
import { Accreditation } from '@/components/sections/Accreditation'
import { Included } from '@/components/sections/Included'
import { JobBoard } from '@/components/sections/JobBoard'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { opportunities, testimonials } from '@/lib/content'
import { offerOf, savePctOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { build, certificate, faq as faqCode, inr, jobs, learn, mentors, pricing as pricingCode, reviews } from '@/lib/earlyAccess'
import { FaqList } from './FaqList'
import { SeatsLeft } from './Live'
import { ModuleList } from './ModuleList'
import { PlayOnView } from './PlayOnView'
import { hasToolLogo, ToolLogoMark } from './ToolLogos'

/**
 * Everything below a campaign page's hero, in one place, so every campaign
 * page that sells Early Access tells the same story in the same order:
 *
 *   accreditation → what you'll learn (and the tools) → what all you get →
 *   mentors → what you'll build → certificate → job board → reviews →
 *   the offer → FAQ → final call.
 *
 * Used by /campaign/everything-ai and /campaign/ai-showcase. Render it inside
 * an element with the .ea class (and early-access.css loaded) — every rule
 * here is scoped to it.
 */

/** Every CTA on the page buys the same thing: verify → /checkout → Cashfree. */
export function Buy({ children, className = 'button ea-cta' }: { children: ReactNode; className?: string }) {
  return (
    <PurchaseButton plan="earlyaccess" className={className}>
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

        {/* What you'll learn — the modules, then the tools */}
        <section className="ea-sec ea-sec-soft" id="learn">
          <Deco kind="marks" />
          <div className="ea-container">
            <Head eyebrow={learn.eyebrow} title={learn.title} />
            <ModuleList modules={learn.modules} />
            <div className="ea-toolrow">
              <span className="ea-toolrow-label">{learn.toolsLabel}</span>
              {/* Claude stays put on the left — it is the core of the course — and
                  the rest scroll past beside it, right to left. The list is
                  drawn twice so the loop has no seam; the copy is hidden from
                  screen readers. */}
              <div className="ea-tr">
                <span className="ea-tr-lead" title="Claude">
                  <ToolLogo name="Claude" mark="claude" />
                  <span>Claude</span>
                </span>
                <div className="ea-tr-marquee">
                  <ul>
                    {[0, 1].map((copy) =>
                      learn.tools
                        .filter((t) => t.name !== 'Claude')
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

        {/* What all you get — the home page's section */}
        <Included />

        {/* Mentors — three across */}
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

        {/* 3. What you'll build */}
        <section className="ea-sec ea-build-sec" id="build">
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
                    {testimonials[0].photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={testimonials[0].photo} alt="" loading="lazy" />
                  ) : (
                    initials(testimonials[0].name)
                  )}
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
        <section className="ea-sec ea-faq-sec" id="faq">
          <Ornament kind="faq" />
          <div className="ea-container">
            <Head eyebrow={faq.eyebrow} title={faq.title} />
            <FaqList items={faq.items} />
          </div>
        </section>

      <PlayOnView selector=".ea-builds li" />
    </div>
  )
}
