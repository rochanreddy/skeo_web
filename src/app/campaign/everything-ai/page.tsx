import type { Metadata } from 'next'
import Link from 'next/link'
import { CampaignSchema } from '@/components/StructuredData'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { pageMeta } from '@/lib/seo'
import { announcement, hero, inr, offer, savePct, valueStack } from '@/lib/earlyAccess'
import { Countdown } from './Countdown'
import { JoinToasts, SeatsLeft } from './Live'
import { Buy, CampaignSections, Check, Lines } from './Sections'
import { StickyCta } from './StickyCta'
import './early-access.css'

export const metadata: Metadata = pageMeta({
  path: '/campaign/everything-ai',
  title: `Everything AI — every skeo course for ${inr(offer.price)}`,
  description: `Learn ChatGPT, Claude and 50+ AI tools, build 20+ real projects and get certified — 10+ courses for a one-time ${inr(offer.price)}, with lifetime access.`,
})

function Price({ big = false }: { big?: boolean }) {
  return (
    <p className={big ? 'ea-price ea-price-big' : 'ea-price'}>
      <strong>{inr(offer.price)}</strong>
      <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
    </p>
  )
}

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
                <a className="button button-outline ea-cta ea-ghost" href="#learn">
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

        <CampaignSections />
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
      <CampaignSchema />
    </div>
  )
}
