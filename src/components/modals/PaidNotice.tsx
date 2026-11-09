'use client'

import { useEffect, useRef, useState } from 'react'
import { gaPurchase } from '@/lib/analytics/ga'
import { metaPurchase, type MetaOrder } from '@/lib/analytics/meta'
import { clearCheckoutSession } from '@/lib/checkoutSession'
import { lms } from '@/lib/site'

/**
 * What a campaign-page buyer sees once Cashfree closes: one message in the
 * dialog they paid from, instead of a trip to /thank-you.
 *
 * It does /thank-you's two jobs, or the sale goes missing:
 *   - it polls GET /api/checkout/order/:id, which is what confirms the payment
 *     with Cashfree and has the LMS make the account and send the login mail
 *     (the webhook does the same, so closing this early loses nothing);
 *   - once the order is paid it reports the purchase to GA and Meta, with the
 *     server's order id as the event id, so neither counts it twice.
 */

type Status = 'pending' | 'paid' | 'provisioned' | 'failed' | 'unknown' | 'error'
type OrderView = { status: Status; orderId: string; items: string[]; amount: number; email: string; meta?: MetaOrder }

const POLL_MS = 2500
const GIVE_UP_MS = 90_000

export function PaidNotice({ orderId, email, onClose }: { orderId: string; email: string; onClose: () => void }) {
  const [order, setOrder] = useState<OrderView | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const reported = useRef(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const started = Date.now()

    async function check() {
      let view: OrderView | null = null
      try {
        const res = await fetch(`/api/checkout/order/${encodeURIComponent(orderId)}`, { cache: 'no-store' })
        view = (await res.json()) as OrderView
      } catch {
        view = null
      }
      if (stopped) return
      if (view && view.status !== 'error' && view.status !== 'unknown') setOrder(view)
      if (view?.status === 'paid' || view?.status === 'provisioned') {
        clearCheckoutSession()
        if (!reported.current) {
          reported.current = true
          gaPurchase(view)
          metaPurchase(view.meta)
        }
      }
      if (view?.status === 'provisioned' || view?.status === 'failed') return
      if (Date.now() - started > GIVE_UP_MS) {
        setTimedOut(true)
        return
      }
      timer = setTimeout(check, POLL_MS)
    }
    check()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
    }
  }, [orderId])

  const to = order?.email || email
  const items = order?.items ?? []
  // Playbooks and the AI Library come as PDFs by mail; there is no login.
  const playbooksOnly = items.length > 0 && items.every((item) => item === 'playbooks' || item === 'library')
  const what = playbooksOnly ? 'your playbooks' : 'your skeo login details'
  const confirmed = order?.status === 'paid' || order?.status === 'provisioned'

  if (order?.status === 'failed') {
    return (
      <div className="modal-success paid-notice" role="status">
        <h3>The payment didn&rsquo;t go through.</h3>
        <p>No money was taken. You can try again whenever you&rsquo;re ready.</p>
        <button type="button" className="button" onClick={onClose}>
          Close <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }

  return (
    <div className="modal-success paid-notice" role="status" data-clarity-mask="true">
      <div className="success-mark" aria-hidden="true">
        ✓
      </div>
      <h3>{confirmed || !timedOut ? 'Payment successful' : 'Payment received'}</h3>
      <p>
        {confirmed
          ? <>We&rsquo;ve sent {what} to <b>{to}</b>.</>
          : timedOut
            ? <>The bank is still confirming order {orderId}. As soon as it does, {what} will be emailed to <b>{to}</b>.</>
            : <>We&rsquo;re emailing {what} to <b>{to}</b>.</>}
      </p>
      <p>
        It arrives {lms.credentialsEta}. Not in your inbox? Check spam, or write to{' '}
        <a href={`mailto:${lms.support}?subject=Order ${orderId}`}>{lms.support}</a>.
      </p>
      <button type="button" className="button" onClick={onClose}>
        Done <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
