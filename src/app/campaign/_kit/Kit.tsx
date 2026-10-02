import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import './kit.css'

/**
 * The parts every campaign variant shares that are not live: the buy button,
 * the FAQ and the footer. Server components.
 */

/** Every buy button on every variant buys the same thing: verify → /checkout → Cashfree. */
export function Buy({ children, className = 'button', arrow = '→' }: { children: ReactNode; className?: string; arrow?: string }) {
  return (
    <PurchaseButton plan="earlyaccess" className={className} arrow={arrow}>
      {children}
    </PurchaseButton>
  )
}

/** Native <details>: opens without JavaScript, and screen readers know it. */
export function FaqList({ items, className = 'kit-faq' }: { items: readonly { q: string; a: string }[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            <span>{f.q}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}

/** A campaign page ends on its ask: only what a payment gateway and a careful buyer need. */
export function KitFooter({ className = 'kit-foot' }: { className?: string }) {
  return (
    <footer className={className}>
      <span>© {new Date().getFullYear()} skeo · Menler Learning Systems Private Limited</span>
      <nav aria-label="Policies">
        <Link href="/about#working-with-us">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund">Refund</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  )
}

/**
 * The variants are test pages for ads and links, not pages to rank: kept out of
 * search so they never compete with /campaign/everything-ai, which is.
 */
export const variantMeta = (path: string, title: string, description: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  robots: { index: false, follow: true },
  openGraph: { title, description, url: path },
})
