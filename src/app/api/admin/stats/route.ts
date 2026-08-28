import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { computeStats, isRangeKey } from '@/lib/analytics/aggregate'
import { readEvents } from '@/lib/analytics/store'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Everything the dashboard renders, in one response, recomputed per request. */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  const range = new URL(request.url).searchParams.get('range')
  const events = await readEvents()

  let selfHost: string | undefined
  try {
    selfHost = new URL(site.url).hostname
  } catch {
    selfHost = undefined
  }

  const stats = computeStats(events, isRangeKey(range) ? range : '7d', Date.now(), selfHost)

  return NextResponse.json(
    { ok: true, stats },
    // A cached dashboard is a wrong dashboard.
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
