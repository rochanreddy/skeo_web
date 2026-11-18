import Link from 'next/link'
import { Award, BookOpen, BriefcaseBusiness, Gift, Presentation, Rocket, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { Accreditation } from '@/components/sections/Accreditation'
import { MetaViewContent } from '@/components/MetaViewContent'
import { faqs } from '@/lib/content'
import { offerOf, savePctOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { announcement as announcementCode, inr, learn } from '@/lib/earlyAccess'
import { pageMeta } from '@/lib/seo'
import { BrownTheme } from '../ai-bundle/Interactive'
import { FaqList } from '../everything-ai/FaqList'
import { Buy, Certificate, Check, Mentors, Reviews, ToolLogo } from '../everything-ai/Sections'
import { StickyCta } from '../everything-ai/StickyCta'
import { WindowTimer } from '../everything-ai/WindowTimer'
import '../everything-ai/early-access.css'
import '../ai-bundle/bundle.css'
import './starter.css'

/**
 * /campaign/ai-starter: the simple version of the Everything AI offer, built
 * for phones. Each section answers one plain question, in this order:
 * what is it → what do I get → what do I get free → is it for me → how do I
 * start → who teaches → does it work → what does it cost. Same price and
 * checkout as /campaign/everything-ai (Early Access). Classes are sx-.
 */

const PATH = '/campaign/ai-starter'

/* Kept out of search (noindex, no schema) until we decide to rank it; to turn
   SEO on, drop `robots` here and put <CampaignSchema> back. */
export async function generateMetadata(): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return {
    ...pageMeta({
      path: PATH,
      title: `Learn AI the Easy Way: 50+ Courses for ${inr(price)}`,
      description: `50+ AI courses, 100+ real projects, a certificate and ₹25,000 of free playbooks, for a one-time ${inr(price)}. Beginner friendly, no coding needed.`,
    }),
    robots: { index: false, follow: false },
  }
}

/* What you get: one line each, in plain words. */
const GET = [
  { Icon: BookOpen, t: '50+ AI courses', b: 'Claude, ChatGPT, Grok, n8n, Lovable and more. Short lessons, plain language.' },
  { Icon: Rocket, t: '100+ real projects', b: 'Build things you can show: content, automations, agents and web apps.' },
  { Icon: Presentation, t: '12+ live masterclasses', b: 'Learn live from people who use AI at work every day.' },
  { Icon: Award, t: 'Certificate', b: 'Recognised by DPIIT Startup India, MSME, Anthropic CPN and Sarvam.' },
  { Icon: BriefcaseBusiness, t: 'Job & freelancing board', b: '1 Lakh+ AI jobs, internships and freelance projects to apply to.' },
  { Icon: Users, t: 'Community', b: 'Ask questions and learn alongside other beginners.' },
]

/* The free extras, with what each is worth on its own. */
const BONUSES = [
  { t: 'Claude Playbooks & AI Library', b: 'Ready-to-use prompts and guides, emailed to you as PDFs.', worth: '₹25,000' },
  { t: 'Job board access', b: '1 Lakh+ global AI roles and projects.', worth: '₹25,000' },
  { t: 'Live masterclasses', b: 'Every live session, at no extra cost.', worth: 'Free' },
  { t: 'Lifetime access', b: 'Learn at your own pace, come back any time.', worth: 'Free' },
]

const FOR = [
  { t: 'Students', b: 'Stand out with AI skills and real projects.' },
  { t: 'Working professionals', b: 'Finish your everyday work in half the time.' },
  { t: 'Founders & freelancers', b: 'Do more without hiring more.' },
  { t: 'Career switchers', b: 'Start from zero. No coding needed.' },
]

const STEPS = [
  { t: 'Pay once', b: 'UPI, cards or netbanking. Takes a minute.' },
  { t: 'Check your email', b: 'Your login arrives within 5 minutes.' },
  { t: 'Start learning', b: 'On your phone or laptop, at your own pace.' },
]

/* The price card's list. */
const ALL = [
  '50+ AI courses, lifetime access',
  '100+ real projects',
  '12+ live masterclasses',
  'Accredited certificate',
  'Claude Playbooks & AI Library (worth ₹25,000)',
  'Job & freelancing board (1 Lakh+ roles)',
  'Community access',
]

function PriceCard({ price, was, save, savePct }: { price: string; was: string; save: string; savePct: number }) {
  return (
    <div className="sx-card">
      <p className="sx-card-title">Everything AI · Instant Access</p>
      <p className="sx-card-price">
        <b>{price}</b>
        <s>{was}</s>
        <span className="sx-off">{savePct}% OFF</span>
      </p>
      <p className="sx-card-save">You save {save}. One-time payment, no subscription.</p>
      <ul className="sx-list">
        {ALL.map((v) => (
          <li key={v}>
            <Check />
            {v}
          </li>
        ))}
      </ul>
      <Buy className="button button-lime ea-cta sx-cta">Get Instant Access, {price}</Buy>
      <p className="sx-trust">Secure payment by Cashfree · Login emailed in 5 minutes</p>
    </div>
  )
}

export default async function AiStarterPage() {
  const catalog = await getCatalog()
  const offer = offerOf(catalog)
  const savePct = savePctOf(catalog)
  const price = inr(offer.price)
  const was = inr(offer.was)
  const save = inr(offer.was - offer.price)
  const announcement = { ...announcementCode, ...catalog.campaign.announcement, cta: announcementCode.cta, offer: `${savePct}% OFF` }

  return (
    <div className="ea bx sx">
      <BrownTheme />
      <MetaViewContent ids={['earlyaccess']} name={catalog.plans.earlyaccess.title} value={offer.price} />

      {/* Offer bar: the real deadline and the button. */}
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

      <header className="wrap ea-header bx-header">
        <Link className="brand" href="/" aria-label="skeo home">
          <span>skeo</span>
        </Link>
        <p className="bx-header-offer">
          <s>{was}</s> <b>{price} only</b>
        </p>
      </header>

      <main id="top">
        {/* ---- Hero: what it is, what it costs, one button ---- */}
        <section className="sx-hero" data-hero>
          <div className="sx-wrap">
            <span className="bx-live">
              <i aria-hidden="true" /> No coding needed · Start today
            </span>
            <h1>
              Learn AI the easy way.
              <em>Everything you need, for {price}.</em>
            </h1>
            <p className="sx-lede">
              50+ AI courses, 100+ real projects and a certificate. Short lessons in plain language, made for complete
              beginners.
            </p>
            <ul className="sx-chips">
              <li>
                <Check /> Beginner friendly
              </li>
              <li>
                <Check /> Phone or laptop
              </li>
              <li>
                <Check /> Lifetime access
              </li>
            </ul>
            <div className="sx-hero-price">
              <b>{price}</b>
              <s>{was}</s>
              <span className="sx-off">{savePct}% OFF</span>
            </div>
            <Buy className="button button-lime ea-cta sx-cta">Get Instant Access, {price}</Buy>
            <p className="sx-trust">One-time payment · Secure checkout · Login in 5 minutes</p>
          </div>
        </section>

        <Accreditation />

        {/* ---- What you get ---- */}
        <section className="ea-sec" id="get">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">What you get</span>
              <h2>Everything in one pass.</h2>
            </header>
            <ul className="sx-get">
              {GET.map(({ Icon, t, b }) => (
                <li key={t}>
                  <span className="sx-ico" aria-hidden="true">
                    <Icon strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3>{t}</h3>
                    <p>{b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Free bonuses ---- */}
        <section className="ea-sec bx-dark" id="bonuses">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">Free with your pass</span>
              <h2>Bonuses worth ₹50,000+, free.</h2>
            </header>
            <ul className="sx-bonus">
              {BONUSES.map((x) => (
                <li key={x.t}>
                  <span className="sx-ico" aria-hidden="true">
                    <Gift strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3>{x.t}</h3>
                    <p>{x.b}</p>
                    <span className="sx-worth">{x.worth === 'Free' ? 'Free' : <>Worth {x.worth}</>}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Buy className="button button-lime ea-cta sx-cta">Claim the bonuses, {price}</Buy>
          </div>
        </section>

        {/* ---- Who it's for ---- */}
        <section className="ea-sec ea-sec-soft" id="for">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">Who it&rsquo;s for</span>
              <h2>If you can use a phone, you can learn this.</h2>
            </header>
            <ul className="sx-for">
              {FOR.map((x) => (
                <li key={x.t}>
                  <Check />
                  <div>
                    <h3>{x.t}</h3>
                    <p>{x.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- How it works ---- */}
        <section className="ea-sec" id="how">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">How it works</span>
              <h2>Start in 3 simple steps.</h2>
            </header>
            <ol className="sx-steps">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="sx-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- Tools ---- */}
        <section className="ea-sec ea-sec-soft" id="tools">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">Tools you&rsquo;ll learn</span>
              <h2>The AI tools companies actually use.</h2>
            </header>
            <ul className="sx-tools">
              {learn.tools.map((t) => (
                <li key={t.name}>
                  <ToolLogo name={t.name} mark={t.mark} />
                  {t.name}
                </li>
              ))}
              <li className="sx-tools-more">+40 more</li>
            </ul>
          </div>
        </section>

        <Mentors />
        <Reviews />
        <Certificate />

        {/* ---- The offer ---- */}
        <section className="ea-sec bx-dark" id="offer">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">The offer</span>
              <h2>One price. Everything included.</h2>
            </header>
            <PriceCard price={price} was={was} save={save} savePct={savePct} />
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="ea-sec" id="faq">
          <div className="sx-wrap">
            <header className="sx-head">
              <span className="ea-eyebrow">FAQ</span>
              <h2>Quick answers.</h2>
            </header>
            <FaqList items={faqs} />
            <p className="sx-help">
              Still have a question? Write to <a href="mailto:support@skeoai.com">support@skeoai.com</a> and a real person
              replies within a day.
            </p>
          </div>
        </section>
      </main>

      <footer className="ea-foot">
        <div className="ea-container ea-foot-inner">
          <span>© {new Date().getFullYear()} skeo · Menler Learning Systems Private Limited</span>
          <nav aria-label="Policies">
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refund</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>

      <StickyCta />
    </div>
  )
}
