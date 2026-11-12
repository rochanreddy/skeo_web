import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { EverythingAiLanding } from '../everything-ai/Landing'

/**
 * /campaign/everything-ai-intro: the free 7-day campaign (lib/landings
 * isFreeCampaign). The Everything AI page with the intro video, no prices, and
 * a free sign-up instead of a payment; the LMS locks the account after 7 days.
 * Kept out of search: it is an ad landing page.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    ...pageMeta({
      path: '/campaign/everything-ai-intro',
      title: 'Everything AI, free for 7 days',
      description: 'Learn ChatGPT, Claude and 50+ AI tools free for 7 days. Real projects, a certificate and a job board. No payment, no card.',
    }),
    robots: { index: false, follow: true },
  }
}

export default function EverythingAiIntroPage() {
  return <EverythingAiLanding video free />
}
