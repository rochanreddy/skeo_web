'use client'

import { useEffect, useState } from 'react'

/**
 * Time left in the current 10-hour window, counting down and starting again
 * when it reaches zero. The windows are fixed to the clock, not to the visit,
 * so everyone sees the same time. It is labelled "this window" and claims no
 * more than that: the offer itself does not end when it runs out.
 *
 * The server does not know the visitor's clock, so the first render draws
 * dashes and the numbers arrive on mount; rendering digits on the server would
 * hydrate a second out and flash.
 */
const WINDOW_MS = 10 * 60 * 60 * 1000
const pad = (n: number) => String(n).padStart(2, '0')

export function WindowTimer({ offer }: { offer: string }) {
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setLeft(WINDOW_MS - (Date.now() % WINDOW_MS))
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [])

  const s = left == null ? null : Math.floor(left / 1000)
  const units: [string, string][] = [
    ['h', s == null ? '--' : pad(Math.floor(s / 3600))],
    ['m', s == null ? '--' : pad(Math.floor((s % 3600) / 60))],
    ['s', s == null ? '--' : pad(s % 60)],
  ]
  const label = s == null ? 'Time left in this window' : `${Math.floor(s / 3600)} hours ${Math.floor((s % 3600) / 60)} minutes left in this window`

  return (
    <>
      <span className="ea-announce-offer">
        <strong>{offer}</strong>
        {/* Kept on phones too: without it the bar would read as a deadline. */}
        <span className="ea-announce-window"> · this window</span>
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
