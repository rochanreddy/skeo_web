'use client'

import { useEffect, useState } from 'react'

/**
 * Preview scaffolding. Flips the `data-palette` attribute on <html> so the
 * four palettes in globals.css can be compared on the real page instead of on
 * a swatch sheet — colour decisions only hold up against real content.
 *
 * To ship: pick a palette, fold its block into `:root` in globals.css, then
 * delete this component, the `.palette-switcher` styles, and the boot script
 * in layout.tsx.
 */

export const PALETTE_STORAGE_KEY = 'skeo-palette'

/* Swatches are the four bands each palette actually paints with, in the order
   they appear down the page — paper, the analytical band, the human band, and
   the dark one. Kept in sync by hand with the blocks in globals.css. */
const PALETTES = [
  { id: 'claude', label: 'Claude', note: 'Default', swatch: ['#fafaf7', '#f0eee6', '#f0e1d6', '#4e2a1e'] },
  { id: 'indigo', label: 'Ivory & Indigo', note: 'Warm/cool', swatch: ['#fbf9f5', '#eff1f6', '#f5e8db', '#2c1f6e'] },
  { id: 'original', label: 'Original', note: 'Yours', swatch: ['#ffffff', '#faf9fc', '#f2eefc', '#241a4d'] },
  { id: 'violet', label: 'Violet Paper', note: 'Brand', swatch: ['#ffffff', '#f6f3fc', '#fdf7ec', '#292150'] },
  { id: 'oat', label: 'Ink & Oat', note: 'Editorial', swatch: ['#fffdf8', '#f1e8d8', '#ebedf6', '#2c2432'] },
  { id: 'graphite', label: 'Graphite', note: 'Technical', swatch: ['#ffffff', '#e9edf3', '#f6f2fd', '#262a33'] },
  { id: 'charcoal', label: 'Charcoal', note: 'All dark', swatch: ['#131417', '#1c1e23', '#1a1720', '#2a2450'] },
  { id: 'mono', label: 'Mono', note: 'Old school', swatch: ['#ffffff', '#f7f7f7', '#ececec', '#101010'] },
] as const

type PaletteId = (typeof PALETTES)[number]['id']

export function PaletteSwitcher() {
  const [active, setActive] = useState<PaletteId>('claude')
  const [open, setOpen] = useState(false)

  /* layout.tsx serves data-palette on <html> and the boot script has already
     overridden it with any stored choice, so read it back rather than
     re-applying — re-applying would repaint the page on every mount. */
  useEffect(() => {
    const current = document.documentElement.dataset.palette as PaletteId | undefined
    if (current) setActive(current)
  }, [])

  function choose(id: PaletteId) {
    document.documentElement.dataset.palette = id
    setActive(id)
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, id)
    } catch {
      /* Private browsing. The choice still applies; it just will not survive
         a reload, which is fine for a preview control. */
    }
  }

  return (
    <div className="palette-switcher">
      <button
        type="button"
        className="palette-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="palette-list"
      >
        <Swatch colors={PALETTES.find((p) => p.id === active)?.swatch ?? []} />
        Palette
      </button>

      <div className="palette-list" id="palette-list" hidden={!open}>
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            className="palette-option"
            aria-pressed={p.id === active}
            onClick={() => choose(p.id)}
          >
            <Swatch colors={p.swatch} />
            <b>{p.label}</b>
            <i>{p.note}</i>
          </button>
        ))}
      </div>
    </div>
  )
}

function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span className="palette-swatch" aria-hidden="true">
      {colors.map((c) => (
        <i key={c} style={{ background: c }} />
      ))}
    </span>
  )
}
