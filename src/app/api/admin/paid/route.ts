import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { failed, listPaid, recordPayment, type RecordInput } from '@/lib/admin/paid'
import { cashfreeConfigured } from '@/lib/payments/cashfree'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const unauthorised = () => NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })

/** GET /api/admin/paid — every paid order, website and manual, newest first. */
export async function GET() {
  if (!(await isAuthenticated())) return unauthorised()
  try {
    return NextResponse.json({ ok: true, cashfree: cashfreeConfigured(), rows: await listPaid() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return failed(err, 'Could not read payments.')
  }
}

/** POST /api/admin/paid — record a payment taken off the website. */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorised()
  const body = (await request.json().catch(() => ({}))) as RecordInput
  try {
    return NextResponse.json({ ok: true, ...(await recordPayment(body)) }, { status: 201 })
  } catch (err) {
    console.error('record payment', err)
    return failed(err, 'Could not record the payment.')
  }
}
