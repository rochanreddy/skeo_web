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
