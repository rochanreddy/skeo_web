import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { listLeads } from '@/lib/admin/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/leads — everyone who verified at checkout, paid or not. */
export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  try {
    return NextResponse.json({ ok: true, leads: await listLeads() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not read leads.' }, { status: 503 })
  }
}
