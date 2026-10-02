import Link from 'next/link'
import { Buy, KitFooter, variantMeta } from '../_kit/Kit'
import { JoinedToast, TimeLeft } from '../_kit/Live'
import { endsOn, price, product, savePct, was } from '../_kit/facts'
import { CampaignSections } from '../everything-ai/Sections'
import { StickyCta } from '../everything-ai/StickyCta'
import '../everything-ai/early-access.css'
import { HeroScene } from './HeroScene'
import { NightOnly } from './NightOnly'
import './showcase.css'

/**
 * Variant: SHOWCASE — the best-looking one.
 *
 * Its own hero — a learner at a laptop with the AI tools glowing round them —
 * on a page that runs on the night palette (NightOnly), then exactly the
 * sections /campaign/everything-ai has, in the same order (CampaignSections).
 * Same facts, same checkout.
 */

export const metadata = variantMeta(
  '/campaign/ai-showcase',
  `${product} — learn AI, build real work · ${price}`,
  'Go from never having used AI to building real projects with it. 10+ courses, 50+ tools, 20+ projects and a certificate, for a one-time ₹499.',
)

export default function ShowcasePage() {
  return (
    <div className="vx">
      <NightOnly />
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
                <i aria-hidden="true" /> Early Access · {savePct}% off
              </span>
              {/* The hook is the price: a big promise, then a number that
                  sounds too small for it. Short on purpose — the scene beside
                  it does the explaining. */}
              <h1>
                Master 50+ AI tools.
                <br />
                <em>For just {price}.</em>
              </h1>
              <p className="vx-lede">ChatGPT, Claude, Gemini &amp; more — from zero to real projects. No coding.</p>
              <ul className="vx-hero-ticks">
                <li>Beginner friendly</li>
                <li>Certificate</li>
                <li>Lifetime access</li>
              </ul>
              <div className="vx-hero-cta">
                <Buy className="vx-btn">Claim my seat — {price}</Buy>
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

      </main>

      {/* Below the hero: the same sections, in the same order, as
          /campaign/everything-ai — inside .ea so its stylesheet applies. */}
      <div className="ea vx-body">
        <CampaignSections />
        <StickyCta />
      </div>

      <KitFooter />
      <JoinedToast />
    </div>
  )
}
