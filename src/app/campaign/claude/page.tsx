import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { offerOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { EverythingAiLanding } from '../everything-ai/Landing'

/**
 * /campaign/claude — the Everything AI page led by Claude: the hero speaks to
 * Claude and its pass shows Cowork, Code and Design; everything below it is
 * the Everything AI page, at the Early Access price.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return pageMeta({
    path: '/campaign/claude',
    title: `Master Claude — Chat, Cowork, Code and Design for ${inr(price)}`,
    description: `Learn Claude Chat, Cowork, Code, Design and 50+ AI tools by doing: real projects, a certificate and job openings, for a one-time ${inr(price)}.`,
  })
}

export default function ClaudeCampaignPage() {
  return <EverythingAiLanding kind="claude" />
}
