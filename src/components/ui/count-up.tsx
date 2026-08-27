'use client'

import { useEffect, useRef } from 'react'

/**
 * A number that counts up to its value the first time it scrolls into view.
 *
 * Same idea as 21st.dev's Count Up, rebuilt on IntersectionObserver plus
 * requestAnimationFrame rather than `motion` — every published version of this
 * pulls in an animation library for one eased tween, and the site has no
 * animation runtime otherwise. It matches how Reveal already works.
 *
 * The final value is what renders on the server, so the real number is present
 * with JavaScript off and in the markup search engines read. The client resets
 * it to zero on mount; the section sits well below the fold, so that swap is
 * never on screen when it happens.
 */
export function CountUp({
  to,
  suffix = '',
  duration = 1500,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const final = `${to}${suffix}`

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') return

    node.textContent = `0${suffix}`
    let frame = 0

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)

          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            // easeOutCubic: fast off the mark, settling into the final value.
            const eased = 1 - Math.pow(1 - t, 3)
            node.textContent = `${Math.round(to * eased)}${suffix}`
            if (t < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to, suffix, duration])

  return (
    // The ghost copy holds the final value's width so the chip never resizes
    // mid-count ("0" and "1000" are three digits apart). Both copies are hidden
    // from assistive tech, which reads the stable label on the wrapper instead.
    <span className="countup" aria-label={final}>
      <span className="countup-ghost" aria-hidden="true">
        {final}
      </span>
      <span className="countup-value" ref={ref} aria-hidden="true">
        {final}
      </span>
    </span>
  )
}
