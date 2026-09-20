'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { attachRail } from '@/lib/rail'

/**
 * A rail that only becomes a rail at some widths.
 *
 * LogoRail owns its own markup and runs wherever it is rendered. This one owns
 * nothing: it wraps whatever it is given, takes the first element inside as the
 * track, and attaches the marquee engine only while `query` matches. Above that
 * width it detaches and clears the transform, handing the element back to CSS —
 * which is what lets the accreditation strip be a four-column grid on a desktop
 * and a rail on a phone without two copies of the markup.
 *
 * The CSS animation on the track is the fallback, not the main path: it runs
 * for anyone whose JavaScript has not arrived, and `data-rail="on"` turns it
 * off the moment this takes over, so the two never drive the same transform.
 *
 * Children stay server-rendered — only this wrapper is a client component.
 */
export function SwipeRail({
  className,
  query,
  speed,
  direction = 'left',
  children,
}: {
  className?: string
  /** Media query the rail is active within, e.g. '(max-width: 680px)'. */
  query: string
  speed: number
  direction?: 'left' | 'right'
  children: ReactNode
}) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const track = host.firstElementChild
    if (!(track instanceof HTMLElement)) return

    const active = window.matchMedia(query)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let detach: (() => void) | null = null

    // Reduced motion detaches rather than freezing: a parked rail is a clipped
    // window with most of its list outside it, and the stylesheet falls back to
    // a wrapped row for that reader instead.
    const sync = () => {
      const on = active.matches && !reduced.matches
      if (on && !detach) {
        host.dataset.rail = 'on'
        detach = attachRail(track, { speed, direction })
      } else if (!on && detach) {
        detach()
        detach = null
        delete host.dataset.rail
      }
    }

    sync()
    active.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    return () => {
      active.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
      detach?.()
      delete host.dataset.rail
    }
  }, [query, speed, direction])

  return (
    <div className={className} ref={hostRef}>
      {children}
    </div>
  )
}
