import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { GUIDES } from '@/lib/guides'
import { TOOL_SLUGS } from '@/lib/toolCampaigns'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${site.url}/campaign/everything-ai`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    /* One page per tool course. */
    ...TOOL_SLUGS.map((slug) => ({
      url: `${site.url}/campaign/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    /* The guides, dated by their own last update. */
    { url: `${site.url}/guides`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${site.url}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    /* The policies. Low priority and rarely changed, but they belong in the
       sitemap: a payment gateway or an app store reviewer looking for a refund
       policy should find it through search, not only through the footer. */
    ...['about', 'privacy', 'refund', 'terms'].map((path) => ({
      url: `${site.url}/${path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
