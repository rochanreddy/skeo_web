'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * The list furniture the menler admin has on every tab, for skeo's: a sort
 * order, a From / To date window, 25 rows a page with "a–b of N", and a
 * drawer that opens on a row with everything recorded about it.
 *
 * All in the browser — the lists are a few hundred rows, already loaded.
 */

export const PAGE_SIZE = 25

export type SortOption<T> = { key: string; label: string; compare: (a: T, b: T) => number }

/** IST calendar day of an instant, "2026-10-02" — what a date input holds. */
const istDay = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export function useListView<T>(
  rows: T[],
  { sorts, dateOf }: { sorts: SortOption<T>[]; dateOf: (row: T) => string | null },
) {
  const [sort, setSort] = useState(sorts[0].key)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const cmp = (sorts.find((s) => s.key === sort) ?? sorts[0]).compare
    return rows
      .filter((r) => {
        if (!from && !to) return true
        const iso = dateOf(r)
        if (!iso) return false
        const d = istDay(iso)
        return (!from || d >= from) && (!to || d <= to)
      })
      .sort(cmp)
  }, [rows, sort, from, to, sorts, dateOf])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // a filter that shrinks the list must not strand the reader on page 9 of 2
  useEffect(() => {
    if (page > pages) setPage(1)
  }, [page, pages])
  const start = (Math.min(page, pages) - 1) * PAGE_SIZE

  return {
    all: filtered,
    shown: filtered.slice(start, start + PAGE_SIZE),
    controls: { sort, setSort, from, setFrom, to, setTo, sorts },
    pager: { page: Math.min(page, pages), pages, setPage, total: filtered.length, start },
  }
}

export function ListControls<T>({
  sort,
  setSort,
  from,
  setFrom,
  to,
  setTo,
  sorts,
  dateLabel,
}: ReturnType<typeof useListView<T>>['controls'] & { dateLabel: string }) {
  return (
    <div className="list-controls">
      <label className="list-field">
        <span>Sort</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {sorts.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="list-field">
        <span>{dateLabel} from</span>
        <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
      </label>
      <label className="list-field">
        <span>to</span>
        <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
      </label>
      {(from || to) && (
        <button type="button" className="admin-btn admin-btn-quiet" onClick={() => { setFrom(''); setTo('') }}>
          Clear dates
        </button>
      )}
    </div>
  )
}

export function Pager({ page, pages, setPage, total, start }: ReturnType<typeof useListView<unknown>>['pager']) {
  if (total <= PAGE_SIZE) return total ? <p className="pager-count">{total} shown</p> : null
  return (
    <nav className="pager" aria-label="Pages">
      <span className="pager-count">
        {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
      </span>
      <button type="button" className="admin-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        ← Prev
      </button>
      <span className="pager-page">
        Page {page} / {pages}
      </span>
      <button type="button" className="admin-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>
        Next →
      </button>
    </nav>
  )
}

/** The side panel a row opens: everything about one order or lead. */
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="drawer-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}

/** A labelled group of facts in the drawer. Empty values are left out. */
export function Facts({ title, rows }: { title?: string; rows: [string, ReactNode][] }) {
  const kept = rows.filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
  if (!kept.length) return null
  return (
    <section className="facts">
      {title && <h3>{title}</h3>}
      <dl>
        {kept.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Props for a clickable row that opens its drawer, by mouse or keyboard. */
export const openRow = (open: () => void) => ({
  className: 'is-clickable',
  tabIndex: 0,
  onClick: (e: React.MouseEvent) => {
    // buttons and links inside the row keep their own job
    if ((e.target as HTMLElement).closest('button, a, input, select')) return
    open()
  },
  onKeyDown: (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement) !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  },
})
