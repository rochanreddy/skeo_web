'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Element to render. Defaults to a div so it can slot in anywhere. */
  as?: ElementType
  className?: string
  /** Staggers the transition — maps to the .delay-1 / .delay-2 helpers. */
  delay?: 0 | 1 | 2
  [key: string]: unknown
}

/**
 * Fades content in the first time it scrolls into view.
 * Falls back to visible-immediately when IntersectionObserver is unavailable
 * or the visitor prefers reduced motion, so content is never trapped at opacity 0.
 */
export function Reveal({ children, as: Tag = 'div', className = '', delay = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const classes = ['reveal', delay === 1 ? 'delay-1' : delay === 2 ? 'delay-2' : '', visible ? 'visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  )
}
