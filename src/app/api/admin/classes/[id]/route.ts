import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { classesCollection, parseClassInput } from '@/lib/admin/classes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }
const unauthorised = () => NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })

/** PATCH /api/admin/classes/:id — relink the session, change the course or the name. */
export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return unauthorised()
  const { id } = await params
  const parsed = parseClassInput((await request.json().catch(() => ({}))) as Record<string, unknown>, true)
  if (parsed.error) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
  try {
    const res = await (await classesCollection()).updateOne({ _id: id }, { $set: parsed.value })
    if (!res.matchedCount) return NextResponse.json({ ok: false, error: 'No such class.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not save the class.' }, { status: 503 })
  }
}

/** DELETE /api/admin/classes/:id — forget the link. Nothing in Zoom changes. */
export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return unauthorised()
  const { id } = await params
  try {
    await (await classesCollection()).deleteOne({ _id: id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not remove the class.' }, { status: 503 })
  }
}
