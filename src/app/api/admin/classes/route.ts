import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { createClass, listClasses, parseClassInput, type ClassDoc } from '@/lib/admin/classes'
import { zoomConfigured } from '@/lib/admin/zoom'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const unauthorised = () => NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })

/** GET /api/admin/classes — every linked class, newest first, with how many paid for its course. */
export async function GET() {
  if (!(await isAuthenticated())) return unauthorised()
  try {
    return NextResponse.json({ ok: true, zoom: zoomConfigured(), classes: await listClasses() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not read classes.' }, { status: 503 })
  }
}

/** POST /api/admin/classes — link a Zoom session to a course. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorised()
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const parsed = parseClassInput(body)
  if (parsed.error) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
  try {
    const id = await createClass(parsed.value as Omit<ClassDoc, '_id' | 'createdAt'>)
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not save the class.' }, { status: 503 })
  }
}
