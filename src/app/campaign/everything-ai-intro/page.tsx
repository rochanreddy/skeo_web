import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { offerOf } from '@/lib/catalog'
import { getCatalog } from '@/lib/cms'
import { inr } from '@/lib/earlyAccess'
import { EverythingAiLanding } from '../everything-ai/Landing'

/**
 * /campaign/everything-ai-intro — the Everything AI page with the intro video
 * in the hero instead of the pass card. The same page otherwise, so search
 * engines are pointed at /campaign/everything-ai as the one to index.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { price } = offerOf(await getCatalog())
  return pageMeta({
    path: '/campaign/everything-ai',
    title: `Everything AI — every skeo course for ${inr(price)}`,
    description: `Learn ChatGPT, Claude and 50+ AI tools, build 20+ real projects and get certified — 10+ courses for a one-time ${inr(price)}.`,
  })
}

export default function EverythingAiIntroPage() {
  return <EverythingAiLanding video />
}
