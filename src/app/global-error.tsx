'use client'

import { useEffect } from 'react'

/**
 * The last resort: an error thrown in the root layout itself, where error.tsx
 * cannot help because the layout that would have wrapped it is the thing that
 * failed.
 *
 * It REPLACES the root layout, so it has to render its own <html> and <body> —
 * and it cannot rely on anything that layout sets up. globals.css is not
 * loaded here and the palette attribute is never written, so every style below
 * is inline and every colour is literal. That is deliberate: a fallback that
 * depends on the thing that just broke is not a fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root error:', error.digest ?? error.message, error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '40px 24px',
          background: '#141413',
          color: '#faf9f5',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <main style={{ textAlign: 'center', maxWidth: 460 }}>
          <p
            style={{
              margin: '0 0 18px',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#8a867e',
            }}
          >
            skeo
          </p>
          <h1 style={{ margin: '0 0 14px', fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Something went wrong.
          </h1>
          <p style={{ margin: '0 0 28px', color: '#b8b4ab', lineHeight: 1.6 }}>
            The page failed to load. Reloading usually clears it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              appearance: 'none',
              border: 0,
              borderRadius: 999,
              padding: '13px 26px',
              background: '#faf9f5',
              color: '#141413',
              font: '600 15px inherit',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ marginTop: 26, fontSize: 12, color: '#6f6b64' }}>
              Reference <b>{error.digest}</b>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
