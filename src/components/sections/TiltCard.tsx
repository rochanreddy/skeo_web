'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'

/**
 * Tilts toward the cursor and moves a specular highlight with it — the glass
 * only reads as glass when the light on it responds to you.
 * Angles and the highlight position go out as custom properties, so all of the
 * look stays in CSS; the card sits flat for anyone who prefers reduced motion.
 */
export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function track(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = el.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    el.style.setProperty('--ry', `${(x - 0.5) * 7}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 4.5}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }

  function settle() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} className={className} onPointerMove={track} onPointerLeave={settle}>
      {children}
    </div>
  )
}
