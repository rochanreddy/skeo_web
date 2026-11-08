import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { pageMeta } from '@/lib/seo'
import { TOOL_CAMPAIGNS, TOOL_SLUGS, type ToolSlug } from '@/lib/toolCampaigns'
import { ToolLanding } from '../everything-ai/ToolLanding'

/**
 * /campaign/chatgpt, /campaign/grok, /campaign/n8n, /campaign/lovable — the
 * hero is the tool's own (its copy and course pass, from lib/toolCampaigns);
 * everything below it is the Everything AI page, as on every campaign page.
 * Claude has its own pages (/campaign/claude, /campaign/claude-intro).
 */

export const dynamicParams = false

/* Claude has its own landing pages (/campaign/claude, /campaign/claude-intro). */
export function generateStaticParams() {
  return TOOL_SLUGS.filter((tool) => tool !== 'claude').map((tool) => ({ tool }))
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

export default async function ToolCampaignPage({ params }: Props) {
  const c = campaignOf((await params).tool)
  if (!c) notFound()
  return <ToolLanding c={c} />
}
