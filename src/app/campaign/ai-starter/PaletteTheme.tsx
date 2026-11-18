'use client'

import { useEffect } from 'react'

/** The colour themes the ai-starter variants use (globals.css data-palette). */
export type StarterPalette = 'claude' | 'violet' | 'charcoal' | 'mono'

/* Sets the page's colour theme on arrival (the layout's first-paint script
   does the same before the first frame) and gives the visitor's own theme
   back on leaving. Same as ai-bundle's BrownTheme, for any palette. */
export function PaletteTheme({ palette }: { palette: StarterPalette }) {
  useEffect(() => {
    const root = document.documentElement
    const before = root.dataset.palette
    root.dataset.palette = palette
    return () => {
      if (before) root.dataset.palette = before
    }
  }, [palette])
  return null
}
