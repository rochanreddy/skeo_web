import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { lookupPayment, failed } from '@/lib/admin/paid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/admin/paid/lookup — what a Cashfree reference resolves to, before anything is written. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  const { reference } = (await request.json().catch(() => ({}))) as { reference?: string }
  try {
    return NextResponse.json({ ok: true, ...(await lookupPayment(String(reference ?? ''))) })
  } catch (err) {
    return failed(err, 'Could not reach Cashfree.')
  }
}
