'use client'

import { useState, type FormEvent } from 'react'
import { Modal, useDialogId } from './Modal'
import { BackgroundField } from '@/components/forms/BackgroundField'
import { PLANS, money, type PlanKey } from '@/lib/plans'
import { validateEmail, validateName, validatePhone } from '@/lib/validation'

type Field = 'name' | 'email' | 'phone' | 'background'
type Errors = Partial<Record<Field, string>>

/**
 * Checkout captures the lead, not a card: name, phone, email and the same
 * background question menler.in asks, so a person who lands here is described
 * the same way they would be on the main site. Payment is taken afterwards,
 * out of band.
 */
export function PurchaseModal({ planKeys, onClose }: { planKeys: PlanKey[]; onClose: () => void }) {
  const titleId = useDialogId('purchase-title')
  const plans = planKeys.map((key) => PLANS[key])
  // A cart of one behaves exactly as the old single-plan checkout did.
  const single = plans.length === 1 ? plans[0] : null
  const isTeams = single?.billing === 'custom'
  const cartTotal = plans.reduce((sum, plan) => sum + (plan.amount ?? 0), 0)

  const [values, setValues] = useState({ name: '', email: '', phone: '', background: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function set(key: Field, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): Errors {
    const next: Errors = {}
    const name = validateName(values.name)
    if (name) next.name = name
    const email = validateEmail(values.email)
    if (email) next.email = email
    const phone = validatePhone(values.phone)
    if (phone) next.phone = phone
    // BackgroundField reports '' until the follow-up is answered too.
    if (!values.background) next.background = 'Tell us where you are right now.'
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
        {single ? (
          <>
            <span className="eyebrow">{single.eyebrow}</span>
            <h3 id={titleId}>{single.title}</h3>
            <div className="purchase-price">
              <span>{single.price}</span>
              <small>{single.period}</small>
            </div>
            <ul>
              {single.features.map((feature) => (
                <li key={feature}>
                  <b aria-hidden="true">✓</b> {feature}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <span className="eyebrow">YOUR CART</span>
            <h3 id={titleId}>{plans.length} modules</h3>
            <ul className="purchase-cart">
              {plans.map((plan) => (
                <li key={plan.title}>
                  <b>{plan.title}</b>
                  <span>{plan.price}</span>
                </li>
              ))}
            </ul>
            <div className="purchase-price">
              <span>{money(cartTotal)}</span>
              <small>/ one-time</small>
            </div>
          </>
        )}
      </div>

      {done ? (
        <div className="modal-success">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h3>{isTeams ? 'Request received.' : 'Details received.'}</h3>
          <p>
            {isTeams
              ? 'A member of the team will reach out within one working day.'
              : 'Our team will call you shortly to confirm your enrolment and get you started.'}
          </p>
          <button type="button" className="button" onClick={onClose}>
            {isTeams ? 'Back to pricing' : 'Done'} <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <form className="purchase-form" onSubmit={handleSubmit} noValidate>
          <h4>{isTeams ? 'Tell us where to reach you' : 'Where should we reach you?'}</h4>

          <div className={`field${errors.name ? ' invalid' : ''}`}>
            <label htmlFor="purchase-name">Full name</label>
            <input
              id="purchase-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'purchase-name-error' : undefined}
            />
            {errors.name && (
              <span className="field-message" id="purchase-name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="field-row">
            <div className={`field${errors.email ? ' invalid' : ''}`}>
              <label htmlFor="purchase-email">Email</label>
              <input
                id="purchase-email"
                type="email"
                placeholder="you@domain.com"
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
            <div className={`field${errors.phone ? ' invalid' : ''}`}>
              <label htmlFor="purchase-phone">Phone / WhatsApp</label>
              <input
                id="purchase-phone"
                type="tel"
                inputMode="tel"
                placeholder="+91 …"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'purchase-phone-error' : undefined}
              />
              {errors.phone && (
                <span className="field-message" id="purchase-phone-error">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className={`field${errors.background ? ' invalid' : ''}`}>
            <label htmlFor="purchase-background">Background</label>
            <BackgroundField
              id="purchase-background"
              onChange={(value) => set('background', value)}
              invalid={Boolean(errors.background)}
              describedBy={errors.background ? 'purchase-background-error' : undefined}
            />
            {errors.background && (
              <span className="field-message" id="purchase-background-error">
                {errors.background}
              </span>
            )}
          </div>

          <button type="submit" className="button modal-submit full" disabled={submitting}>
            <span className="btn-label">
              {submitting ? 'Sending…' : isTeams ? single.cta : `Confirm · ${money(cartTotal)}`}
            </span>
            <span className={submitting ? 'spinner' : ''} aria-hidden="true">
              {submitting ? '' : '→'}
            </span>
          </button>

          <small className="purchase-note">
            {isTeams
              ? 'No card required · We reply within one working day'
              : 'No card is charged here · Our team confirms your seat by phone'}
          </small>
        </form>
      )}
    </Modal>
  )
}
