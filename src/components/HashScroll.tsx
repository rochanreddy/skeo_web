'use client'

import { useEffect } from 'react'

/**
 * Lands on the section a link asked for.
 *
 * Arriving at /#pricing from another page (the footer's Start Learning on
 * /about, say) the browser's own jump to the fragment does not reliably
 * happen here: measured, it fired when the URL was opened directly and not
 * when it was followed from another page, which left the reader at the top of
 * a long page. So once the page has laid out, scroll to the fragment if the
 * browser has not already — and do nothing if it has.
 */
export function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const go = () => {
      const el = document.getElementById(id)
      if (!el) return
      const off = el.getBoundingClientRect().top
      // already there (scroll-margin puts it ~100px down): leave it alone
      if (off > -20 && off < 160) return
      // instant: html has scroll-behavior: smooth, and a smooth glide across
      // a page still laying out is cut short partway down
      el.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    // twice: once laid out, once more after late layout (fonts, images)
    const t1 = window.setTimeout(go, 120)
    const t2 = window.setTimeout(go, 700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])
  return null
}
