import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { explainZoomError, pastMeetings, zoomConfigured } from '@/lib/admin/zoom'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/zoom/sessions — the account's finished meetings, last 90 days, to pick a class from. */
export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  if (!zoomConfigured()) return NextResponse.json({ ok: false, error: 'Zoom is not connected on this server yet.' }, { status: 503 })
  try {
    return NextResponse.json({ ok: true, sessions: await pastMeetings(90) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('zoom sessions', err)
    return NextResponse.json({ ok: false, error: explainZoomError(err) }, { status: 502 })
  }
}
