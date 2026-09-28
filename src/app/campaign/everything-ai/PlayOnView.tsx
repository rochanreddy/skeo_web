'use client'

import { useEffect } from 'react'

/**
 * Plays the build-card icons on touch screens, where hover never happens.
 *
 * On a phone the animations a mouse gets on hover would simply never run, so
 * each card gets `is-play` once as it scrolls into view — one after another, a
 * beat apart — and the stylesheet plays the same animation the hover does.
 * Devices that can hover are left to hover; reduced motion gets nothing.
 */
export function PlayOnView({ selector }: { selector: string }) {
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return
    const cards = [...document.querySelectorAll<HTMLElement>(selector)]
    const timers: number[] = []
    const io = new IntersectionObserver(
      (entries) => {
        const arriving = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)
        arriving.forEach((el, i) => {
          io.unobserve(el)
          timers.push(window.setTimeout(() => el.classList.add('is-play'), i * 180))
        })
      },
      { threshold: 0.6 },
    )
    cards.forEach((c) => io.observe(c))
    return () => {
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [selector])
  return null
}
