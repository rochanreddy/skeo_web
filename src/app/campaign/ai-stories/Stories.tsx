'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A story player, the format people from Instagram already know: a card at a
 * time, bars along the top, tap the right side for the next, the left for the
 * previous, press and hold to pause. Each card moves on by itself after a few
 * seconds; the last one stops and waits for the button.
 *
 * Arrow keys work too, and with reduced motion nothing advances on its own.
 */

const DWELL = 5200

export type Story = { key: string; tone: string; content: ReactNode }

export function Stories({ stories }: { stories: Story[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)
  const last = stories.length - 1
  const startedAt = useRef(Date.now())
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const go = useCallback(
    (n: number) => {
      setI(Math.max(0, Math.min(last, n)))
      startedAt.current = Date.now()
      setProgress(0)
    },
    [last],
  )

  // the clock: fill the current bar, then move on — never past the last card
  useEffect(() => {
    if (still || i === last) return
    let elapsed = progress * DWELL
    let frame = 0
    let prev = performance.now()
    const tick = (now: number) => {
      if (!paused) elapsed += now - prev
      prev = now
      const p = Math.min(1, elapsed / DWELL)
      setProgress(p)
      if (p >= 1) return go(i + 1)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // progress is read once on (re)start, not tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, still, last, go])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, go])

  const downAt = useRef(0)
  return (
    <div className={`vt-player vt-tone-${stories[i].tone}`} aria-roledescription="stories" aria-label={`Story ${i + 1} of ${stories.length}`}>
      <div className="vt-bars" aria-hidden="true">
        {stories.map((s, n) => (
          <span key={s.key}>
            <i style={{ width: `${n < i ? 100 : n === i ? (i === last ? 100 : progress * 100) : 0}%` }} />
          </span>
        ))}
      </div>

      <div className="vt-card" key={stories[i].key} aria-live="polite">
        {stories[i].content}
      </div>

      {/* Tap zones: left back, right forward; holding either pauses. They sit
          under the card's own buttons, which stay clickable. */}
      <button
        type="button"
        className="vt-zone vt-zone-prev"
        aria-label="Previous"
        disabled={i === 0}
        onPointerDown={() => { downAt.current = Date.now(); setPaused(true) }}
        onPointerUp={() => { setPaused(false); if (Date.now() - downAt.current < 300) go(i - 1) }}
        onPointerLeave={() => setPaused(false)}
      />
      <button
        type="button"
        className="vt-zone vt-zone-next"
        aria-label="Next"
        disabled={i === last}
        onPointerDown={() => { downAt.current = Date.now(); setPaused(true) }}
        onPointerUp={() => { setPaused(false); if (Date.now() - downAt.current < 300) go(i + 1) }}
        onPointerLeave={() => setPaused(false)}
      />

      <div className="vt-foot">
        {i < last ? (
          <button type="button" className="vt-skip" onClick={() => go(last)}>
            Skip to the offer
          </button>
        ) : (
          <button type="button" className="vt-skip" onClick={() => go(0)}>
            Watch again
          </button>
        )}
        <span>
          {i + 1} / {stories.length}
        </span>
      </div>
    </div>
  )
}
