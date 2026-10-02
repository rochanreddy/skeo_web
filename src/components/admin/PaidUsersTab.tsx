'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaidRow } from '@/lib/admin/paid'
import type { FoundPayment } from '@/lib/payments/cashfree'
import { CHECKOUT_ROWS } from '@/lib/checkoutItems'
import { Status, downloadCsv, matches, rupees, when } from './AdminTabs'
import { Drawer, Facts, ListControls, Pager, openRow, useListView, type SortOption } from './AdminList'

/**
 * Paid users — menler's Paid users tab, for skeo: every payment, website or
 * not, and a way to record money taken off the website.
 *
 * Verification is the default path for a recorded payment: paste the Cashfree
 * Order ID (or transaction / payment-link id) and it checks itself, and the
 * amount and payer come from Cashfree. Recording without it stays possible —
 * a payment you cannot find an id for still happened — but it has to be
 * chosen, needs a transaction id, and is marked Unverified until checked.
 */

const IST_DAY = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
const monthLabel = (m: string) => new Date(`${m}-01T12:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
const istMonth = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).slice(0, 7)
const viaLabel = (r: PaidRow) => (r.source === 'website' ? 'Website' : r.verified ? 'Link · verified' : 'Unverified')

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init, headers: init?.body ? { 'Content-Type': 'application/json' } : undefined })
  if (res.status === 401) {
    window.location.href = '/admin/login'
    throw new Error('Signed out.')
  }
  const body = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string }
  if (!body.ok) throw new Error(body.error || `Something went wrong (${res.status}).`)
  return body
}

const SORTS: SortOption<PaidRow>[] = [
  { key: 'new', label: 'Newest first', compare: (a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt) },
  { key: 'old', label: 'Oldest first', compare: (a, b) => Date.parse(a.paidAt) - Date.parse(b.paidAt) },
  { key: 'amount', label: 'Amount, high to low', compare: (a, b) => b.amount - a.amount },
  { key: 'name', label: 'Name A–Z', compare: (a, b) => (a.name || a.email).localeCompare(b.name || b.email) },
]
const paidOf = (r: PaidRow) => r.paidAt

export function PaidUsersTab() {
  const [rows, setRows] = useState<PaidRow[] | null>(null)
  const [cashfree, setCashfree] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [batch, setBatch] = useState('')
  const [via, setVia] = useState<'all' | 'website' | 'manual' | 'unverified'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [flash, setFlash] = useState('')

  const load = useCallback(async () => {
    try {
      const body = await api<{ rows: PaidRow[]; cashfree: boolean }>('/api/admin/paid')
      setRows(body.rows)
      setCashfree(body.cashfree)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load payments.')
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  const matching = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (batch === '' || (batch === 'none' ? !r.batch : r.batch === batch)) &&
          (via === 'all' || (via === 'website' ? r.source === 'website' : via === 'manual' ? r.source === 'manual' : r.source === 'manual' && !r.verified)) &&
          matches(q, r.name, r.email, r.phone, r.program, r.id, r.cfOrderId, r.transactionId, r.note),
      ),
    [rows, q, batch, via],
  )
  const view = useListView(matching, { sorts: SORTS, dateOf: paidOf })

  async function setRowBatch(r: PaidRow, value: string) {
    try {
      await api(`/api/admin/paid/${encodeURIComponent(r.id)}`, { method: 'PATCH', body: JSON.stringify({ batch: value }) })
      setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, batch: value } : x)) ?? rs)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not set the batch.')
    }
  }

  async function remove(r: PaidRow) {
    const lms = r.access && r.lmsDone ? '\n\nTheir LMS account stays — deleting this only removes the payment from the list.' : ''
    if (!window.confirm(`Delete the payment added by hand for “${r.name || r.email}” (${rupees(r.amount)})?${lms}`)) return
    try {
      await api(`/api/admin/paid/${encodeURIComponent(r.id)}`, { method: 'DELETE' })
      setOpenId(null)
      await load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not delete it.')
    }
  }

  const closeOpen = useCallback(() => setOpenId(null), [])
  const closeAdd = useCallback(() => setAdding(false), [])

  if (error) return <p className="admin-notice is-error">{error}</p>
  if (!rows) return <p className="admin-empty">Loading payments…</p>

  const filtered = Boolean(q || batch || via !== 'all' || view.controls.from || view.controls.to)
  const revenue = view.all.reduce((n, r) => n + r.amount, 0)
  const month = istMonth(new Date().toISOString())
  const thisMonth = view.all.filter((r) => istMonth(r.paidAt) === month)
  const manual = view.all.filter((r) => r.source === 'manual').length
  const unverified = rows.filter((r) => r.source === 'manual' && !r.verified).length
  // Every batch that exists, ignoring the batch filter — else picking one empties the list it was picked from.
  const batches = [...rows.reduce((m, r) => (r.batch ? m.set(r.batch, [(m.get(r.batch)?.[0] ?? 0) + 1, (m.get(r.batch)?.[1] ?? 0) + r.amount]) : m), new Map<string, [number, number]>())].sort((a, b) =>
    b[0].localeCompare(a[0]),
  )
  const unbatched = rows.filter((r) => !r.batch).length
  // Programmes already typed in, so the same thing is not recorded three ways.
  const otherPrograms = [...new Set(rows.filter((r) => r.source === 'manual' && !r.items.length).map((r) => r.program))].slice(0, 8)
  const open = rows.find((r) => r.id === openId) ?? null

  return (
    <section className="panel panel-wide">
      <header className="panel-head">
        <div>
          <h2>Paid users</h2>
          <p>Every payment — from the website, and the ones taken off it and recorded here.</p>
        </div>
        <div className="panel-head-actions">
          <button type="button" className="admin-btn" onClick={() => { setFlash(''); setAdding(true) }}>
            + Record a payment
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-quiet"
            onClick={() =>
              downloadCsv(
                'skeo-paid-users',
                ['Name', 'Email', 'Phone', 'Course', 'Batch', 'Amount', 'Actual price', 'Sold price', 'Payment cycle', 'Paid by', 'EMI', 'Payment detail', 'Via', 'Order ID', 'Cashfree order', 'Transaction ID', 'Bank reference', 'Paid on', 'LMS access', 'Note'],
                view.all.map((r) => [
                  r.name, r.email, r.phone, r.program, r.batch, r.amount, r.deal.actualPrice ?? '', r.deal.soldPrice ?? '', r.deal.cycle ?? '',
                  r.method?.label ?? '', r.method?.emi ? 'yes' : '', r.method?.detail ?? '', viaLabel(r), r.id, r.cfOrderId, r.transactionId,
                  r.method?.reference ?? '', when(r.paidAt), r.source === 'website' || r.access ? (r.lmsDone ? 'given' : 'pending') : 'not asked', r.note,
                ]),
              )
            }
          >
            ⭳ Export CSV
          </button>
        </div>
      </header>

      {flash && (
        <p className="admin-notice is-ok">
          {flash}{' '}
          <button type="button" onClick={() => setFlash('')}>
            Dismiss
          </button>
        </p>
      )}

      <div className="money-boxes">
        <div className="money-box">
          <span>{filtered ? 'Revenue (matching)' : 'Total revenue'}</span>
          <b>{rupees(revenue)}</b>
          <small>{view.all.length} payments</small>
        </div>
        <div className="money-box">
          <span>This month</span>
          <b>{rupees(thisMonth.reduce((n, r) => n + r.amount, 0))}</b>
          <small>{thisMonth.length} payments</small>
        </div>
        <div className="money-box">
          <span>Payments</span>
          <b>{view.all.length}</b>
          <small>{view.all.length - manual} on the website</small>
        </div>
        <div className="money-box">
          <span>Added by hand</span>
          <b>{manual}</b>
          <small>{unverified ? `${unverified} not verified` : 'all verified'}</small>
        </div>
      </div>

      {unverified > 0 && (
        <p className="admin-notice is-warn">
          <b>
            {unverified} payment{unverified === 1 ? ' was' : 's were'} typed in by hand and never checked.
          </b>{' '}
          Their amounts may not match what Cashfree received. Click <b>Unverified · Verify →</b> on the row to check it against Cashfree and correct it.
          <button type="button" onClick={() => setVia('unverified')}>
            Show them
          </button>
        </p>
      )}

      {!cashfree && (
        <p className="admin-notice is-warn">
          Cashfree keys are not set on this server, so payments can only be recorded unverified for now.
        </p>
      )}

      <div className="tab-toolbar">
        <input className="tab-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, course, order or transaction id…" />
        <div className="seg" role="group" aria-label="Which payments">
          {(
            [
              ['all', 'All'],
              ['website', 'Website'],
              ['manual', 'Added by hand'],
              ['unverified', 'Unverified'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" className={via === k ? 'is-on' : ''} onClick={() => setVia(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="list-controls-row">
        <ListControls {...view.controls} dateLabel="Paid" />
        <label className="list-field">
          <span>Batch</span>
          <select value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="">All batches</option>
            {batches.map(([m, [n, amount]]) => (
              <option key={m} value={m}>
                {monthLabel(m)} — {n} · {rupees(amount)}
              </option>
            ))}
            {unbatched > 0 && <option value="none">No batch set — {unbatched}</option>}
          </select>
        </label>
      </div>

      {view.all.length === 0 ? (
        <p className="admin-empty">{rows.length ? 'No payments match.' : 'No payments yet.'}</p>
      ) : (
        <div className="table-scroll">
          <table className="admin-table paid-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th className="n">Amount</th>
                <th>Via</th>
                <th>Paid on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {view.shown.map((r) => (
                <tr key={r.id} {...openRow(() => setOpenId(r.id))}>
                  <td className="wrap">
                    <b>{r.name || '—'}</b>
                    <small>{[r.email, r.phone].filter(Boolean).join(' · ') || '—'}</small>
                  </td>
                  <td className="wrap">
                    {r.program || '—'}
                    {r.deal.cycle && (
                      <small title={r.deal.actualPrice ? `List price ${rupees(r.deal.actualPrice)}` : ''}>
                        Payment {r.deal.cycle}
                        {r.deal.soldPrice ? ` · sold ${rupees(r.deal.soldPrice)}` : ''}
                      </small>
                    )}
                  </td>
                  <td>
                    {/* Editable in place: checkout never asks which cohort someone is joining. */}
                    <input type="month" className={`batch-cell${r.batch ? '' : ' is-empty'}`} value={r.batch} aria-label={`Batch for ${r.name}`} onChange={(e) => void setRowBatch(r, e.target.value)} />
                  </td>
                  <td className="n">
                    <b>{rupees(r.amount)}</b>
                    {r.method?.emi ? <small className="emi">EMI</small> : r.method && <small title={r.method.detail}>{r.method.label}</small>}
                  </td>
                  <td>
                    {r.source === 'website' ? (
                      <Status tone="good">Website</Status>
                    ) : r.verified ? (
                      <Status tone="good">Link · verified</Status>
                    ) : (
                      <button type="button" className="verify-chip" title="Typed in, never checked — click to check it against Cashfree" onClick={() => setOpenId(r.id)}>
                        <i aria-hidden="true" /> Unverified <span>Verify →</span>
                      </button>
                    )}
                  </td>
                  <td>{when(r.paidAt)}</td>
                  <td>
                    {r.source === 'manual' && (
                      <button type="button" className="row-del" aria-label={`Delete the payment added for ${r.name}`} title="Delete this manual entry" onClick={() => void remove(r)}>
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager {...view.pager} />
      <p className="panel-note">
        Click a payment for everything recorded about it. <b>Record a payment</b> is for money taken off the website — a Cashfree payment link, say. It counts in
        revenue, class attendance and Early Access seats like a website payment, and can give the buyer their LMS login. Only payments added by hand can be deleted.
      </p>

      {open && <PaymentDrawer row={open} onClose={closeOpen} onChanged={load} onDelete={() => void remove(open)} />}
      {adding && (
        <RecordDrawer
          cashfree={cashfree}
          otherPrograms={otherPrograms}
          onClose={closeAdd}
          onSaved={(message) => {
            setAdding(false)
            setFlash(message)
            void load()
          }}
        />
      )}
    </section>
  )
}

/* ======================================================================== *
 * One payment, and verifying it if it went in unverified
 * ======================================================================== */

function PaymentDrawer({ row: r, onClose, onChanged, onDelete }: { row: PaidRow; onClose: () => void; onChanged: () => Promise<void>; onDelete: () => void }) {
  const [ref, setRef] = useState(r.transactionId)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState<{ amount: { from: number; to: number } | null; name: { from: string; to: string } | null } | null>(null)

  async function verify(value = ref) {
    if (!value.trim()) return
    setBusy(true)
    setErr('')
    try {
      const res = await api<{ changed: NonNullable<typeof done> }>(`/api/admin/paid/${encodeURIComponent(r.id)}/verify`, { method: 'POST', body: JSON.stringify({ reference: value.trim() }) })
      setDone(res.changed)
      await onChanged()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not verify it.')
    } finally {
      setBusy(false)
    }
  }

  const off = r.deal.actualPrice && r.deal.soldPrice && r.deal.soldPrice < r.deal.actualPrice ? r.deal.actualPrice - r.deal.soldPrice : 0
  return (
    <Drawer title="Payment detail" onClose={onClose}>
      {r.source === 'manual' && !r.verified && !done && (
        <div className="verify-box">
          <b>Not verified</b>
          <p>This was typed in by hand, so its amount has never been checked. Paste the Transaction ID or the Order ID — Cashfree&rsquo;s amount and payer replace what was typed.</p>
          <div className="lookup">
            <input
              value={ref}
              spellCheck={false}
              placeholder="5114772211 or order_1739…"
              disabled={busy}
              onChange={(e) => { setRef(e.target.value); setErr('') }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text').trim()
                if (pasted) {
                  e.preventDefault()
                  setRef(pasted)
                  void verify(pasted)
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && void verify()}
            />
            <button type="button" className="admin-btn" disabled={busy || !ref.trim()} onClick={() => void verify()}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </div>
          {err && <p className="admin-notice is-error">{err}</p>}
        </div>
      )}
      {done && (
        <p className={`admin-notice ${done.amount || done.name ? 'is-warn' : 'is-ok'}`}>
          <b>Verified.</b>{' '}
          {done.amount || done.name ? (
            <>
              Cashfree disagreed with what was typed, and Cashfree wins:
              {done.amount && <> amount {rupees(done.amount.from)} → <b>{rupees(done.amount.to)}</b>.</>}
              {done.name && <> Name “{done.name.from}” → <b>“{done.name.to}”</b>.</>}
            </>
          ) : (
            'Everything matched what Cashfree holds.'
          )}
        </p>
      )}

      <Facts
        rows={[
          ['Name', r.name || '—'],
          ['Email', r.email ? <a key="e" href={`mailto:${r.email}`}>{r.email}</a> : '—'],
          ['Phone', r.phone ? <a key="p" href={`tel:${r.phone.replace(/\s/g, '')}`}>{r.phone}</a> : '—'],
        ]}
      />
      <Facts
        title="The payment"
        rows={[
          ['Course', r.program || '—'],
          ['Batch', r.batch ? monthLabel(r.batch) : 'not set'],
          ['Amount', rupees(r.amount)],
          ['Actual price', r.deal.actualPrice ? rupees(r.deal.actualPrice) : null],
          ['Sold price', r.deal.soldPrice ? `${rupees(r.deal.soldPrice)}${off ? ` (${rupees(off)} off)` : ''}` : null],
          ['Payment cycle', r.deal.cycle ? `Payment ${r.deal.cycle}` : null],
          ['Paid on', when(r.paidAt)],
          [
            'Via',
            r.source === 'website'
              ? 'Website checkout (Cashfree)'
              : `Recorded by hand — ${r.verified ? `verified against Cashfree${r.verifiedAt ? ` on ${when(r.verifiedAt)}` : ''}` : 'never verified'}`,
          ],
          ['Order ID', <span key="o" className="mono">{r.id}</span>],
          ['Cashfree order', r.cfOrderId && r.cfOrderId !== r.id ? <span key="c" className="mono">{r.cfOrderId}</span> : null],
          ['Transaction ID', r.transactionId ? <span key="t" className="mono">{r.transactionId}</span> : null],
        ]}
      />
      <Facts
        title="How it was paid"
        rows={[
          ['Method', r.method?.label ?? (r.source === 'website' ? 'Cashfree checkout' : 'Not recorded')],
          ['Instalments (EMI)', r.method ? (r.method.emi ? 'Yes — paid in instalments' : 'No — paid in full') : null],
          ['Card / account', r.method?.detail || null],
          ['Bank reference', r.method?.reference || null],
        ]}
      />
      <Facts
        title="Access"
        rows={[
          [
            'LMS login',
            r.source === 'manual' && !r.access ? (
              <Status key="l" tone="quiet">Not asked — recorded only</Status>
            ) : r.lmsDone ? (
              <Status key="l" tone="good">Given</Status>
            ) : (
              <Status key="l" tone="warn">Not done yet — see Orders</Status>
            ),
          ],
          ['LMS error', r.lmsError && !r.lmsDone ? r.lmsError : null],
        ]}
      />
      {r.note && <Facts title="Note" rows={[['Note', r.note]]} />}
      {r.source === 'manual' && (
        <div className="drawer-actions">
          <button type="button" className="admin-btn admin-btn-danger" onClick={onDelete}>
            Delete this entry
          </button>
        </div>
      )}
    </Drawer>
  )
}

/* ======================================================================== *
 * Record a payment
 * ======================================================================== */

const BLANK = { name: '', email: '', phone: '', program: '', other: '', amount: '', paidOn: '', batch: '', txnId: '', note: '', actualPrice: '', soldPrice: '', cycle: '1' }

function RecordDrawer({ cashfree, otherPrograms, onClose, onSaved }: { cashfree: boolean; otherPrograms: string[]; onClose: () => void; onSaved: (message: string) => void }) {
  const [f, setForm] = useState(BLANK)
  const set = (k: keyof typeof BLANK, v: string) => setForm((x) => ({ ...x, [k]: v }))
  const [ref, setRef] = useState('')
  const [found, setFound] = useState<FoundPayment | null>(null)
  const [checking, setChecking] = useState(false)
  const [manualMode, setManualMode] = useState(!cashfree)
  const [access, setAccess] = useState(true)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const product = CHECKOUT_ROWS.find((r) => r.key === f.program)
  const program = f.program === '__other' ? f.other.trim() : f.program

  async function check(raw = ref) {
    const value = raw.trim()
    if (!value) return
    setChecking(true)
    setErr('')
    setFound(null)
    try {
      const res = await api<{ payment: FoundPayment; duplicate: { name: string } | null }>('/api/admin/paid/lookup', { method: 'POST', body: JSON.stringify({ reference: value }) })
      if (res.duplicate) {
        setErr(`Already recorded — ${res.duplicate.name} has this payment. Adding it again would double-count revenue.`)
        return
      }
      const p = res.payment
      setFound(p)
      // Fill in what Cashfree knows. The course is left alone — only you know that.
      setForm((x) => ({
        ...x,
        name: p.customer.name || x.name,
        email: p.customer.email || x.email,
        phone: p.customer.phone || x.phone,
        amount: String(p.amount),
        txnId: p.cfPaymentId || x.txnId,
        paidOn: p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : x.paidOn,
      }))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not check that reference.')
    } finally {
      setChecking(false)
    }
  }

  function pickProgram(v: string) {
    const known = CHECKOUT_ROWS.find((r) => r.key === v)
    setForm((x) => ({
      ...x,
      program: v,
      // The usual price, still editable for a part payment — unless Cashfree already said.
      ...(known && !found ? { amount: String(known.amount) } : {}),
      // The list price is the course's; the sold price starts there too unless a deal was typed.
      ...(known ? { actualPrice: String(known.amount), ...(!x.soldPrice || x.soldPrice === x.actualPrice ? { soldPrice: String(known.amount) } : {}) } : {}),
    }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const res = await api<{ amount: number; verified: boolean; lms: 'not asked' | 'done' | 'pending' }>('/api/admin/paid', {
        method: 'POST',
        body: JSON.stringify({
          ...f,
          program,
          // Cashfree's own payment time beats the day shown in the form.
          paidOn: found ? '' : f.paidOn,
          reference: manualMode ? '' : ref.trim(),
          unverified: manualMode,
          access: Boolean(product) && access,
        }),
      })
      const lms =
        res.lms === 'done' ? ' Their LMS login has been sent.' : res.lms === 'pending' ? ' The LMS did not answer yet — Orders shows it under Needs attention, and Verify there retries.' : ''
      onSaved(`Recorded ${rupees(res.amount)} from ${f.name}${res.verified ? ', verified with Cashfree' : ', unverified'}.${lms}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not record it.')
      setSaving(false)
    }
  }

  const off = Number(f.actualPrice) > 0 && Number(f.soldPrice) > 0 && Number(f.soldPrice) < Number(f.actualPrice) ? Number(f.actualPrice) - Number(f.soldPrice) : 0
  const lock = Boolean(found)

  return (
    <Drawer title="Record a payment" onClose={onClose}>
      <form className="record-form" onSubmit={(e) => void save(e)}>
        <p className="record-lede">For money taken off the website — a Cashfree payment link, say.</p>

        <div className={`verify-box${found ? ' is-ok' : ''}`}>
          <label className="list-field wide">
            <span>Cashfree Order ID or Transaction ID {manualMode ? '— skipped' : '*'}</span>
            <div className="lookup">
              <input
                value={ref}
                disabled={manualMode}
                spellCheck={false}
                autoComplete="off"
                placeholder="5114772211 or order_1739…"
                onChange={(e) => { setRef(e.target.value); setFound(null); setErr('') }}
                onPaste={(e) => {
                  // Checks straight off the paste — a button press would be a step with no decision in it.
                  const pasted = e.clipboardData.getData('text').trim()
                  if (pasted) {
                    e.preventDefault()
                    setRef(pasted)
                    void check(pasted)
                  }
                }}
                onBlur={() => ref.trim() && !found && !checking && void check()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void check()
                  }
                }}
              />
              <button type="button" className="admin-btn" disabled={!ref.trim() || checking || manualMode} onClick={() => void check()}>
                {checking ? 'Checking…' : found ? 'Re-check' : 'Verify'}
              </button>
            </div>
          </label>
          {found ? (
            <p className="lookup-ok">
              ✓ Verified with Cashfree — {rupees(found.amount)} received{found.cfPaymentId ? ` · txn ${found.cfPaymentId}` : ''}
              {found.method ? ` · ${found.method.label}` : ''}. The details below came from Cashfree.
            </p>
          ) : manualMode ? (
            <p className="record-hint">
              Recording without verification.{' '}
              {cashfree && (
                <button type="button" className="linkish" onClick={() => { setManualMode(false); setErr('') }}>
                  Verify with an Order ID instead
                </button>
              )}
            </p>
          ) : (
            <p className="record-hint">
              Paste it and it checks itself. Cashfree dashboard → Payments → open the payment → copy the <b>Order ID</b>.{' '}
              <button type="button" className="linkish" onClick={() => { setManualMode(true); setRef(''); setFound(null); setErr('') }}>
                Can&rsquo;t find it? Record it unverified
              </button>
            </p>
          )}
        </div>

        {manualMode && (
          <p className="admin-notice is-warn">
            <b>Recording without verification.</b> Fill everything in yourself, including the Transaction ID — it is the only thing tying this row to a real
            payment. It counts in revenue and is marked <b>Unverified</b> until someone checks it.
          </p>
        )}

        <div className="record-grid">
          <label className="list-field">
            <span>Full name *</span>
            <input required value={f.name} readOnly={lock && Boolean(found?.customer.name)} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="list-field">
            <span>Email{product && access ? ' *' : ''}</span>
            <input type="email" required={Boolean(product) && access} value={f.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label className="list-field">
            <span>Phone</span>
            <input value={f.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>
          <label className="list-field">
            <span>Paid on</span>
            <input type="date" value={f.paidOn} max={IST_DAY()} readOnly={lock} onChange={(e) => set('paidOn', e.target.value)} />
          </label>
        </div>

        <label className="list-field wide">
          <span>Course / what they paid for *</span>
          <select required value={f.program} onChange={(e) => pickProgram(e.target.value)}>
            <option value="">Select…</option>
            {CHECKOUT_ROWS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.title} — {rupees(r.amount)}
              </option>
            ))}
            {otherPrograms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="__other">Something else…</option>
          </select>
        </label>
        {f.program === '__other' && (
          <label className="list-field wide">
            <span>Name it *</span>
            <input required placeholder="e.g. mentoring, workshop" value={f.other} onChange={(e) => set('other', e.target.value)} />
          </label>
        )}

        <div className="record-grid three">
          <label className="list-field">
            <span>Actual price (₹)</span>
            <input type="number" min="1" placeholder="List price" value={f.actualPrice} onChange={(e) => set('actualPrice', e.target.value)} />
          </label>
          <label className="list-field">
            <span>Sold price (₹)</span>
            <input type="number" min="1" placeholder="What they were charged" value={f.soldPrice} onChange={(e) => set('soldPrice', e.target.value)} />
            {off > 0 && (
              <em className="record-hint">
                {rupees(off)} off ({Math.round((off / Number(f.actualPrice)) * 100)}% discount)
              </em>
            )}
          </label>
          <label className="list-field">
            <span>Payment cycle</span>
            <select value={f.cycle} onChange={(e) => set('cycle', e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                  {n === 1 ? ' — first payment' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="record-grid">
          <label className="list-field">
            <span>Amount paid (₹) *{found ? ' — from Cashfree' : ''}</span>
            <input required type="number" min="1" step="any" value={f.amount} readOnly={lock} onChange={(e) => set('amount', e.target.value)} />
          </label>
          <label className="list-field">
            <span>Batch month</span>
            <input type="month" value={f.batch} onChange={(e) => set('batch', e.target.value)} />
          </label>
        </div>

        <label className="list-field wide">
          <span>Cashfree Transaction ID{found ? ' — from Cashfree' : manualMode ? ' *' : ''}</span>
          <input className="mono" placeholder="e.g. 5114772211" required={manualMode} readOnly={lock} value={f.txnId} onChange={(e) => set('txnId', e.target.value)} />
        </label>

        <label className="list-field wide">
          <span>Note — optional</span>
          <input placeholder="Anything worth remembering" value={f.note} onChange={(e) => set('note', e.target.value)} />
        </label>

        {product && (
          <label className="access-tick">
            <input type="checkbox" checked={access} onChange={(e) => setAccess(e.target.checked)} />
            <span>
              <b>Give them access now</b> — create their skeo LMS account and email the login
              {product.key === 'playbooks' || product.key === 'library' ? ' and the playbooks' : ''}, as a website purchase would.
            </span>
          </label>
        )}

        {err && <p className="admin-notice is-error">{err}</p>}

        <div className="drawer-actions">
          <button type="submit" className="admin-btn" disabled={saving || (!found && !manualMode)}>
            {saving ? 'Saving…' : found ? `Save verified ${rupees(found.amount)}` : 'Save payment'}
          </button>
          <button type="button" className="admin-btn admin-btn-quiet" onClick={onClose}>
            Cancel
          </button>
          {!found && !manualMode && <small className="record-hint">Verify the Order ID above to save.</small>}
        </div>
      </form>
    </Drawer>
  )
}
