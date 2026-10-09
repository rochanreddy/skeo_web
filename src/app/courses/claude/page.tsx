import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { Price } from '@/components/Price'
import { BreadcrumbSchema, ClaudeCourseSchema } from '@/components/StructuredData'
import { claudeSyllabus, faqs, featuredTool } from '@/lib/content'
import { PLANS } from '@/lib/plans'
import { pageMeta } from '@/lib/seo'

/**
 * /courses/claude — the Claude curriculum as a page of its own.
 *
 * The same overview the "View Curriculum" overlay on the home page opens,
 * read from the same `claudeSyllabus`, so the two cannot disagree. It exists
 * because the overlay is drawn only when someone clicks: a crawler, or an
 * answer engine asked "what does skeo's Claude course cover?", never sees it.
 * This is the one URL that can rank for the course and be quoted about it.
 *
 * Laid out on the policy pages' reading column (the .legal classes) — it is a
 * document to read, not a section to scroll past.
 */

const path = '/courses/claude'

export const metadata: Metadata = pageMeta({
  path,
  title: 'Claude Course — learn Claude by building real work',
  description:
    'Learn Claude end to end — 8 modules from how the model works to a capstone you ship: Chat, Cowork, Claude Code, MCP. 15 hours, self-paced, with a certificate.',
})

/* The FAQs that are about taking a course, from the home page's list. */
const COURSE_FAQS = faqs.filter((f) =>
  ['Do I need a technical background?', 'How much time does a tool take?', 'Are the certificates recognized?', 'Do I have to pay for the AI tools as well?', 'The tools change every month. Does the content?'].includes(f.q),
)

export default function ClaudeCoursePage() {
  const plan = PLANS.claude
  return (
    <>
      <Nav />
      <main className="legal" id="top">
        <div className="wrap legal-wrap">
          <header className="legal-head">
            <Link href="/" className="legal-back">&larr; skeo</Link>
            <h1>Claude Course</h1>
            <p className="legal-meta">
              {featuredTool.name}, {featuredTool.maker} · {featuredTool.tagline}
            </p>
            <ul className="syllabus-stats" aria-label="At a glance">
              {claudeSyllabus.stats.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </header>

          <div className="legal-body">
            <p>{featuredTool.blurb}</p>
            <p>{claudeSyllabus.intro}</p>

            <section>
              <h2>What the course covers</h2>
              {claudeSyllabus.modules.map((m, i) => (
                <section key={m.title} aria-labelledby={`module-${i + 1}`}>
                  <h3 className="legal-sub" id={`module-${i + 1}`}>
                    {i + 1}. {m.title} <span className="legal-meta">· {m.meta}</span>
                  </h3>
                  <ul className="legal-list">
                    {m.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </section>
              ))}
              <p className="legal-meta">{claudeSyllabus.footnote}</p>
            </section>

            <section>
              <h2>Price</h2>
              <p>
                <strong>
                  <Price inr={plan.amount} />
                </strong>{' '}
                one-time — {plan.features.join(', ').toLowerCase()}. Or take it as part of{' '}
                <Link href="/#pricing">{PLANS.member.title}</Link>, which covers every tool on skeo.
              </p>
              {/* A plain anchor, not Link: arriving from another page, Link
                  lands at the top and drops the #pricing. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="button" href="/#pricing">
                <span className="btn-label">{claudeSyllabus.cta.label}</span> <span aria-hidden="true">→</span>
              </a>
            </section>

            <section>
              <h2>Questions</h2>
              {COURSE_FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="legal-sub">{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <ClaudeCourseSchema />
      <BreadcrumbSchema items={[{ name: 'Claude Course', path }]} />
    </>
  )
}
