import Link from 'next/link'
import type { Metadata } from 'next'
import { CampaignSchema } from '@/components/StructuredData'
import { Accreditation } from '@/components/sections/Accreditation'
import { MetaViewContent } from '@/components/MetaViewContent'
import { claudeSyllabus, faqs, toolLibrary } from '@/lib/content'
import { offerOf, savePctOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { announcement as announcementCode, inr, learn, mentors } from '@/lib/earlyAccess'
import { landingHero } from '@/lib/landings'
import { pageMeta } from '@/lib/seo'
import { syllabusFor } from '@/lib/syllabi'
import { FaqList } from '../everything-ai/FaqList'
import { JoinToasts } from '../everything-ai/Live'
import { Buy, Certificate, Check, Reviews, ToolLogo } from '../everything-ai/Sections'
import { StickyCta } from '../everything-ai/StickyCta'
import { WindowTimer } from '../everything-ai/WindowTimer'
import '../everything-ai/early-access.css'
import { BrownTheme, CourseTabs, UseCases, type CourseTab } from './Interactive'
import './bundle.css'

/**
 * The bundle landing pages, /campaign/ai-bundle (every tool) and
 * /campaign/claude-bundle (led by Claude): the Everything AI offer laid out as
 * one long page: hero with a buy card, accreditation, why, what you can do,
 * the courses in tabs, mentors, reviews, certificate, FAQ and a closing offer.
 * Everything on them is skeo's own copy, components and figures; the price
 * and checkout are the Early Access ones. Only the hero and "what you can do"
 * differ between the two.
 */

export type BundleKind = 'all' | 'claude'

/* Where each version lives: the two links the ads run on. (The old pages
   these replaced are still in everything-ai/Landing.tsx; to bring one back,
   point its page.tsx at EverythingAiLanding again.) */
const PATHS: Record<BundleKind, string> = { all: '/campaign/everything-ai', claude: '/campaign/claude-intro' }

export async function bundleMeta(kind: BundleKind): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return kind === 'claude'
    ? pageMeta({
        path: PATHS.claude,
        title: `Master Claude: Chat, Cowork, Code and Design, ${inr(price)} One-Time`,
        description: `Learn Claude Chat, Cowork, Code and Design by building real projects, plus 50+ more AI courses. An accredited certificate and a job board, all for a one-time ${inr(price)}. No coding needed.`,
      })
    : pageMeta({
        path: PATHS.all,
        title: `50+ AI Courses in One Bundle, ${inr(price)} One-Time`,
        description: `Learn Claude, ChatGPT, Grok, n8n, Lovable and 50+ AI tools by building real projects. 100+ projects, an accredited certificate and a job board, all for a one-time ${inr(price)}. No coding needed.`,
      })
}

/* The figures under the hero. */
const STATS = [
  { n: '50+', l: 'AI Courses' },
  { n: '100+', l: 'Projects' },
  { n: '1 Lakh+', l: 'AI Job Openings' },
]

/* The moving row of tools: Claude's own products lead on the Claude page. */
type Pill = { name: string; mark?: string; img?: string }
function pillsFor(kind: BundleKind): Pill[] {
  const tools: Pill[] = learn.tools.map((t) => ({ name: t.name, mark: t.mark }))
  if (kind === 'all') return tools
  const features = landingHero('claude', '').features ?? []
  return [
    { name: 'Claude Chat', mark: 'claude' },
    ...features.map((f) => ({ name: f.label, img: f.logo })),
    ...tools.filter((t) => t.name !== 'Claude'),
  ]
}

/* Why skeo, in six claims the rest of the page backs up. */
const WHY = [
  { t: 'Learn by doing, not watching', b: 'Every lesson ends in an assignment on your own work, so you finish with things you built, not notes you took.' },
  { t: 'Zero coding needed', b: 'Built for any background: students, marketers, founders and working professionals. If you can type, you can start.' },
  { t: '50+ AI tools, hands-on', b: 'Claude, ChatGPT, Grok, n8n, Lovable, Cursor, Canva and more, used on real tasks in every module.' },
  { t: '100+ portfolio projects', b: 'Content engines, automations, agents and live web apps: proof of skill you can show anyone.' },
  { t: 'An accredited certificate', b: 'Recognised by DPIIT Startup India, MSME, Anthropic CPN and Sarvam, and linked to the projects behind it.' },
  { t: 'A job board and a community', b: 'Access to 1 Lakh+ jobs, internships and freelance projects, and a community of people learning alongside you.' },
]

/* One short line per Claude module, for its card (the full topics are in
   the curriculum popup). Same order as claudeSyllabus.modules. */
const CLAUDE_SHORT = [
  'Learn how AI and Claude actually work, why it sometimes sounds right but is wrong, and how to catch it.',
  'Write prompts that get the right answer first time, and set up Projects and Skills so Claude works your way.',
  'Turn screenshots and notes into diagrams, charts and Artifacts, and make decks and prototypes with Claude Design.',
  'Connect Claude to your real tools with MCP, run cited research, and use it inside Chrome, Excel and Word.',
  'Hand off multi-step work, schedule tasks that run on their own, and build small tools with Claude Code.',
  'Use Claude on your phone, desktop and in Slack, and set it up safely for a whole team.',
  'Put it to work on real tasks: inbox and meeting prep, reports and decks, study, freelance and business.',
  'Ship a capstone of your choice, from a personal AI system to a tool you built, ready to show anyone.',
]

/* What's in the pass. */
const JOBS_LINE = '1 Lakh+ global AI roles & projects active on the monetization platform (₹25,000 value)'

const VALUE = [
  '50+ AI courses with lifetime access (₹50,000 value)',
  'Prompt Playbooks & AI workflow automation (₹15,000 value)',
  '12+ live masterclasses',
  JOBS_LINE,
  'Certification, accredited by Anthropic & DPIIT, Govt. of India',
  '100+ real projects for your portfolio',
  'Top AI builders & mentors',
]

function CtaStrip({ line, cta }: { line: string; cta: string }) {
  return (
    <div className="bx-strip">
      <p>{line}</p>
      <Buy className="button button-lime ea-cta">{cta}</Buy>
    </div>
  )
}

/**
 * The bundle hero: copy, tool row, stats and price on the left, the buy card
 * on the right. Used by the bundle pages and by /campaign/everything-ai.
 */
export async function BundleHero({ kind }: { kind: BundleKind }) {
  const catalog = await getCatalog()
  const offer = offerOf(catalog)
  const savePct = savePctOf(catalog)
  const price = inr(offer.price)
  const was = inr(offer.was)
  const save = inr(offer.was - offer.price)
  const pills = pillsFor(kind)
  return (
    <section className="bx-hero" data-hero>
      <div className="ea-container bx-hero-grid">
        <div className="bx-hero-copy">
          <span className="bx-live">
            <i aria-hidden="true" /> Early Access · Self-paced · Start today
          </span>
          {kind === 'claude' ? (
            <>
              <h1>
                Master Claude.
                <br />
                <em>Chat, Cowork, Code and Design, at just {price}.</em>
              </h1>
              <p className="bx-hero-lede">
                Learn the tool people actually get work done with, plus 50+ more AI courses. Zero coding needed: go
                from first prompt to shipped work.
              </p>
            </>
          ) : (
            <>
              <h1>
                50+ AI Courses.
                <br />
                <em>Everything you need to work with AI.</em>
              </h1>
              <p className="bx-hero-lede">
                Claude, ChatGPT, Grok, n8n, Lovable and 50+ more. Zero coding needed: go from complete beginner to
                building real projects.
              </p>
            </>
          )}

          <div className="bx-marquee" aria-label="Tools you will use">
            <ul>
              {[0, 1].map((copy) =>
                pills.map((t) => (
                  <li key={`${copy}-${t.name}`} aria-hidden={copy === 1 || undefined}>
                    {t.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="ea-tool-mark bx-pill-img" src={t.img} alt="" />
                    ) : (
                      <ToolLogo name={t.name} mark={t.mark} />
                    )}
                    {t.name}
                  </li>
                )),
              )}
            </ul>
          </div>

          <ul className="bx-stats">
            {STATS.map((s) => (
              <li key={s.l}>
                <b>{s.n}</b>
                <small>{s.l}</small>
              </li>
            ))}
          </ul>

          <div className="bx-hero-cta">
            <div className="bx-price">
              <s>Total value {was}</s>
              <b>{price}</b>
              <small>One-time · Every course, project and workshop</small>
            </div>
            <Buy className="button button-lime ea-cta bx-cta-big">Get Started, {price}</Buy>
          </div>
        </div>

        {/* The buy card */}
        <aside className="bx-card" aria-label="The Early Access pass">
          <span className="bx-card-ribbon">Best value</span>
          <p className="bx-card-title">Everything AI: Instant Access</p>
          <p className="bx-card-sub">50+ AI courses · 100+ projects · Certificate</p>
          <p className="bx-card-price">
            <b>{price}</b>
            <s>{was}</s>
          </p>
          <span className="bx-save">
            You save {save}, {savePct}% OFF
          </span>
          <ul className="bx-value">
            {VALUE.map((v) => (
              <li key={v}>
                <Check />
                {v}
              </li>
            ))}
          </ul>
          <Buy className="button button-lime ea-cta bx-card-cta">Get Started, pay {price}</Buy>
          <p className="bx-card-trust">Secure payment by Cashfree · One-time · Instant access</p>
        </aside>
      </div>
    </section>
  )
}

export async function BundlePage({ kind }: { kind: BundleKind }) {
  const catalog = await getCatalog()
  const offer = offerOf(catalog)
  const savePct = savePctOf(catalog)
  const price = inr(offer.price)
  const was = inr(offer.was)
  const save = inr(offer.was - offer.price)
  const announcement = { ...announcementCode, ...catalog.campaign.announcement, cta: announcementCode.cta, offer: `${savePct}% OFF` }


  /* What you'll be able to do: the twelve modules, or Claude's eight. */
  const useCases =
    kind === 'claude'
      ? claudeSyllabus.modules.map((m, i) => ({
          level: `Claude · Module ${String(i + 1).padStart(2, '0')}`,
          title: m.title,
          body: CLAUDE_SHORT[i],
        }))
      : learn.levels.flatMap((l) => l.modules.map((m) => ({ level: l.label, title: m.title, body: m.body, build: m.build })))

  /* The five courses, with their curricula, for the tabs. */
  const courses: CourseTab[] = toolLibrary.map((t) => {
    const s = syllabusFor(t.id)
    return {
      id: t.id,
      name: t.name,
      maker: t.maker,
      tagline: t.tagline,
      blurb: t.blurb,
      facts: t.facts.map((f) => f.label),
      modules: s.modules.map((m) => m.title),
      capstone: s.modules[s.modules.length - 1]?.topics ?? [],
      logo: t.poster.logo,
    }
  })

  return (
    <div className="ea bx">
      {/* Always the brown theme here (also set before first paint in the layout). */}
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
        {/* ---- Hero ---- */}
        <BundleHero kind={kind} />

        {/* ---- Trust: the accreditation strip ---- */}
        <Accreditation />

        {/* ---- Why ---- */}
        <section className="ea-sec ea-sec-soft" id="why">
          <div className="ea-container">
            <header className="ea-head">
              <span className="ea-eyebrow">Why skeo</span>
              <h2>
                Built for the AI-first world.
                <br />
                Not for the classroom.
              </h2>
              <p className="bx-lede">
                Self-paced. Short challenges, real tools and real work. Whether you are 18 or 60, a student or a founder, if you can
                use a phone, you can learn AI here.
              </p>
            </header>
            <ul className="bx-why">
              {WHY.map((w) => (
                <li key={w.t}>
                  <span className="bx-why-ico" aria-hidden="true">
                    <Check />
                  </span>
                  <h3>{w.t}</h3>
                  <p>{w.b}</p>
                </li>
              ))}
            </ul>
            <div className="bx-center">
              <Buy className="button button-lime ea-cta">Start your AI journey, just {price}</Buy>
              <small>One-time payment · No hidden fees · Instant access</small>
            </div>
          </div>
        </section>

        {/* ---- What you'll be able to do ---- */}
        <section className="ea-sec bx-dark" id="use-cases">
          <div className="ea-container">
            <header className="ea-head">
              <span className="ea-eyebrow">{kind === 'claude' ? 'The Claude track' : 'Real-world skills'}</span>
              <h2>{kind === 'claude' ? 'What you’ll be able to do with Claude' : 'What you’ll actually be able to do'}</h2>
              <p className="bx-lede">
                {kind === 'claude'
                  ? 'Eight modules, from how the model works to a capstone you ship. Tap any one to see what it covers.'
                  : 'Twelve modules in four levels, each ending in something you build. Tap any one to see what it is.'}
              </p>
            </header>
            <UseCases items={useCases} />
            <div className="bx-center">
              <Buy className="button button-lime ea-cta">Learn all of this, {price}</Buy>
            </div>
          </div>
        </section>

        {/* ---- The courses ---- */}
        <section className="ea-sec" id="courses">
          <div className="ea-container">
            <header className="ea-head">
              <span className="ea-eyebrow">The courses</span>
              <h2>
                Every AI skill that
                <br />
                actually gets you hired.
              </h2>
              <p className="bx-lede">Each course runs from the basics to a capstone you ship. Self-paced, with an assignment in every lesson.</p>
            </header>
            <CourseTabs courses={courses} />
          </div>
        </section>

        {/* ---- Mentors and masterclasses ---- */}
        <section className="ea-sec bx-dark" id="mentors">
          <div className="ea-container">
            <header className="ea-head">
              <span className="ea-eyebrow">Mentors &amp; masterclasses</span>
              <h2>{mentors.title}</h2>
              <p className="bx-lede">Live AI masterclasses and mentor sessions come with your pass, at no extra cost.</p>
            </header>
            <ul className="bx-mentors">
              {mentors.people.map((m) => (
                <li key={m.name}>
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} width={56} height={56} />
                  ) : (
                    <span className="bx-mentor-initials">{m.initials}</span>
                  )}
                  <div>
                    <b>{m.name}</b>
                    <small>{m.role}</small>
                    <p>{m.bio}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Reviews ---- */}
        <Reviews />

        <CtaStrip line="Join the learners already building with AI on skeo." cta={`Enrol now, ${price} only`} />

        {/* ---- Certificate ---- */}
        <Certificate />

        {/* ---- FAQ ---- */}
        <section className="ea-sec ea-faq-sec" id="faq">
          <div className="ea-container ea-faq-wrap">
            <div className="ea-faq-side">
              <span className="ea-eyebrow">FAQ</span>
              <h2>Quick answers.</h2>
              <p>Everything people ask before they join.</p>
              <div className="ea-faq-help">
                <b>Still have a question?</b>
                <span>Write to us and a real person replies within a day.</span>
                <a href="mailto:support@skeoai.com">support@skeoai.com</a>
              </div>
            </div>
            <FaqList items={faqs} />
            <p className="ea-faq-contact">
              Contact us: <a href="mailto:support@skeoai.com">support@skeoai.com</a>
            </p>
          </div>
        </section>

        {/* ---- The closing offer ---- */}
        <section className="ea-sec bx-dark bx-final" id="offer">
          <div className="ea-container">
            <header className="ea-head">
              <span className="ea-eyebrow">
                Early Access · {savePct}% off
              </span>
              <h2>
                Don&rsquo;t let AI leave you behind.
                <br />
                Start today for {price}.
              </h2>
            </header>
            <div className="bx-card bx-card-final">
              <p className="bx-card-title">Everything AI · Early Access</p>
              <p className="bx-card-sub">50+ AI courses · 100+ projects · Certificate · Job board</p>
              <p className="bx-card-price">
                <b>{price}</b>
                <s>{was}</s>
              </p>
              <span className="bx-save">
                You save {save}, {savePct}% OFF
              </span>
              <ul className="bx-value">
                {VALUE.map((v) => (
                  <li key={v}>
                    <Check />
                    {v}
                  </li>
                ))}
              </ul>
              <Buy className="button button-lime ea-cta bx-card-cta">Get Started, pay {price}</Buy>
              <p className="bx-card-trust">Secure payment by Cashfree · One-time · Instant access</p>
            </div>
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
      <JoinToasts />
      <CampaignSchema path={PATHS[kind]} name={kind === 'claude' ? 'Master Claude' : '50+ AI Courses in One Bundle'} />
    </div>
  )
}
