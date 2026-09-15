'use client'

import { useEffect, useState } from 'react'

/**
 * Day / night, as the two palettes the site actually ships: Claude by day and
 * Charcoal by night. It writes `data-palette` on <html>, which is the same
 * hook every palette block in globals.css already keys off, so switching is a
 * repaint and nothing re-renders.
 *
 * The stored key is shared with the boot script in layout.tsx — that script
 * applies the choice before first paint so a returning night-mode reader never
 * sees a white flash on the way to their theme.
 */

export const THEME_KEY = 'skeo-palette'

type Theme = 'claude' | 'charcoal'

export function ThemeToggle() {
  // Starts light and is corrected on mount from what the boot script actually
  // applied. Rendering the switch from state the server cannot know would
  // hydrate wrong for anyone in night mode.
  const [theme, setTheme] = useState<Theme>('claude')

  useEffect(() => {
    setTheme(document.documentElement.dataset.palette === 'charcoal' ? 'charcoal' : 'claude')
  }, [])

  function choose(next: Theme) {
    document.documentElement.dataset.palette = next
    setTheme(next)
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      /* Private browsing. The choice still applies for this visit. */
    }
  }

  const night = theme === 'charcoal'

  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={night}
      aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
      title={night ? 'Day mode' : 'Night mode'}
      onClick={() => choose(night ? 'claude' : 'charcoal')}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <SunIcon />
        <MoonIcon />
        {/* The knob rides over the two icons rather than between them, so the
            one it covers reads as unselected without needing a second colour. */}
        <span className="theme-toggle-knob" />
      </span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
