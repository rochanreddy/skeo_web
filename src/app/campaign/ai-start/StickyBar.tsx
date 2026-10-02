'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * The bottom buy bar, held back until the hero has scrolled away — on a phone
 * the hero is the quiz, and a bar over its answers would hide the very thing
 * the page asks you to tap.
 */
export function StickyBar({ children, after = '.ve-hero' }: { children: ReactNode; after?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.querySelector(after)
    if (!hero) return setShow(true)
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(hero)
    return () => io.disconnect()
  }, [after])
  return <div className={`ve-sticky${show ? ' is-shown' : ''}`}>{children}</div>
}
