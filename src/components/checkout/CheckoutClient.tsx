'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  clearCheckoutSession,
  readCheckoutSession,
  saveCompletedOrder,
  type CheckoutSession,
} from '@/lib/checkoutSession'
import { track } from '@/lib/analytics/track'
import { payForOrder } from '@/lib/payment'
import { MODULE_ROWS, PLANS, money } from '@/lib/plans'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'

const MARKS = {
  claude: ClaudeMark,
  chatgpt: ChatGptMark,
  gemini: GeminiMark,
  n8n: N8nMark,
  lovable: LovableMark,
}

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
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    track('checkout_view', {
      modules: found.modules,
      email: found.contact.email,
    })
  }, [router])

  if (!session) return null

  const rows = MODULE_ROWS.filter((row) => session.modules.includes(row.key))
  const subtotal = rows.reduce((sum, row) => sum + row.amount, 0)
  const total = subtotal

  const contactEmail = session.contact.email
  const contactName = session.contact.name

  async function pay() {
    setError(null)
    setPaying(true)
    const result = await payForOrder({ amount: total })
    setPaying(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    // The one event the revenue column is built on, sent before the redirect so
    // a slow network cannot lose the sale from the dashboard.
    track('purchase', {
      orderId: result.orderId,
      modules: rows.map((row) => row.key),
      amount: total,
      email: contactEmail,
      name: contactName,
    })
    // The order is done: drop the session so a refresh or a back-button press
    // cannot replay the same payment, and hand the receipt to /thank-you.
    saveCompletedOrder({
      orderId: result.orderId,
      modules: rows.map((row) => row.key),
      email: contactEmail,
      paidAt: Date.now(),
    })
    clearCheckoutSession()
    router.replace('/thank-you')
  }

  return (
    <main className="checkout">
      {/* LEFT — ink panel: who is buying, and what they picked. */}
      <section className="checkout-detail" aria-label="Order details">
        <div className="checkout-panel">
          <Link className="checkout-back" href="/#pricing">
            ← Back to modules
          </Link>

          <ol className="step-track" aria-label="Checkout progress">
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

          {/* What you are buying leads; the money is restated on the paper side
              and the contact is a confirmation, so both come after it. */}
          <h2 className="checkout-h">
            {rows.length} module{rows.length > 1 ? 's' : ''} in your order
          </h2>
          <ul className="checkout-items">
            {rows.map((row) => {
              const plan = PLANS[row.key]
              return (
                <li key={row.key}>
                  <div className="checkout-item-head">
                    <span className="checkout-item-info">
                      <b>
                        {row.title}
                        <span className="module-marks" aria-hidden="true">
                          {row.marks.map((mark) => {
                            const Mark = MARKS[mark]
                            return <Mark key={mark} className="module-mark" />
                          })}
                        </span>
                      </b>
                      <small>{row.subtitle}</small>
                    </span>
                    <span className="checkout-item-price">{row.price}</span>
                  </div>
                  <ul className="checkout-item-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>

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

          {/* The amount used to be set large here as well as on the total line,
              which printed the same figure three times down one short column.
              The total is the only one that is large now. */}
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
            <b>{money(total)}</b>
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

          {/* Both claims come from the module's own pricing copy — nothing here
              promises anything the pricing card does not. */}
          <ul className="checkout-assurances">
            <li>Pay once — the module is yours to keep</li>
            <li>Certificate on completion</li>
          </ul>

          {/* Honest about what this is: no gateway is connected yet. */}
          <p className="checkout-fine">Demo build — no gateway is connected and no card is charged.</p>
        </div>
      </section>
    </main>
  )
}
