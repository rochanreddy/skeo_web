'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Continuous horizontal logo rail, the same one menler.in runs.
 *
 * Transform-driven rather than a scroll container: three identical copies of
 * the list are translated a fraction of a pixel each frame, so the row never
 * stops on hover or touch and loops with no visible seam. Dragging follows the
 * pointer and auto-advance resumes on release — a resting finger doesn't stop
 * it either.
 */
export function LogoRail({
  children,
  speed = 0.5,
  className = '',
}: {
  children: ReactNode[]
  speed?: number
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let copy = 0
    let offset = 0
    let frame = 0
    let down = false
    let dragging = false
    let startX = 0
    let downX = 0
    let startOffset = 0

    // One copy's width. Kept in a variable rather than read per frame — layout
    // reads inside rAF are what make marquees stutter.
    const measure = () => {
      copy = track.scrollWidth / 3
    }
    const wrap = () => {
      if (copy <= 0) return
      while (offset <= -copy) offset += copy
      while (offset > 0) offset -= copy
    }
    const apply = () => {
      track.style.transform = `translate3d(${offset}px,0,0)`
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)

    // Only advance while the rail is actually on screen.
    let onScreen = true
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    visibility.observe(track)

    const tick = () => {
      if (onScreen && copy > 0 && !dragging && !document.hidden) {
        offset -= speed
        wrap()
        apply()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const onDown = (e: PointerEvent) => {
      down = true
      downX = startX = e.clientX
      startOffset = offset
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      // A few pixels of slop, so a tap on a logo isn't read as a drag.
      if (!dragging && Math.abs(e.clientX - downX) > 6) dragging = true
      if (!dragging) return
      offset = startOffset + (e.clientX - startX)
      wrap()
      apply()
      startOffset = offset
      startX = e.clientX
    }
    const onUp = () => {
      down = false
      dragging = false
    }

    track.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
      track.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [speed, children.length])

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
