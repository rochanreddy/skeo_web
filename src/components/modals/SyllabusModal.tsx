'use client'

import { syllabusFor } from '@/lib/syllabi'
import { Modal, useDialogId } from './Modal'

/**
 * A tool's curriculum, opened over the page from its card.
 *
 * Overview depth on purpose: what each module covers, not every lesson inside
 * it. Someone deciding whether to buy wants to answer "will this teach me the
 * thing I came for?" in a minute of scrolling.
 */
export function SyllabusModal({ tool, onClose }: { tool?: string; onClose: () => void }) {
  const titleId = useDialogId('syllabus-title')
  const { eyebrow, title, intro, stats, modules, footnote, cta } = syllabusFor(tool)

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="syllabus-modal">
      <header className="syllabus-head">
        <span className="eyebrow">{eyebrow}</span>
        <h3 id={titleId}>{title}</h3>
        <p>{intro}</p>
        <ul className="syllabus-stats">
          {stats.map((stat) => (
            <li key={stat}>{stat}</li>
          ))}
        </ul>
      </header>

      <ol className="syllabus-list">
        {modules.map((module, i) => (
          <li key={module.title}>
            <article>
              <header>
                <span className="syllabus-no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4>{module.title}</h4>
                  <small>{module.meta}</small>
                </div>
              </header>
              <ul>
                {module.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>

      <footer className="syllabus-foot">
        <p>
          <span aria-hidden="true">🔒</span> {footnote}
        </p>
        <a className="button" href={cta.href} onClick={onClose}>
          <span className="btn-label">{cta.label}</span> <span aria-hidden="true">→</span>
        </a>
      </footer>
    </Modal>
  )
}
