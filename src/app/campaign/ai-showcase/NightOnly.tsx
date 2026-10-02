'use client'

import { useEffect } from 'react'
import { THEME_KEY } from '@/components/ThemeToggle'

/**
 * /campaign/ai-showcase is always dark — its hero is drawn for a dark room —
 * and the sections below it are the shared campaign sections, which colour
 * themselves from the site palette. So this page runs on the night palette
 * whatever the reader chose elsewhere.
 *
 * The inline script sets it before anything paints (no light flash); the
 * effect hands the reader's own palette back when they navigate away. Their
 * stored choice is never touched.
 */
const SET_NIGHT = "document.documentElement.dataset.palette='charcoal'"

export function NightOnly() {
  useEffect(() => {
    document.documentElement.dataset.palette = 'charcoal'
    return () => {
      let back: string = 'claude'
      try {
        const s = window.localStorage.getItem(THEME_KEY)
        if (s === 'charcoal' || s === 'claude') back = s
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) back = 'charcoal'
      } catch {
        /* storage blocked: the light default */
      }
      document.documentElement.dataset.palette = back
    }
  }, [])
  return <script dangerouslySetInnerHTML={{ __html: SET_NIGHT }} />
}
