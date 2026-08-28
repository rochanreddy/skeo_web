'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm({ defaultPassword }: { defaultPassword: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const body = (await response.json()) as { ok: boolean; error?: string }
      if (!body.ok) {
        setError(body.error ?? 'That password is not right.')
        setPassword('')
        setBusy(false)
        return
      }
      // The cookie is set; `refresh` makes the server re-run the /admin guard.
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('Could not reach the server.')
      setBusy(false)
    }
  }

  return (
    <form className="login-card" onSubmit={submit} noValidate>
      <span className="brand-mark" aria-hidden="true">
        S
      </span>
      <h1>skeo admin</h1>
      <p className="login-sub">Sign in to see how the site is doing.</p>

      <div className={`field${error ? ' invalid' : ''}`}>
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError(null)
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'admin-password-error' : undefined}
        />
        {error && (
          <span className="field-message" id="admin-password-error" role="alert">
            {error}
          </span>
        )}
      </div>

      <button type="submit" className="button modal-submit full" disabled={busy || password.length === 0}>
        <span className="btn-label">{busy ? 'Checking…' : 'Sign in'}</span>
        <span className={busy ? 'spinner' : ''} aria-hidden="true">
          {busy ? '' : '→'}
        </span>
      </button>

      {/* Shown only while the built-in password is still in force — once
          ADMIN_PASSWORD is set there is nothing here worth printing. */}
      {defaultPassword && (
        <p className="login-hint">
          No <code>ADMIN_PASSWORD</code> is set, so the password is <b>skeo-admin</b>. Put a real one in{' '}
          <code>.env.local</code> before this is deployed.
        </p>
      )}
    </form>
  )
}
