'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * A card that lights up under the cursor.
 *
 * Adapted from 21st.dev's Spotlight Card. Two changes from the original: the
 * pointer position is written straight to the node as custom properties rather
 * than held in React state — the original re-rendered on every mousemove — and
 * the gradient itself lives in globals.css, so the spotlight is themed with the
 * rest of the page instead of via an inline colour string.
 *
 * Falls back to a plain card with no JavaScript: the overlay is invisible until
 * a pointer sets --spot-o.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = 'div',
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'li'
  [key: string]: unknown
}) {
  const ref = useRef<HTMLElement>(null)

  const set = (x: string, y: string, o: string) => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--spot-x', x)
    node.style.setProperty('--spot-y', y)
    node.style.setProperty('--spot-o', o)
  }

  return (
    <Tag
      ref={ref as never}
      className={cn('spotlight-card', className)}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        // Coarse pointers report a position only on tap, which would flash the
        // spotlight on and leave it there — hover is the whole interaction.
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        set(`${e.clientX - r.left}px`, `${e.clientY - r.top}px`, '1')
      }}
      onPointerLeave={() => set('50%', '50%', '0')}
      {...rest}
    >
      <span className="spotlight-card-glow" aria-hidden="true" />
      {children}
    </Tag>
  )
}
