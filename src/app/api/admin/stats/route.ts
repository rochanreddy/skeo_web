import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { computeStats, isRangeKey } from '@/lib/analytics/aggregate'
import { readEvents, storeKind } from '@/lib/analytics/store'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Everything the dashboard renders, in one response, recomputed per request. */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  const range = new URL(request.url).searchParams.get('range')

  /* Reading the events is the one step here that talks to something outside
     this function, so it is the one step that can fail for reasons the
     dashboard cannot guess: an unreachable cluster, a refused IP, credentials
     that were rotated. Letting it throw hands the browser a 500 with no body,
     and the only thing that reaches the screen is fetch's own complaint that
     the empty string is not JSON — which says nothing about the database and
     sends you looking in the wrong place. Catch it and say what happened. */
  let events
  try {
    events = await readEvents()
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    console.error('admin/stats: could not read events', cause)
    return NextResponse.json(
      {
        ok: false,
        error: `Could not reach the ${storeKind()} store. ${detail}`,
        store: storeKind(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

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
