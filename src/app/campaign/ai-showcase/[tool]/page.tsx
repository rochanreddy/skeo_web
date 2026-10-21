import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { TOOL_CAMPAIGNS, TOOL_SLUGS, type ToolSlug } from '@/lib/toolCampaigns'
import { Buy, KitFooter, variantMeta } from '../../_kit/Kit'
import { JoinedToast } from '../../_kit/Live'
import { StickyCta } from '../../everything-ai/StickyCta'
import { ToolSections } from '../../everything-ai/ToolSections'
import '../../everything-ai/early-access.css'
import { HeroScene } from '../HeroScene'
import { NightOnly } from '../NightOnly'
import '../showcase.css'

/**
 * /campaign/ai-showcase/<tool> — one tool's course in the SHOWCASE style.
 *
 * The showcase hero (the learner at the laptop, on the night palette) with the
 * tool in the middle of it: its logo leads the scene and drafts in the
 * floating chat, the logos round it are apps it really works with. Below the
 * hero, the same sections as /campaign/<tool>. Every button buys this tool's
 * course through the real checkout. No countdown: a tool's price has no
 * deadline.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return TOOL_SLUGS.map((tool) => ({ tool }))
}

type Props = { params: Promise<{ tool: string }> }

const campaignOf = (tool: string) => ((TOOL_SLUGS as string[]).includes(tool) ? TOOL_CAMPAIGNS[tool as ToolSlug] : null)

export async function generateMetadata({ params }: Props) {
  const c = campaignOf((await params).tool)
  if (!c) return {}
  const { plans } = await getCatalog()
  return variantMeta(`/campaign/ai-showcase/${c.slug}`, `${c.meta.title} · ${inr(plans[c.plan].amount)}`, c.meta.description)
}

export default async function ShowcaseToolPage({ params }: Props) {
  const c = campaignOf((await params).tool)
  if (!c) notFound()
  const { plans } = await getCatalog()
  const price = inr(plans[c.plan].amount)
  const course = `${c.name} Course`
  return (
    <div className="vx">
      <NightOnly />
      <div className="vx-bar">
        <span>
          <b>New</b> · The {course} is open
        </span>
        <Buy plan={c.plan} className="vx-bar-cta" arrow="→">
          Start for {price}
        </Buy>
      </div>

      <header className="vx-head">
        <Link className="vx-brand" href="/" aria-label="skeo home">
          skeo
        </Link>
        <Buy plan={c.plan} className="vx-btn vx-btn-ghost vx-btn-sm">
          Get started
        </Buy>
      </header>

      <main>
        <section className="vx-hero">
          <div className="vx-glow" aria-hidden="true" />
          <div className="vx-wrap vx-hero-grid">
            <div className="vx-hero-copy">
              <span className="vx-pill">
                <i aria-hidden="true" /> {course} · Now open
              </span>
              {/* The same hook as the main showcase: a big promise, then a
                  number that sounds too small for it. */}
              <h1>
                Master {c.name}.
                <br />
                <em>For just {price}.</em>
              </h1>
              <p className="vx-lede">{c.showcase.lede}</p>
              <ul className="vx-hero-ticks">
                {c.hero.checks.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="vx-hero-cta">
                <Buy plan={c.plan} className="vx-btn">
                  Start learning — {price}
                </Buy>
                <a className="vx-btn vx-btn-ghost" href="#learn">
                  See what&rsquo;s inside <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="vx-fine">One-time payment · Instant access · Certificate included</p>
            </div>

            <HeroScene tool={{ name: c.name, mark: c.slug }} features={c.showcase.features} ask={c.showcase.ask} tag={`${c.name} · 6 modules · 4 projects`} />
          </div>
        </section>
      </main>

      {/* Below the hero: the one-tool sections, inside .ea so its stylesheet applies. */}
      <div className="ea vx-body">
        <ToolSections c={c} />
        <StickyCta plan={c.plan} />
      </div>

      <KitFooter />
      <JoinedToast />
    </div>
  )
}
