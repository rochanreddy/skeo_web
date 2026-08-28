'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RANGES, type RangeKey, type Stats } from '@/lib/analytics/aggregate'
import { BarList, Funnel, TrendChart } from './Charts'

/**
 * Everything the operator sees after signing in.
 *
 * One fetch feeds the whole screen — the API recomputes the full picture per
 * request, so there is no partial state to keep in sync here, and switching
 * range or polling is the same code path as the first load.
 */

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
const num = (n: number) => n.toLocaleString('en-US')

const timeOf = (at: number) =>
  new Date(at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

/** Percentage change against the previous window; null when there is no base. */
function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return <span className="kpi-delta is-new">new</span>
  if (value === 0) return <span className="kpi-delta is-flat">no change</span>
  // `invert` is for the metrics where up is bad — an abandoned cart, say.
  const good = invert ? value < 0 : value > 0
  return (
    <span className={`kpi-delta ${good ? 'is-up' : 'is-down'}`}>
      {value > 0 ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  )
}

function Kpi({
  label,
  value,
  sub,
  delta: d,
  invert,
  accent,
}: {
  label: string
  value: string
  sub: string
  delta?: number | null
  invert?: boolean
  accent?: 'purple' | 'lime' | 'plain'
}) {
  return (
    <article className={`kpi${accent ? ` kpi-${accent}` : ''}`}>
      <h3>{label}</h3>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className="kpi-sub">{sub}</span>
        {d !== undefined && <Delta value={d} invert={invert} />}
      </div>
    </article>
  )
}

function Panel({
  title,
  hint,
  children,
  wide,
  action,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  wide?: boolean
  action?: React.ReactNode
}) {
  return (
    <section className={`panel${wide ? ' panel-wide' : ''}`}>
      <header className="panel-head">
        <div>
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function AdminDashboard({ defaultPassword }: { defaultPassword: boolean }) {
  const router = useRouter()
  const [range, setRange] = useState<RangeKey>('7d')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [live, setLive] = useState(true)
  const [metric, setMetric] = useState<'visitors' | 'revenue'>('visitors')

  // Held in a ref so the polling effect does not restart on every fetch.
  const rangeRef = useRef(range)
  rangeRef.current = range

  const load = useCallback(async (which: RangeKey) => {
    try {
      const response = await fetch(`/api/admin/stats?range=${which}`, { cache: 'no-store' })
      if (response.status === 401) {
        // The session ran out while the tab sat open.
        window.location.href = '/admin/login'
        return
      }
      const body = (await response.json()) as { ok: boolean; stats?: Stats; error?: string }
      if (!body.ok || !body.stats) throw new Error(body.error || 'Could not load the numbers.')
      setStats(body.stats)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the numbers.')
    }
  }, [])

  useEffect(() => {
    void load(range)
  }, [load, range])

  // Auto-refresh, so a dashboard left on a second screen stays true.
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => void load(rangeRef.current), 20_000)
    return () => window.clearInterval(id)
  }, [live, load])

  async function tool(action: 'seed' | 'clear-demo' | 'clear-all') {
    if (action === 'clear-all' && !window.confirm('Delete every recorded event, real ones included. Continue?')) return
    setBusy(true)
    await fetch('/api/admin/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await load(range)
    setBusy(false)
  }

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  if (!stats) {
    return (
      <div className="admin-loading">
        {error ? <p className="admin-error">{error}</p> : <p>Counting…</p>}
      </div>
    )
  }

  const t = stats.totals
  const p = stats.previous
  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? ''
  const topWanted = [...stats.modules].sort((a, b) => b.nextInterest - a.nextInterest)[0]

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <div>
            <b>skeo admin</b>
            <small>
              {t.liveNow > 0 ? (
                <>
                  <i className="live-dot" aria-hidden="true" /> {t.liveNow} on the site now
                </>
              ) : (
                'Nobody on the site right now'
              )}
            </small>
          </div>
        </div>

        <div className="admin-actions">
          <div className="range-picker" role="group" aria-label="Date range">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                className={range === option.key ? 'is-on' : ''}
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="admin-toggle">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            <span>Auto-refresh</span>
          </label>

          <button type="button" className="admin-btn" onClick={() => void load(range)}>
            Refresh
          </button>
          <button type="button" className="admin-btn admin-btn-quiet" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {defaultPassword && (
        <p className="admin-notice is-warn">
          <b>This dashboard is still on the built-in password.</b> Set <code>ADMIN_PASSWORD</code> in{' '}
          <code>.env.local</code> before this site goes anywhere public.
        </p>
      )}

      {stats.demoEvents > 0 && (
        <p className="admin-notice is-demo">
          <b>{num(stats.demoEvents)} of these events are demo data.</b> Real traffic is mixed in with it — clear the
          demo rows to see only what actually happened.
          <button type="button" onClick={() => void tool('clear-demo')} disabled={busy}>
            Clear demo data
          </button>
        </p>
      )}

      {error && <p className="admin-notice is-error">{error}</p>}

      {/* ---- The headline numbers ---- */}
      <div className="kpi-grid">
        <Kpi
          label="Total visitors"
          value={num(t.visitors)}
          sub={`${num(t.pageviews)} views · ${num(t.sessions)} sessions`}
          delta={delta(t.visitors, p.visitors)}
          accent="purple"
        />
        <Kpi
          label="Total sales"
          value={money(t.revenue)}
          sub={t.orders > 0 ? `${num(t.orders)} orders · ${money(t.aov)} average` : 'No orders yet'}
          delta={delta(t.revenue, p.revenue)}
          accent="lime"
        />
        <Kpi
          label="Bought a course"
          value={num(t.buyers)}
          sub={`${num(t.orders)} order${t.orders === 1 ? '' : 's'} placed`}
          delta={delta(t.buyers, p.buyers)}
        />
        <Kpi
          label="Visitor → buyer"
          value={`${t.conversionRate}%`}
          sub={`${num(t.buyers)} of ${num(t.visitors)} visitors`}
          delta={delta(t.conversionRate, p.conversionRate)}
        />

        <Kpi
          label="Registered"
          value={num(t.registrations)}
          sub={`${num(t.signins)} returning sign-in${t.signins === 1 ? '' : 's'}`}
          delta={delta(t.registrations, p.registrations)}
        />
        <Kpi
          label={stats.lmsReporting ? 'Signed into the LMS' : 'Opened the LMS'}
          value={num(t.lmsActivations)}
          sub={
            t.buyers > 0
              ? `${t.activationRate}% of the ${num(t.buyers)} who bought`
              : 'Nobody has bought yet'
          }
          delta={delta(t.lmsActivations, p.lmsActivations)}
        />
        <Kpi
          label="Want the next course"
          value={num(t.nextInterest)}
          sub={topWanted && topWanted.nextInterest > 0 ? `${topWanted.title} leads the list` : 'Asked after checkout'}
          delta={delta(t.nextInterest, p.nextInterest)}
        />
        <Kpi
          label="Left in carts"
          value={money(t.abandonedValue)}
          sub={`${num(t.abandonedCarts)} of ${num(t.cartAdders)} who picked a module`}
          invert
          delta={null}
        />
      </div>

      {/* ---- Trend ---- */}
      <Panel
        title={metric === 'visitors' ? 'Traffic' : 'Revenue'}
        hint={`Last ${rangeLabel.toLowerCase()} · bars are orders`}
        wide
        action={
          <div className="seg" role="group" aria-label="Chart metric">
            <button type="button" className={metric === 'visitors' ? 'is-on' : ''} onClick={() => setMetric('visitors')}>
              Visitors
            </button>
            <button type="button" className={metric === 'revenue' ? 'is-on' : ''} onClick={() => setMetric('revenue')}>
              Revenue
            </button>
          </div>
        }
      >
        <TrendChart series={stats.series} metric={metric} />
        <ul className="legend">
          <li>
            <i className="swatch swatch-line" /> {metric === 'visitors' ? 'Unique visitors' : 'Revenue'}
          </li>
          <li>
            <i className="swatch swatch-bar" /> Orders
          </li>
          <li className="legend-note">
            {num(t.newVisitors)} new · {num(t.returningVisitors)} returning
          </li>
        </ul>
      </Panel>

      <div className="admin-split">
        {/* ---- Funnel ---- */}
        <Panel title="From landing to learning" hint="Unique people reaching each step in this window">
          <Funnel steps={stats.funnel} />
          {!stats.lmsReporting && (
            <p className="panel-note">
              The last step counts people who clicked through to the LMS from the thank-you page. Point the LMS at{' '}
              <code>POST /api/track</code> with <code>lms_login</code> to count real sign-ins instead.
            </p>
          )}
        </Panel>

        {/* ---- Module performance ---- */}
        <Panel title="Modules" hint="What sells, and what people ask for next">
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th className="n">Added</th>
                  <th className="n">Bought</th>
                  <th className="n">Conv.</th>
                  <th className="n">Revenue</th>
                  <th className="n">Wants next</th>
                </tr>
              </thead>
              <tbody>
                {stats.modules.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <b>{row.title}</b>
                      <small>{row.price}</small>
                    </td>
                    <td className="n">{num(row.added)}</td>
                    <td className="n">{num(row.purchased)}</td>
                    <td className="n">{row.added > 0 ? `${row.conversion}%` : '—'}</td>
                    <td className="n">{money(row.revenue)}</td>
                    <td className="n">{num(row.nextInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="panel-note">
            &ldquo;Wants next&rdquo; comes from the question on the thank-you page — buyers only, so it is the
            best read you have on what to build after this.
          </p>
        </Panel>
      </div>

      <div className="admin-split">
        {/* ---- Orders ---- */}
        <Panel
          title="Recent orders"
          hint={`${num(t.orders)} in the last ${rangeLabel.toLowerCase()}`}
          action={
            <a className="admin-btn admin-btn-quiet" href={`/api/admin/export?type=orders&range=${range}`}>
              Export CSV
            </a>
          }
        >
          {stats.orders.length === 0 ? (
            <p className="admin-empty">No orders in this window.</p>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Modules</th>
                    <th className="n">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orders.map((order) => (
                    <tr key={`${order.orderId}-${order.at}`}>
                      <td>
                        <b className="mono">{order.orderId}</b>
                        <small>{timeOf(order.at)}</small>
                      </td>
                      <td className="wrap">
                        {order.email || '—'}
                        {order.demo && <span className="tag">demo</span>}
                      </td>
                      <td className="wrap">{order.modules.join(', ') || '—'}</td>
                      <td className="n">{money(order.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* ---- People ---- */}
        <Panel
          title="Registrations & enquiries"
          hint={`${num(t.registrations)} registered · ${num(t.leads)} enquiries`}
          action={
            <a className="admin-btn admin-btn-quiet" href={`/api/admin/export?type=people&range=${range}`}>
              Export CSV
            </a>
          }
        >
          {stats.people.length === 0 ? (
            <p className="admin-empty">Nobody has registered in this window.</p>
          ) : (
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.people.map((person, i) => (
                    <tr key={`${person.email}-${person.at}-${i}`}>
                      <td>
                        <b>{person.name || 'Unnamed'}</b>
                        <small>{timeOf(person.at)}</small>
                      </td>
                      <td className="wrap">{person.email || '—'}</td>
                      <td>
                        <span className={`tag tag-${person.kind}`}>{person.kind}</span>
                        {person.detail && <small className="muted-inline">{person.detail}</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <div className="admin-thirds">
        <Panel title="Top pages" hint="Where the views land">
          <BarList rows={stats.topPages} empty="No pageviews yet." />
        </Panel>
        <Panel title="Where they came from" hint="Referring site">
          <BarList rows={stats.referrers} empty="No referrers yet." />
        </Panel>
        <Panel title="Devices" hint="How they are reading it">
          <BarList rows={stats.devices} empty="No device data yet." />
        </Panel>
      </div>

      <footer className="admin-foot">
        <div className="admin-tools">
          <a className="admin-btn admin-btn-quiet" href={`/api/admin/export?type=events&range=${range}`}>
            Export raw events
          </a>
          <button type="button" className="admin-btn admin-btn-quiet" onClick={() => void tool('seed')} disabled={busy}>
            Load 30 days of demo data
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={() => void tool('clear-all')}
            disabled={busy}
          >
            Delete all data
          </button>
        </div>
        <p>
          {num(stats.totalEvents)} events stored · refreshed {timeOf(stats.generatedAt)}
          {live && ' · updating every 20s'}
        </p>
      </footer>
    </div>
  )
}
