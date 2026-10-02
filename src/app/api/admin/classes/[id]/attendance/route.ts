import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { WrongSessionError, attendanceFor, classesCollection } from '@/lib/admin/classes'
import { explainZoomError, zoomConfigured } from '@/lib/admin/zoom'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/classes/:id/attendance[?uuid=] — who was in the class and who
 * paid but never joined. Zoom reports only on finished meetings, about half an
 * hour after they end.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  if (!zoomConfigured()) return NextResponse.json({ ok: false, error: 'Zoom is not connected on this server yet.' }, { status: 503 })
  const { id } = await params
  const uuid = new URL(request.url).searchParams.get('uuid')?.trim() ?? ''
  try {
    const cls = await (await classesCollection()).findOne({ _id: id })
    if (!cls) return NextResponse.json({ ok: false, error: 'No such class.' }, { status: 404 })
    return NextResponse.json({ ok: true, classId: id, ...(await attendanceFor(cls, uuid)) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    if (err instanceof WrongSessionError) return NextResponse.json({ ok: false, error: err.message, wrongSession: true }, { status: 409 })
    console.error('zoom attendance', err)
    return NextResponse.json({ ok: false, error: explainZoomError(err) }, { status: 502 })
  }
}
