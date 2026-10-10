'use client'

import { useEffect, useState } from 'react'
import { useCatalog } from '@/components/CatalogProvider'

/**
 * Days, hours, minutes, seconds to offer.endsAt — the real deadline, the same
 * for everyone, not a timer that restarts per visitor.
 *
 * The server does not know the visitor's clock, so the first render draws
 * dashes and the numbers arrive on mount; rendering digits on the server
 * would hydrate a second out and flash.
 */
const pad = (n: number) => String(n).padStart(2, '0')

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

/**
 * The offer line travels with the timer, so when the deadline passes the bar
 * reads "This offer has ended" — not "98% OFF ends in … has ended".
 */
export function Countdown({ offer: offerText, endsIn, ended }: { offer: string; endsIn: string; ended: string }) {
  const end = Date.parse(useCatalog().campaign.endsAt)
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setLeft(end - Date.now())
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [end])

  if (left != null && left <= 0) return <span className="ea-cd-ended">{ended}</span>

  const p = left == null ? null : parts(left)
  const units: [string, string][] = [
    ['d', p ? pad(p.d) : '--'],
    ['h', p ? pad(p.h) : '--'],
    ['m', p ? pad(p.m) : '--'],
    ['s', p ? pad(p.s) : '--'],
  ]
  const label = p ? `${p.d} days ${p.h} hours ${p.m} minutes left` : 'Time left'

  return (
    <>
      <span className="ea-announce-offer">
        <strong>{offerText}</strong>
        <span className="ea-announce-ends"> {endsIn}</span>
      </span>
      {/* Read once as a sentence, not re-announced every second. */}
      <span className="ea-cd" role="timer" aria-live="off" aria-label={label}>
        {units.map(([u, v], i) => (
          <span key={u} className="ea-cd-unit" aria-hidden="true">
            <b>{v}</b>
            <i>{u}</i>
            {i < units.length - 1 && <span className="ea-cd-sep">:</span>}
          </span>
        ))}
      </span>
    </>
  )
}
