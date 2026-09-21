import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import type { LegalBlock, LegalDoc as Doc } from '@/lib/legal'

/**
 * One layout for every policy page.
 *
 * The three documents are laid out by this rather than written as three pages
 * of markup, because hand-built legal pages drift the first time one of them is
 * amended — a heading level here, a list spacing there — and a policy that
 * looks different from its neighbours reads as the less official one.
 */

/* Email addresses are written into the policy text as plain words, because the
   source documents are plain words. Linking them here means the contact address
   is live everywhere it appears without the content carrying markup, and a
   grievance address nobody can click is a grievance address nobody uses. */
const EMAIL_SPLIT = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
/* A SECOND, NON-GLOBAL COPY, and not a convenience. `test()` on a /g regex
   advances its lastIndex and resumes from there on the next call, so one shared
   pattern returns true, false, true, false down the same list and links every
   other address. Measured: 4 of the 8 mentions on these three pages. A pattern
   used for splitting must not also be used for testing. */
const EMAIL_ONE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i

function withEmailLinks(text: string) {
  return text.split(EMAIL_SPLIT).map((part, i) =>
    EMAIL_ONE.test(part)
      ? <a key={i} href={`mailto:${part}`}>{part}</a>
      : <span key={i}>{part}</span>,
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'sub') return <h3 className="legal-sub">{block.text}</h3>
  if (block.type === 'list') {
    return (
      <ul className="legal-list">
        {block.items.map((item) => <li key={item}>{withEmailLinks(item)}</li>)}
      </ul>
    )
  }
  return <p>{withEmailLinks(block.text)}</p>
}

export function LegalDoc({ doc }: { doc: Doc }) {
  return (
    <>
      {/* Nav and Footer are rendered by the home page rather than by the root
          layout — checkout and thank-you deliberately go without them — so a
          page outside that one has to bring them itself. Without the footer
          these three documents cannot reach each other, which is the one
          journey a policy page actually has. */}
      <Nav />
      <main className="legal">
      <div className="wrap legal-wrap">
        <header className="legal-head">
          {/* Back to the site rather than to the browser's history: these pages
              are linked from the footer of every page and are also what a
              search result or a pasted link lands on, where "back" goes
              nowhere useful. */}
          <Link href="/" className="legal-back">&larr; skeo</Link>
          <h1>{doc.title}</h1>
          <p className="legal-meta">
            Menler Learning Systems Private Limited
            {doc.updated ? <> &middot; Last updated {doc.updated}</> : null}
          </p>
        </header>

        <div className="legal-body">
          {doc.intro.map((block, i) => <Block key={i} block={block} />)}

          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.blocks.map((block, i) => <Block key={i} block={block} />)}
            </section>
          ))}
        </div>

        <footer className="legal-foot">
          <p>
            Questions about this document? Write to <a href="mailto:support@skeoai.com">support@skeoai.com</a>.
          </p>
          <nav className="legal-nav" aria-label="Other policies">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund">Refund Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </nav>
        </footer>
      </div>
      </main>
      <Footer />
    </>
  )
}
