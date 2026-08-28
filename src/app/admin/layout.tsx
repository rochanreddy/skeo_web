import type { Metadata } from 'next'
import './admin.css'

/**
 * The dashboard is behind a password and has nothing to offer a crawler, so it
 * is kept out of the index and out of the sitemap entirely.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>
}
