'use client'

import { useState } from 'react'
import { PurchaseButton } from '@/components/ActionButton'
import { Glyph, Tick } from '../_kit/Icons'

/**
 * Three taps to a personal plan. It asks what a beginner can answer without
 * knowing anything about AI — what they want, where they are starting from,
 * what they do — and answers with the four modules and projects of the real
 * curriculum that fit, and the button. Nothing is stored or sent: it only
 * changes what this page shows.
 */

type Module = { title: string; learn: readonly string[]; build: string }

const GOALS = [
  { key: 'time', icon: 'time', label: 'Save time at work', picks: [0, 1, 2, 4], win: 'hours back every week' },
  { key: 'money', icon: 'money', label: 'Earn on the side', picks: [0, 1, 3, 6], win: 'skills people pay for' },
  { key: 'job', icon: 'job', label: 'Get a better job', picks: [0, 1, 4, 7], win: 'a portfolio employers want' },
  { key: 'build', icon: 'build', label: 'Build my own thing', picks: [0, 5, 6, 7], win: 'a real product, live online' },
] as const

const LEVELS = [
  { key: 'new', label: 'Never used AI', line: 'You start at lesson one: what AI is and how to talk to it.' },
  { key: 'some', label: 'Tried ChatGPT a bit', line: 'You skip nothing, but the first steps will feel quick.' },
  { key: 'often', label: 'Use it most days', line: 'The early modules sharpen what you do; the later ones are new ground.' },
] as const

const WHO = [
  { key: 'student', label: 'Student', line: 'Projects to show before your first interview.' },
  { key: 'working', label: 'Working', line: 'Use it in the job you already have, from week one.' },
  { key: 'business', label: 'Business owner', line: 'Marketing, admin and customer replies — handled faster.' },
  { key: 'freelance', label: 'Freelancer', line: 'Deliver more for each client, in less time.' },
] as const

const pad = (n: number) => String(n).padStart(2, '0')

export function Quiz({ modules, price }: { modules: readonly Module[]; price: string }) {
  const [goal, setGoal] = useState<(typeof GOALS)[number] | null>(null)
  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null)
  const [who, setWho] = useState<(typeof WHO)[number] | null>(null)
  const step = !goal ? 0 : !level ? 1 : !who ? 2 : 3

  const reset = () => {
    setGoal(null)
    setLevel(null)
    setWho(null)
  }

  return (
    <div className="ve-quiz" aria-live="polite">
      <div className="ve-quiz-top">
        <span>{step < 3 ? `Question ${step + 1} of 3` : 'Your plan'}</span>
        <span className="ve-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i <= step ? 'is-on' : undefined} />
          ))}
        </span>
      </div>

      {step === 0 && (
        <fieldset>
          <legend>What do you want AI to do for you?</legend>
          <div className="ve-options ve-options-goal">
            {GOALS.map((g) => (
              <button key={g.key} type="button" onClick={() => setGoal(g)}>
                <span className="ve-opt-icon">
                  <Glyph name={g.icon} />
                </span>
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>How much have you used AI so far?</legend>
          <div className="ve-options">
            {LEVELS.map((l) => (
              <button key={l.key} type="button" onClick={() => setLevel(l)}>
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" className="ve-back" onClick={() => setGoal(null)}>
            ← Back
          </button>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend>Which best describes you?</legend>
          <div className="ve-options ve-options-2">
            {WHO.map((w) => (
              <button key={w.key} type="button" onClick={() => setWho(w)}>
                {w.label}
              </button>
            ))}
          </div>
          <button type="button" className="ve-back" onClick={() => setLevel(null)}>
            ← Back
          </button>
        </fieldset>
      )}

      {step === 3 && goal && level && who && (
        <div className="ve-plan">
          <p className="ve-plan-head">
            Your path to <b>{goal.win}</b>
          </p>
          <ol>
            {goal.picks.map((i) => (
              <li key={i}>
                <span>{pad(i + 1)}</span>
                <div>
                  <b>{modules[i].title}</b>
                  <small>You build: {modules[i].build}</small>
                </div>
              </li>
            ))}
          </ol>
          <ul className="ve-plan-notes">
            <li>
              <Tick />
              {level.line}
            </li>
            <li>
              <Tick />
              {who.line}
            </li>
            <li>
              <Tick />
              The other {modules.length - goal.picks.length} modules are included too — take them whenever you like.
            </li>
          </ul>
          <PurchaseButton plan="earlyaccess" className="ve-btn ve-btn-block">
            Start my plan — {price}
          </PurchaseButton>
          <button type="button" className="ve-back" onClick={reset}>
            Start over
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Rough maths, labelled as such: hours a week on writing, research and
 * repeat tasks, and what a third of that back would add up to. A third is a
 * deliberately cautious guess, and the page says it is a guess.
 */
export function TimeBack() {
  const [hours, setHours] = useState(8)
  const back = Math.round((hours / 3) * 10) / 10
  return (
    <div className="ve-calc">
      <label htmlFor="ve-hours">
        Hours a week you spend writing, researching or on repeat tasks: <b>{hours}</b>
      </label>
      <input id="ve-hours" type="range" min={1} max={30} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      <div className="ve-calc-out">
        <div>
          <b>{back}</b>
          <span>hours back a week</span>
        </div>
        <div>
          <b>{Math.round(back * 48)}</b>
          <span>hours back a year</span>
        </div>
      </div>
      <p>A rough guide, not a promise: it assumes AI saves you a third of that time.</p>
    </div>
  )
}
