'use client'

import { useEffect, useState } from 'react'

type Review = { quote: string; name: string; role: string; photo?: string }

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

/**
 * The large quote beside the testimonial wall. It moves on to the next review
 * every five seconds, pausing while the pointer or keyboard focus is on it so
 * nobody loses a quote mid-read; the dots under it jump straight to any one.
 * Reduced motion still rotates, without the fade.
 */
export function FeaturedReview({ items }: { items: readonly Review[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || items.length < 2) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % items.length), 5000)
    return () => window.clearTimeout(t)
  }, [i, paused, items.length])

  const r = items[i]
  return (
    <figure
      className="ea-rv-feature"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="ea-rv-mark" aria-hidden="true">
        “
      </span>
      <div key={i} className="ea-rv-slide">
        <div className="ea-rv-stars" role="img" aria-label="Rated 5 out of 5">
          ★★★★★
        </div>
        <blockquote>{r.quote}</blockquote>
        <figcaption>
          <span className="ea-rv-avatar" aria-hidden="true">
            {r.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.photo} alt="" loading="lazy" />
            ) : (
              initials(r.name)
            )}
          </span>
          <span>
            <b>{r.name}</b>
            <span>{r.role}</span>
          </span>
        </figcaption>
      </div>
      {items.length > 1 && (
        <div className="ea-rv-dots" role="group" aria-label="Choose a review">
          {items.map((it, n) => (
            <button
              key={it.name}
              type="button"
              className={n === i ? 'is-on' : undefined}
              aria-label={`Review ${n + 1} of ${items.length}, ${it.name}`}
              aria-current={n === i || undefined}
              onClick={() => setI(n)}
            >
              {n === i && !paused && <span className="ea-rv-dot-fill" />}
            </button>
          ))}
        </div>
      )}
    </figure>
  )
}
