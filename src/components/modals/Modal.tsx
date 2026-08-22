'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type ModalProps = {
  labelledBy: string
  onClose: () => void
  className?: string
  children: ReactNode
}

/**
 * Dialog shell shared by the auth and checkout modals.
 * Handles the parts the original inline script skipped: rendering in a portal,
 * trapping Tab inside the dialog, restoring focus to the trigger on close, and
 * locking body scroll without the layout shift a plain `overflow:hidden` causes.
 */
export function Modal({ labelledBy, onClose, className = '', children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  // Play the enter transition on the frame after mount.
  useEffect(() => {
    if (!mounted) return
    const id = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(id)
  }, [mounted])

  // Lock scroll, remember the trigger, and move focus into the dialog.
  useEffect(() => {
    if (!mounted) return
    restoreFocusTo.current = document.activeElement as HTMLElement | null

    const { body } = document
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    // Prefer the first real field so keyboard users land on the form, not the ✕.
    const first =
      modalRef.current?.querySelector<HTMLElement>('input') ??
      modalRef.current?.querySelector<HTMLElement>('button')
    first?.focus()

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
      restoreFocusTo.current?.focus?.()
    }
  }, [mounted])

  const requestClose = useCallback(() => {
    setOpen(false)
    // Let the 0.22s exit transition finish before unmounting.
    window.setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
        return
      }
      if (event.key !== 'Tab') return

      const nodes = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null)
      if (list.length === 0) return

      const firstNode = list[0]
      const lastNode = list[list.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === firstNode || !modalRef.current?.contains(active))) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && active === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  if (!mounted) return null

  return createPortal(
    <div
      ref={overlayRef}
      className={`modal-overlay${open ? ' open' : ''}`}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) requestClose()
      }}
    >
      <div ref={modalRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Close dialog">
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Convenience for generating the stable ids dialogs need for aria-labelledby. */
export function useDialogId(prefix: string) {
  const id = useId()
  return `${prefix}-${id}`
}
