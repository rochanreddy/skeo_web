import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin/auth'
import { isPlaybookSet, lmsPost, manualSends, playbookRows, setsFor } from '@/lib/admin/data'
import { ordersCollection } from '@/lib/payments/orders'
import { validateEmail } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const unauthorised = () => NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })

/** GET /api/admin/playbooks — who should have playbooks, and who has them. */
export async function GET() {
  if (!(await isAuthenticated())) return unauthorised()
  try {
    return NextResponse.json({ ok: true, rows: await playbookRows() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not read.' }, { status: 503 })
  }
}

/**
 * POST /api/admin/playbooks — send playbooks now.
 *
 *   { orderId }                  send what that order paid for (Send / Resend)
 *   { orderId, sets: ['ai'] }    only those sets of it
 *   { email, name, sets }        someone with no website order (paid another way)
 *
 * The LMS sends the mails (it holds the PDFs and the mailer); this records
 * what went, so the Playbooks tab shows it.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return unauthorised()
  const body = (await request.json().catch(() => ({}))) as {
    orderId?: string
    email?: string
    name?: string
    sets?: unknown[]
  }
  const wanted = Array.isArray(body.sets) ? body.sets.filter(isPlaybookSet) : []

  try {
    if (body.orderId) {
      const orders = await ordersCollection()
      const order = await orders.findOne({ _id: String(body.orderId) })
      if (!order) return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
      if (order.status === 'created') {
        return NextResponse.json({ ok: false, error: 'This order is not paid, so there is nothing to send.' }, { status: 409 })
      }
      const paidFor = setsFor(order.items)
      const sets = wanted.length ? wanted.filter((s) => paidFor.includes(s)) : paidFor
      if (!sets.length) return NextResponse.json({ ok: false, error: 'This order has no playbooks.' }, { status: 400 })

      const r = await lmsPost<{ sent: string[]; at: string }>('/provision/playbooks', {
        orderId: order._id,
        email: order.contact.email,
        name: order.contact.name,
        sets,
      })
      await orders.updateOne(
        { _id: order._id },
        {
          $addToSet: { 'provision.playbookParts': { $each: r.sent } },
          $push: { playbookSends: { at: new Date(r.at), parts: r.sent } },
        },
      )
      return NextResponse.json({ ok: true, sent: r.sent })
    }

    const email = String(body.email ?? '').trim().toLowerCase()
    const name = String(body.name ?? '').trim().slice(0, 120)
    const problem = validateEmail(email) || (!wanted.length ? 'Pick at least one set.' : null)
    if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 })

    const r = await lmsPost<{ sent: string[]; at: string }>('/provision/playbooks', { email, name, sets: wanted })
    await (await manualSends()).insertOne({ email, name, sets: wanted, parts: r.sent, at: new Date(r.at) })
    return NextResponse.json({ ok: true, sent: r.sent })
  } catch (err) {
    console.error('admin/playbooks send:', err)
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Could not send.' }, { status: 502 })
  }
}
