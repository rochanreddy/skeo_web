import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

/* /manifest.webmanifest — what a phone uses when the site is added to the home
   screen, and one more place a crawler reads the name and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#14121c',
    categories: ['education', 'productivity'],
    lang: 'en',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
