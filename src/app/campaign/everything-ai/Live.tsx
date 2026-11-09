'use client'

import { useEffect, useRef, useState } from 'react'
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
 * "Priya S. joined Everything AI · 12 min ago": one real purchase at a time,
 * bottom-left. The first comes once the hero has landed, then a new one every
 * 40 seconds, each on screen for six. Only real buyers are ever shown; when
 * the list runs out it starts again from the most recent. Closing it stops it
 * for the rest of the visit.
 */
const FIRST_MS = 6_000
const EVERY_MS = 40_000
const SHOWN_MS = 6_000

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

  /* The stats reload every minute; the rotation restarts only when the list
     of buyers itself changes, so the 40-second rhythm is not reset. */
  const recent = stats?.recent
  const key = recent?.map((j) => `${j.name}@${j.at}`).join('|') ?? ''
  const queueRef = useRef<Join[]>([])
  queueRef.current = recent ?? []

  useEffect(() => {
    if (off || !key) return
    const queue = queueRef.current
    let n = 0
    let hide: number | undefined
    const show = () => {
      setCurrent(queue[n % queue.length])
      setOpen(true)
      n++
      hide = window.setTimeout(() => setOpen(false), SHOWN_MS)
    }
    const first = window.setTimeout(show, FIRST_MS)
    const every = window.setInterval(show, EVERY_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(every)
      if (hide) window.clearTimeout(hide)
    }
  }, [key, off])

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
