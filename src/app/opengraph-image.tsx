import { cardSize, siteCard } from '@/lib/og'

/* Inherited by every route without its own card. */
export const alt = 'skeo — Master the AI tools that matter. Real projects, certificates and a job board.'
export const size = cardSize
export const contentType = 'image/png'

export default function Image() {
  return siteCard()
}
