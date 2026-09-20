'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { attachRail } from '@/lib/rail'

/**
 * Continuous horizontal logo rail, the same one menler.in runs.
 *
 * Transform-driven rather than a scroll container: three identical copies of
 * the list are translated a fraction of a pixel each frame, so the row never
 * stops on hover or touch and loops with no visible seam. Dragging follows the
 * pointer and auto-advance resumes on release — a resting finger doesn't stop
 * it either.
 *
 * `direction` is which way the CONTENT travels, not which way the track is
 * pushed — the two are opposite, and naming the visible one keeps the call
 * sites readable.
 */
export function LogoRail({
  children,
  speed = 0.5,
  direction = 'left',
  className = '',
}: {
  children: ReactNode[]
  speed?: number
  direction?: 'left' | 'right'
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // The engine itself lives in lib/rail — the accreditation strip runs the
    // same loop behind a media query, and one marquee is enough to maintain.
    return attachRail(track, { speed, direction })
  }, [speed, direction, children.length])

  // Three copies: one on screen, one entering, one leaving.
  const copies = [0, 1, 2]

  return (
    <div className={`logo-rail ${className}`.trim()}>
      <div className="logo-rail-track" ref={trackRef}>
        {copies.map((copy) =>
          children.map((child, i) => (
            <span key={`${copy}-${i}`} aria-hidden={copy > 0 || undefined}>
              {child}
            </span>
          )),
        )}
      </div>
    </div>
  )
}
