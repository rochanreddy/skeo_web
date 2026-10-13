import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { listClientErrors } from '@/lib/clientErrors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/client-errors — the admin's Errors tab. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  }
  try {
    return NextResponse.json({ ok: true, ...(await listClientErrors()) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('admin/client-errors: could not read', err)
    return NextResponse.json({ ok: false, error: 'Could not load errors.' }, { status: 503 })
  }
}
