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

    /* A FRAGMENT NAVIGATION SCROLLS THE PAGE AFTER THIS EFFECT HAS RUN, and the
       observer does not reliably deliver an entry for that jump. Measured on
       this site: arriving at /#pricing or /#reviews left the target section at
       opacity 0 for as long as you did not touch the page — so every shared
       deep link landed on something invisible, and the fix for one of them is
       the fix for all of them.

       Only a hash can put the page in that state, so only a hash pays for the
       extra listener. The timeout is for a jump that produces no scroll event
       we catch; both stop at the first hit. */
    if (!window.location.hash) return () => observer.disconnect()

    /* A short poll rather than a scroll listener, because the page can settle in
       three different ways and only one of them is a scroll event: the smooth
       scroll to the fragment runs for up to two seconds, it may finish before
       this effect even attaches, and content loading above the target moves it
       into view afterwards without scrolling anything — which is what still had
       /#tools arriving blank when this listened for scrolls alone.
       Twelve looks at 250ms covers the slowest of those and then stops. */
    let looks = 0
    const timer = window.setInterval(() => {
      const box = node.getBoundingClientRect()
      if (box.top < window.innerHeight && box.bottom > 0) {
        setVisible(true)
        window.clearInterval(timer)
      } else if (++looks > 12) {
        window.clearInterval(timer)
      }
    }, 250)

    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
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
