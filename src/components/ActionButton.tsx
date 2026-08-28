'use client'

import type { ReactNode } from 'react'
import type { PlanKey } from '@/lib/plans'
import { useModal, type AuthMode } from './modals/ModalProvider'

/**
 * Modal triggers, isolated into the only client components the marketing
 * sections need — every section itself stays a server component.
 * These are real <button>s, replacing the original `<a href="#">` triggers that
 * jumped to the top of the page whenever JavaScript hadn't run yet.
 */

type TriggerProps = {
  children: ReactNode
  className?: string
  /** Trailing glyph rendered at button-arrow size. */
  arrow?: string
}

export function AuthButton({ mode, children, className = 'button', arrow = '→' }: TriggerProps & { mode: AuthMode }) {
  const { openAuth } = useModal()
  return (
    <button type="button" className={className} onClick={() => openAuth(mode)}>
      <span className="btn-label">{children}</span>
      {arrow && <span aria-hidden="true">{arrow}</span>}
    </button>
  )
}

export function SyllabusButton({ children, className = 'button', arrow = '→' }: TriggerProps) {
  const { openSyllabus } = useModal()
  return (
    <button type="button" className={className} onClick={openSyllabus}>
      <span className="btn-label">{children}</span>
      {arrow && <span aria-hidden="true">{arrow}</span>}
    </button>
  )
}

export function PurchaseButton({
  plan,
  children,
  className = 'button',
  arrow = '→',
}: TriggerProps & { plan: PlanKey }) {
  const { openPurchase } = useModal()
  return (
    <button type="button" className={className} onClick={() => openPurchase(plan)}>
      <span className="btn-label">{children}</span>
      {arrow && <span aria-hidden="true">{arrow}</span>}
    </button>
  )
}
