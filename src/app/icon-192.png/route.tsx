import { markImage } from '@/lib/og'

/** /icon-192.png — the small icon the web manifest lists; /logo.png is the 512. */
export const dynamic = 'force-static'

export function GET() {
  return markImage(192)
}
