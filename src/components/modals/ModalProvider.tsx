'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ModuleKey, PlanKey } from '@/lib/plans'
import { AuthModal } from './AuthModal'
import { PurchaseModal } from './PurchaseModal'
import { SyllabusModal } from './SyllabusModal'
import { VerifyModal } from './VerifyModal'

export type AuthMode = 'signin' | 'signup'

type ModalState =
  | { kind: 'none' }
  | { kind: 'auth'; mode: AuthMode }
  | { kind: 'purchase'; plans: PlanKey[] }
  | { kind: 'verify'; modules: ModuleKey[] }
  | { kind: 'syllabus' }

type ModalApi = {
  openAuth: (mode: AuthMode) => void
  openPurchase: (plan: PlanKey) => void
  /** Step two of the buying flow: verify the buyer, then send them to /checkout. */
  openVerify: (modules: ModuleKey[]) => void
  /** The curriculum overlay, raised from the tool card. */
  openSyllabus: () => void
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
  const openVerify = useCallback((modules: ModuleKey[]) => {
    if (modules.length > 0) setState({ kind: 'verify', modules })
  }, [])
  const openSyllabus = useCallback(() => setState({ kind: 'syllabus' }), [])
  const close = useCallback(() => setState({ kind: 'none' }), [])

  const api = useMemo(
    () => ({ openAuth, openPurchase, openVerify, openSyllabus, close }),
    [openAuth, openPurchase, openVerify, openSyllabus, close],
  )

  return (
    <ModalContext.Provider value={api}>
      {children}
      {state.kind === 'auth' && <AuthModal initialMode={state.mode} onClose={close} />}
      {state.kind === 'purchase' && <PurchaseModal planKeys={state.plans} onClose={close} />}
      {state.kind === 'verify' && <VerifyModal modules={state.modules} onClose={close} />}
      {state.kind === 'syllabus' && <SyllabusModal onClose={close} />}
    </ModalContext.Provider>
  )
}
