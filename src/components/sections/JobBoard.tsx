'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { GhostCursor } from '@/components/sections/GhostCursor'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'

/**
 * The Job & Freelancing Board, shown rather than described.
 *
 * Built to behave like the hero's tool stage: it plays on its own, stepping
 * through the tracks on a six-second timer with the line redrawing and the bars
 * re-growing each time, and holds still the moment a pointer or keyboard lands
 * on it. Everything also answers directly — the rail re-cuts every figure, the
 * stat tiles pick which series the chart draws, the chart follows the pointer
 * with a crosshair and readout, the ring selects a track when a segment is
 * clicked, and hovering a role hands the match card over to it.
 *
 * All local state over static data: a product shot you can poke at.
 */

type MetricKey = 'open' | 'match' | 'pay'

type Role = { title: string; meta: string; match: number }

type Track = {
  key: string
  label: string
  count: string
  /** Twelve months, so the 6M / 12M range toggle has something to reveal. */
  series: Record<MetricKey, number[]>
  /* What the track actually pays, in dollars per month. The series above is
     the average; these two are the shape of the distribution around it. */
  earnings: { median: number; top10: number }
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

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

/* The board itself. Each track carries its whole list rather than three
   samples — the roles column scrolls — and "All" is genuinely every opening,
   ordered by how well it matches. */
const FREELANCE_ROLES: Role[] = [
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
    series: {
      open: [612, 640, 668, 705, 726, 774, 802, 838, 866, 905, 964, 1024],
      match: [71, 72, 74, 75, 77, 78, 80, 81, 82, 84, 85, 86],
      pay: [375, 400, 410, 435, 445, 470, 495, 505, 530, 545, 565, 580],
    },
    earnings: { median: 505, top10: 1450 },
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
    series: {
      open: [188, 204, 219, 236, 248, 267, 284, 301, 322, 348, 379, 412],
      match: [74, 76, 78, 80, 82, 83, 85, 86, 88, 89, 90, 91],
      pay: [215, 230, 255, 265, 290, 300, 315, 340, 350, 360, 375, 385],
    },
    earnings: { median: 340, top10: 1030 },
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
    series: {
      open: [74, 79, 86, 92, 101, 112, 124, 133, 145, 158, 172, 188],
      match: [62, 63, 65, 66, 68, 69, 71, 72, 74, 75, 77, 78],
      pay: [95, 110, 120, 120, 135, 145, 155, 170, 180, 195, 205, 215],
    },
    earnings: { median: 195, top10: 460 },
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
    series: {
      open: [204, 216, 231, 248, 262, 279, 296, 312, 334, 361, 392, 424],
      match: [66, 68, 69, 71, 72, 74, 75, 77, 78, 80, 81, 83],
      pay: [530, 555, 590, 625, 650, 685, 725, 745, 785, 805, 830, 870],
    },
    earnings: { median: 770, top10: 2100 },
    skills: [
      { label: 'n8n', value: 90, mark: 'n8n' },
      { label: 'Claude', value: 85, mark: 'claude' },
      { label: 'Lovable', value: 72, mark: 'lovable' },
      { label: 'ChatGPT', value: 68, mark: 'chatgpt' },
    ],
    roles: FULLTIME_ROLES,
  },
]

const METRICS: { key: MetricKey; label: string; format: (v: number) => string }[] = [
  { key: 'open', label: 'Open roles', format: (v) => v.toLocaleString('en-IN') },
  { key: 'match', label: 'Match rate', format: (v) => `${v}%` },
  { key: 'pay', label: 'Avg / mo', format: (v) => usd(v) },
]

/* The mix ring: share of the board by track, in the rail's own order. */
const MIX = [
  { key: 'freelance', label: 'Freelance', value: 40, color: '#7453e9' },
  { key: 'fulltime', label: 'Full time', value: 42, color: '#a690f0' },
  { key: 'internships', label: 'Internships', value: 18, color: '#d9cffa' },
]

/* How many roles the column shows. Six is what fits beside the side column at
   its current height — the two are meant to end level, so if either changes,
   this is the other half of that sum. */
const VISIBLE_ROLES = 6

const CHART = { w: 320, h: 78, pad: 8 }

// Dollars per month, written the way a reader scans them: in full up to a
// thousand, in thousands above it. Takes whole dollars, so 505 -> $505 and
// 6960 -> $7k.
const usd = (n: number) => {
  const v = Math.round(n)
  if (v < 1000) return `$${v}`
  const k = v / 1000
  return `$${k >= 10 ? Math.round(k) : Number(k.toFixed(1))}k`
}

const RING = { size: 92, stroke: 13 }
const CYCLE = 6000

/* One lap of the demonstration pointer, laid over one turn of CYCLE.
 *
 * `at` is milliseconds into the lap, `find` picks the control to sit on, and
 * `press` draws the tap. The lap opens on the track the panel has just switched
 * to, so the pointer is seen clicking the thing that visibly changed, then
 * works across to the chart and the ring. Every stop is a control that already
 * exists and already responds — the pointer is not miming over a static image.
 *
 * `act` is what the panel does when the pointer arrives. The hover stops set
 * the chart's read-out themselves rather than dispatching synthetic pointer
 * events, which would fight the real ones and would not work on touch at all. */
type GhostStop = {
  at: number
  find: (root: HTMLElement, track: number) => Element | null | undefined
  press?: boolean
  act?: (api: { setPoint: (i: number | null) => void; setMetric: (i: number) => void }) => void
}

const pick = (root: HTMLElement, selector: string, nth: number) => root.querySelectorAll(selector)[nth]

const GHOST_LAP: GhostStop[] = [
  // On the track the panel has just stepped to.
  { at: 0, find: (r, track) => pick(r, '.jobboard-rail button', track), press: true },
  // Across to the chart, reading a month off the line.
  { at: 1300, find: (r) => pick(r, '.chart-hits button', 2), act: (a) => a.setPoint(2) },
  // A tile, which re-draws the line as a different series.
  { at: 2600, find: (r) => pick(r, '.jobboard-stats button', 1), press: true, act: (a) => { a.setMetric(1); a.setPoint(null) } },
  { at: 3900, find: (r) => pick(r, '.chart-hits button', 5), act: (a) => a.setPoint(5) },
  // Resting on the mix ring as the lap runs out.
  { at: 5200, find: (r) => r.querySelector('.mix-ring'), act: (a) => a.setPoint(null) },
]

export function JobBoard() {
  const [track, setTrack] = useState(0)
  const [metric, setMetric] = useState(0)
  const [months, setMonths] = useState(6)
  const [point, setPoint] = useState<number | null>(null)
  const [role, setRole] = useState(0)
  const [segment, setSegment] = useState<number | null>(null)
  // Set while a pointer or the keyboard is on the panel: the cycle waits.
  const [held, setHeld] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const [ghost, setGhost] = useState<{ x: number; y: number; press: boolean } | null>(null)
  // Steps the track the way the hero stage steps its tools.
  useEffect(() => {
    if (held) return
    const timer = window.setTimeout(() => {
      setTrack((current) => (current + 1) % TRACKS.length)
      setRole(0)
    }, CYCLE)
    return () => window.clearTimeout(timer)
  }, [track, held])

  /* The demonstration pointer. Keyed on `track` so a lap starts every time the
     panel steps, which is what keeps the two in step without a second clock.

     It stands down the moment a real pointer or the keyboard arrives — two
     cursors on one panel is worse than none — and never runs for a reader who
     has asked for reduced motion. */
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    if (held) {
      setGhost(null)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const api = { setPoint, setMetric }
    const timers = GHOST_LAP.map((stop) =>
      window.setTimeout(() => {
        const target = stop.find(board, track)
        if (!target) return
        const b = board.getBoundingClientRect()
        const r = target.getBoundingClientRect()
        /* The panel is scaled with `zoom` on narrow screens. Both rects come
           back already scaled, but this overlay's transform is applied inside
           that scale, so the difference has to be divided back out or the
           pointer lands progressively further off the smaller the screen. */
        const scale = parseFloat(getComputedStyle(board).zoom) || 1
        setGhost({
          x: (r.left - b.left + r.width / 2) / scale,
          y: (r.top - b.top + r.height / 2) / scale,
          press: Boolean(stop.press),
        })
        stop.act?.(api)
      }, stop.at),
    )
    // The tap is a flash, not a state: released shortly after each press.
    const releases = GHOST_LAP.filter((s) => s.press).map((s) =>
      window.setTimeout(() => setGhost((g) => (g ? { ...g, press: false } : g)), s.at + 420),
    )

    return () => {
      timers.forEach(window.clearTimeout)
      releases.forEach(window.clearTimeout)
    }
  }, [track, held])

  const data = TRACKS[track]
  const active = METRICS[metric]
  const values = data.series[active.key].slice(-months)
  const labels = MONTHS.slice(-months)
  const featured = data.roles[role] ?? data.roles[0]

  // What the track pays, held separately from the metric the chart is drawing:
  // the money stays on screen even when the line is showing open roles.
  const payNow = data.series.pay[data.series.pay.length - 1]

  // Growth across the visible window — the figure beside the chart title.
  const delta = Math.round(((values[values.length - 1] - values[0]) / values[0]) * 100)

  const { line, area, dots } = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const step = (CHART.w - CHART.pad * 2) / (values.length - 1)
    const points = values.map((v, i) => {
      const x = CHART.pad + i * step
      const y = CHART.h - CHART.pad - ((v - min) / span) * (CHART.h - CHART.pad * 2)
      return [x, y] as const
    })
    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    return {
      line: path,
      area: `${path} L${CHART.w - CHART.pad} ${CHART.h} L${CHART.pad} ${CHART.h} Z`,
      dots: points,
    }
  }, [values])

  const radius = (RING.size - RING.stroke) / 2
  const circumference = 2 * Math.PI * radius
  let sweep = 0

  // While nothing is being hovered the last point carries a blinking rider, so
  // the chart still reads as live.
  const rider = dots[dots.length - 1]

  return (
    <div
      ref={boardRef}
      className={`jobboard${held ? ' is-held' : ''}`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => {
        setHeld(false)
        setPoint(null)
        setRole(0)
      }}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {ghost && <GhostCursor x={ghost.x} y={ghost.y} press={ghost.press} hidden={held} />}

      <div className="jobboard-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>skeoai.com/jobs</span>
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
                setPoint(null)
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
            {/* Tiles are the chart's legend as well as its control. */}
            <div className="jobboard-stats" role="tablist" aria-label="Metric">
            {METRICS.map((item, i) => {
              const series = data.series[item.key]
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={i === metric}
                  className={i === metric ? 'is-active' : undefined}
                  onClick={() => {
                    setMetric(i)
                    setPoint(null)
                  }}
                >
                  <b>{item.format(series[series.length - 1])}</b>
                  <small>{item.label}</small>
                </button>
              )
            })}
          </div>

            {/* As many roles as the column holds, and no scrollbar. The count
              beside the label is still the real total for the track, so the
              panel shows a sample of the board without misstating its size —
              the list used to scroll through all of them, which set the panel's
              height by how long a track happened to be. */}
            <div className="jobboard-list">
              <span className="chart-label">
                Open roles <em>{data.roles.length}</em>
              </span>
              <ul className="jobboard-roles">
                {data.roles.slice(0, VISIBLE_ROLES).map((item, i) => (
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
            {/* The trend lives on this side of the panel, above the ring —
              the tiles opposite stay the headline figures and double as its
              controls. */}
            <div className="jobboard-chart">
              <div className="chart-head">
                <span className="chart-label">
                  {active.label}
                  <em className={delta >= 0 ? 'up' : 'down'}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
                  </em>
                </span>
                <div className="chart-range">
                  {[6, 12].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n === months ? 'is-active' : undefined}
                      onClick={() => {
                        setMonths(n)
                        setPoint(null)
                      }}
                    >
                      {n}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="chart-plot" onMouseLeave={() => setPoint(null)}>
                <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="jb-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7453e9" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#7453e9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Re-keyed so the line redraws itself whenever the data changes. */}
                  <path key={`a-${track}-${metric}-${months}`} className="chart-area" d={area} fill="url(#jb-fill)" />
                  <path key={`l-${track}-${metric}-${months}`} className="chart-line" d={line} />
                  {point === null && <circle className="chart-rider" cx={rider[0]} cy={rider[1]} r="3.5" />}
                  {point !== null && (
                    <>
                      <line className="chart-cross" x1={dots[point][0]} y1={0} x2={dots[point][0]} y2={CHART.h} />
                      <circle className="chart-dot" cx={dots[point][0]} cy={dots[point][1]} r="4" />
                    </>
                  )}
                </svg>

                {/* One hit area per month, so the chart is keyboard-reachable too. */}
                <div className="chart-hits">
                  {values.map((value, i) => (
                    <button
                      key={labels[i]}
                      type="button"
                      onMouseEnter={() => setPoint(i)}
                      onFocus={() => setPoint(i)}
                      onBlur={() => setPoint(null)}
                      aria-label={`${labels[i]}: ${active.format(value)}`}
                    />
                  ))}
                </div>

                {point !== null && (
                  <span
                    className="chart-tip"
                    style={{
                      left: `${(dots[point][0] / CHART.w) * 100}%`,
                      top: `${(dots[point][1] / CHART.h) * 100}%`,
                    }}
                  >
                    <b>{active.format(values[point])}</b>
                    <i>{labels[point]}</i>
                  </span>
                )}
              </div>

              <div className="chart-axis" aria-hidden="true">
                {labels.map((month, i) => (
                  <span key={month} className={point === i ? 'is-lit' : undefined}>
                    {month}
                  </span>
                ))}
              </div>

              {/* What the board pays, always on show. The line above can be
                switched to open roles or match rate; this stays put, because
                the money is the reason anyone reads the panel at all. */}
              <div className="chart-pay">
                <span>
                  <small>Median</small>
                  <b>{usd(data.earnings.median)}</b>
                </span>
                <span>
                  <small>Top 10%</small>
                  <b>{usd(data.earnings.top10)}</b>
                </span>
                <span>
                  <small>Per year</small>
                  <b>{usd(payNow * 12)}</b>
                </span>
              </div>
            </div>

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
  )
}
