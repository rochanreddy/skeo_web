import { NextResponse } from 'next/server'
import { liveStats } from '@/lib/earlyAccessLive'

/**
 * GET /api/early-access/stats — seats left and recent joins, for the
 * campaign page. Public, read-only, and cached for half a minute at the edge:
 * a visitor sees a count that is at most that stale, and a traffic spike
 * costs the database one query per 30 seconds rather than one per visitor.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await liveStats()
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch {
    // No numbers is better than wrong ones: the page hides both features.
    return NextResponse.json({ seatsTotal: null, seatsLeft: null, recent: [] }, { status: 200 })
  }
}
