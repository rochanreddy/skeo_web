import { faqs, promiseStats } from '@/lib/content'
import { getCatalog } from '@/lib/cms'
import { abs } from '@/lib/seo'
import { site } from '@/lib/site'

/**
 * JSON-LD, split by page.
 *
 * Search engines use it for rich results; answer engines use it to decide what
 * an entity *is* — the name, the company behind it, what it sells and at what
 * price. Rendered server-side so neither has to run JavaScript to see it.
 *
 * Two rules every block here follows:
 *  - Only what the page visibly says. FAQ markup repeats the FAQ the page
 *    renders, word for word, and only on that page; Google treats markup the
 *    reader cannot see as spam, and an answer engine that quotes it is
 *    quoting something the site never published.
 *  - Every node that is referred to elsewhere has a stable @id built from
 *    site.url, so the graph on /about and the graph on / describe the same
 *    organization rather than two that happen to share a name.
 */

const ORG = `${site.url}/#organization`
const WEBSITE = `${site.url}/#website`
const LOGO = `${site.url}/logo.png`

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is authored in this repo, not user input. `<` is escaped so a
      // string can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/** On every page, from the root layout: who publishes this site. */
export function SiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['Organization', 'EducationalOrganization'],
            '@id': ORG,
            name: site.name,
            alternateName: ['skeo AI', 'skeoai'],
            legalName: site.legalName,
            url: site.url,
            logo: { '@type': 'ImageObject', '@id': `${site.url}/#logo`, url: LOGO, width: 512, height: 512 },
            image: { '@id': `${site.url}/#logo` },
            description: site.description,
            email: site.email,
            areaServed: 'Worldwide',
            knowsAbout: ['Artificial intelligence', 'Claude', 'ChatGPT', 'Gemini', 'n8n', 'Lovable', 'Prompt engineering', 'AI automation'],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: site.email,
              availableLanguage: ['English'],
            },
            /* The parent brand the footer links to. */
            parentOrganization: { '@type': 'Organization', name: 'menler', url: 'https://menler.in' },
            ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
          },
          {
            '@type': 'WebSite',
            '@id': WEBSITE,
            url: site.url,
            name: site.name,
            description: site.description,
            inLanguage: 'en',
            publisher: { '@id': ORG },
          },
        ],
      }}
    />
  )
}

/** The home page: the page itself, its FAQ, and the tracks it sells. */
export async function HomeSchema() {
  /* The published prices, so the markup always matches the number on the page. */
  const { modules: MODULE_ROWS, plans: PLANS, comingSoon: COMING_SOON } = await getCatalog()
  const courses = MODULE_ROWS.map((m) => {
    const plan = PLANS[m.key]
    return {
      '@type': 'Course',
      '@id': `${site.url}/#course-${m.key}`,
      name: m.title,
      description: m.subtitle,
      url: `${site.url}/#pricing`,
      inLanguage: 'en',
      isAccessibleForFree: false,
      educationalLevel: 'Beginner',
      teaches: plan.features,
      provider: { '@id': ORG },
      offers: {
        '@type': 'Offer',
        price: plan.amount,
        /* The base currency every amount in lib/plans is stored in. An
           overseas reader is shown dollars, but this is the price of record
           and it has to match the number beside it. */
        priceCurrency: 'INR',
        category: 'Paid',
        availability: 'https://schema.org/InStock',
        url: `${site.url}/#pricing`,
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        /* Self-paced, and the FAQ's own figure: "Most daily builds take
           30–60 minutes." */
        courseSchedule: { '@type': 'Schedule', duration: 'PT1H', repeatFrequency: 'Daily' },
      },
    }
  })

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${site.url}/#webpage`,
            url: site.url,
            name: `${site.name} — ${site.tagline}`,
            description: site.description,
            isPartOf: { '@id': WEBSITE },
            about: { '@id': ORG },
            primaryImageOfPage: { '@type': 'ImageObject', url: `${site.url}/opengraph-image` },
            inLanguage: 'en',
          },
          {
            '@type': 'FAQPage',
            '@id': `${site.url}/#faq`,
            isPartOf: { '@id': `${site.url}/#webpage` },
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          {
            '@type': 'ItemList',
            '@id': `${site.url}/#tracks`,
            name: 'skeo AI tool tracks',
            description: `Available now: ${MODULE_ROWS.map((m) => m.title).join(', ')}. Coming next: ${COMING_SOON.title}.`,
            itemListElement: courses.map((course, i) => ({ '@type': 'ListItem', position: i + 1, item: course })),
          },
        ],
      }}
    />
  )
}

/** /campaign/everything-ai: the bundle on sale, its price and deadline, and its FAQ. */
export async function CampaignSchema() {
  const { plans: PLANS, campaign } = await getCatalog()
  const offer = { endsAt: campaign.endsAt }
  const campaignFaq = { items: campaign.faq }
  const path = '/campaign/everything-ai'
  const url = abs(path)
  const plan = PLANS.earlyaccess
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Course',
            '@id': `${url}#course`,
            name: plan.title,
            description:
              'Every skeo course and tool batch in one pass — ChatGPT, Claude and 50+ AI tools, 20+ real projects, live workshops, templates, community access and a certificate.',
            url,
            inLanguage: 'en',
            isAccessibleForFree: false,
            educationalLevel: 'Beginner',
            teaches: plan.features,
            provider: { '@id': ORG },
            offers: {
              '@type': 'Offer',
              price: plan.amount,
              priceCurrency: 'INR',
              category: 'Paid',
              url,
              availability: 'https://schema.org/InStock',
              /* The real deadline: the order route stops selling at this moment. */
              priceValidUntil: offer.endsAt.slice(0, 10),
              validThrough: offer.endsAt,
            },
            hasCourseInstance: {
              '@type': 'CourseInstance',
              courseMode: 'Online',
              courseSchedule: { '@type': 'Schedule', duration: 'PT1H', repeatFrequency: 'Daily' },
            },
          },
          {
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            mainEntity: campaignFaq.items.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
          breadcrumbs([{ name: 'Everything AI', path }]),
        ],
      }}
    />
  )
}

/** /about: the page is about the organization the site-wide graph defines. */
export function AboutSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${abs('/about')}#webpage`,
        url: abs('/about'),
        name: `About ${site.name}`,
        isPartOf: { '@id': WEBSITE },
        about: { '@id': ORG },
        mainEntity: { '@id': ORG },
        /* The same four figures the page and the home page count up to. */
        description: promiseStats.map((s) => `${s.value}${s.suffix} ${s.label}`).join(' · '),
      }}
    />
  )
}

function breadcrumbs(items: readonly { name: string; path: string }[]) {
  const trail = [{ name: site.name, path: '/' }, ...items]
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  }
}

/** Home › page, for the pages one level down. */
export function BreadcrumbSchema({ items }: { items: readonly { name: string; path: string }[] }) {
  return <JsonLd data={{ '@context': 'https://schema.org', ...breadcrumbs(items) }} />
}
