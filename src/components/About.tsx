import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { Reveal } from '@/components/Reveal'
import { promiseStats } from '@/lib/content'

/**
 * The About page.
 *
 * EVERY CLAIM HERE IS ALREADY MADE SOMEWHERE ELSE ON THE SITE OR IN THE
 * POLICIES. The problem statement is the Problem section's, the four figures
 * are imported from the same `promiseStats` the home page counts up, the tool
 * list is the Included section's, and the company facts come from the published
 * Terms and Privacy Policy. Nothing was invented for this page: an About page
 * is the one place a reader goes to check whether a company is real, and it is
 * the worst possible place to put a number nobody can trace.
 *
 * Which is also why there is no team section, no founding date and no office
 * address — none of those exist anywhere in this repo, and inventing them here
 * is how a site ends up with a fictional history it then has to maintain.
 */

/* Straight from the Included section, so the two lists cannot disagree about
   which tools are taught. */
const TOOLS = ['Claude', 'ChatGPT', 'Gemini', 'n8n', 'Lovable']

const WHAT_A_SEAT_INCLUDES = [
  ['Every tool, in order', 'Each one builds on the last, so the sequence teaches something the tools cannot teach separately.'],
  ['Short challenges, not lectures', 'Thirty minutes at a time, ending in something you made rather than something you watched.'],
  ['Real projects', 'The work is the assessment. Nothing is graded on having sat through it.'],
  ['Verified credentials', 'Tool-specific, earned through the projects, and checkable by anyone holding the certificate.'],
  ['A job board', 'Roles and freelance briefs, open to members who have the proof to apply with.'],
]

export function About() {
  return (
    <>
      {/* Rendered here rather than by the root layout, which carries neither —
          see the note in components/LegalDoc. */}
      <Nav />

      <main className="about">
        <div className="wrap about-wrap">
          <Reveal className="about-head">
            <span className="eyebrow">ABOUT SKEO</span>
            <h1>
              AI isn’t one skill<br />
              <em>anymore.</em>
            </h1>
            <p className="about-lede">
              It is a dozen tools that each do something different, changing every month, with no
              obvious place to start. Most people collect tutorials instead of skills — and end up
              able to describe AI without being able to use it.
            </p>
            <p className="about-lede">
              skeo exists to close that gap. One platform, every major AI tool, taught as short
              challenges that end in something you built.
            </p>
          </Reveal>

          {/* The home page's own figures, imported rather than retyped. A number
              that appears twice and agrees once is worse than no number. */}
          <Reveal className="about-stats">
            {promiseStats.map((stat) => (
              <div className="about-stat" key={stat.label}>
                <b>{stat.value.toLocaleString('en-IN')}{stat.suffix}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </Reveal>

          <Reveal className="about-block">
            <h2>What we actually do</h2>
            <p>
              Most AI education is either a single tool taught in depth or a survey that touches
              everything and lands nowhere. skeo is neither. It teaches{' '}
              {TOOLS.map((tool, i) => (
                <span key={tool}>
                  <b>{tool}</b>
                  {i < TOOLS.length - 2 ? ', ' : i === TOOLS.length - 2 ? ' and ' : ''}
                </span>
              ))}{' '}
              and more, in an order where each one builds on the last — because the skill worth
              having is not any single tool but knowing which to reach for.
            </p>
            <p>
              The work is short and daily rather than long and occasional. Thirty minutes, a
              challenge, something finished at the end of it. That shape is deliberate: skills that
              take a free weekend to start are the ones people never start.
            </p>
          </Reveal>

          <Reveal className="about-block">
            <h2>What a seat includes</h2>
            <dl className="about-list">
              {WHAT_A_SEAT_INCLUDES.map(([term, detail]) => (
                <div className="about-item" key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* The disclaimer from the published Terms, said plainly and up front
              rather than left for clause 7. An About page that implies outcomes
              the Terms then deny is the gap people quote back at you. */}
          <Reveal className="about-block">
            <h2>What we don’t promise</h2>
            <p>
              We do not guarantee employment, internships, interviews, freelance work, salary
              outcomes or career advancement. The job board is access and the credential is proof —
              every hiring decision rests with the employer. Anyone telling you otherwise about an
              AI course is selling you the part they cannot deliver.
            </p>
          </Reveal>

          <Reveal className="about-block about-company">
            <h2>The company</h2>
            <dl className="about-list">
              <div className="about-item">
                <dt>Legal entity</dt>
                <dd>Menler Learning Systems Private Limited</dd>
              </div>
              <div className="about-item">
                <dt>Registered jurisdiction</dt>
                <dd>Bengaluru, Karnataka, India</dd>
              </div>
              <div className="about-item">
                <dt>Contact</dt>
                <dd><a href="mailto:support@skeoai.com">support@skeoai.com</a></dd>
              </div>
              <div className="about-item">
                <dt>Policies</dt>
                <dd className="about-policies">
                  <Link href="/privacy">Privacy Policy</Link>
                  <Link href="/refund">Refund Policy</Link>
                  <Link href="/terms">Terms &amp; Conditions</Link>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </main>

      <Footer />
    </>
  )
}
