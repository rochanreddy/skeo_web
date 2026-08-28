import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    // The dashboard and the tracking endpoint are noindex in their own
    // metadata too; this keeps well-behaved crawlers from asking at all.
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${site.url}/sitemap.xml`,
  }
}
