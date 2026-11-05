'use client'

import { useState } from 'react'

/**
 * A walkthrough poster that plays where it sits.
 *
 * Clicking swaps the poster for the video in the same 16:9 frame, so the reader
 * keeps their place on the page; full screen comes with the browser's own
 * controls. The <video> only mounts on that click, which is what keeps the file
 * off the page load — the thumbnail is the only thing fetched until then.
 *
 * With no `src` yet there is nothing to play, so the poster renders as plain
 * content rather than a button that would look clickable and do nothing.
 */
export function VideoPlayer({
  src,
  poster,
  label,
  duration,
}: {
  src?: string
  poster?: string
  label: string
  duration: string
}) {
  const [playing, setPlaying] = useState(false)

  const cover = (
    <>
      {poster && <img src={poster} alt="" loading="lazy" />}
      <span className="video-poster-play" aria-hidden="true">
        ▶
      </span>
      <span className="video-poster-label">
        {src ? label : `${label} — coming soon`}
        <b>{duration}</b>
      </span>
    </>
  )

  if (!src) {
    return (
      <div className="video-poster is-pending" role="img" aria-label={`${label} — video coming soon`}>
        {cover}
      </div>
    )
  }

  if (playing) {
    return (
      <div className="video-poster">
        {/* The button that had focus is gone, so hand it to the player. */}
        <video ref={(v) => v?.focus()} src={src} poster={poster} aria-label={label} controls autoPlay playsInline />
      </div>
    )
  }

  return (
    <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play: ${label}`}>
      {cover}
    </button>
  )
}
