import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { deleteManual, setBatch, failed } from '@/lib/admin/paid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }
const unauthorised = () => NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })

/** PATCH /api/admin/paid/:id — set or clear the batch month. */
export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return unauthorised()
  const { id } = await params
  const { batch } = (await request.json().catch(() => ({}))) as { batch?: string }
  try {
    return NextResponse.json({ ok: true, batch: await setBatch(id, String(batch ?? '')) })
  } catch (err) {
    return failed(err, 'Could not set the batch.')
  }
}

/** DELETE /api/admin/paid/:id — remove a payment added by hand. */
export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return unauthorised()
  const { id } = await params
  try {
    await deleteManual(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return failed(err, 'Could not delete it.')
  }
}
