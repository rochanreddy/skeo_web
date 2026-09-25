import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { listOrders } from '@/lib/admin/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/orders — every order, newest first, for the Orders tab. */
export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  try {
    return NextResponse.json({ ok: true, orders: await listOrders() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('admin/orders:', err)
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not read orders.' }, { status: 503 })
  }
}
