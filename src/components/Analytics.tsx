'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics/track'

/**
 * Reports a pageview on first load and on every client-side navigation.
 *
 * Sits in the root layout so nothing has to remember to add it. /admin is
 * skipped: the operator reading the dashboard is not a visitor, and counting
 * them would put their own refreshes into their own traffic numbers.
 */
export function Analytics() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    // Strict mode mounts effects twice in development; without this the very
    // first pageview of every session is counted twice.
    if (lastSent.current === pathname) return
    lastSent.current = pathname
    track('pageview')
  }, [pathname])

  return null
}
