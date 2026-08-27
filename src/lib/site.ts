/**
 * Where the LMS lives, and how someone who just paid gets into it.
 *
 * `web` and `mobile` are placeholders until the LMS is deployed and a mobile
 * build is published — swapping these two URLs is the whole integration.
 * `support` is deliberately empty: the thank-you page hides the "something not
 * right?" line rather than pointing at an address nobody reads.
 */
export const lms = {
  web: 'https://lms.skeo.com',
  mobile: 'https://lms.skeo.com/download/skeo-lms.apk',
  support: '',
  /** How the thank-you page describes the wait for the credentials email. */
  credentialsEta: 'within 5 minutes',
} as const

export const site = {
  name: 'skeo',
  url: 'https://skeo.com',
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
