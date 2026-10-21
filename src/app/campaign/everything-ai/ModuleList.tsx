'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Rocket, Sparkles, Workflow, Zap, type LucideIcon } from 'lucide-react'
import { ToolMark } from '../_kit/ToolMark'

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

type Level = { label: string; tagline: string; icon?: string; modules: readonly (Module & { tools?: readonly string[] })[] }

const LEVEL_ICONS: Record<string, LucideIcon> = { use: Zap, create: Sparkles, automate: Workflow, build: Rocket }

/**
 * The Everything AI curriculum as a four-step track. A numbered step for each
 * level, joined by a line that fills in, level by level, as the section comes
 * into view; under each step, one panel: the level's glyph, name and promise,
 * then its modules — number, title, one line, what you build and the tools
 * it uses — and a count at the foot. The panels share a height, so the four
 * read as one row. On phones the track turns vertical: the steps run down the
 * left, each panel beside its step.
 */
export function LevelList({ levels }: { levels: readonly Level[] }) {
  const starts = levels.map((_, i) => levels.slice(0, i).reduce((n, l) => n + l.modules.length, 0))
  const ref = useRef<HTMLOListElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={ref} className={shown ? 'ea-lv is-in' : 'ea-lv'}>
      {levels.map((level, li) => {
        const [step, name] = level.label.split(' · ')
        const Icon = LEVEL_ICONS[level.icon ?? ''] ?? Zap
        const count = level.modules.length
        return (
          <li key={level.label} className="ea-lv-col" style={{ '--lv': li } as CSSProperties}>
            <span className="ea-lv-step" aria-hidden="true">
              <span className="ea-lv-dot">{li + 1}</span>
            </span>
            <section className="ea-lv-panel" aria-label={level.label}>
              <header className="ea-lv-head">
                <span className="ea-lv-icon" aria-hidden="true">
                  <Icon strokeWidth={2} absoluteStrokeWidth />
                </span>
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
                      {m.tools?.length ? (
                        <span className="ea-lv-tools" aria-label={`Tools: ${m.tools.join(', ')}`}>
                          {m.tools.map((t) => (
                            <span key={t} className="ea-lv-tool" title={t}>
                              <ToolMark name={t} mark={t} className="ea-lv-tool-mark" id={`lv-${starts[li] + mi}-${t}`} />
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
              <footer className="ea-lv-foot">
                <span>
                  {count} modules · {count} projects
                </span>
                <span aria-hidden="true">
                  <span className="ea-lv-next">{li < levels.length - 1 ? 'Next level ' : 'Ship it '}</span>
                  {li < levels.length - 1 ? '→' : '✦'}
                </span>
              </footer>
            </section>
          </li>
        )
      })}
    </ol>
  )
}
