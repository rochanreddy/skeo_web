'use client'

import { useState, type FormEvent } from 'react'
import { Modal, useDialogId } from './Modal'
import type { AuthMode } from './ModalProvider'
import { track } from '@/lib/analytics/track'
import { passwordStrength, validateEmail, validateName, validatePassword } from '@/lib/validation'

type Errors = Partial<Record<'name' | 'email' | 'password', string>>

const COPY: Record<AuthMode, { title: string; sub: string; submit: string }> = {
  signin: {
    title: 'Welcome back',
    sub: 'Sign in to keep building your AI streak.',
    submit: 'Sign in',
  },
  signup: {
    title: 'Create your account',
    sub: 'Start your first free challenge in under a minute.',
    submit: 'Create account',
  },
}

export function AuthModal({ initialMode, onClose }: { initialMode: AuthMode; onClose: () => void }) {
  const titleId = useDialogId('auth-title')
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const isSignup = mode === 'signup'
  const copy = COPY[mode]

  function switchMode(next: AuthMode) {
    setMode(next)
    setErrors({})
  }

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): Errors {
    const next: Errors = {}
    if (isSignup) {
      const nameError = validateName(values.name)
      if (nameError) next.name = nameError
    }
    const emailError = validateEmail(values.email)
    if (emailError) next.email = emailError
    // Sign-in only needs a non-empty password; new accounts get the full rule.
    const passwordError = isSignup
      ? validatePassword(values.password)
      : values.password
        ? null
        : 'Password is required.'
    if (passwordError) next.password = passwordError
    return next
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const firstKey = Object.keys(next)[0]
      document.getElementById(`auth-${firstKey}`)?.focus()
      return
    }

    setSubmitting(true)
    // Stand-in for the real auth call.
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitting(false)
    // Reported only once the account exists, so an abandoned half-filled form
    // never counts as a registration. No password leaves this component.
    track(isSignup ? 'signup' : 'signin', {
      email: values.email.trim(),
      ...(isSignup ? { name: values.name.trim() } : {}),
    })
    setDone(true)
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="auth-modal">
      <div className="modal-brand">
        <span className="brand-mark" aria-hidden="true">
          S
        </span>
      </div>

      {done ? (
        <div className="modal-success">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h3 id={titleId}>You’re in.</h3>
          <p>Your dashboard is ready — time to keep your streak alive.</p>
          <button type="button" className="button" onClick={onClose}>
            Go to dashboard <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              className={`auth-tab${!isSignup ? ' active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={`auth-tab${isSignup ? ' active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Register
            </button>
          </div>

          <h3 id={titleId} className="modal-title">
            {copy.title}
          </h3>
          <p className="modal-sub">{copy.sub}</p>

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className={`field${errors.name ? ' invalid' : ''}`}>
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'auth-name-error' : undefined}
                />
                {errors.name && (
                  <span className="field-message" id="auth-name-error">
                    {errors.name}
                  </span>
                )}
              </div>
            )}

            <div className={`field${errors.email ? ' invalid' : ''}`}>
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'auth-email-error' : undefined}
              />
              {errors.email && (
                <span className="field-message" id="auth-email-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className={`field${errors.password ? ' invalid' : ''}`}>
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'auth-password-error' : undefined}
              />
              {isSignup && (
                <div className="pw-meter" data-score={passwordStrength(values.password)} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              )}
              {errors.password && (
                <span className="field-message" id="auth-password-error">
                  {errors.password}
                </span>
              )}
            </div>

            <button type="submit" className="button modal-submit" disabled={submitting}>
              <span className="btn-label">{submitting ? 'Working…' : copy.submit}</span>
              <span className={submitting ? 'spinner' : ''} aria-hidden="true">
                {submitting ? '' : '→'}
              </span>
            </button>
          </form>

          <p className="modal-switch">
            {isSignup ? (
              <>
                Already building with us?{' '}
                <button type="button" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to skeo?{' '}
                <button type="button" onClick={() => switchMode('signup')}>
                  Register
                </button>
              </>
            )}
          </p>
        </>
      )}
    </Modal>
  )
}
