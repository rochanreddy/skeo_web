'use client'

import { useId, useState } from 'react'

/**
 * The FAQ as an accordion on every screen: numbered questions, one answer
 * open at a time (the first, to start), sliding open beneath its question
 * with a plus that turns into a minus.
 */
export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const id = useId()

  return (
    <ul className="ea-qa">
      {items.map((f, i) => {
        const isOpen = open === i
        return (
          <li key={f.q} className={isOpen ? 'ea-qa-item is-open' : 'ea-qa-item'}>
            <h3 className="ea-qa-h">
              <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} id={`${id}-q${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                <span className="ea-qa-n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="ea-qa-q">{f.q}</span>
                <span className="ea-qa-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="ea-qa-body" id={`${id}-${i}`} role="region" aria-labelledby={`${id}-q${i}`}>
              <div>
                <p>{f.a}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
