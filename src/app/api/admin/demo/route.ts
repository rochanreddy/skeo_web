import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { generateDemoEvents } from '@/lib/analytics/seed'
import { appendMany, clearAllEvents, clearDemoEvents } from '@/lib/analytics/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Fill the dashboard with demo traffic, take it away again, or wipe everything. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }

  let action = ''
  try {
    const body = (await request.json()) as Record<string, unknown>
    action = typeof body.action === 'string' ? body.action : ''
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 })
  }

  if (action === 'seed') {
    // Replace rather than stack, so pressing it twice does not double the story.
    await clearDemoEvents()
    const events = generateDemoEvents(30)
    await appendMany(events)
    return NextResponse.json({ ok: true, added: events.length })
  }

  if (action === 'clear-demo') {
    const removed = await clearDemoEvents()
    return NextResponse.json({ ok: true, removed })
  }

  if (action === 'clear-all') {
    const removed = await clearAllEvents()
    return NextResponse.json({ ok: true, removed })
  }

  return NextResponse.json({ ok: false, error: 'Unknown action.' }, { status: 400 })
}
