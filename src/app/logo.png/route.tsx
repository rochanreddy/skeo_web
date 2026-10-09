import { markImage } from '@/lib/og'

/**
 * /logo.png — the raster logo the Organization structured data points at.
 * Google wants a logo it can show beside search results: at least 112px
 * square, in a format it reads, at a stable URL. The SVG favicon is none of
 * those reliably, and the generated icon routes carry a cache-busting hash.
 */
export const dynamic = 'force-static'

export function GET() {
  return markImage(512)
}
