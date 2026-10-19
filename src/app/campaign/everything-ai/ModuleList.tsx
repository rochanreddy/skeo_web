'use client'

import { useId, useState, type CSSProperties } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

type Module = { title: string; build: string; body: string; isNew?: boolean }
type Level = { label: string; tagline: string; modules: readonly Module[] }

/**
 * The curriculum, in levels. Each level opens with its label and one-line
 * promise, then its modules side by side; modules are numbered straight
 * through the levels. On wide screens every card shows what it covers and
 * what you build. On phones, where ten cards would be a long scroll, each
 * module is a row with an arrow: tap it and its description and project slide
 * down beneath. The stylesheet decides which, as it does for the FAQ: below
 * 680px the details show only while their row is open.
 */
export function ModuleList({ levels }: { levels: readonly Level[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()
  const starts = levels.map((_, i) => levels.slice(0, i).reduce((n, l) => n + l.modules.length, 0))

  return (
    <div className="ea-levels">
      {levels.map((level, li) => (
        <section key={level.label} className="ea-level" aria-label={level.label}>
          <header className="ea-level-head">
            <span className="ea-level-label">{level.label}</span>
            <h3 className="ea-level-tag">{level.tagline}</h3>
          </header>
          <ol className="ea-modules" start={starts[li] + 1} style={{ '--n': level.modules.length } as CSSProperties}>
            {level.modules.map((m, mi) => {
              const n = starts[li] + mi
              const isOpen = open === n
              return (
                <li key={m.title} className={isOpen ? 'is-open' : undefined}>
                  <h4 className="ea-mod-head">
                    <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${n}`} onClick={() => setOpen(isOpen ? null : n)}>
                      <span className="ea-mod-num">{pad(n + 1)}</span>
                      <span className="ea-mod-title">
                        {m.title}
                        {m.isNew && <span className="ea-mod-new">New</span>}
                      </span>
                      <svg className="ea-mod-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </h4>
                  <div className="ea-mod-body" id={`${id}-${n}`}>
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
        </section>
      ))}
    </div>
  )
}
