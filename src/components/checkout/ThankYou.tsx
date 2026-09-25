'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/analytics/track'
import { CHECKOUT_ROWS, type CheckoutItem } from '@/lib/checkoutItems'
import { clearCheckoutSession } from '@/lib/checkoutSession'
import { price, useCurrency } from '@/lib/currency'
import { MODULE_ROWS, type ModuleKey } from '@/lib/plans'
import { lms } from '@/lib/site'

/**
 * What happens after the money: the receipt, and the three things someone has
 * to do to actually start what they just bought.
 *
 * Cashfree sends the buyer here with ?order_id=…, and the page asks the server
 * where that order stands rather than taking the browser's word for it. The
 * server checks with Cashfree, and — once the payment is PAID — has the LMS
 * make the account and send the login mail. So the page polls briefly: a
 * redirect can land a second or two before Cashfree marks the order paid.
 */

type OrderView = {
  status: 'pending' | 'paid' | 'provisioned' | 'failed' | 'unknown' | 'error'
  orderId: string
  items: CheckoutItem[]
  amount: number
  email: string
}

const POLL_MS = 2500
// Long enough to ride out Cashfree marking the order paid and the LMS sending
// its mail; after this the page stops asking and says what it knows.
const GIVE_UP_MS = 90_000

export function ThankYou() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get('order_id')
    if (!orderId) {
      router.replace('/')
      return undefined
    }
    let stopped = false
    const started = Date.now()
    let timer: ReturnType<typeof setTimeout> | undefined

    async function check() {
      let view: OrderView | null = null
      try {
        const res = await fetch(`/api/checkout/order/${encodeURIComponent(orderId!)}`, { cache: 'no-store' })
        view = (await res.json()) as OrderView
      } catch {
        view = null
      }
      if (stopped) return
      if (view?.status === 'unknown') {
        router.replace('/')
        return
      }
      if (view && view.status !== 'error') setOrder(view)
      // Paid: the cart has done its job. Cleared only now, so someone who
      // backed out of Cashfree's page still has their order to try again.
      if (view?.status === 'paid' || view?.status === 'provisioned') clearCheckoutSession()
      const settled = view?.status === 'provisioned' || view?.status === 'failed'
      if (settled) return
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
  }, [router])

  // Above the bail-outs below: hooks cannot run conditionally.
  const currency = useCurrency()

  if (!order) {
    return (
      <main className="thanks">
        <div className="thanks-card">
          <header className="thanks-head">
            <h1>Confirming your payment…</h1>
            <p>This takes a few seconds. Please keep this page open.</p>
          </header>
        </div>
      </main>
    )
  }

  if (order.status === 'failed') {
    return (
      <main className="thanks">
        <div className="thanks-card">
          <header className="thanks-head">
            <h1>The payment didn&rsquo;t go through.</h1>
            <p>
              Nothing was charged for order <b>{order.orderId}</b>. You can try again from the pricing section.
            </p>
          </header>
          <footer className="thanks-foot">
            <Link className="button" href="/#pricing">
              <span className="btn-label">Back to pricing</span> <span aria-hidden="true">→</span>
            </Link>
          </footer>
        </div>
      </main>
    )
  }

  // Cashfree has not said PAID yet — usually a matter of seconds.
  if (order.status === 'pending') {
    return (
      <main className="thanks">
        <div className="thanks-card">
          <header className="thanks-head">
            <h1>{timedOut ? 'Still waiting for the bank.' : 'Confirming your payment…'}</h1>
            <p>
              {timedOut
                ? `We haven’t had confirmation for order ${order.orderId} yet. If money left your account, your login details will be emailed to ${order.email} as soon as it is confirmed.`
                : 'This takes a few seconds. Please keep this page open.'}
            </p>
          </header>
          {timedOut && lms.support && (
            <footer className="thanks-foot">
              <p>
                Questions? <a href={`mailto:${lms.support}?subject=Order ${order.orderId}`}>{lms.support}</a>
              </p>
            </footer>
          )}
        </div>
      </main>
    )
  }

  // Paid. `provisioned` means the LMS has the account and has sent the mail;
  // `paid` means it is still being set up — the steps are the same either way.
  const rows = CHECKOUT_ROWS.filter((row) => order.items.includes(row.key))
  const one = rows.length === 1
  const ready = order.status === 'provisioned'

  return (
    <main className="thanks">
      <div className="thanks-card">
        <header className="thanks-head">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h1>You&rsquo;re in.</h1>
          <p>
            {one ? `${rows[0]?.title ?? 'Your purchase'} is` : `All ${rows.length} tools are`} yours.{' '}
            {ready ? 'Your login details are on their way to' : 'Your account is being set up — the login details will go to'}{' '}
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
                only thing you need to sign in. If you already had a skeo account, sign in with the password you
                already use.
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
                {one ? 'What you bought is' : 'Your tools are'} already unlocked on the account.
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
                The mobile app runs the same tools and the same account — sign in with the credentials from step one
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
                <span>{price(row.amount, currency)}</span>
              </li>
            ))}
          </ul>
          <div className="thanks-total">
            <span>Paid</span>
            <b>{price(order.amount, currency)}</b>
          </div>
          <p className="thanks-ref">
            Order <b>{order.orderId}</b>
          </p>
        </div>

        <NextUp bought={order.items} email={order.email} />

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
 * Only the tools they did not buy are offered, the answer is one tap, and
 * nothing is promised in return beyond being told when it lands. Someone who
 * bought Everything AI owns every tool, so there is nothing to ask them.
 */
function NextUp({ bought, email }: { bought: CheckoutItem[]; email: string }) {
  const [picked, setPicked] = useState<ModuleKey[]>([])
  const remaining = bought.includes('member') ? [] : MODULE_ROWS.filter((row) => !bought.includes(row.key))

  if (remaining.length === 0) return null

  function toggle(key: ModuleKey) {
    const removing = picked.includes(key)
    setPicked((current) => (removing ? current.filter((k) => k !== key) : [...current, key]))
    // Only the positive answer is worth recording; un-ticking is someone
    // correcting themselves, not a signal about the tool.
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
