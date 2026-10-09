import type { Metadata } from 'next'
import { site } from '@/lib/site'

/**
 * Metadata for one indexable page: its title, description, canonical, and the
 * Open Graph and Twitter cards that go with them.
 *
 * Next merges metadata one key deep. A page that sets `title` but not
 * `openGraph` inherits the root layout's openGraph whole — url included — so
 * /about would be shared as the home page. Every page goes through here so
 * that the canonical, og:url and the card's title can never disagree.
 *
 * The share image is set here too. app/opengraph-image.tsx would be inherited
 * by file convention — but only by a route that leaves openGraph alone, and
 * every route that comes through here sets it. Without this, every page but
 * the home page would be shared as a bare link.
 */
const card = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'skeo — Master the AI tools that matter. Real projects, certificates and a job board.',
}

export function pageMeta({
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  /** Root-relative, e.g. '/about'. Resolved against metadataBase. */
  path: string
  title: string
  description: string
  /** Use the title as written, without the "· skeo" suffix the layout adds. */
  absoluteTitle?: boolean
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${site.name}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: fullTitle,
      description,
      images: [card],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [card],
    },
  }
}

/** Absolute URL for a root-relative path, for structured data (which has no metadataBase). */
export const abs = (path = '/') => (path === '/' ? site.url : `${site.url}${path}`)
