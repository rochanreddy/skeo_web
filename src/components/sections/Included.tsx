import type { ReactElement } from 'react'
import { Reveal } from '@/components/Reveal'

/**
 * What a seat actually contains. It sits between the certificate and the job
 * board, at the point where someone has been told what they will earn and is
 * asking what they are getting for the money — so it answers that in one grid
 * instead of leaving it spread across the page.
 */

const icons: Record<string, ReactElement> = {
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

const INCLUDED = [
  {
    icon: 'tools',
    title: 'Every AI tool',
    detail: 'Claude, ChatGPT, Gemini, n8n, Lovable and more — new ones added every month.',
  },
  {
    icon: 'lms',
    title: 'Full LMS access',
    detail: 'Every lesson, project and submission in one place, with your progress tracked.',
  },
  {
    icon: 'mentor',
    title: 'Mentor guidance',
    detail: 'Get unstuck by people who build with these tools for a living, not just teach them.',
  },
  {
    icon: 'playbook',
    title: 'Playbooks',
    detail: 'Step-by-step guides for real tasks, yours to keep and reuse long after the module.',
  },
  {
    icon: 'reading',
    title: 'Reading material',
    detail: 'Curated notes, prompt libraries and references for every tool you take on.',
  },
  {
    icon: 'video',
    title: 'Video lessons',
    detail: 'Short, built-along videos you can pause, rewind and follow at your own pace.',
  },
] as const

const MORE = ['Real projects', 'Verified certificates', 'Job board access', 'Community', 'New tools monthly']

export function Included() {
  return (
    <section className="section included" id="included" aria-labelledby="included-title">
      <div className="wrap">
        <Reveal className="center-heading">
          <span className="eyebrow">WHAT ALL YOU GET</span>
          <h2 id="included-title">Everything you need. In one place.</h2>
          <p>One seat covers the tools, the teaching, the material and the people.</p>
        </Reveal>

        <div className="included-grid reveal-stagger">
          {INCLUDED.map((item) => (
            <Reveal as="article" className="included-card" key={item.title}>
              <span className="included-icon" aria-hidden="true">
                {icons[item.icon]}
              </span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="included-more">
          <span>And more</span>
          <ul>
            {MORE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
