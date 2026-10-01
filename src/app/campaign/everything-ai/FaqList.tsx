'use client'

import { useId, useState } from 'react'

/**
 * The FAQ. On wide screens every answer is simply shown — six short answers
 * in a grid are quicker to read than to click open. On phones, where the same
 * six would be a long scroll, each question is a row with an arrow: tap it
 * and the answer slides down beneath. The stylesheet decides which: below
 * 680px an answer shows only while its row is open.
 */
export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()

  return (
    <dl className="ea-faq">
      {items.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} className={isOpen ? 'ea-faq-item is-open' : 'ea-faq-item'}>
            <dt>
              <button
                type="button"
                className="ea-faq-q"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{f.q}</span>
                <svg className="ea-faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </dt>
            <dd id={`${id}-${i}`}>
              <div className="ea-faq-a">
                <p>{f.a}</p>
              </div>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
