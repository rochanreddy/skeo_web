import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { verifyExisting, failed } from '@/lib/admin/paid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/admin/paid/:id/verify — check an unverified manual payment against Cashfree. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  const { id } = await params
  const { reference } = (await request.json().catch(() => ({}))) as { reference?: string }
  try {
    return NextResponse.json({ ok: true, ...(await verifyExisting(id, String(reference ?? ''))) })
  } catch (err) {
    return failed(err, 'Could not reach Cashfree.')
  }
}
