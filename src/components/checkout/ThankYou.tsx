'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readCompletedOrder, type CompletedOrder } from '@/lib/checkoutSession'
import { MODULE_ROWS, money } from '@/lib/plans'
import { lms } from '@/lib/site'

/**
 * What happens after the money: the receipt, and the three things someone has
 * to do to actually start the module they just bought.
 *
 * The order is read from the handoff /checkout writes on a successful payment,
 * so this page cannot be reached — or refreshed into — without one.
 */
export function ThankYou() {
  const router = useRouter()
  const [order, setOrder] = useState<CompletedOrder | null>(null)

  useEffect(() => {
    const found = readCompletedOrder()
    if (!found) {
      router.replace('/')
      return
    }
    setOrder(found)
  }, [router])

  if (!order) return null

  const rows = MODULE_ROWS.filter((row) => order.modules.includes(row.key))
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const one = rows.length === 1

  return (
    <main className="thanks">
      <div className="thanks-card">
        <header className="thanks-head">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h1>You&rsquo;re in.</h1>
          <p>
            {one ? `${rows[0].title} is` : `All ${rows.length} modules are`} yours. The receipt is on its way to{' '}
            <b>{order.email}</b>.
          </p>
        </header>

        {/* Numbered because the order matters: the password has to arrive
            before either of the two buttons below is any use. */}
        <h2 className="thanks-h">Getting started</h2>
        <ol className="thanks-steps">
          <li>
            <span className="thanks-num" aria-hidden="true">
              1
            </span>
            <div className="thanks-step-body">
              <b>Watch for your password</b>
              <p>
                We&rsquo;re emailing your skeo LMS username and a temporary password to <b>{order.email}</b>{' '}
                {lms.credentialsEta}. If it hasn&rsquo;t landed, check your spam folder before anything else — it is the
                only thing you need to sign in.
              </p>
            </div>
          </li>

          <li>
            <span className="thanks-num" aria-hidden="true">
              2
            </span>
            <div className="thanks-step-body">
              <b>Open the LMS in your browser</b>
              <p>
                Sign in with that email and temporary password, then set a password of your own.{' '}
                {one ? 'Your module is' : 'Your modules are'} already unlocked on the account.
              </p>
              <a className="button thanks-cta" href={lms.web} target="_blank" rel="noreferrer">
                <span className="btn-label">Open the LMS</span> <span aria-hidden="true">↗</span>
              </a>
            </div>
          </li>

          <li>
            <span className="thanks-num" aria-hidden="true">
              3
            </span>
            <div className="thanks-step-body">
              <b>Or carry it on your phone</b>
              <p>
                The mobile app runs the same modules and the same account — sign in with the credentials from step one
                and your progress follows you between the two.
              </p>
              <a className="button button-outline thanks-cta" href={lms.mobile} target="_blank" rel="noreferrer">
                <span className="btn-label">Download the app</span> <span aria-hidden="true">↓</span>
              </a>
            </div>
          </li>
        </ol>

        <div className="thanks-order">
          <h2 className="thanks-h">Your order</h2>
          <ul>
            {rows.map((row) => (
              <li key={row.key}>
                <span>{row.title}</span>
                <span>{row.price}</span>
              </li>
            ))}
          </ul>
          <div className="thanks-total">
            <span>Paid</span>
            <b>{money(total)}</b>
          </div>
          <p className="thanks-ref">
            Order <b>{order.orderId}</b>
          </p>
        </div>

        <footer className="thanks-foot">
          {/* Rendered only once there is an address worth pointing at. */}
          {lms.support && (
            <p>
              Password not arrived, or something else not right?{' '}
              <a href={`mailto:${lms.support}?subject=Order ${order.orderId}`}>{lms.support}</a>
            </p>
          )}
          <Link className="button button-outline" href="/">
            <span className="btn-label">Back to skeo</span> <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
    </main>
  )
}
