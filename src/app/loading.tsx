/**
 * Shown while a route segment is still being fetched.
 *
 * The companion to error.tsx and not-found.tsx: those cover a route that broke
 * or does not exist, this covers one that has not arrived yet. Without it a
 * navigation sits on the old page with nothing to say it is working — most
 * visible going into /checkout, which is a fresh route reached at the one
 * moment a reader is least willing to wonder whether their click registered.
 *
 * Deliberately bare. A skeleton of a page it cannot predict would be a guess,
 * and a guess that redraws as the real thing arrives reads as a flicker; a mark
 * that simply says "working" does not.
 */
export default function Loading() {
  return (
    <main className="route-loading" aria-busy="true" aria-live="polite">
      <span className="route-loading-mark" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </main>
  )
}
