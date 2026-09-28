'use client'

import { useEffect, useState } from 'react'
import type { Join, LiveStats } from '@/lib/earlyAccessLive'

/**
 * The live parts of /campaign/everything-ai — seats left, and who just joined — read
 * from /api/early-access/stats, which reads real orders. One request per page
 * view, shared by every component that asks, and refreshed once a minute.
 * If the numbers cannot be had, both features stay hidden rather than guess.
 */

const EMPTY: LiveStats = { seatsTotal: null, seatsLeft: null, recent: [] }
let pending: Promise<LiveStats> | null = null
let lastAt = 0

function fetchStats(): Promise<LiveStats> {
  if (!pending || Date.now() - lastAt > 60_000) {
    lastAt = Date.now()
    pending = fetch('/api/early-access/stats')
      .then((r) => (r.ok ? (r.json() as Promise<LiveStats>) : EMPTY))
      .catch(() => EMPTY)
  }
  return pending
}

export function useLiveStats(): LiveStats | null {
  const [stats, setStats] = useState<LiveStats | null>(null)
  useEffect(() => {
    let live = true
    const load = () => fetchStats().then((s) => live && setStats(s))
    load()
    const t = window.setInterval(load, 60_000)
    return () => {
      live = false
      window.clearInterval(t)
    }
  }, [])
  return stats
}

/** "37 of 500 seats left", with a bar. Renders nothing when there is no cap. */
export function SeatsLeft({ variant = 'bar' }: { variant?: 'bar' | 'inline' }) {
  const stats = useLiveStats()
  if (!stats || stats.seatsLeft == null || !stats.seatsTotal) return null
  const { seatsLeft, seatsTotal } = stats
  const taken = Math.min(1, (seatsTotal - seatsLeft) / seatsTotal)

  if (seatsLeft === 0) return <span className="ea-seats ea-seats-full">Early Access is full</span>

  if (variant === 'inline') {
    return (
      <span className="ea-seats ea-seats-inline">
        <i aria-hidden="true" />
        {seatsLeft.toLocaleString('en-IN')} seats left
      </span>
    )
  }
  return (
    <div className="ea-seats">
      <p>
        <strong>{seatsLeft.toLocaleString('en-IN')}</strong> of {seatsTotal.toLocaleString('en-IN')} seats left
      </p>
      <span className="ea-seats-track" aria-hidden="true">
        {/* At least a sliver, so a fresh campaign still reads as a meter. */}
        <span style={{ width: `${Math.max(3, taken * 100)}%` }} />
      </span>
    </div>
  )
}

function ago(iso: string): string {
  const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000))
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

const DISMISS_KEY = 'skeo-ea-joins-off'

/**
 * "Priya S. joined Everything AI · 12 min ago" — one real purchase at a time,
 * bottom-left. Each person is shown once per visit, never looped, so the same
 * three names do not come round again like a script. Closing it stops it for
 * the rest of the visit.
 */
export function JoinToasts() {
  const stats = useLiveStats()
  const [current, setCurrent] = useState<Join | null>(null)
  const [open, setOpen] = useState(false)
  const [off, setOff] = useState(false)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) setOff(true)
    } catch {
      /* private browsing: it simply shows */
    }
  }, [])

  useEffect(() => {
    if (off || !stats?.recent.length) return
    const queue = [...stats.recent]
    const timers: number[] = []
    let t = 7_000 // let the hero land first
    for (const j of queue) {
      timers.push(window.setTimeout(() => { setCurrent(j); setOpen(true) }, t))
      timers.push(window.setTimeout(() => setOpen(false), t + 5_500))
      t += 5_500 + 14_000 + Math.round(Math.random() * 8_000)
    }
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [stats, off])

  if (off || !current) return null

  return (
    <div className={open ? 'ea-toast is-open' : 'ea-toast'} role="status" aria-live="polite">
      <span className="ea-toast-avatar" aria-hidden="true">
        {current.name.charAt(0)}
      </span>
      <p>
        <strong>{current.name}</strong> joined <b>{current.what}</b>
        <span className="ea-toast-time">
          <i aria-hidden="true" />
          {ago(current.at)} · verified purchase
        </span>
      </p>
      <button
        type="button"
        className="ea-toast-close"
        aria-label="Hide these notifications"
        onClick={() => {
          setOff(true)
          try {
            window.sessionStorage.setItem(DISMISS_KEY, '1')
          } catch {
            /* nothing to remember it in */
          }
        }}
      >
        ×
      </button>
    </div>
  )
}
