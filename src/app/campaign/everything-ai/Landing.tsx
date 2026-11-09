import Link from 'next/link'
import { CampaignSchema } from '@/components/StructuredData'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatGptMark, ClaudeMark, GrokMark, LovableMark, N8nMark } from '@/components/tools/marks'
import { VideoPlayer } from '@/components/ui/video-player'
import { walkthrough } from '@/lib/content'
import { offerOf, savePctOf, type Catalog } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { announcement as announcementCode, inr } from '@/lib/earlyAccess'
import { landingHero, type LandingKind } from '@/lib/landings'
import { JoinToasts } from './Live'
import { Buy, CampaignSections, Check, Lines } from './Sections'
import { StickyCta } from './StickyCta'
import { WindowTimer } from './WindowTimer'
import './early-access.css'
import { MetaViewContent } from '@/components/MetaViewContent'

function Price({ big = false, offer }: { big?: boolean; offer: ReturnType<typeof offerOf> }) {
  return (
    <p className={big ? 'ea-price ea-price-big' : 'ea-price'}>
      <strong>{inr(offer.price)}</strong>
      <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
    </p>
  )
}

/**
 * The Everything AI campaign page, and the four landing pages built on it
 * (lib/landings): all tools or Claude in the hero's words, and on the right
 * the Early Access pass card or the intro video. Below the hero every one of
 * them is the same page, selling Everything AI.
 */
export async function EverythingAiLanding({ kind = 'all', video = false }: { kind?: LandingKind; video?: boolean }) {
  const catalog: Catalog = await getCatalog()
  const offer = offerOf(catalog)
  const savePct = savePctOf(catalog)
  const { hero } = catalog.campaign
  const h = landingHero(kind, inr(offer.price))
  const announcement = { ...announcementCode, ...catalog.campaign.announcement, offer: `${savePct}% OFF` }
  return (
    <div className="ea">
      <MetaViewContent ids={['earlyaccess']} name={catalog.plans.earlyaccess.title} value={offer.price} />
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
          <WindowTimer offer={announcement.offer} />
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
        {/* Hero — the promise on the left; the offer itself, or the intro video, on the right */}
        <section className="ea-hero-band">
          <div className="ea-hero-glow" aria-hidden="true" />
          <div className="wrap ea-hero">
            <div className="ea-hero-copy">
              <span className="eyebrow ea-chip">
                <span className="ea-dot" aria-hidden="true" />
                Early Access · Now Open
              </span>
              <h1>
                <Lines lines={h.lines} />
              </h1>
              {/* Each sentence on its own line: "Learn by doing…" is the promise
                  and reads as one. */}
              <p className="ea-lede ea-lede-split">
                {h.lede.split(/(?<=\.)\s+/).map((sentence) => (
                  <span key={sentence}>{sentence}</span>
                ))}
              </p>
              <div className={video ? 'ea-hero-price' : 'ea-hero-price ea-hero-price-pass'}>
                <Price big offer={offer} />
                <span className="ea-save">{savePct}% OFF</span>
              </div>
              <p className={video ? 'ea-terms' : 'ea-terms ea-terms-pass'}>{offer.terms}</p>
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

            <div className={video ? 'ea-hero-visual ea-hero-visual-video' : 'ea-hero-visual'}>
              <span className="ea-float ea-float-1" aria-hidden="true">
                <ClaudeMark className="ea-float-mark" />
              </span>
              {/* the Claude pages float Claude's own products round the card */}
              {h.features?.map((f, i) => (
                <span key={f.label} className={`ea-float ea-float-${i + 2}`} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={f.wide ? 'ea-float-logo is-wide' : 'ea-float-logo'} src={f.logo} alt="" />
                </span>
              ))}
              {kind === 'all' && (
                <>
                  <span className="ea-float ea-float-2" aria-hidden="true">
                    <N8nMark className="ea-float-mark" />
                  </span>
                  <span className="ea-float ea-float-3" aria-hidden="true">
                    <GrokMark className="ea-float-mark" />
                  </span>
                  <span className="ea-float ea-float-4" aria-hidden="true">
                    <LovableMark className="ea-float-mark" idPrefix="ea-float-lovable" />
                  </span>
                </>
              )}

              {video ? (
                /* The price and the ask are already on the left, so the right
                   side shows the course itself — the home FAQ's walkthrough. */
                <div className="ea-hero-video">
                  <VideoPlayer
                    src={walkthrough.src}
                    poster={walkthrough.poster}
                    label={walkthrough.label}
                    duration={walkthrough.duration}
                  />
                </div>
              ) : (
                <article className="ea-pass" aria-label="The Early Access pass">
                  <header className="ea-pass-top">
                    <span className="ea-pass-brand">skeo</span>
                    <span className="ea-pass-tag">Early Access Pass</span>
                  </header>
                  <p className="ea-pass-name">{h.passName}</p>
                  <p className="ea-pass-price">
                    <strong>{inr(offer.price)}</strong>
                    <s aria-label={`was ${inr(offer.was)}`}>{inr(offer.was)}</s>
                  </p>
                  <ul className="ea-pass-list">
                    {h.items.map((i) => (
                      <li key={i}>
                        <Check />
                        {i}
                      </li>
                    ))}
                  </ul>
                  {h.features ? (
                    <ul className="ea-pass-features" aria-label="Inside the Claude track">
                      {h.features.map((f) => (
                        <li key={f.label}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className={f.wide ? 'ea-pass-feature-logo is-wide' : 'ea-pass-feature-logo'} src={f.logo} alt="" />
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="ea-pass-marks" aria-label="Tools included: Claude, ChatGPT, Grok, n8n, Lovable and more">
                      <ClaudeMark className="ea-pass-mark" />
                      <ChatGptMark className="ea-pass-mark ea-pass-mono" />
                      <GrokMark className="ea-pass-mark ea-pass-mono" />
                      <N8nMark className="ea-pass-mark" />
                      <LovableMark className="ea-pass-mark" idPrefix="ea-pass-lovable" />
                      <span className="ea-pass-more">+45</span>
                    </div>
                  )}
                  <footer className="ea-pass-foot">
                    <span>One-time payment</span>
                    <span>Instant access</span>
                  </footer>
                </article>
              )}
            </div>
          </div>
        </section>

        <CampaignSections pinned={kind === 'claude' ? ['Claude'] : undefined} />
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
