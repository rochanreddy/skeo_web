'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, useDialogId } from './Modal'
import { PaidNotice } from './PaidNotice'
import { track } from '@/lib/analytics/track'
import { saveCheckoutSession } from '@/lib/checkoutSession'
import { verifySmsOtp } from '@/lib/amplifeedOtp'
import { startPayment } from '@/lib/payment'
import { friendlyError, reportError } from '@/lib/friendlyError'
import type { CheckoutItem } from '@/lib/checkoutItems'
import { validateEmail, validateName, validatePhone } from '@/lib/validation'

type Field = 'name' | 'email' | 'phone'
type Errors = Partial<Record<Field, string>>

/**
 * Step two of buying a tool: say who you are, then prove you can be reached.
 * The cart was just picked on the page behind this dialog and the order is
 * restated in full on /checkout, so this screen shows neither — only the
 * tools it is carrying through, which it never displays.
 *
 * Verification is Amplifeed, the same provider menler's campaign pages use, and
 * that decides the shape of this screen: the provider draws its OWN code-entry
 * dialog and checks the code itself, resolving with a short-lived token. There
 * is no code for this component to compare, so it no longer has a second step
 * or a six-box input — it collects the details, hands off, and on success goes
 * straight to /checkout.
 *
 * WHAT THE TOKEN IS AND IS NOT: it proves the visitor held that phone or inbox
 * a moment ago, in this browser. It is not proof to a server, because nothing
 * here checks it with Amplifeed — skeo has no backend for this step yet. When
 * one exists it should send otp_token with the order and verify it there, the
 * way menler's /leads does before marking a lead verified.
 *
 * DIRECT: on the campaign pages (lib/landings) there is no code and no
 * /checkout review: the details go straight to an order and Cashfree's popup,
 * and once it closes this dialog says the login is on its way (PaidNotice)
 * rather than sending the buyer to /thank-you. Nothing is lost by it on the
 * server: the order route never asked for the code, and only Cashfree
 * answering PAID unlocks anything.
 */
export function VerifyModal({
  modules,
  direct = false,
  onClose,
}: {
  modules: CheckoutItem[]
  direct?: boolean
  onClose: () => void
}) {
  const titleId = useDialogId('verify-title')
  const router = useRouter()

  const [values, setValues] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [paidOrder, setPaidOrder] = useState<string | null>(null)

  // /checkout is never linked to, so Next has no reason to have fetched it —
  // without this the route is only requested once verification passes, and the
  // wait for it lands on the one screen where nothing else is happening.
  useEffect(() => {
    router.prefetch('/checkout')
  }, [router])

  function set(key: Field, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
    if (failure) setFailure(null)
  }

  function validate(): Errors {
    const next: Errors = {}
    const name = validateName(values.name)
    if (name) next.name = name
    const email = validateEmail(values.email)
    if (email) next.email = email
    const phone = validatePhone(values.phone)
    if (phone) next.phone = phone
    return next
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`verify-${Object.keys(next)[0]}`)?.focus()
      return
    }

    setBusy(true)
    setFailure(null)
    const contact = { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() }

    if (direct) {
      // Still a lead in the admin's list, called back if they do not pay.
      track('verify_ok', { modules, ...contact })
      saveCheckoutSession({ modules, contact, verifiedAt: Date.now() })
      setLeaving(true)
      const result = await startPayment({ items: modules, contact }, { stay: true })
      setBusy(false)
      setLeaving(false)
      if (result.ok) setPaidOrder(result.orderId)
      else setFailure(result.error)
      return
    }

    track('verify_sent', { modules })

    try {
      // SMS, with the email offered as the other channel — the same pairing
      // menler's apply flow uses, and the reason the address is passed in.
      await verifySmsOtp(values.phone, { email: values.email })
    } catch (err) {
      setBusy(false)
      // Cancelling the provider's dialog rejects too, so this is not always an
      // error worth alarming about — friendlyError words it as something to retry.
      const f = friendlyError(err, 'verify')
      reportError('verify', err, f)
      setFailure(f.message)
      return
    }

    // Deliberately still busy: the button keeps its spinner until the dialog
    // closes, so the gap while /checkout renders reads as progress rather than
    // as a press that did nothing.
    setLeaving(true)
    // The phone too: this event is the admin's Leads list, and a lead who did
    // not pay is only worth something if they can be called back.
    track('verify_ok', { modules, email: values.email.trim(), name: values.name.trim(), phone: values.phone.trim() })
    saveCheckoutSession({
      modules,
      contact: { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() },
      verifiedAt: Date.now(),
    })
    router.push('/checkout')
    // The provider lives in the root layout, so navigating does not unmount the
    // dialog — without this the overlay sits on top of /checkout and swallows
    // every click on it.
    onClose()
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="verify-modal" suspended={busy}>
      {paidOrder ? (
        <PaidNotice orderId={paidOrder} email={values.email.trim()} onClose={onClose} />
      ) : (
      <form className="verify-form" onSubmit={handleSubmit} noValidate>
        <h3 id={titleId} className="sr-only">
          Verify it&rsquo;s you
        </h3>

        <div className={`field${errors.name ? ' invalid' : ''}`}>
          <label htmlFor="verify-name">Full name</label>
          <input
            id="verify-name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'verify-name-error' : undefined}
          />
          {errors.name && (
            <span className="field-message" id="verify-name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className={`field${errors.phone ? ' invalid' : ''}`}>
          <label htmlFor="verify-phone">Phone / WhatsApp</label>
          <input
            id="verify-phone"
            type="tel"
            inputMode="tel"
            placeholder="+91 …"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'verify-phone-error' : undefined}
          />
          {errors.phone && (
            <span className="field-message" id="verify-phone-error">
              {errors.phone}
            </span>
          )}
        </div>

        <div className={`field${errors.email ? ' invalid' : ''}`}>
          <label htmlFor="verify-email">Email</label>
          <input
            id="verify-email"
            type="email"
            placeholder="you@domain.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'verify-email-error' : undefined}
          />
          {errors.email && (
            <span className="field-message" id="verify-email-error">
              {errors.email}
            </span>
          )}
        </div>

        {failure && (
          <span className="field-message otp-message" role="alert">
            {failure}
          </span>
        )}

        <button type="submit" className="button modal-submit full" disabled={busy}>
          <span className="btn-label">
            {direct
              ? leaving
                ? 'Opening payment…'
                : failure
                  ? 'Try again'
                  : 'Register Now'
              : leaving
                ? 'Opening checkout…'
                : busy
                  ? 'Verifying…'
                  : failure
                    ? 'Try again'
                    : 'Send code'}
          </span>
          <span className={busy ? 'spinner' : ''} aria-hidden="true">
            {busy ? '' : '→'}
          </span>
        </button>
        <small className="purchase-note">
          {direct
            ? 'Secure payment by Cashfree — UPI, cards and netbanking.'
            : 'We’ll text a code to confirm it’s you. Your seat is held once it is verified.'}
        </small>
      </form>
      )}
    </Modal>
  )
}
