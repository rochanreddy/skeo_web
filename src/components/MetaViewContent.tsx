'use client'

import { useEffect } from 'react'
import { metaViewContent } from '@/lib/analytics/meta'

/**
 * Tells Meta a course page was opened — ViewContent, the first of the three
 * moments the ads optimise on. Renders nothing. `ids` are the checkout item
 * keys this page sells, the same ids the checkout and purchase carry, so Meta
 * can follow one course from view to sale.
 */
export function MetaViewContent({ ids, name, value }: { ids: string[]; name: string; value: number }) {
  const key = ids.join(',')
  useEffect(() => {
    metaViewContent({ ids: key.split(','), name, value })
  }, [key, name, value])
  return null
}
