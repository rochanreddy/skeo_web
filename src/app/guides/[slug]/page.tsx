import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { GuideSchema } from '@/components/StructuredData'
import { GUIDES, guideBySlug, type GuideBlock } from '@/lib/guides'
import { pageMeta } from '@/lib/seo'

/**
 * One guide. The prose layout is the policy pages' (.legal) — a readable
 * measure, nothing that moves — with the answer boxed at the top, because
 * that paragraph is the one a reader and an answer engine both came for.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).slug)
  if (!g) return {}
  return {
    ...pageMeta({ path: `/guides/${g.slug}`, title: g.metaTitle, description: g.description }),
    keywords: [...g.keywords],
  }
}

const day = (iso: string) =>
  new Date(`${iso}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>
    case 'list':
      return (
        <ul className="legal-list">
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )
    case 'steps':
      return (
        <ol className="guide-steps">
          {block.items.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="guide-table-wrap">
          <table className="guide-table">
            <thead>
              <tr>{block.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export default async function GuidePage({ params }: Props) {
  const g = guideBySlug((await params).slug)
  if (!g) notFound()
  const others = GUIDES.filter((x) => x.slug !== g.slug)

  return (
    <>
      <Nav />
      <main className="legal guide">
        <article className="wrap legal-wrap">
          <header className="legal-head">
            <Link href="/guides" className="legal-back">&larr; All guides</Link>
            <h1>{g.title}</h1>
            <p className="legal-meta">
              Updated <time dateTime={g.updated}>{day(g.updated)}</time> &middot; {g.readMins} min read
            </p>
          </header>

          <div className="guide-answer">
            <span className="guide-label">The short answer</span>
            <p>{g.answer}</p>
          </div>

          <div className="legal-body">
            {g.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.blocks.map((b, i) => <Block key={i} block={b} />)}
              </section>
            ))}

            <section>
              <h2>Frequently asked questions</h2>
              {g.faq.map((f) => (
                <div className="guide-faq" key={f.q}>
                  <h3 className="legal-sub">{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          </div>

          <aside className="guide-cta">
            <h2>{g.cta.title}</h2>
            <p>{g.cta.text}</p>
            <Link className="button" href={g.cta.href}>
              <span className="btn-label">{g.cta.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </aside>

          <nav className="guide-more" aria-label="More guides">
            <span className="guide-label">More guides</span>
            {others.map((o) => (
              <Link key={o.slug} href={`/guides/${o.slug}`}>{o.title} →</Link>
            ))}
          </nav>
        </article>
      </main>
      <Footer />
      <GuideSchema guide={g} />
    </>
  )
}
