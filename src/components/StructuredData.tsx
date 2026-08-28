import { faqs } from '@/lib/content'
import { PLANS, MODULE_KEYS } from '@/lib/plans'
import { site } from '@/lib/site'

/**
 * JSON-LD for rich results: who we are, what the FAQ says, and what the
 * tools cost. Rendered server-side so crawlers see it without running JS.
 */
export function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        description: site.description,
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { '@id': `${site.url}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${site.url}/#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
      ...MODULE_KEYS.map((key) => {
        const plan = PLANS[key]
        return {
          '@type': 'Course',
          name: plan.title,
          description: plan.features.join('. '),
          provider: { '@id': `${site.url}/#organization` },
          offers: {
            '@type': 'Offer',
            price: plan.amount,
            priceCurrency: 'USD',
            category: 'Paid',
          },
        }
      }),
    ],
  }

  return (
    <script
      type="application/ld+json"
      // Content is authored in this repo, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
