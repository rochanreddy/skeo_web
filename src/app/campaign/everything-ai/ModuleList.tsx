'use client'

import { useId, useState, type CSSProperties } from 'react'

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
 * The Everything AI curriculum as a four-step track. A numbered step for each
 * level, joined by a line that brightens as it climbs; under each step, one
 * panel: the level's name and promise, then its modules as a short list —
 * number, title, one line, what you build. The panels share a height, so the
 * four read as one row. On phones the track turns vertical: the steps run
 * down the left, each panel beside its step.
 */
export function LevelList({ levels }: { levels: readonly Level[] }) {
  const starts = levels.map((_, i) => levels.slice(0, i).reduce((n, l) => n + l.modules.length, 0))
  return (
    <ol className="ea-lv">
      {levels.map((level, li) => {
        const [step, name] = level.label.split(' · ')
        return (
          <li key={level.label} className="ea-lv-col" style={{ '--lv': li } as CSSProperties}>
            <span className="ea-lv-step" aria-hidden="true">
              <span className="ea-lv-dot">{li + 1}</span>
            </span>
            <section className="ea-lv-panel" aria-label={level.label}>
              <header className="ea-lv-head">
                <span className="ea-lv-kicker">{step}</span>
                <h3 className="ea-lv-name">{name ?? level.label}</h3>
                <p className="ea-lv-tag">{level.tagline}</p>
              </header>
              <ol className="ea-lv-mods" start={starts[li] + 1}>
                {level.modules.map((m, mi) => (
                  <li key={m.title}>
                    <span className="ea-lv-num">{pad(starts[li] + mi + 1)}</span>
                    <div className="ea-lv-mod">
                      <h4>
                        {m.title}
                        {m.isNew && <span className="ea-mod-new">New</span>}
                      </h4>
                      <p>{m.body}</p>
                      <p className="ea-lv-build">
                        <span>You build</span> {m.build}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </li>
        )
      })}
    </ol>
  )
}
