import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { BreadcrumbSchema } from '@/components/StructuredData'
import { GUIDES } from '@/lib/guides'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  path: '/guides',
  title: 'AI guides — Claude, ChatGPT, n8n and more',
  description: 'Short, practical guides to the AI tools people use at work: how to learn them, how they compare and how to start.',
})

export default function GuidesPage() {
  return (
    <>
      <Nav />
      <main className="legal guide">
        <div className="wrap legal-wrap">
          <header className="legal-head">
            <Link href="/" className="legal-back">&larr; skeo</Link>
            <h1>AI guides</h1>
            <p className="legal-meta">Practical answers about the AI tools people use at work.</p>
          </header>
          <ul className="guide-index">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`}>
                  <strong>{g.title}</strong>
                  <span>{g.description}</span>
                  <em>{g.readMins} min read →</em>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
      <BreadcrumbSchema items={[{ name: 'Guides', path: '/guides' }]} />
    </>
  )
}
