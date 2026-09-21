'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { lms, navLinks } from '@/lib/site'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  /* EVERY DESTINATION IN THIS BAR IS A SECTION OF THE HOME PAGE. On the home
     page a bare hash is right: it scrolls, and it does not reload. Anywhere
     else the same hash resolves against the current URL, so "#tools" on
     /about becomes /about#tools — a link to an element that does not exist,
     which silently does nothing. Prefixing with "/" off the home page turns
     each one back into a real destination.

     The brand is the same problem with a worse symptom: "#top" is defined to
     scroll to the top of the DOCUMENT, so on /about it scrolls the about page
     to its own top and looks like a link that is broken rather than one that
     went somewhere. */
  const onHome = usePathname() === '/'
  const section = (hash: string) => (onHome ? hash : `/${hash}`)

  // Shadow the header once the page has moved off the top, and run the progress
  // line under it. Written as a custom property rather than state so scrolling
  // never re-renders the tree.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      shellRef.current?.style.setProperty('--progress', String(progress))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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
        <a className="brand" href={onHome ? '#top' : '/'} aria-label="skeo home">
          <span>skeo</span>
        </a>

        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={section(link.href)}
              onClick={() => setOpen(false)}
              aria-current={activeId === link.href.slice(1) ? 'true' : undefined}
              className={activeId === link.href.slice(1) ? 'active' : undefined}
            >
              {link.label}
            </a>
          ))}
          {/* Phone only (see .nav-lms): the pill has no room for the LMS button
              below 680px, so the dropdown carries it instead. */}
          <a className="nav-lms button button-small" href={lms.web} target="_blank" rel="noopener noreferrer">
            <span className="btn-label">Sign in to LMS</span>
            <span aria-hidden="true">→</span>
          </a>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <a className="button button-small" href={lms.web} target="_blank" rel="noopener noreferrer">
            <span className="btn-label">Sign in to LMS</span>
            <span aria-hidden="true">→</span>
          </a>
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

      {/* Pinned to the very top of the viewport rather than to the bar. The nav
          is a floating pill now, and a line inside it read as a stray underline
          against the brand. */}
      <span className="scroll-progress" aria-hidden="true" />
    </div>
  )
}
