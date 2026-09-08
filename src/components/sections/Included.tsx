import { FeatureGrid, type FeatureCategory } from '@/components/ui/feature-section'

/**
 * What a seat actually contains. It sits between the certificate and the job
 * board, at the point where someone has been told what they will earn and is
 * asking what they are getting for the money — so it answers that in one grid
 * instead of leaving it spread across the page.
 *
 * Each heading now carries the two or three specifics behind it rather than a
 * single sentence, which is what the grid is shaped for. The three claims that
 * have their own section further down link to it, so the list is checkable
 * rather than just asserted.
 */

const icons = {
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  lms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8h6M7 12h4" />
    </svg>
  ),
  mentor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  playbook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7M9 11h5" />
    </svg>
  ),
  reading: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5h7a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2.5H2z" />
      <path d="M22 5h-7a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2.5H22z" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M10 9.2v5.6l4.6-2.8z" />
    </svg>
  ),
}

const INCLUDED: FeatureCategory[] = [
  {
    icon: icons.tools,
    title: 'Every AI tool',
    items: [
      { text: 'Claude, ChatGPT and Gemini' },
      { text: 'n8n, Lovable and more' },
      { text: 'New tools added every month' },
    ],
  },
  {
    icon: icons.lms,
    title: 'Full LMS access',
    items: [
      { text: 'Every lesson and project in one place' },
      { text: 'Your progress tracked as you go' },
      { text: 'Verified certificates', href: '#certification' },
    ],
  },
  {
    icon: icons.mentor,
    title: 'Mentor guidance',
    items: [
      { text: 'People who build with these tools for a living' },
      { text: 'A community working alongside you' },
      { text: 'Job board access', href: '#jobs' },
    ],
  },
  {
    icon: icons.playbook,
    title: 'Playbooks',
    items: [
      { text: 'Step-by-step guides for real tasks' },
      { text: 'Yours to keep long after the module' },
      { text: 'Real projects, not exercises' },
    ],
  },
  {
    icon: icons.reading,
    title: 'Reading material',
    items: [
      { text: 'Curated notes for every tool' },
      { text: 'Prompt libraries you can lift' },
      { text: 'References worth coming back to' },
    ],
  },
  {
    icon: icons.video,
    title: 'Video lessons',
    items: [
      { text: 'Short, built-along recordings' },
      { text: 'Pause, rewind, follow at your pace' },
      { text: 'Watchable on anything you own' },
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
      subtitle="One seat covers the tools, the teaching, the material and the people."
      categories={INCLUDED}
      buttonText="See the plans"
      buttonHref="#pricing"
    />
  )
}
