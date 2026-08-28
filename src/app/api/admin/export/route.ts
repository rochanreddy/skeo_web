import { isAuthenticated } from '@/lib/admin/auth'
import { computeStats, isRangeKey } from '@/lib/analytics/aggregate'
import { readEvents } from '@/lib/analytics/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * CSV for the three tables worth taking elsewhere: orders, the people who
 * registered or enquired, and the raw event log for anyone who wants to do
 * their own counting.
 */

/** Quote everything: a name with a comma in it must not shift the columns. */
const cell = (value: unknown): string => {
  const text = value === undefined || value === null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))].join('\r\n')

const iso = (at: number) => new Date(at).toISOString()

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return new Response('unauthorised', { status: 401 })
  }

  const params = new URL(request.url).searchParams
  const rangeParam = params.get('range')
  const range = isRangeKey(rangeParam) ? rangeParam : '30d'
  const kind = params.get('type') ?? 'orders'

  const events = await readEvents()
  const stats = computeStats(events, range)

  let csv: string
  let name: string

  if (kind === 'people') {
    csv = toCsv(
      ['When', 'Kind', 'Name', 'Email', 'Detail', 'Demo'],
      stats.people.map((p) => [iso(p.at), p.kind, p.name, p.email, p.detail ?? '', p.demo]),
    )
    name = 'skeo-people'
  } else if (kind === 'events') {
    csv = toCsv(
      ['When', 'Type', 'Visitor', 'Session', 'Path', 'Referrer', 'Device', 'Props', 'Demo'],
      events
        .filter((event) => event.at >= stats.from && event.at <= stats.to)
        .map((event) => [
          iso(event.at),
          event.type,
          event.visitorId,
          event.sessionId,
          event.path ?? '',
          event.referrer ?? '',
          event.device ?? '',
          event.props ? JSON.stringify(event.props) : '',
          Boolean(event.demo),
        ]),
    )
    name = 'skeo-events'
  } else {
    csv = toCsv(
      ['When', 'Order', 'Email', 'Modules', 'Amount USD', 'Demo'],
      stats.orders.map((o) => [iso(o.at), o.orderId, o.email, o.modules.join(' + '), o.amount, o.demo]),
    )
    name = 'skeo-orders'
  }

  const stamp = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}-${range}-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
