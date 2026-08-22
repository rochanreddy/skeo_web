const groups = [
  {
    title: 'Explore',
    links: [
      { label: 'Tools', href: '#tools' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Job Board', href: '#jobs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { label: 'LinkedIn ↗', href: 'https://linkedin.com' },
      { label: 'Instagram ↗', href: 'https://instagram.com' },
      { label: 'X / Twitter ↗', href: 'https://x.com' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <div>
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>skillora</span>
          </a>
          <p>
            Practical AI skills for
            <br />
            the work ahead.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {groups.map((group) => (
            <div key={group.title}>
              <b>{group.title}</b>
              {group.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.href.startsWith('http') ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Skillora, Inc.</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
        <span>Made for the future ✦</span>
      </div>
    </footer>
  )
}
