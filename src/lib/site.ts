/**
 * Where the LMS lives, and how someone who just paid gets into it.
 *
 * `web` and `mobile` are placeholders until the LMS is deployed and a mobile
 * build is published — swapping these two URLs is the whole integration.
 * `support` is deliberately empty: the thank-you page hides the "something not
 * right?" line rather than pointing at an address nobody reads.
 */
export const lms = {
  web: 'https://lms.skeoai.com',
  mobile: 'https://lms.skeoai.com/download/skeo-lms.apk',
  support: 'support@skeoai.com',
  /** How the thank-you page describes the wait for the credentials email. */
  credentialsEta: 'within 5 minutes',
} as const

export const site = {
  name: 'skeo',
  /* The domain the site is actually served from, which is not necessarily the
     one the brand is named after. This single value becomes the canonical
     link, the Open Graph urls, every @id in the structured data, the sitemap
     and the host robots.txt points crawlers at — so leaving it on a domain the
     site is not served from tells a crawler the real page lives elsewhere,
     which is the kind of mistake that looks fine in a browser and only shows
     up in search. It is also what the admin compares referrers against to
     separate its own traffic from the rest. */
  url: 'https://skeoai.com',
  tagline: 'Master the AI tools that matter',
  description:
    'skeo — master the AI tools that matter. One platform. Every AI tool. Short challenges, real proof, real opportunities.',
  twitter: '@skeo',
} as const

/* Ordered to match the order the sections appear down the page, so the active
   link moves left-to-right as you scroll instead of jumping back and forth. */
export const navLinks = [
  { href: '#tools', label: 'Tools' },
  { href: '#jobs', label: 'Job Board' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#reviews', label: 'Reviews' },
] as const
