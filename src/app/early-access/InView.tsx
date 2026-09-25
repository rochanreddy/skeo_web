'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Adds `is-in` to its element the first time it scrolls into view, and the
 * stylesheet does the rest. With reduced motion, or no IntersectionObserver,
 * it is in from the start — nothing ever waits at opacity 0.
 */
export function InView({ as: Tag = 'div', className = '', children }: { as?: 'div' | 'ol'; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`${className}${inView ? ' is-in' : ''}`}>
      {children}
    </Tag>
  )
}
