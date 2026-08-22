'use client'

import { useState } from 'react'
import { testimonials } from '@/lib/content'

const PER_PAGE = 3
const PAGES = Math.ceil(testimonials.length / PER_PAGE)

/**
 * The original markup had arrow buttons that did nothing. They now page through
 * the full quote set, with dots, keyboard support, and a live region so screen
 * readers are told the page changed.
 */
export function Testimonials() {
  const [page, setPage] = useState(0)

  const go = (next: number) => setPage((next + PAGES) % PAGES)
  const visible = testimonials.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="section testimonials" aria-labelledby="testimonials-title">
      <div className="wrap">
        <div className="heading-row">
          <div>
            <span className="eyebrow">FROM THE COMMUNITY</span>
            <h2 id="testimonials-title">Builders become believers.</h2>
          </div>
          <div className="arrows">
            <button type="button" onClick={() => go(page - 1)} aria-label="Previous testimonials">
              ←
            </button>
            <button type="button" onClick={() => go(page + 1)} aria-label="Next testimonials">
              →
            </button>
          </div>
        </div>

        <div className="quote-grid" aria-live="polite">
          {visible.map((item, i) => (
            <article key={`${page}-${item.name}`} className={`quote${i === 1 ? ' featured' : ''}`}>
              <div className="stars" role="img" aria-label="Rated 5 out of 5">
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote>“{item.quote}”</blockquote>
              <footer>
                <b>{item.name}</b>
                <span>{item.role}</span>
              </footer>
            </article>
          ))}
        </div>

        <div className="quote-dots">
          {Array.from({ length: PAGES }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-current={page === i}
              aria-label={`Testimonials page ${i + 1} of ${PAGES}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
