'use client'

import { useEffect, useId, useState } from 'react'
import { PurchaseButton, SyllabusButton } from '@/components/ActionButton'
import { GrokMark } from '@/components/tools/marks'

/* The bundle pages always show the brown theme: set it on arrival (the
   layout's script does the same before first paint) and give the visitor's
   own choice back on leaving. */
export function BrownTheme() {
  useEffect(() => {
    const root = document.documentElement
    const before = root.dataset.palette
    root.dataset.palette = 'claude'
    return () => {
      if (before) root.dataset.palette = before
    }
  }, [])
  return null
}

/* ---- What you'll be able to do: tap a card to open it, one at a time ---- */

export type UseCase = { level: string; title: string; body?: string; build?: string; points?: readonly string[] }

export function UseCases({ items }: { items: readonly UseCase[] }) {
  const [open, setOpen] = useState(0)
  return (
    <ul className="bx-uc">
      {items.map((u, i) => {
        const on = open === i
        return (
          <li key={u.title} className={on ? 'is-on' : undefined}>
            <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
              <span className="bx-uc-level">{u.level}</span>
              <span className="bx-uc-title">{u.title}</span>
              {!on && <span className="bx-uc-hint">Tap to open</span>}
            </button>
            {on && (
              <div className="bx-uc-body">
                {u.body && <p>{u.body}</p>}
                {u.points && (
                  <ul className="bx-uc-points">
                    {u.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                )}
                {u.build && <span className="bx-uc-build">You build: {u.build}</span>}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ---- The courses, one tab each, with what is taught and what you ship ---- */

export type CourseTab = {
  id: string
  name: string
  maker: string
  tagline: string
  blurb: string
  facts: string[]
  modules: string[]
  capstone: readonly string[]
  logo: string
}

export function CourseTabs({ courses }: { courses: readonly CourseTab[] }) {
  const [active, setActive] = useState(0)
  const base = useId()

  /* The hero's "Inside the bundle" links point at #course-<id>: open that tab. */
  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#course-(.+)$/)
      if (!m) return
      const i = courses.findIndex((c) => c.id === m[1])
      if (i < 0) return
      setActive(i)
      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    pick()
    window.addEventListener('hashchange', pick)
    return () => window.removeEventListener('hashchange', pick)
  }, [courses])

  const c = courses[active]
  return (
    <div className="bx-courses">
      <div className="bx-tabs" role="tablist" aria-label="Courses">
        {courses.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-controls={`${base}-panel`}
            aria-selected={i === active}
            className={i === active ? 'is-on' : undefined}
            onClick={() => setActive(i)}
          >
            {t.id === 'grok' ? (
              <GrokMark className="bx-tab-mark" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logo} alt="" width={18} height={18} />
            )}
            {t.name}
          </button>
        ))}
      </div>

      <div className="bx-panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${c.id}`} key={c.id}>
        <div className="bx-panel-main">
          <h3>
            {c.name} <small>{c.maker}</small>
          </h3>
          <p>{c.blurb}</p>
          <ul className="bx-panel-facts">
            {c.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <ol className="bx-panel-modules">
            {c.modules.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        </div>

        <aside className="bx-panel-side">
          <span className="bx-panel-label">Capstone: pick one to ship</span>
          <ul>
            {c.capstone.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <SyllabusButton className="button button-outline bx-panel-syl" tool={c.id}>
            View the full curriculum
          </SyllabusButton>
          <PurchaseButton plan="earlyaccess" className="button button-lime ea-cta bx-panel-buy">
            Get every course
          </PurchaseButton>
        </aside>
      </div>
    </div>
  )
}
