'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AdminOrder, Lead, PlaybookRow, PlaybookSet } from '@/lib/admin/data'
import { Drawer, Facts, ListControls, Pager, openRow, useListView, type SortOption } from './AdminList'

/**
 * The admin's working tabs — the menler admin's Leads and Paid users, for skeo,
 * plus the one skeo needs that menler does not: who has their playbooks.
 *
 * Each tab loads its own list, searches it in the browser, and exports what is
 * on screen as CSV. Actions (verify an order, send playbooks) go to the admin
 * API and reload the list, so what the screen says is what the server holds.
 */

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
export const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
    : '—'

const ITEM_NAMES: Record<string, string> = {
  claude: 'Claude Course',
  playbooks: 'Claude Playbooks',
  library: 'AI Library',
  member: 'Everything AI',
  earlyaccess: 'Early Access (₹499)',
}
const itemNames = (items: string[]) => items.map((i) => ITEM_NAMES[i] ?? i).join(', ')

/** Fetch an admin list; bounce to login if the session ran out. */
function useAdminList<T>(url: string, key: string) {
  const [rows, setRows] = useState<T[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!body.ok) throw new Error(String(body.error || `Could not load (${res.status}).`))
      setRows(body[key] as T[])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load.')
    }
  }, [url, key])
  useEffect(() => {
    void load()
  }, [load])
  return { rows, error, reload: load }
}

/** Download what is on screen. Quoted so commas and quotes in names survive. */
function downloadCsv(name: string, header: string[], lines: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [header, ...lines].map((r) => r.map(cell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const matches = (q: string, ...fields: (string | null | undefined)[]) => {
  const needle = q.trim().toLowerCase()
  return !needle || fields.some((f) => (f ?? '').toLowerCase().includes(needle))
}

function Toolbar({
  q,
  setQ,
  placeholder,
  children,
}: {
  q: string
  setQ: (v: string) => void
  placeholder: string
  children?: React.ReactNode
}) {
  return (
    <div className="tab-toolbar">
      <input className="tab-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      {children}
    </div>
  )
}

/* Menler's meanings: green done, accent paid, amber pending — red only for a
   real error. */
function Status({ tone, children }: { tone: 'good' | 'paid' | 'warn' | 'bad' | 'quiet'; children: React.ReactNode }) {
  return <span className={`status status-${tone}`}>{children}</span>
}

/* ======================================================================== *
 * Orders — menler's "Paid users", with what the LMS did about each one
 * ======================================================================== */

const ORDER_SORTS: SortOption<AdminOrder>[] = [
  { key: 'new', label: 'Newest first', compare: (a, b) => Date.parse(b.paidAt ?? b.createdAt) - Date.parse(a.paidAt ?? a.createdAt) },
  { key: 'old', label: 'Oldest first', compare: (a, b) => Date.parse(a.paidAt ?? a.createdAt) - Date.parse(b.paidAt ?? b.createdAt) },
  { key: 'amount', label: 'Amount, high to low', compare: (a, b) => b.amount - a.amount },
  { key: 'name', label: 'Name A–Z', compare: (a, b) => (a.name || a.email).localeCompare(b.name || b.email) },
]
const orderDate = (o: AdminOrder) => o.paidAt ?? o.createdAt

/** This calendar month in India, as "2026-10". */
const istMonth = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7)

export function OrdersTab() {
  const { rows, error, reload } = useAdminList<AdminOrder>('/api/admin/orders', 'orders')
  const [q, setQ] = useState('')
  const [show, setShow] = useState<'paid' | 'attention' | 'all'>('paid')
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const matching = useMemo(() => {
    if (!rows) return []
    return rows.filter((o) => {
      if (show === 'paid' && o.status === 'created') return false
      if (show === 'attention' && !needsAttention(o)) return false
      return matches(q, o.orderId, o.name, o.email, o.phone)
    })
  }, [rows, q, show])
  const view = useListView(matching, { sorts: ORDER_SORTS, dateOf: orderDate })

  async function verify(orderId: string) {
    setBusy(orderId)
    setNote(null)
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/verify`, { method: 'POST' })
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string }
    setNote(body.ok ? `${orderId}: ${STATUS_WORDS[body.status ?? ''] ?? body.status}` : `${orderId}: ${body.error}`)
    await reload()
    setBusy(null)
  }

  if (error) return <p className="admin-notice is-error">{error}</p>
  if (!rows) return <p className="admin-empty">Loading orders…</p>

  // The money boxes count paid orders in what is on screen — every filter,
  // the dates included — the way menler's "Revenue (matching)" does.
  const paidShown = view.all.filter((o) => o.status !== 'created')
  const thisMonth = istMonth(new Date().toISOString())
  const paidAll = rows.filter((o) => o.status !== 'created')
  const narrowed = q.trim() !== '' || view.controls.from !== '' || view.controls.to !== '' || show !== 'paid'
  const open = rows.find((o) => o.orderId === openId) ?? null

  return (
    <section className="panel panel-wide">
      <header className="panel-head">
        <div>
          <h2>Orders</h2>
          <p>Every order placed at checkout — paid, and the ones that were opened and abandoned.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-quiet"
          onClick={() =>
            downloadCsv(
              'skeo-orders',
              ['Order', 'Created', 'Paid', 'Name', 'Email', 'Phone', 'Items', 'Amount', 'Status', 'LMS account', 'Playbooks'],
              view.all.map((o) => [
                o.orderId,
                when(o.createdAt),
                when(o.paidAt),
                o.name,
                o.email,
                o.phone,
                itemNames(o.items),
                o.amount,
                STATUS_WORDS[o.status],
                o.lmsDone ? (o.lmsAccountCreated ? 'created' : 'added to existing') : 'no',
                o.playbooks.map((p) => `${p.label}: ${p.sent ? 'sent' : 'not sent'}`).join('; '),
              ]),
            )
          }
        >
          ⭳ Export CSV
        </button>
      </header>

      <div className="money-boxes">
        <div className="money-box">
          <span>{narrowed ? 'Revenue (matching)' : 'Total revenue'}</span>
          <b>{rupees(paidShown.reduce((n, o) => n + o.amount, 0))}</b>
          <small>{paidShown.length} paid {paidShown.length === 1 ? 'order' : 'orders'}</small>
        </div>
        <div className="money-box">
          <span>This month</span>
          <b>{rupees(paidAll.filter((o) => o.paidAt && istMonth(o.paidAt) === thisMonth).reduce((n, o) => n + o.amount, 0))}</b>
          <small>{paidAll.filter((o) => o.paidAt && istMonth(o.paidAt) === thisMonth).length} payments</small>
        </div>
        <div className="money-box">
          <span>Payments</span>
          <b>{paidAll.length}</b>
          <small>{rows.length - paidAll.length} opened, not paid</small>
        </div>
        <div className={`money-box${rows.filter(needsAttention).length ? ' is-warn' : ''}`}>
          <span>Needs attention</span>
          <b>{rows.filter(needsAttention).length}</b>
          <small>paid, something not delivered</small>
        </div>
      </div>

      <Toolbar q={q} setQ={setQ} placeholder="Search name, email, phone, order id…">
        <div className="seg" role="group" aria-label="Which orders">
          {(['paid', 'attention', 'all'] as const).map((k) => (
            <button key={k} type="button" className={show === k ? 'is-on' : ''} onClick={() => setShow(k)}>
              {k === 'paid' ? 'Paid' : k === 'attention' ? 'Needs attention' : 'All, incl. unpaid'}
            </button>
          ))}
        </div>
      </Toolbar>
      <ListControls {...view.controls} dateLabel="Paid" />
      {note && <p className="admin-notice">{note}</p>}

      {view.all.length === 0 ? (
        <p className="admin-empty">{show === 'attention' ? 'Nothing needs attention.' : 'No orders here.'}</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Bought</th>
                <th className="n">Amount</th>
                <th>Payment</th>
                <th>LMS login</th>
                <th>Playbooks</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {view.shown.map((o) => (
                <tr key={o.orderId} {...openRow(() => setOpenId(o.orderId))}>
                  <td>
                    <b className="mono">{o.orderId}</b>
                    <small>{when(o.paidAt ?? o.createdAt)}</small>
                  </td>
                  <td className="wrap">
                    <b>{o.name || '—'}</b>
                    <small>
                      {o.email} · {o.phone}
                    </small>
                  </td>
                  <td className="wrap">{itemNames(o.items)}</td>
                  <td className="n">{rupees(o.amount)}</td>
                  <td>{o.status === 'created' ? <Status tone="quiet">Not paid</Status> : <Status tone="paid">Paid {rupees(o.amount)}</Status>}</td>
                  <td>
                    <LmsStatus o={o} />
                  </td>
                  <td>
                    {o.playbooks.length === 0 ? (
                      <Status tone="quiet">—</Status>
                    ) : (
                      o.playbooks.map((p) => (
                        <div key={p.set}>
                          <Status tone={p.sent ? 'good' : o.status === 'created' ? 'quiet' : 'warn'}>
                            {p.label}: {p.sent ? 'sent' : 'not sent'}
                          </Status>
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-quiet"
                      disabled={busy === o.orderId}
                      onClick={() => void verify(o.orderId)}
                      title="Ask Cashfree for this order's status, and finish anything left undone"
                    >
                      {busy === o.orderId ? 'Checking…' : 'Verify with Cashfree'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager {...view.pager} />
      <p className="panel-note">
        Click an order for everything recorded about it. <b>Verify with Cashfree</b> asks Cashfree for the
        order&rsquo;s status; if it is paid, it records the sale and has the LMS finish anything left undone — the
        login mail, the playbooks. Safe to press any number of times.
      </p>

      {open && (
        <Drawer title="Order detail" onClose={() => setOpenId(null)}>
          <Facts
            rows={[
              ['Name', open.name || '—'],
              ['Email', <a key="e" href={`mailto:${open.email}`}>{open.email}</a>],
              ['Phone', open.phone ? <a key="p" href={`tel:${open.phone.replace(/\s/g, '')}`}>{open.phone}</a> : '—'],
            ]}
          />
          <Facts
            title="The order"
            rows={[
              ['Order ID', <span key="o" className="mono">{open.orderId}</span>],
              ['Bought', itemNames(open.items)],
              ['Amount', rupees(open.amount)],
              ['Status', open.status === 'created' ? <Status key="s" tone="quiet">Not paid</Status> : <Status key="s" tone="paid">Paid</Status>],
              ['Opened checkout', when(open.createdAt)],
              ['Paid on', open.paidAt ? when(open.paidAt) : null],
            ]}
          />
          <Facts
            title="Delivery"
            rows={[
              ['LMS login', <LmsStatus key="l" o={open} />],
              ['Batches', open.batches.length ? open.batches.join(', ') : null],
              ...open.playbooks.map(
                (p): [string, React.ReactNode] => [
                  p.label,
                  <Status key={p.set} tone={p.sent ? 'good' : open.status === 'created' ? 'quiet' : 'warn'}>
                    {p.sent ? 'Received' : p.partsSent > 0 ? `Part ${p.partsSent} of ${p.total} only` : 'Not received'}
                  </Status>,
                ],
              ),
              ['Last error', open.lastError ? <span key="x" className="err-line">{open.lastError}</span> : null],
              ['Warnings', open.warnings.length ? open.warnings.join(' · ') : null],
            ]}
          />
          <div className="drawer-actions">
            <button type="button" className="admin-btn" disabled={busy === open.orderId} onClick={() => void verify(open.orderId)}>
              {busy === open.orderId ? 'Checking…' : 'Verify with Cashfree'}
            </button>
          </div>
        </Drawer>
      )}
    </section>
  )
}

function LmsStatus({ o }: { o: AdminOrder }) {
  return (
    <>
      {!needsLogin(o) ? (
        <Status tone="quiet">Not needed</Status>
      ) : o.lmsDone ? (
        <Status tone="good">{o.lmsAccountCreated ? 'Sent' : 'Added to account'}</Status>
      ) : o.status === 'created' ? (
        <Status tone="quiet">—</Status>
      ) : (
        <Status tone="warn">Not sent</Status>
      )}
      {o.lastError && !o.lmsDone && <small className="err-line">{o.lastError}</small>}
      {o.warnings.map((w) => (
        <small key={w} className="err-line">
          {w}
        </small>
      ))}
    </>
  )
}

const STATUS_WORDS: Record<string, string> = {
  created: 'not paid',
  pending: 'not paid yet',
  failed: 'payment failed',
  paid: 'paid — the LMS has not finished yet',
  provisioned: 'paid and delivered',
  unknown: 'no such order',
}

/** Only mail-only purchases (Claude Playbooks, AI Library) need no LMS login. */
const needsLogin = (o: AdminOrder) => o.items.some((i) => i !== 'playbooks' && i !== 'library')

export const needsAttention = (o: AdminOrder) =>
  o.status !== 'created' && (!o.lmsDone || o.playbooks.some((p) => !p.sent) || o.warnings.length > 0)

/* ======================================================================== *
 * Playbooks — who has them, who does not, and a button to send them
 * ======================================================================== */

export function PlaybooksTab() {
  const { rows, error, reload } = useAdminList<PlaybookRow>('/api/admin/playbooks', 'rows')
  const [q, setQ] = useState('')
  const [show, setShow] = useState<'all' | 'missing'>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const list = useMemo(() => {
    if (!rows) return []
    return rows.filter(
      (r) => (show === 'all' || r.playbooks.some((p) => !p.sent)) && matches(q, r.name, r.email, r.phone, r.orderId),
    )
  }, [rows, q, show])

  async function send(key: string, payload: Record<string, unknown>, who: string) {
    setBusy(key)
    setNote(null)
    const res = await fetch('/api/admin/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: string[]; error?: string }
    setNote(
      body.ok
        ? { tone: 'ok', text: `Sent to ${who} — ${body.sent?.length ?? 0} email${body.sent?.length === 1 ? '' : 's'}.` }
        : { tone: 'error', text: `Not sent to ${who}: ${body.error}` },
    )
    await reload()
    setBusy(null)
    return Boolean(body.ok)
  }

  if (error) return <p className="admin-notice is-error">{error}</p>
  if (!rows) return <p className="admin-empty">Loading…</p>

  const missing = rows.filter((r) => r.playbooks.some((p) => !p.sent)).length

  return (
    <>
      <section className="panel panel-wide">
        <header className="panel-head">
          <div>
            <h2>Playbooks</h2>
            <p>
              {rows.length} {rows.length === 1 ? 'person' : 'people'} should have them · {missing} still waiting
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-quiet"
            onClick={() =>
              downloadCsv(
                'skeo-playbooks',
                ['Name', 'Email', 'Phone', 'Order', 'Bought / sent on', 'Claude Playbooks', 'AI Library', 'Last sent'],
                list.map((r) => {
                  const of = (set: PlaybookSet) => {
                    const p = r.playbooks.find((x) => x.set === set)
                    return p ? (p.sent ? 'sent' : 'not sent') : '—'
                  }
                  return [r.name, r.email, r.phone, r.orderId ?? 'sent by hand', when(r.at), of('claude'), of('ai'), when(r.lastSentAt)]
                }),
              )
            }
          >
            Export CSV
          </button>
        </header>

        <Toolbar q={q} setQ={setQ} placeholder="Search name, email, phone, order id…">
          <div className="seg" role="group" aria-label="Which people">
            <button type="button" className={show === 'all' ? 'is-on' : ''} onClick={() => setShow('all')}>
              Everyone
            </button>
            <button type="button" className={show === 'missing' ? 'is-on' : ''} onClick={() => setShow('missing')}>
              Not received
            </button>
          </div>
        </Toolbar>
        {note && <p className={`admin-notice${note.tone === 'error' ? ' is-error' : ''}`}>{note.text}</p>}

        {list.length === 0 ? (
          <p className="admin-empty">{show === 'missing' ? 'Everyone has their playbooks.' : 'Nobody has bought playbooks yet.'}</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Claude Playbooks</th>
                  <th>AI Library</th>
                  <th>Last sent</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const key = r.orderId ?? `${r.email}-${r.at}`
                  const cell = (set: PlaybookSet) => {
                    const p = r.playbooks.find((x) => x.set === set)
                    if (!p) return <Status tone="quiet">—</Status>
                    return p.sent ? (
                      <Status tone="good">Received</Status>
                    ) : (
                      <Status tone="warn">{p.partsSent > 0 ? `Part ${p.partsSent} of ${p.total} only` : 'Not received'}</Status>
                    )
                  }
                  const allSent = r.playbooks.every((p) => p.sent)
                  return (
                    <tr key={key}>
                      <td className="wrap">
                        <b>{r.name || '—'}</b>
                        <small>
                          {r.email}
                          {r.phone ? ` · ${r.phone}` : ''}
                        </small>
                        <small>{r.orderId ? `${r.orderId} · ${when(r.at)}` : `Sent by hand · ${when(r.at)}`}</small>
                      </td>
                      <td>{cell('claude')}</td>
                      <td>{cell('ai')}</td>
                      <td>{when(r.lastSentAt)}</td>
                      <td>
                        <button
                          type="button"
                          className={`admin-btn${allSent ? ' admin-btn-quiet' : ''}`}
                          disabled={busy === key}
                          onClick={() => {
                            const sets = r.playbooks.map((p) => p.set)
                            const what = r.playbooks.map((p) => p.label).join(' and ')
                            if (allSent && !window.confirm(`${r.email} already has ${what}. Send ${what} again?`)) return
                            void send(key, r.orderId ? { orderId: r.orderId } : { email: r.email, name: r.name, sets }, r.email)
                          }}
                        >
                          {busy === key ? 'Sending…' : allSent ? 'Resend' : 'Send now'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="panel-note">
          Playbooks go out on their own once a payment is confirmed. <b>Send now</b> covers anyone they did not reach;{' '}
          <b>Resend</b> is for someone who lost the email. The AI Library is two emails (part 1 and part 2), and only
          counts as received when both have gone.
        </p>
      </section>

      <ManualSend onSend={send} busy={busy === 'manual'} />
    </>
  )
}

/** Send to someone with no website order — paid by a link, say, or a gift. */
function ManualSend({
  onSend,
  busy,
}: {
  onSend: (key: string, payload: Record<string, unknown>, who: string) => Promise<boolean>
  busy: boolean
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sets, setSets] = useState<PlaybookSet[]>(['claude'])
  const toggle = (s: PlaybookSet) => setSets((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  return (
    <section className="panel panel-wide">
      <header className="panel-head">
        <div>
          <h2>Send playbooks to someone</h2>
          <p>For a buyer with no order on the website — paid another way, or a gift. They appear in the list above.</p>
        </div>
      </header>
      <form
        className="manual-send"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!sets.length) return
          const ok = await onSend('manual', { email, name, sets }, email)
          if (ok) {
            setEmail('')
            setName('')
          }
        }}
      >
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={sets.includes('claude')} onChange={() => toggle('claude')} /> Claude Playbooks
        </label>
        <label className="check">
          <input type="checkbox" checked={sets.includes('ai')} onChange={() => toggle('ai')} /> AI Library
        </label>
        <button type="submit" className="admin-btn" disabled={busy || !sets.length}>
          {busy ? 'Sending…' : 'Send playbooks'}
        </button>
      </form>
    </section>
  )
}

/* ======================================================================== *
 * Leads — everyone who verified at checkout, paid or not
 * ======================================================================== */

const LEAD_SORTS: SortOption<Lead>[] = [
  { key: 'new', label: 'Newest first', compare: (a, b) => Date.parse(b.at) - Date.parse(a.at) },
  { key: 'old', label: 'Oldest first', compare: (a, b) => Date.parse(a.at) - Date.parse(b.at) },
  { key: 'name', label: 'Name A–Z', compare: (a, b) => (a.name || a.email).localeCompare(b.name || b.email) },
]
const leadDate = (l: Lead) => l.at

export function LeadsTab() {
  const { rows, error } = useAdminList<Lead>('/api/admin/leads', 'leads')
  const [q, setQ] = useState('')
  const [show, setShow] = useState<'all' | 'unpaid' | 'paid'>('unpaid')
  const [openEmail, setOpenEmail] = useState<string | null>(null)

  const matching = useMemo(() => {
    if (!rows) return []
    return rows.filter(
      (l) => (show === 'all' || (show === 'paid' ? l.paid : !l.paid)) && matches(q, l.name, l.email, l.phone),
    )
  }, [rows, q, show])
  const view = useListView(matching, { sorts: LEAD_SORTS, dateOf: leadDate })

  if (error) return <p className="admin-notice is-error">{error}</p>
  if (!rows) return <p className="admin-empty">Loading leads…</p>

  const paid = rows.filter((l) => l.paid).length
  const open = rows.find((l) => l.email === openEmail) ?? null

  return (
    <section className="panel panel-wide">
      <header className="panel-head">
        <div>
          <h2>Leads</h2>
          <p>Everyone who confirmed their phone at checkout. The ones who did not pay are your call-back list.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-quiet"
          onClick={() =>
            downloadCsv(
              'skeo-leads',
              ['Name', 'Email', 'Phone', 'Wanted', 'Verified on', 'Paid', 'Order', 'Amount'],
              view.all.map((l) => [l.name, l.email, l.phone, itemNames(l.items), when(l.at), l.paid ? 'yes' : 'no', l.orderId ?? '', l.paid ? l.amount : '']),
            )
          }
        >
          ⭳ Export CSV
        </button>
      </header>

      <div className="money-boxes">
        <div className="money-box">
          <span>Leads</span>
          <b>{rows.length}</b>
          <small>verified at checkout</small>
        </div>
        <div className="money-box">
          <span>Paid</span>
          <b>{paid}</b>
          <small>{rows.length ? Math.round((paid / rows.length) * 100) : 0}% of leads</small>
        </div>
        <div className={`money-box${rows.length - paid ? ' is-warn' : ''}`}>
          <span>Did not pay</span>
          <b>{rows.length - paid}</b>
          <small>to call back</small>
        </div>
      </div>

      <Toolbar q={q} setQ={setQ} placeholder="Search name, email, phone…">
        <div className="seg" role="group" aria-label="Which leads">
          {(['unpaid', 'paid', 'all'] as const).map((k) => (
            <button key={k} type="button" className={show === k ? 'is-on' : ''} onClick={() => setShow(k)}>
              {k === 'unpaid' ? 'Did not pay' : k === 'paid' ? 'Paid' : 'Everyone'}
            </button>
          ))}
        </div>
      </Toolbar>
      <ListControls {...view.controls} dateLabel="Verified" />

      {view.all.length === 0 ? (
        <p className="admin-empty">No leads here.</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Wanted</th>
                <th>Verified</th>
                <th>Checkout</th>
              </tr>
            </thead>
            <tbody>
              {view.shown.map((l) => (
                <tr key={l.email} {...openRow(() => setOpenEmail(l.email))}>
                  <td>
                    <b>{l.name || '—'}</b>
                  </td>
                  <td className="wrap">
                    {l.phone ? <a href={`tel:${l.phone.replace(/\s/g, '')}`}>{l.phone}</a> : '—'}
                    <small>{l.email}</small>
                  </td>
                  <td className="wrap">{itemNames(l.items) || '—'}</td>
                  <td>{when(l.at)}</td>
                  <td>{l.paid ? <Status tone="paid">Paid {rupees(l.amount)}</Status> : <Status tone="warn">Pending</Status>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager {...view.pager} />
      <p className="panel-note">
        Click a lead for their details. A lead is anyone who confirmed their phone with the one-time code at
        checkout; leads from before this list existed have no phone number recorded.
      </p>

      {open && (
        <Drawer title="Lead detail" onClose={() => setOpenEmail(null)}>
          <Facts
            rows={[
              ['Name', open.name || '—'],
              ['Email', <a key="e" href={`mailto:${open.email}`}>{open.email}</a>],
              ['Phone', open.phone ? <a key="p" href={`tel:${open.phone.replace(/\s/g, '')}`}>{open.phone}</a> : '—'],
            ]}
          />
          <Facts
            title="At checkout"
            rows={[
              ['Wanted', itemNames(open.items) || '—'],
              ['Verified on', when(open.at)],
              ['Checkout', open.paid ? <Status key="s" tone="paid">Paid {rupees(open.amount)}</Status> : <Status key="s" tone="warn">Pending — did not pay</Status>],
              ['Order ID', open.orderId ? <span key="o" className="mono">{open.orderId}</span> : null],
            ]}
          />
          {!open.paid && open.phone && (
            <div className="drawer-actions">
              <a className="admin-btn" href={`tel:${open.phone.replace(/\s/g, '')}`}>
                Call {open.name.split(' ')[0] || 'them'}
              </a>
              <a className="admin-btn admin-btn-quiet" href={`https://wa.me/${open.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          )}
        </Drawer>
      )}
    </section>
  )
}
