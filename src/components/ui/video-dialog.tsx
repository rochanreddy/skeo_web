'use client'

import { useState } from 'react'
import { Modal, useDialogId } from '@/components/modals/Modal'

/**
 * A walkthrough poster that opens the cut in a lightbox.
 *
 * The pattern is 21st.dev's Hero Video Dialog — poster, centred play control,
 * full-size player over a dimmed page. The implementation is not: that one
 * animates with framer-motion and its dialog has no focus trap, no scroll lock,
 * no Escape handling, and a close button with no click handler. This site
 * already ships a Modal that does all of that, so the poster is the only new
 * part and the overlay is the shell the auth and checkout dialogs use.
 *
 * With no `src` yet there is nothing to open, so the poster renders as plain
 * content rather than a button that would look clickable and do nothing.
 */
export function VideoDialog({
  src,
  label,
  duration,
}: {
  src?: string
  label: string
  duration: string
}) {
  const [open, setOpen] = useState(false)
  const titleId = useDialogId('walkthrough')

  const poster = (
    <>
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
        {poster}
      </div>
    )
  }

  return (
    <>
      <button type="button" className="video-poster" onClick={() => setOpen(true)} aria-label={`Play: ${label}`}>
        {poster}
      </button>

      {open && (
        <Modal labelledBy={titleId} onClose={() => setOpen(false)} className="video-modal">
          <h2 id={titleId} className="sr-only">
            {label}
          </h2>
          <div className="video-frame">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={src} controls autoPlay playsInline />
          </div>
        </Modal>
      )}
    </>
  )
}
