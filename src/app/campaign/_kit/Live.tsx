'use client'

import { useEffect, useState } from 'react'
import { offer } from '@/lib/earlyAccess'
import { useLiveStats } from '../everything-ai/Live'

/**
 * The live bits the campaign variants share: time left, seats left and who
 * just joined. Each reads the same real sources the main campaign page does —
 * offer.endsAt, and /api/early-access/stats (real paid orders) — and renders
 * nothing rather than a guess when it has nothing to show.
 *
 * Unstyled on purpose: every variant dresses them in its own class.
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** "6d 11h 52m 08s", ticking. Dashes until mounted, so it never hydrates a second out. */
export function TimeLeft({ className, endedText = 'This offer has ended' }: { className?: string; endedText?: string }) {
  const end = Date.parse(offer.endsAt)
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setLeft(end - Date.now())
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [end])

  if (left != null && left <= 0) return <span className={className}>{endedText}</span>
  const s = left == null ? null : Math.floor(left / 1000)
  const units: [string, string][] = [
    ['d', s == null ? '--' : String(Math.floor(s / 86400))],
    ['h', s == null ? '--' : pad(Math.floor((s % 86400) / 3600))],
    ['m', s == null ? '--' : pad(Math.floor((s % 3600) / 60))],
    ['s', s == null ? '--' : pad(s % 60)],
  ]
  return (
    <span className={className} role="timer" aria-live="off" aria-label={s == null ? 'Time left' : `${units[0][1]} days ${units[1][1]} hours left`}>
      {units.map(([u, v]) => (
        <span key={u} aria-hidden="true">
          <b>{v}</b>
          <i>{u}</i>
        </span>
      ))}
    </span>
  )
}

/** "37 of 500 seats left" — only when there is a real cap. */
export function SeatsText({ className }: { className?: string }) {
  const stats = useLiveStats()
  if (!stats || stats.seatsLeft == null || !stats.seatsTotal) return null
  if (stats.seatsLeft === 0) return <span className={className}>Early Access is full</span>
  return (
    <span className={className}>
      <b>{stats.seatsLeft.toLocaleString('en-IN')}</b> of {stats.seatsTotal.toLocaleString('en-IN')} seats left
    </span>
  )
}

/** A meter for the seats taken; nothing without a cap. */
export function SeatsBar({ className }: { className?: string }) {
  const stats = useLiveStats()
  if (!stats || stats.seatsLeft == null || !stats.seatsTotal) return null
  const taken = Math.min(1, (stats.seatsTotal - stats.seatsLeft) / stats.seatsTotal)
  return (
    <span className={className} aria-hidden="true">
      <span style={{ width: `${Math.max(3, taken * 100)}%` }} />
    </span>
  )
}

function ago(iso: string) {
  const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000))
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

/**
 * "Priya S. joined · 12 min ago" — real purchases from the last week, one at a
 * time, each shown once per visit. Closing it stops it for the visit.
 */
export function JoinedToast({ className = 'kit-toast' }: { className?: string }) {
  const stats = useLiveStats()
  const [current, setCurrent] = useState<{ name: string; what: string; at: string } | null>(null)
  const [open, setOpen] = useState(false)
  const [off, setOff] = useState(false)

  useEffect(() => {
    if (off || !stats?.recent.length) return
    const timers: number[] = []
    let t = 8_000
    for (const j of stats.recent) {
      timers.push(window.setTimeout(() => { setCurrent(j); setOpen(true) }, t))
      timers.push(window.setTimeout(() => setOpen(false), t + 5_500))
      t += 5_500 + 15_000 + Math.round(Math.random() * 8_000)
    }
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [stats, off])

  if (off || !current) return null
  return (
    <div className={`${className}${open ? ' is-open' : ''}`} role="status" aria-live="polite">
      <span className="kit-toast-avatar" aria-hidden="true">
        {current.name.charAt(0)}
      </span>
      <p>
        <strong>{current.name}</strong> joined {current.what}
        <small>{ago(current.at)} · verified purchase</small>
      </p>
      <button type="button" aria-label="Hide these notifications" onClick={() => setOff(true)}>
        ×
      </button>
    </div>
  )
}
