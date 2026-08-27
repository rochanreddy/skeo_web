'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, useDialogId } from './Modal'
import { OtpInput } from '@/components/forms/OtpInput'
import { saveCheckoutSession } from '@/lib/checkoutSession'
import { DEMO_OTP, OTP_LENGTH, RESEND_SECONDS, sendOtp, verifyOtp } from '@/lib/otp'
import type { ModuleKey } from '@/lib/plans'
import { validateEmail, validateName, validatePhone } from '@/lib/validation'

type Field = 'name' | 'email' | 'phone'
type Errors = Partial<Record<Field, string>>

/**
 * Step two of buying a module: say who you are, then prove you can be reached.
 * The cart was just picked on the page behind this dialog and the order is
 * restated in full on /checkout, so this screen shows neither — only the
 * modules it is carrying through, which it never displays.
 */
export function VerifyModal({ modules, onClose }: { modules: ModuleKey[]; onClose: () => void }) {
  const titleId = useDialogId('verify-title')
  const router = useRouter()

  const [step, setStep] = useState<'details' | 'code'>('details')
  const [values, setValues] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Resend stays locked for a moment after each send, the way a real gateway
  // rate-limits it.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

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
    return next
  }

  async function handleDetails(event: FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`verify-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setBusy(true)
    await sendOtp({ email: values.email, phone: values.phone })
    setBusy(false)
    setCode('')
    setCodeError(null)
    setCooldown(RESEND_SECONDS)
    setStep('code')
  }

  async function submitCode(entered: string) {
    setCodeError(null)
    setBusy(true)
    const result = await verifyOtp(entered)
    setBusy(false)
    if (!result.ok) {
      setCodeError(result.error)
      return
    }
    // Verified: hand the cart and the contact to /checkout and get out of the
    // way — no success screen, the next page is the confirmation.
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

  async function resend() {
    if (cooldown > 0 || busy) return
    setBusy(true)
    await sendOtp({ email: values.email, phone: values.phone })
    setBusy(false)
    setCode('')
    setCodeError(null)
    setCooldown(RESEND_SECONDS)
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="verify-modal">
      {step === 'details' ? (
        <form className="verify-form" onSubmit={handleDetails} noValidate>
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

          <button type="submit" className="button modal-submit full" disabled={busy}>
            <span className="btn-label">{busy ? 'Sending code…' : 'Send code'}</span>
            <span className={busy ? 'spinner' : ''} aria-hidden="true">
              {busy ? '' : '→'}
            </span>
          </button>
          <small className="purchase-note">Your seat is held once the code is verified</small>
        </form>
      ) : (
        <form
          className="verify-form"
          onSubmit={(e) => {
            e.preventDefault()
            void submitCode(code)
          }}
          noValidate
        >
          <h3 id={titleId} className="modal-title">
            Enter the code
          </h3>
          <p className="modal-sub">
            Sent to <b>{values.phone}</b> and <b>{values.email}</b>.{' '}
            <button type="button" className="link-button" onClick={() => setStep('details')}>
              Change
            </button>
          </p>

          <OtpInput
            id="verify-code"
            value={code}
            onChange={(next) => {
              setCode(next)
              if (codeError) setCodeError(null)
            }}
            onComplete={(entered) => void submitCode(entered)}
            invalid={Boolean(codeError)}
            describedBy={codeError ? 'verify-code-error' : 'verify-code-demo'}
          />

          {codeError && (
            <span className="field-message otp-message" id="verify-code-error" role="alert">
              {codeError}
            </span>
          )}

          {/* No gateway is wired up yet, so the code has to come from somewhere. */}
          <p className="otp-demo" id="verify-code-demo">
            Demo build — nothing is actually sent. Use <b>{DEMO_OTP}</b>.
          </p>

          <button type="submit" className="button modal-submit full" disabled={busy || code.length < OTP_LENGTH}>
            <span className="btn-label">{busy ? 'Verifying…' : 'Verify and continue'}</span>
            <span className={busy ? 'spinner' : ''} aria-hidden="true">
              {busy ? '' : '→'}
            </span>
          </button>

          <div className="otp-resend">
            {cooldown > 0 ? (
              <span>Resend code in {cooldown}s</span>
            ) : (
              <button type="button" className="link-button" onClick={() => void resend()} disabled={busy}>
                Resend code
              </button>
            )}
          </div>
        </form>
      )}
    </Modal>
  )
}
