'use client'

import { useId, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

type Module = { title: string; build: string; body: string; isNew?: boolean }

/**
 * The curriculum: eight modules, each a card with its number, one line on
 * what it covers and what you build. On wide screens every card shows it all;
 * the stylesheet decides how phones lay them out.
 */
export function ModuleList({ modules, start = 0 }: { modules: readonly Module[]; start?: number }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()

  return (
    <ol className="ea-modules" start={start + 1}>
      {modules.map((m, i) => {
        const isOpen = open === i
        return (
          <li key={m.title} className={isOpen ? 'is-open' : undefined}>
            <h3 className="ea-mod-head">
              <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span className="ea-mod-num">{pad(start + i + 1)}</span>
                <span className="ea-mod-title">
                  {m.title}
                  {m.isNew && <span className="ea-mod-new">New</span>}
                </span>
                <svg className="ea-mod-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div className="ea-mod-body" id={`${id}-${i}`}>
              <div className="ea-mod-inner">
                <p className="ea-mod-desc">{m.body}</p>
                <p className="ea-mod-build">
                  <span>You build</span>
                  <b>{m.build}</b>
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

type Level = { label: string; tagline: string; modules: readonly Module[] }

/**
 * The Everything AI curriculum, in levels: each level opens with its label
 * and one-line promise, then its modules; the numbers run straight through
 * the levels. The four levels stand side by side as a ladder on wide screens
 * and stack on phones.
 */
export function LevelList({ levels }: { levels: readonly Level[] }) {
  const starts = levels.map((_, i) => levels.slice(0, i).reduce((n, l) => n + l.modules.length, 0))
  return (
    <div className="ea-levels">
      {levels.map((level, li) => (
        <section key={level.label} className="ea-level" aria-label={level.label}>
          <header className="ea-level-head">
            <span className="ea-level-label">{level.label}</span>
            <p className="ea-level-tag">{level.tagline}</p>
          </header>
          <ModuleList modules={level.modules} start={starts[li]} />
        </section>
      ))}
    </div>
  )
}
