'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'

/**
 * The Job & Freelancing Board, shown rather than described.
 *
 * Built to behave like the hero's tool stage: it plays on its own, stepping
 * through the tracks on a six-second timer with the bars re-growing each time,
 * and holds still the moment a pointer or keyboard lands on it. Everything also
 * answers directly — the rail re-cuts every figure, the ring selects a track
 * when a segment is clicked, and hovering a role hands the match card over to
 * it.
 *
 * The roles list is the point of the panel, so it gets the room: no trend chart
 * competing with it, and enough height that six openings read at once with the
 * seventh cut mid-row to say there is more under it.
 *
 * All local state over static data: a product shot you can poke at.
 */

type Role = { title: string; meta: string; match: number }

type Track = {
  key: string
  label: string
  count: string
  /** The three headline figures, as the tiles above the list read them. */
  stats: { open: number; match: number; pay: number }
  skills: { label: string; value: number; mark: keyof typeof MARKS }[]
  roles: Role[]
}

const MARKS = {
  claude: ClaudeMark,
  chatgpt: ChatGptMark,
  gemini: GeminiMark,
  n8n: N8nMark,
  lovable: LovableMark,
}

/* The board itself. Each track carries its whole list rather than three
   samples — the roles column scrolls — and "All" is genuinely every opening,
   ordered by how well it matches. */
const FREELANCE_ROLES: Role[] = [
  { title: 'AI Automation Architect', meta: 'Remote · Contract', match: 99 },
  { title: 'Claude Prompt Specialist', meta: 'Remote · Freelance', match: 98 },
  { title: 'GenAI Content Systems Lead', meta: 'Remote · Contract', match: 97 },
  { title: 'AI Workflow Designer', meta: 'Remote · Project', match: 96 },
  { title: 'Agent Build Freelancer', meta: 'Remote · Freelance', match: 95 },
  { title: 'AI Content Freelancer', meta: 'Remote · Freelance', match: 94 },
  { title: 'Automation Consultant', meta: 'Remote · Contract', match: 90 },
  { title: 'Chatbot Builder', meta: 'Remote · Freelance', match: 89 },
  { title: 'Prompt Copywriter', meta: 'Remote · Freelance', match: 87 },
  { title: 'AI Video Editor', meta: 'Remote · Freelance', match: 85 },
  { title: 'Newsletter Systems', meta: 'Remote · Project', match: 84 },
  { title: 'n8n Workflow Setup', meta: 'Remote · Project', match: 83 },
  { title: 'Lead-Gen Automation', meta: 'Remote · Contract', match: 82 },
  { title: 'AI Social Manager', meta: 'Remote · Freelance', match: 80 },
  { title: 'Notion AI Systems', meta: 'Remote · Project', match: 79 },
  { title: 'SEO Brief Writer', meta: 'Remote · Freelance', match: 78 },
  { title: 'Data Cleanup with AI', meta: 'Remote · Project', match: 76 },
  { title: 'Landing Page in Lovable', meta: 'Remote · Project', match: 75 },
  { title: 'CRM Automation', meta: 'Pune · Contract', match: 74 },
  { title: 'Podcast Repurposing', meta: 'Remote · Freelance', match: 73 },
  { title: 'Voice Agent Setup', meta: 'Remote · Project', match: 71 },
  { title: 'Ecommerce Copy Refresh', meta: 'Remote · Freelance', match: 70 },
  { title: 'Reporting Automation', meta: 'Remote · Contract', match: 68 },
  { title: 'AI Course Assistant', meta: 'Remote · Freelance', match: 66 },
  { title: 'Deck & Pitch Builder', meta: 'Remote · Project', match: 64 },
]

const INTERNSHIP_ROLES: Role[] = [
  { title: 'GenAI Product Intern', meta: 'Bengaluru · Internship', match: 95 },
  { title: 'AI Automation Intern', meta: 'Remote · Internship', match: 93 },
  { title: 'Claude Systems Intern', meta: 'Remote · Internship', match: 91 },
  { title: 'Agent Ops Intern', meta: 'Hyderabad · Internship', match: 88 },
  { title: 'Prompt Engineer Intern', meta: 'Remote · Internship', match: 86 },
  { title: 'AI Content Intern', meta: 'Remote · Internship', match: 84 },
  { title: 'Automation Intern', meta: 'Bengaluru · Internship', match: 82 },
  { title: 'Marketing AI Intern', meta: 'Mumbai · Internship', match: 80 },
  { title: 'AI Research Intern', meta: 'Hyderabad · Internship', match: 79 },
  { title: 'Data Annotation Intern', meta: 'Remote · Internship', match: 78 },
  { title: 'Chatbot Support Intern', meta: 'Remote · Internship', match: 77 },
  { title: 'Product AI Intern', meta: 'Bengaluru · Internship', match: 75 },
  { title: 'Growth & AI Intern', meta: 'Remote · Internship', match: 74 },
  { title: 'Design + AI Intern', meta: 'Remote · Internship', match: 73 },
  { title: 'AI Ops Trainee', meta: 'Pune · Internship', match: 72 },
  { title: 'Community AI Intern', meta: 'Remote · Internship', match: 70 },
  { title: 'Video AI Intern', meta: 'Delhi · Internship', match: 69 },
  { title: 'Sales Enablement Intern', meta: 'Remote · Internship', match: 68 },
  { title: 'AI QA Intern', meta: 'Chennai · Internship', match: 66 },
  { title: 'Analytics Intern', meta: 'Remote · Internship', match: 65 },
  { title: 'Docs & Prompt Intern', meta: 'Remote · Internship', match: 63 },
  { title: 'HR Automation Intern', meta: 'Noida · Internship', match: 61 },
  { title: 'Ops Research Intern', meta: 'Remote · Internship', match: 59 },
  { title: 'Founders Office Intern', meta: 'Bengaluru · Internship', match: 57 },
]

const FULLTIME_ROLES: Role[] = [
  { title: 'AI Implementation Lead', meta: 'Bengaluru · Full-time', match: 98 },
  { title: 'Head of AI Operations', meta: 'Remote · Full-time', match: 96 },
  { title: 'Senior Automation Engineer', meta: 'Remote · Full-time', match: 95 },
  { title: 'AI Systems Manager', meta: 'Hyderabad · Full-time', match: 93 },
  { title: 'GenAI Platform Engineer', meta: 'Bengaluru · Full-time', match: 91 },
  { title: 'AI Delivery Manager', meta: 'Pune · Full-time', match: 89 },
  { title: 'Junior AI Ops', meta: 'Bengaluru · Full-time', match: 88 },
  { title: 'AI Product Associate', meta: 'Bengaluru · Full-time', match: 86 },
  { title: 'Workflow Architect', meta: 'Remote · Full-time', match: 85 },
  { title: 'AI Support Lead', meta: 'Hyderabad · Full-time', match: 83 },
  { title: 'AI Solutions Analyst', meta: 'Pune · Full-time', match: 82 },
  { title: 'Growth Automation Manager', meta: 'Mumbai · Full-time', match: 81 },
  { title: 'Automation Engineer', meta: 'Remote · Full-time', match: 80 },
  { title: 'Prompt Systems Engineer', meta: 'Remote · Full-time', match: 79 },
  { title: 'AI Content Lead', meta: 'Remote · Full-time', match: 78 },
  { title: 'Sales Ops (AI)', meta: 'Gurugram · Full-time', match: 76 },
  { title: 'Implementation Specialist', meta: 'Bengaluru · Full-time', match: 75 },
  { title: 'AI Marketing Executive', meta: 'Pune · Full-time', match: 74 },
  { title: 'RevOps Analyst', meta: 'Remote · Full-time', match: 72 },
  { title: 'Customer AI Engineer', meta: 'Chennai · Full-time', match: 71 },
  { title: 'Internal Tools Developer', meta: 'Remote · Full-time', match: 70 },
  { title: 'AI Trainer', meta: 'Delhi · Full-time', match: 68 },
  { title: 'Ops Automation Lead', meta: 'Mumbai · Full-time', match: 67 },
  { title: 'Data Workflow Analyst', meta: 'Remote · Full-time', match: 65 },
  { title: 'AI Program Coordinator', meta: 'Bengaluru · Full-time', match: 63 },
  { title: 'Knowledge Base Manager', meta: 'Remote · Full-time', match: 61 },
]

const ALL_ROLES: Role[] = [...FREELANCE_ROLES, ...FULLTIME_ROLES, ...INTERNSHIP_ROLES].sort(
  (a, b) => b.match - a.match,
)

const TRACKS: Track[] = [
  {
    key: 'all',
    label: 'All',
    count: '1,024',
    stats: { open: 1024, match: 86, pay: 48 },
    skills: [
      { label: 'Claude', value: 92, mark: 'claude' },
      { label: 'n8n', value: 84, mark: 'n8n' },
      { label: 'ChatGPT', value: 78, mark: 'chatgpt' },
      { label: 'Lovable', value: 66, mark: 'lovable' },
    ],
    roles: ALL_ROLES,
  },
  {
    key: 'freelance',
    label: 'Freelance',
    count: '412',
    stats: { open: 412, match: 91, pay: 32 },
    skills: [
      { label: 'Claude', value: 95, mark: 'claude' },
      { label: 'ChatGPT', value: 88, mark: 'chatgpt' },
      { label: 'Gemini', value: 71, mark: 'gemini' },
      { label: 'n8n', value: 62, mark: 'n8n' },
    ],
    roles: FREELANCE_ROLES,
  },
  {
    key: 'internships',
    label: 'Internships',
    count: '188',
    stats: { open: 188, match: 78, pay: 18 },
    skills: [
      { label: 'ChatGPT', value: 81, mark: 'chatgpt' },
      { label: 'Claude', value: 74, mark: 'claude' },
      { label: 'Gemini', value: 69, mark: 'gemini' },
      { label: 'n8n', value: 48, mark: 'n8n' },
    ],
    roles: INTERNSHIP_ROLES,
  },
  {
    key: 'fulltime',
    label: 'Full time',
    count: '424',
    stats: { open: 424, match: 83, pay: 72 },
    skills: [
      { label: 'n8n', value: 90, mark: 'n8n' },
      { label: 'Claude', value: 85, mark: 'claude' },
      { label: 'Lovable', value: 72, mark: 'lovable' },
      { label: 'ChatGPT', value: 68, mark: 'chatgpt' },
    ],
    roles: FULLTIME_ROLES,
  },
]

/* The three tiles above the list — a readout now the trend chart is gone, so
   they state the figure rather than selecting a series to draw. */
const METRICS: { key: keyof Track['stats']; label: string; format: (v: number) => string }[] = [
  { key: 'open', label: 'Open roles', format: (v) => v.toLocaleString('en-IN') },
  { key: 'match', label: 'Match rate', format: (v) => `${v}%` },
  { key: 'pay', label: 'Avg / mo', format: (v) => `₹${v}k` },
]

/* The mix ring: share of the board by track, in the rail's own order. */
const MIX = [
  { key: 'freelance', label: 'Freelance', value: 40, color: '#7453e9' },
  { key: 'fulltime', label: 'Full time', value: 42, color: '#a690f0' },
  { key: 'internships', label: 'Internships', value: 18, color: '#d9cffa' },
]

const RING = { size: 92, stroke: 13 }
const CYCLE = 6000

/* The self-demo, as a script rather than a nest of setTimeouts. Each cue is
   "at this many ms, do this" — reading the timeline top to bottom is how you
   check the pacing. Positions are measured from the real controls at run time,
   so the pointer lands on them at any panel size. */
type Ghost = { x: number; y: number; shown: boolean; tap: boolean }

const DEMO = {
  /* One beat after the panel settles into view, so it is not competing with
     the reveal animation. */
  enter: 420,
  toTab: 700,
  tapAt: 1560,
  tapFor: 340,
  toRole: 2050,
  hoverAt: 2760,
  leave: 3700,
  clear: 4200,
}

export function JobBoard() {
  const [track, setTrack] = useState(0)
  const [role, setRole] = useState(0)
  const [segment, setSegment] = useState<number | null>(null)
  // Set while a pointer or the keyboard is on the panel: the cycle waits.
  const [held, setHeld] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* The panel shows what it can do rather than captioning it: a pointer glides
     in, clicks a track, then picks out a role while the match card answers —
     then gets out of the way. Seeing the panel respond to a click is the only
     thing that reliably reads as "this responds to yours". */
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [demo, setDemo] = useState(false)
  const timers = useRef<number[]>([])

  const stopDemo = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
    setDemo(false)
    setGhost(null)
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let played = false
    const at = (el: Element, box: DOMRect) => {
      const r = el.getBoundingClientRect()
      return { x: r.left - box.left + r.width * 0.5, y: r.top - box.top + r.height * 0.5 }
    }

    const play = () => {
      const box = panel.getBoundingClientRect()
      const tab = panel.querySelectorAll('.jobboard-rail button')[1]
      const row = panel.querySelectorAll('.jobboard-roles button')[2]
      if (!tab || !row) return
      const tabAt = at(tab, box)
      const rowAt = at(row, box)

      setDemo(true)
      // Starts low and to the right of the rail, so the first move reads as
      // travel rather than a jump-cut.
      setGhost({ x: tabAt.x + 96, y: tabAt.y + 132, shown: false, tap: false })

      const cue = (ms: number, run: () => void) => {
        timers.current.push(window.setTimeout(run, ms))
      }
      cue(DEMO.enter, () => setGhost((g) => g && { ...g, shown: true }))
      cue(DEMO.toTab, () => setGhost((g) => g && { ...g, ...tabAt }))
      cue(DEMO.tapAt, () => {
        setGhost((g) => g && { ...g, tap: true })
        setTrack(1)
        setRole(0)
      })
      cue(DEMO.tapAt + DEMO.tapFor, () => setGhost((g) => g && { ...g, tap: false }))
      cue(DEMO.toRole, () => setGhost((g) => g && { ...g, ...rowAt }))
      cue(DEMO.hoverAt, () => setRole(2))
      cue(DEMO.leave, () => setGhost((g) => g && { ...g, shown: false }))
      cue(DEMO.clear, () => {
        setGhost(null)
        setDemo(false)
      })
    }

    /* Waits for the whole panel to be on screen, not just most of it: someone
       still scrolling past a half-visible board is not watching it, and the
       demo only plays once.

       Two traps here, both of which silently mean "never plays":

       A threshold of exactly 1 is not reachable. The panel runs jb-float, so
       its box is drifting a few px the whole time, and sub-pixel layout does
       the rest — the ratio tops out a hair under 1 and a [1] threshold fires
       no callback at all. Hence 0.98 as "fully visible", with a spread of
       thresholds below it so the callback actually runs and can decide.

       And an element taller than the window can never exceed viewport/element,
       so on a short viewport a fixed bar would strand it. The requirement is
       recomputed per callback — which also means a resize mid-scroll can no
       longer leave it waiting on a number that stopped being achievable. */
    const need = () => {
      const fit = panel.getBoundingClientRect().height
      return Math.min(0.98, (window.innerHeight * 0.94) / Math.max(fit, 1))
    }

    const watch = new IntersectionObserver(
      ([entry]) => {
        if (played || !entry.isIntersecting) return
        if (entry.intersectionRatio < need()) return
        played = true
        watch.disconnect()
        play()
      },
      /* Every 5%. A sparse set stalls whenever the requirement falls between
         two of its steps: the callback fires below the bar, is rejected, and
         nothing fires again. */
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    watch.observe(panel)

    return () => {
      watch.disconnect()
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [])

  // The moment a real pointer or key arrives the demo is redundant: it hands
  // over mid-step rather than talking over the person now driving.
  useEffect(() => {
    if (held && demo) stopDemo()
  }, [held, demo, stopDemo])

  // A new track is a new list: start it at the top rather than wherever the
  // last one was left scrolled to.
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 })
  }, [track])

  // Steps the track the way the hero stage steps its tools.
  useEffect(() => {
    if (held || demo) return
    const timer = window.setTimeout(() => {
      setTrack((current) => (current + 1) % TRACKS.length)
      setRole(0)
    }, CYCLE)
    return () => window.clearTimeout(timer)
  }, [track, held, demo])

  const data = TRACKS[track]
  const featured = data.roles[role] ?? data.roles[0]

  const radius = (RING.size - RING.stroke) / 2
  const circumference = 2 * Math.PI * radius
  let sweep = 0

  return (
    <>
    <div
      ref={panelRef}
      className={`jobboard${held ? ' is-held' : ''}`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => {
        setHeld(false)
        setRole(0)
      }}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {/* The demo pointer. Decorative and inert — it never intercepts a real
          one, and the panel is fully usable whether or not it ever plays. The
          arrow is drawn with its tip at the origin, so the transform is the
          point it is aiming at. */}
      {ghost && (
        <span
          className={`jb-ghost${ghost.shown ? ' is-shown' : ''}${ghost.tap ? ' is-tap' : ''}`}
          style={{ transform: `translate3d(${ghost.x}px, ${ghost.y}px, 0)` }}
          aria-hidden="true"
        >
          <i />
          <svg viewBox="0 0 20 22" width="20" height="22" focusable="false">
            <path
              d="M0.9 0.8 L0.9 16.6 L5.3 12.6 L8.1 19.1 L11.2 17.7 L8.4 11.4 L14.2 10.8 Z"
              fill="#fff"
              stroke="#2a2140"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <div className="jobboard-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>skeoai.io/jobs</span>
        <em>Live</em>
      </div>

      <div className="jobboard-body">
        <div className="jobboard-rail" role="tablist" aria-label="Opportunity type">
          {TRACKS.map((item, i) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={i === track}
              className={i === track ? 'is-active' : undefined}
              onClick={() => {
                setTrack(i)
                setRole(0)
              }}
            >
              {item.label}
              <small>{item.count}</small>
            </button>
          ))}
        </div>

        <div className="jobboard-main">
          <div className="jobboard-trend">
            {/* A plain readout of the three headline figures — nothing to pick
                now the trend chart is gone, so nothing here is a control. */}
            <div className="jobboard-stats">
              {METRICS.map((item) => (
                <div className="stat-tile" key={item.key}>
                  <b>{item.format(data.stats[item.key])}</b>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>

            {/* The whole list, not a top three — six openings read at once and
                the column scrolls, so the panel reads like a board you could
                actually work through. */}
            <div className="jobboard-list">
              <span className="chart-label">
                Open roles <em>{data.roles.length}</em>
              </span>
              <ul className="jobboard-roles" ref={listRef}>
                {data.roles.map((item, i) => (
                  <li key={`${item.title}-${i}`} className={i === role ? 'is-lit' : undefined}>
                    <button type="button" onMouseEnter={() => setRole(i)} onFocus={() => setRole(i)}>
                      <span>
                        <b>{item.title}</b>
                        <small>{item.meta}</small>
                      </span>
                      <em>{item.match}%</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="jobboard-side">
            {/* Mix ring — clicking a segment jumps the whole panel to that track. */}
            <div className="jobboard-mix">
              <span className="chart-label">Board mix</span>
              <div className="mix-body">
                <svg viewBox={`0 0 ${RING.size} ${RING.size}`} className="mix-ring">
                  {MIX.map((item, i) => {
                    const length = (item.value / 100) * circumference
                    const dash = `${length} ${circumference - length}`
                    const offset = -sweep
                    sweep += length
                    const index = TRACKS.findIndex((t) => t.key === item.key)
                    const jump = () => index > -1 && setTrack(index)
                    return (
                      <circle
                        key={item.key}
                        r={radius}
                        cx={RING.size / 2}
                        cy={RING.size / 2}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={segment === i ? RING.stroke + 3 : RING.stroke}
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        className="mix-seg"
                        style={{ animationDelay: `${i * 0.12}s` }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.label}: ${item.value}%`}
                        onMouseEnter={() => setSegment(i)}
                        onMouseLeave={() => setSegment(null)}
                        onClick={jump}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') jump()
                        }}
                      />
                    )
                  })}
                </svg>
                <div className="mix-legend">
                  {MIX.map((item, i) => (
                    <span key={item.key} className={segment === i ? 'is-lit' : undefined}>
                      <i style={{ background: item.color }} />
                      {item.label}
                      <b>{item.value}%</b>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Which tools this track actually asks for, in the hero's own marks. */}
            <div className="jobboard-skills">
              <span className="chart-label">Tools in demand</span>
              {data.skills.map((skill) => {
                const Mark = MARKS[skill.mark]
                return (
                  <div className="skill-row" key={skill.label}>
                    <span>
                      <Mark className="skill-mark" />
                      {skill.label}
                    </span>
                    <div className="skill-bar">
                      <i style={{ width: `${skill.value}%` }} />
                    </div>
                    <b>{skill.value}</b>
                  </div>
                )
              })}
            </div>

            {/* Closes the side column, and follows whichever role is under
              the pointer. */}
            <div className="jobboard-float">
              <span className="float-head">
                <i aria-hidden="true">✦</i> Best match
              </span>
              <span className="float-body">
                <b>{featured.title}</b>
                <span className="float-meter" aria-hidden="true">
                  <span style={{ width: `${featured.match}%` }} />
                </span>
              </span>
              <em>{featured.match}%</em>
            </div>
          </div>
        </div>
      </div>
    </div>

    </>
  )
}
