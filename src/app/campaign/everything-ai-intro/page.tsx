import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { offerOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { EverythingAiLanding } from '../everything-ai/Landing'

/**
 * /campaign/everything-ai-intro: the Everything AI page with the intro video
 * in the hero instead of the pass card. Paid, like the other campaign pages:
 * details, then Cashfree. (It ran as a free 7-day page from 13 Nov to 25 Nov
 * 2026; lib/landings FREE_CAMPAIGNS turns that back on.) The same page
 * otherwise, so search engines are pointed at /campaign/everything-ai.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return pageMeta({
    path: '/campaign/everything-ai',
    title: `Everything AI: every skeo course for ${inr(price)}`,
    description: `Learn ChatGPT, Claude and 50+ AI tools, build 20+ real projects and get certified. 10+ courses for a one-time ${inr(price)}.`,
  })
}

export default function EverythingAiIntroPage() {
  return <EverythingAiLanding video />
}
