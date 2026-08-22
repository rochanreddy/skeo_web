'use client'

import { useState, type FormEvent } from 'react'
import { Modal, useDialogId } from './Modal'
import { PLANS, type PlanKey } from '@/lib/plans'
import {
  cardBrand,
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateCvc,
  validateEmail,
  validateExpiry,
} from '@/lib/validation'

type Field = 'email' | 'card' | 'expiry' | 'cvc'
type Errors = Partial<Record<Field, string>>

export function PurchaseModal({ planKey, onClose }: { planKey: PlanKey; onClose: () => void }) {
  const titleId = useDialogId('purchase-title')
  const plan = PLANS[planKey]
  const isTeams = plan.billing === 'custom'

  const [values, setValues] = useState({ email: '', card: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const brand = cardBrand(values.card)

  function set(key: Field, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): Errors {
    const next: Errors = {}
    const email = validateEmail(values.email)
    if (email) next.email = email
    // Teams enquiries never collect card details.
    if (!isTeams) {
      const card = validateCardNumber(values.card)
      if (card) next.card = card
      const expiry = validateExpiry(values.expiry)
      if (expiry) next.expiry = expiry
      const cvc = validateCvc(values.cvc)
      if (cvc) next.cvc = cvc
    }
    return next
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`purchase-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setDone(true)
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="purchase-modal">
      <div className="purchase-plan">
        <span className="eyebrow">{plan.eyebrow}</span>
        <h3 id={titleId}>{plan.title}</h3>
        <div className="purchase-price">
          <span>{plan.price}</span>
          <small>{plan.period}</small>
        </div>
        <ul>
          {plan.features.map((feature) => (
            <li key={feature}>
              <b aria-hidden="true">✓</b> {feature}
            </li>
          ))}
        </ul>
      </div>

      {done ? (
        <div className="modal-success">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h3>{isTeams ? 'Request received.' : 'You’re enrolled.'}</h3>
          <p>
            {isTeams
              ? 'A member of the team will reach out within one working day.'
              : 'Check your email for next steps. Your first build is waiting.'}
          </p>
          <button type="button" className="button" onClick={onClose}>
            {isTeams ? 'Back to pricing' : 'Start building'} <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <form className="purchase-form" onSubmit={handleSubmit} noValidate>
          <h4>{isTeams ? 'Tell us where to reach you' : 'Checkout'}</h4>

          <div className={`field${errors.email ? ' invalid' : ''}`}>
            <label htmlFor="purchase-email">{isTeams ? 'Work email' : 'Email'}</label>
            <input
              id="purchase-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'purchase-email-error' : undefined}
            />
            {errors.email && (
              <span className="field-message" id="purchase-email-error">
                {errors.email}
              </span>
            )}
          </div>

          {!isTeams && (
            <>
              <div className={`field${errors.card ? ' invalid' : ''}`}>
                <label htmlFor="purchase-card">
                  Card number
                  {brand && <span className="card-brand">{brand}</span>}
                </label>
                <input
                  id="purchase-card"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  value={values.card}
                  onChange={(e) => set('card', formatCardNumber(e.target.value))}
                  aria-invalid={Boolean(errors.card)}
                  aria-describedby={errors.card ? 'purchase-card-error' : undefined}
                />
                {errors.card && (
                  <span className="field-message" id="purchase-card-error">
                    {errors.card}
                  </span>
                )}
              </div>

              <div className="field-row">
                <div className={`field${errors.expiry ? ' invalid' : ''}`}>
                  <label htmlFor="purchase-expiry">Expiry</label>
                  <input
                    id="purchase-expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    maxLength={7}
                    value={values.expiry}
                    onChange={(e) => set('expiry', formatExpiry(e.target.value))}
                    aria-invalid={Boolean(errors.expiry)}
                    aria-describedby={errors.expiry ? 'purchase-expiry-error' : undefined}
                  />
                  {errors.expiry && (
                    <span className="field-message" id="purchase-expiry-error">
                      {errors.expiry}
                    </span>
                  )}
                </div>
                <div className={`field${errors.cvc ? ' invalid' : ''}`}>
                  <label htmlFor="purchase-cvc">CVC</label>
                  <input
                    id="purchase-cvc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    value={values.cvc}
                    onChange={(e) => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    aria-invalid={Boolean(errors.cvc)}
                    aria-describedby={errors.cvc ? 'purchase-cvc-error' : undefined}
                  />
                  {errors.cvc && (
                    <span className="field-message" id="purchase-cvc-error">
                      {errors.cvc}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="button modal-submit full" disabled={submitting}>
            <span className="btn-label">{submitting ? 'Processing…' : plan.cta}</span>
            <span className={submitting ? 'spinner' : ''} aria-hidden="true">
              {submitting ? '' : '→'}
            </span>
          </button>

          <small className="purchase-note">
            {isTeams ? 'No card required · We reply within one working day' : 'No card is charged in this preview · Cancel anytime'}
          </small>
        </form>
      )}
    </Modal>
  )
}
