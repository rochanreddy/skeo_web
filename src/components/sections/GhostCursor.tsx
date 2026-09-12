/**
 * The pointer that demonstrates a panel while nobody is touching it.
 *
 * Purely presentational: it is told where to be and whether it is pressing,
 * and the tour that decides those lives with the panel it is touring — see
 * JobBoard, which drives this off the same clock that steps its tracks, so the
 * cursor is always on the control the panel is actually reacting to.
 *
 * An arrowhead with no tail, which is the point of the shape: the classic
 * cursor's leg reads as a real OS pointer and made the panel look like a
 * screenshot with someone's mouse caught in it.
 */
export function GhostCursor({
  x,
  y,
  press,
  hidden,
}: {
  x: number
  y: number
  press: boolean
  hidden: boolean
}) {
  return (
    <div
      className={`jb-ghost${press ? ' is-press' : ''}${hidden ? ' is-hidden' : ''}`}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
      aria-hidden="true"
    >
      {/* Drawn behind the arrow so a press reads as coming from the tip. */}
      <span className="jb-ghost-tap" />
      <svg viewBox="0 0 24 24" className="jb-ghost-arrow">
        <path d="M4 2.2 18.4 12.6 10.4 13.4 4 18.6Z" />
      </svg>
    </div>
  )
}
