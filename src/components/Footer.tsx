import { AuthButton } from '@/components/ActionButton'
import { site } from '@/lib/site'

/**
 * The closing block: the last ask, the routes off the page, and the legal line.
 * Pricing carries its own CTA, but four sections separate the two now, so the
 * closing statement gets a button rather than leaving the page on a question
 * with nothing to answer it.
 */

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Tools', href: '#tools' },
      { label: 'Job Board', href: '#jobs' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
]

/* Marks rather than names — the row reads as icons, not a third link list. */
const social = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z',
  },
  {
    label: 'X',
    href: 'https://x.com',
    path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.3 19.5h2.04L6.49 3.24H4.3z',
  },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid" aria-hidden="true" />

      <div className="wrap footer-inner">
        <span className="eyebrow footer-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h2 className="footer-title">Ready to begin?</h2>
        <p className="footer-lede">Join thousands of ambitious people building their AI edge, one module at a time.</p>

        <div className="footer-cta">
          <AuthButton mode="signup" className="button button-lime">
            Start Learning
          </AuthButton>
          <span>No card required to browse the modules.</span>
        </div>

        <hr className="footer-rule" />

        <div className="footer-columns">
          <div className="footer-brand">
            <a className="brand" href="#top" aria-label={`${site.name} home`}>
              <span className="brand-mark" aria-hidden="true">
                S
              </span>
              <span>{site.name.toLowerCase()}</span>
            </a>
            <span className="footer-tagline">Learn. Build. Monetize.</span>
            <div className="footer-social">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label={item.label}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={item.path} fill="currentColor" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-nav">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <span className="footer-col-title">{column.title}</span>
                {column.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
        </div>

        {/* The wordmark, oversized and half-buried — it closes the page the way
            the nav opens it. */}
        <span className="footer-mark" aria-hidden="true">
          {site.name.toLowerCase()}
        </span>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <a className="footer-top-link" href="#top" aria-label="Back to top">
            ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
