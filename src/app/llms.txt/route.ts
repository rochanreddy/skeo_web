import { claudeSyllabus, faqs, featuredTool } from '@/lib/content'
import { MODULE_ROWS, PLANS, money } from '@/lib/plans'
import { site } from '@/lib/site'

/**
 * /llms.txt — the site in plain prose, for answer engines.
 *
 * The llmstxt.org convention: a single readable file describing what this site
 * is and what it sells, so a model can answer a question about skeo accurately
 * instead of reconstructing it from nav labels and pricing chips.
 *
 * It is generated from the same exports the page renders — the syllabus, the
 * plans, the FAQs — rather than written out separately, because a summary that
 * drifts from the site is worse than none. Change a price and this changes
 * with it.
 *
 * Not a substitute for the pages themselves: this site is server-rendered, so
 * a crawler already gets the real content from the HTML. This is the short
 * version for tools that look for it.
 */

export const dynamic = 'force-static'

const bullet = (s: string) => `- ${s}`

export function GET() {
  const modules = MODULE_ROWS.map((m) =>
    bullet(`${m.title} — ${money(m.amount)}. ${m.subtitle}`),
  ).join('\n')

  /* A plan priced at zero is the custom one, not a free one. money(0) renders
     "₹0", which beside "Custom pricing" reads as a contradiction and beside
     nothing reads as a giveaway. */
  const plans = Object.values(PLANS).map((p) =>
    bullet(`${p.title} — ${p.amount > 0 ? `${money(p.amount)} ${p.period}` : p.period}. ${p.features.join('; ')}`),
  ).join('\n')

  const syllabus = claudeSyllabus.modules
    .map((m) => bullet(`${m.title} (${m.meta}) — ${m.topics.join('; ')}`))
    .join('\n')

  const faqLines = faqs.map((f) => `**${f.q}**\n\n${f.a}\n`).join('\n')

  const body = `# skeo

> ${site.description}

skeo teaches the AI tools people are actually hired to use — Claude first, then
the rest — as short tool-specific tracks rather than one long course. Each track
ends in projects and a verified certificate that anyone can check.

## What it is
- One subscription covers every tool track, the community, mentorship, the job
  board, the resource library and a certificate per track.
- Tracks are self-paced. ${featuredTool.facts.map((f) => f.label).join(' · ')}.
- Certificates carry a QR code and a public verification page, so an employer
  can confirm one without an account.

## Tools and tracks
${modules}

## Pricing
${plans}

Prices are in Indian rupees for visitors in India and in US dollars elsewhere.

## What the Claude track covers
${claudeSyllabus.intro}

${syllabus}

## Frequently asked questions

${faqLines}
## Links
- [skeo](${site.url})
- [Sign in to the LMS](${site.url.replace('//', '//lms.')})

Last built ${new Date().toISOString().slice(0, 10)}.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Rebuilt on deploy, so it can be cached hard in between.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
