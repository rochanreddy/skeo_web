import { FeatureGrid, type FeatureCategory } from '@/components/ui/feature-section'

/**
 * What a seat actually contains. It sits between the certificate and the job
 * board, at the point where someone has been told what they will earn and is
 * asking what they are getting for the money — so it answers that in one grid
 * instead of leaving it spread across the page.
 *
 * The six are the whole offer, in the order someone lives it: learn the tools,
 * get credited for it, find the work, and have people around you while you do.
 * Certificate, jobs and community used to be chips in the "and more" row, which
 * buried three of the strongest reasons to buy under the weakest heading.
 *
 * Each one carries its specifics as a short list rather than a sentence, which
 * is what the grid is shaped for, and the two that have a section of their own
 * further down link to it so the claim is checkable rather than just asserted.
 */

const icons = {
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  certificate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M15.5 13.1 17 22l-5-3-5 3 1.5-8.9" />
    </svg>
  ),
  jobs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  ),
  mentorship: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="4.5" height="16" rx="1" />
      <rect x="9.75" y="4" width="4.5" height="16" rx="1" />
      <rect x="16.5" y="4" width="4.5" height="16" rx="1" />
      <path d="M3 9h4.5M9.75 9h4.5M16.5 9H21" />
    </svg>
  ),
}

const INCLUDED: FeatureCategory[] = [
  {
    icon: icons.tools,
    title: 'Tool Learning System',
    items: [
      { text: 'Claude, ChatGPT, Gemini, n8n, Lovable and more' },
      { text: 'Taught in order, so each tool builds on the last' },
      { text: 'Every lesson in one LMS, progress tracked' },
      { text: 'New tools added every month' },
    ],
  },
  {
    icon: icons.certificate,
    title: 'Certificate',
    items: [
      { text: 'A verified credential for every track you finish', href: '#certification' },
      { text: 'Shareable on LinkedIn and yours to keep' },
      { text: 'Earned on real projects, not quizzes' },
    ],
  },
  {
    icon: icons.jobs,
    title: 'Jobs Opportunities',
    items: [
      { text: 'Freelance, internship and full-time roles', href: '#jobs' },
      { text: 'A live board, updated as roles open' },
      { text: 'Matched against what you have learned' },
    ],
  },
  {
    icon: icons.community,
    title: 'Community',
    items: [
      { text: 'A working group of learners and builders' },
      { text: 'Ask, share and ship alongside people doing the same' },
    ],
  },
  {
    icon: icons.mentorship,
    title: 'Mentorship',
    items: [
      { text: 'People who build with these tools for a living' },
      { text: 'Not just people who teach them' },
    ],
  },
  {
    icon: icons.library,
    title: 'Library',
    items: [
      { text: 'Playbooks, prompt libraries, notes and references' },
      { text: 'Short video lessons you can pause and rewind' },
      { text: 'Yours to reuse long after the module' },
    ],
  },
]

export function Included() {
  return (
    <FeatureGrid
      className="included"
      id="included"
      aria-labelledby="included-title"
      titleId="included-title"
      eyebrow="WHAT ALL YOU GET"
      title="Everything you need. In one place."
      subtitle="One seat covers the tools, the teaching, the people — and what comes after."
      categories={INCLUDED}
      buttonText="See the plans"
      buttonHref="#pricing"
    />
  )
}
