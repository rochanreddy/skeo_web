'use client'

import { useEffect, useRef, useState } from 'react'
import { navLinks } from '@/lib/site'
import { useModal } from './modals/ModalProvider'

export function Nav() {
  const { openAuth } = useModal()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  // Shadow the header once the page has moved off the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link for whichever section currently owns the viewport.
  useEffect(() => {
    const targets = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el))
    if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return

    // Track the full set, not just the latest entries — otherwise scrolling back
    // past every section leaves the last link stuck highlighted.
    const inBand = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        const firstInOrder = targets.find((t) => inBand.has(t.id))
        setActiveId(firstInOrder?.id ?? null)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  // Close the mobile menu on Escape or an outside click.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (!shellRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={shellRef} className={`nav-shell${scrolled ? ' scrolled' : ''}`}>
      <header className="nav wrap">
        <a className="brand" href="#top" aria-label="Skillora home">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>SKEO</span>
        </a>

        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={activeId === link.href.slice(1) ? 'true' : undefined}
              className={activeId === link.href.slice(1) ? 'active' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="login" onClick={() => openAuth('signin')}>
            Sign in
          </button>
          <button type="button" className="button button-small" onClick={() => openAuth('signup')}>
            <span className="btn-label">Register</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <button
          className="menu"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </header>
    </div>
  )
}
