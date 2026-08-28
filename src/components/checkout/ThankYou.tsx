'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/analytics/track'
import { readCompletedOrder, type CompletedOrder } from '@/lib/checkoutSession'
import { MODULE_ROWS, money, type ModuleKey } from '@/lib/plans'
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
              <a
                className="button thanks-cta"
                href={lms.web}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('lms_open', { target: 'web', orderId: order.orderId, email: order.email })}
              >
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
              <a
                className="button button-outline thanks-cta"
                href={lms.mobile}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('lms_open', { target: 'mobile', orderId: order.orderId, email: order.email })}
              >
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

        <NextUp bought={order.modules} email={order.email} />

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

/**
 * "Which one next?" — asked here because someone who has just bought is the
 * only person whose answer is worth anything, and because the admin dashboard
 * has no other honest way to know what to build next.
 *
 * Only the modules they did not buy are offered, the answer is one tap, and
 * nothing is promised in return beyond being told when it lands.
 */
function NextUp({ bought, email }: { bought: ModuleKey[]; email: string }) {
  const [picked, setPicked] = useState<ModuleKey[]>([])
  const remaining = MODULE_ROWS.filter((row) => !bought.includes(row.key))

  // They bought everything — there is nothing left to ask about.
  if (remaining.length === 0) return null

  function toggle(key: ModuleKey) {
    const removing = picked.includes(key)
    setPicked((current) => (removing ? current.filter((k) => k !== key) : [...current, key]))
    // Only the positive answer is worth recording; un-ticking is someone
    // correcting themselves, not a signal about the module.
    if (!removing) track('next_interest', { module: key, email })
  }

  return (
    <section className="thanks-next" aria-labelledby="thanks-next-h">
      <h2 className="thanks-h" id="thanks-next-h">
        What should we teach you next?
      </h2>
      <p className="thanks-next-sub">
        Tap anything you want. We will email you the moment it opens — no charge for saying so.
      </p>
      <ul className="thanks-next-list">
        {remaining.map((row) => {
          const on = picked.includes(row.key)
          return (
            <li key={row.key}>
              <button
                type="button"
                className={`thanks-next-chip${on ? ' is-on' : ''}`}
                onClick={() => toggle(row.key)}
                aria-pressed={on}
              >
                <b>{row.title}</b>
                <small>{row.subtitle}</small>
                <span className="thanks-next-mark" aria-hidden="true">
                  {on ? '✓' : '+'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {picked.length > 0 && (
        <p className="thanks-next-done" role="status">
          Noted — we will let you know about {picked.length === 1 ? 'that one' : `all ${picked.length}`} first.
        </p>
      )}
    </section>
  )
}
