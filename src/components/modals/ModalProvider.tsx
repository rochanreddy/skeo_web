'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PlanKey } from '@/lib/plans'
import { AuthModal } from './AuthModal'
import { PurchaseModal } from './PurchaseModal'

export type AuthMode = 'signin' | 'signup'

type ModalState =
  | { kind: 'none' }
  | { kind: 'auth'; mode: AuthMode }
  | { kind: 'purchase'; plans: PlanKey[] }

type ModalApi = {
  openAuth: (mode: AuthMode) => void
  openPurchase: (plan: PlanKey) => void
  /** Checkout for a multi-module cart. */
  openCart: (plans: PlanKey[]) => void
  close: () => void
}

const ModalContext = createContext<ModalApi | null>(null)

/** Any section can raise a modal without prop-drilling handlers through the tree. */
export function useModal(): ModalApi {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>')
  return ctx
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({ kind: 'none' })

  const openAuth = useCallback((mode: AuthMode) => setState({ kind: 'auth', mode }), [])
  const openPurchase = useCallback((plan: PlanKey) => setState({ kind: 'purchase', plans: [plan] }), [])
  const openCart = useCallback((plans: PlanKey[]) => {
    if (plans.length > 0) setState({ kind: 'purchase', plans })
  }, [])
  const close = useCallback(() => setState({ kind: 'none' }), [])

  const api = useMemo(
    () => ({ openAuth, openPurchase, openCart, close }),
    [openAuth, openPurchase, openCart, close],
  )

  return (
    <ModalContext.Provider value={api}>
      {children}
      {state.kind === 'auth' && <AuthModal initialMode={state.mode} onClose={close} />}
      {state.kind === 'purchase' && <PurchaseModal planKeys={state.plans} onClose={close} />}
    </ModalContext.Provider>
  )
}
