'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * The boundary for an error thrown while rendering a route.
 *
 * Its absence is what the dev overlay means by "missing required error
 * components": the App Router looks for this pair, and without it a render
 * error in production falls through to Next's own bare page rather than
 * anything of skeo's.
 *
 * Written to match not-found: same shell, same voice, and a way onward rather
 * than a dead end. `reset` re-renders the segment, which is worth offering
 * first — most of what lands here is transient.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The digest is the only handle on a production error, where the message
    // itself is withheld — log it so a report can be matched to a server trace.
    console.error('Route error:', error.digest ?? error.message, error)
  }, [error])

  return (
    <main className="wrap" style={{ padding: '140px 0 160px', textAlign: 'center' }}>
      <span className="eyebrow">SOMETHING BROKE</span>
      <h1 style={{ margin: '18px 0 14px' }}>
        That didn&rsquo;t load
        <br />
        <em>as it should.</em>
      </h1>
      <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 28px' }}>
        Our end, not yours. Try again — and if it keeps happening, the page below
        always works.
      </p>
      <div
        style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <button type="button" className="button" onClick={reset}>
          <span className="btn-label">Try again</span> <span aria-hidden="true">↻</span>
        </button>
        <Link className="button button-outline" href="/" style={{ display: 'inline-flex' }}>
          <span className="btn-label">Back to skeo</span> <span aria-hidden="true">→</span>
        </Link>
      </div>
      {error.digest && (
        <p style={{ color: 'var(--ink-5)', fontSize: 12, marginTop: 26 }}>
          Reference <b>{error.digest}</b>
        </p>
      )}
    </main>
  )
}
