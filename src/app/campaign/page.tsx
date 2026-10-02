import type { Metadata } from 'next'
import Link from 'next/link'
import './variants.css'

/**
 * The campaign pages, side by side — for choosing which to send traffic to.
 * Not for visitors: kept out of search, and nothing links here.
 */

export const metadata: Metadata = {
  title: 'Campaign pages',
  robots: { index: false, follow: false },
}

const VARIANTS = [
  {
    href: '/campaign/everything-ai',
    name: 'Everything AI (main)',
    kind: 'The original',
    body: 'The full campaign page: hero pass, curriculum, certificate, job board, reviews, price. Indexed by search.',
    use: 'Default, and anyone who already knows what AI is.',
  },
  {
    href: '/campaign/ai-simple',
    name: 'Simple',
    kind: 'Clearest',
    body: 'One calm column of plain questions and answers: what AI is, is this for me, what I will be able to do, how it works, what it costs.',
    use: 'Complete beginners, older audiences, WhatsApp forwards.',
  },
  {
    href: '/campaign/ai-showcase',
    name: 'Showcase',
    kind: 'Best design',
    body: 'Always-dark launch page: an AI chat that types itself, the tools sliding past, a bento of what is inside, the path, a certificate, a glowing price card.',
    use: 'Instagram and YouTube ads, where the first impression has to stop the scroll.',
  },
  {
    href: '/campaign/ai-start',
    name: 'Find your path',
    kind: 'Highest engagement',
    body: 'The hero is a 3-tap quiz that builds a personal plan from the real curriculum, then a time-back slider, reviews, and a sticky buy bar with the live deadline.',
    use: 'Cold traffic and retargeting — people who need a reason to keep going.',
  },
  {
    href: '/campaign/ai-explained',
    name: 'AI explained',
    kind: 'Builds trust',
    body: 'A guided story: the jargon explained, an ordinary day with and without AI, the program as four stages, and an honest “is this for you?”.',
    use: 'Search and content traffic, sceptical or confused visitors, parents and students.',
  },
  {
    href: '/campaign/ai-stories',
    name: 'Stories',
    kind: 'Made for Instagram',
    body: 'Seven full-screen cards you tap through like Instagram Stories — what AI can do, what you learn, then the price — with the FAQ underneath.',
    use: 'Instagram and Reels ads on phones: the format people were just scrolling.',
  },
]

export default function CampaignIndex() {
  return (
    <main className="cv">
      <header>
        <p>skeo · campaign pages</p>
        <h1>Pick a page to send people to.</h1>
        <span>
          Every page sells the same Early Access through the same checkout. Pageviews for each show up in the admin by path, so they can be compared. None
          of the variants are listed in search.
        </span>
      </header>
      <ul>
        {VARIANTS.map((v) => (
          <li key={v.href}>
            <span className="cv-kind">{v.kind}</span>
            <h2>{v.name}</h2>
            <p>{v.body}</p>
            <p className="cv-use">
              <b>Best for:</b> {v.use}
            </p>
            <div className="cv-links">
              <Link href={v.href}>Open page →</Link>
              <code>skeoai.com{v.href}</code>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
