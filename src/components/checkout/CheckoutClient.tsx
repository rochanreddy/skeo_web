'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearCheckoutSession, readCheckoutSession, type CheckoutSession } from '@/lib/checkoutSession'
import { payForOrder } from '@/lib/payment'
import { MODULE_ROWS, money } from '@/lib/plans'

/**
 * Step three: the order itself. Everything shown here was decided on the two
 * screens before it — this page only restates the cart, adds up the money and
 * takes the payment, so there is nothing to edit and nothing to re-enter.
 *
 * The session is read once on mount rather than during render: sessionStorage
 * does not exist on the server, and reading it in an effect keeps the first
 * client paint identical to the server's.
 */
export function CheckoutClient() {
  const router = useRouter()
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'paid'>('loading')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // /checkout is only reachable after verifying, so a direct visit — or a
  // verification that has since expired — goes back to the cart rather than
  // showing an order nobody has claimed.
  useEffect(() => {
    const found = readCheckoutSession()
    if (!found) {
      router.replace('/#pricing')
      return
    }
    setSession(found)
    setState('ready')
  }, [router])

  if (!session) return null

  const rows = MODULE_ROWS.filter((row) => session.modules.includes(row.key))
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0)
  const total = subtotal

  async function pay() {
    setError(null)
    setPaying(true)
    const result = await payForOrder({ amount: total })
    setPaying(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    // The order is done: drop the session so a refresh or a back-button press
    // cannot replay the same payment.
    clearCheckoutSession()
    setOrderId(result.orderId)
    setState('paid')
    window.scrollTo(0, 0)
  }

  if (state === 'paid') {
    return (
      <main className="checkout-done">
        <div className="checkout-done-inner">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h1>You&rsquo;re in.</h1>
          <p>
            {rows.length === 1 ? 'Your module is' : `All ${rows.length} modules are`} unlocked. We&rsquo;ve sent the
            receipt and your login link to <b>{session.contact.email}</b>.
          </p>
          <ul className="checkout-done-list">
            {rows.map((row) => (
              <li key={row.key}>
                <b>{row.title}</b>
                <span>{row.price}</span>
              </li>
            ))}
          </ul>
          <p className="checkout-order-id">
            Order <b>{orderId}</b>
          </p>
          <Link className="button" href="/">
            <span className="btn-label">Back to skeo</span> <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout">
      {/* LEFT — ink panel: who is buying, and what they picked. */}
      <section className="checkout-detail" aria-label="Order details">
        <div className="checkout-panel">
          <Link className="checkout-back" href="/#pricing">
            ← Back to modules
          </Link>

          <ol className="step-track on-dark" aria-label="Checkout progress">
            <li className="done">
              <b aria-hidden="true">✓</b> Cart
            </li>
            <li className="done">
              <b aria-hidden="true">✓</b> Verify
            </li>
            <li className="current" aria-current="step">
              <b aria-hidden="true">3</b> Pay
            </li>
          </ol>

          <h2 className="checkout-h">
            Contact
            <span className="checkout-verified" aria-label="Verified by one-time code">
              ✓ Verified
            </span>
          </h2>
          <dl className="checkout-info">
            <div>
              <dt>Name</dt>
              <dd>{session.contact.name}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{session.contact.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{session.contact.email}</dd>
            </div>
          </dl>

          <h2 className="checkout-h">
            {rows.length} module{rows.length > 1 ? 's' : ''} in your cart
          </h2>
          <ul className="checkout-items">
            {rows.map((row) => (
              <li key={row.key}>
                <span className="checkout-item-info">
                  <b>{row.title}</b>
                  <small>{row.subtitle}</small>
                </span>
                <span className="checkout-item-price">{row.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RIGHT — paper panel: the money and the one button that matters. */}
      <section className="checkout-summary" aria-label="Order summary">
        <div className="checkout-panel">
          <span className="brand" aria-label="skeo">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>skeo</span>
          </span>

          <span className="eyebrow">ORDER SUMMARY</span>
          <p className="checkout-amount">{money(total)}</p>

          <ul className="checkout-lines">
            {rows.map((row) => (
              <li key={row.key}>
                <span>{row.title}</span>
                <span>{row.price}</span>
              </li>
            ))}
          </ul>

          <div className="checkout-sub">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="checkout-sub muted">
            <span>Taxes</span>
            <span>{money(0)}</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>

          <button type="button" className="button full checkout-pay" onClick={() => void pay()} disabled={paying}>
            <span className="btn-label">{paying ? 'Processing…' : `Pay ${money(total)}`}</span>
            <span className={paying ? 'spinner' : ''} aria-hidden="true">
              {paying ? '' : '→'}
            </span>
          </button>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          {/* Honest about what this is: no gateway is connected yet. */}
          <p className="checkout-fine">Demo build — no gateway is connected and no card is charged.</p>
        </div>
      </section>
    </main>
  )
}
