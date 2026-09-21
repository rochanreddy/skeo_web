import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    /* The policies. Low priority and rarely changed, but they belong in the
       sitemap: a payment gateway or an app store reviewer looking for a refund
       policy should find it through search, not only through the footer. */
    ...['privacy', 'refund', 'terms'].map((path) => ({
      url: `${site.url}/${path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
