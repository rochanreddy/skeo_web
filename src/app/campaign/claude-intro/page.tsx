import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { offerOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { EverythingAiLanding } from '../everything-ai/Landing'

/**
 * /campaign/claude-intro — /campaign/claude with the intro video in the hero
 * instead of the pass card. The same page otherwise, so search engines are
 * pointed at /campaign/claude as the one to index.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return pageMeta({
    path: '/campaign/claude',
    title: `Master Claude — Chat, Cowork, Code and Design for ${inr(price)}`,
    description: `Learn Claude Chat, Cowork, Code, Design and 50+ AI tools by doing: real projects, a certificate and job openings, for a one-time ${inr(price)}.`,
  })
}

export default function ClaudeIntroPage() {
  return <EverythingAiLanding kind="claude" video />
}
