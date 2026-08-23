import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: '140px 0 160px', textAlign: 'center' }}>
      <span className="eyebrow">404</span>
      <h1 style={{ margin: '18px 0 14px' }}>
        Nothing to build
        <br />
        <em>here.</em>
      </h1>
      <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto 28px' }}>
        That page has moved or never existed. Head back and pick up your streak.
      </p>
      <Link className="button" href="/" style={{ display: 'inline-flex' }}>
        <span className="btn-label">Back to Skeo</span> <span aria-hidden="true">→</span>
      </Link>
    </main>
  )
}
