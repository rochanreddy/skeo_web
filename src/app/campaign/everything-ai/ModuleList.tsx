'use client'

import { useId, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

type Module = { title: string; learn: readonly string[]; build: string }

/**
 * The curriculum. On wide screens every module card shows what it covers and
 * what you build — two columns of eight read at a glance. On phones, where
 * the same eight would be a long scroll, each module is a row with an arrow:
 * tap it and its topics and project slide down beneath. The stylesheet
 * decides which, as it does for the FAQ: below 680px the details show only
 * while their row is open.
 */
export function ModuleList({ modules }: { modules: readonly Module[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()

  return (
    <ol className="ea-modules">
      {modules.map((m, i) => {
        const isOpen = open === i
        return (
          <li key={m.title} className={isOpen ? 'is-open' : undefined}>
            <h3 className="ea-mod-head">
              <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span className="ea-mod-num">{pad(i + 1)}</span>
                <span className="ea-mod-title">{m.title}</span>
                <svg className="ea-mod-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div className="ea-mod-body" id={`${id}-${i}`}>
              <div className="ea-mod-inner">
                <ul className="ea-mod-tags" aria-label={`What you learn in ${m.title}`}>
                  {m.learn.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
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
