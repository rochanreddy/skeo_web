/**
 * The marquee engine behind every rail on the page: the employer strip, and the
 * accreditation strip on a phone.
 *
 * Transform-driven rather than a scroll container, so the row never stops on
 * hover or touch and loops with no visible seam. Dragging follows the pointer
 * and auto-advance resumes on release — a resting finger doesn't stop it
 * either. The track must hold THREE identical copies of its list: one on
 * screen, one entering, one leaving. That is what `copy` below assumes.
 *
 * Extracted so the two callers share one implementation. They differ only in
 * when they attach: LogoRail runs wherever it is rendered, while the
 * accreditation rail is a phone-only treatment and attaches behind a media
 * query — see SwipeRail.
 *
 * The caller is responsible for the reduced-motion check; this function always
 * animates once attached.
 */
export type RailOptions = {
  /** Pixels per frame. */
  speed: number
  /** Which way the CONTENT travels — the track is pushed the other way. */
  direction: 'left' | 'right'
}

export function attachRail(track: HTMLElement, { speed, direction }: RailOptions): () => void {
  let copy = 0
  let offset = 0
  let frame = 0
  let down = false
  let dragging = false
  let startX = 0
  let downX = 0
  let startOffset = 0

  // One copy's width. Kept in a variable rather than read per frame — layout
  // reads inside rAF are what make marquees stutter.
  const measure = () => {
    copy = track.scrollWidth / 3
  }
  const wrap = () => {
    if (copy <= 0) return
    while (offset <= -copy) offset += copy
    while (offset > 0) offset -= copy
  }
  const apply = () => {
    track.style.transform = `translate3d(${offset}px,0,0)`
  }

  measure()
  const observer = new ResizeObserver(measure)
  observer.observe(track)

  // Only advance while the rail is actually on screen.
  let onScreen = true
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
  })
  visibility.observe(track)

  // Content travelling right means the track's offset climbing. wrap() already
  // folds the offset back either way, so the sign is the whole of it.
  const step = direction === 'right' ? speed : -speed

  const tick = () => {
    if (onScreen && copy > 0 && !dragging && !document.hidden) {
      offset += step
      wrap()
      apply()
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)

  const onDown = (e: PointerEvent) => {
    down = true
    downX = startX = e.clientX
    startOffset = offset
  }
  const onMove = (e: PointerEvent) => {
    if (!down) return
    // A few pixels of slop, so a tap on a logo isn't read as a drag.
    if (!dragging && Math.abs(e.clientX - downX) > 6) dragging = true
    if (!dragging) return
    offset = startOffset + (e.clientX - startX)
    wrap()
    apply()
    startOffset = offset
    startX = e.clientX
  }
  const onUp = () => {
    down = false
    dragging = false
  }

  track.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    visibility.disconnect()
    track.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    // Hand the track back to CSS exactly as it was found.
    track.style.transform = ''
  }
}
