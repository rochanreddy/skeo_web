import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { AnalyticsEvent } from './events'

/**
 * Where the events live.
 *
 * A JSON file under `.data/` rather than a database: the site has no backend to
 * speak of, and a single append-only file is honest about the scale this is at
 * while keeping the whole dashboard runnable with `npm run dev` and nothing
 * else. Everything above this module goes through `append` and `readEvents`, so
 * swapping in Postgres later is a rewrite of this file alone.
 *
 * Server-only — importing it from a client component will fail the build.
 */

const DATA_DIR = process.env.SKEO_DATA_DIR || path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'analytics.json')

/** Past this the oldest rows are dropped; a landing page will not reach it soon. */
const MAX_EVENTS = 50_000

type Snapshot = { version: 1; events: AnalyticsEvent[] }

/**
 * The file is read once and then held in memory. Reads are hot (every dashboard
 * poll) and writes are comparatively rare, so the cache is the working copy and
 * disk is the durable mirror of it.
 */
let cache: AnalyticsEvent[] | null = null
let loading: Promise<AnalyticsEvent[]> | null = null

/**
 * Writes are chained onto one promise so two requests landing together cannot
 * interleave and truncate each other's JSON. Node's single thread makes each
 * link atomic; the chain makes the sequence of them safe.
 */
let writeChain: Promise<void> = Promise.resolve()
let dirty = false

async function load(): Promise<AnalyticsEvent[]> {
  if (cache) return cache
  if (loading) return loading

  loading = (async () => {
    try {
      const raw = await fs.readFile(FILE, 'utf8')
      const parsed = JSON.parse(raw) as Partial<Snapshot>
      cache = Array.isArray(parsed.events) ? parsed.events : []
    } catch {
      // No file yet, or one we cannot parse: start clean rather than throw and
      // take the whole site's tracking endpoint down with it.
      cache = []
    }
    loading = null
    return cache
  })()

  return loading
}

async function flush(): Promise<void> {
  if (!dirty || !cache) return
  dirty = false
  const snapshot: Snapshot = { version: 1, events: cache }
  const body = JSON.stringify(snapshot)
  await fs.mkdir(DATA_DIR, { recursive: true })
  // Write beside the target and rename over it: a crash mid-write leaves the
  // previous good file in place instead of a half-written one.
  const tmp = `${FILE}.${process.pid}.tmp`
  await fs.writeFile(tmp, body, 'utf8')
  await fs.rename(tmp, FILE)
}

function schedule(): Promise<void> {
  writeChain = writeChain.then(flush, flush)
  return writeChain
}

/** Appends one event and persists. Resolves once it is on disk. */
export async function append(event: AnalyticsEvent): Promise<void> {
  const events = await load()
  events.push(event)
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS)
  dirty = true
  await schedule()
}

/** Appends many at once — one write for the lot. Used by the seeder. */
export async function appendMany(batch: AnalyticsEvent[]): Promise<void> {
  if (batch.length === 0) return
  const events = await load()
  events.push(...batch)
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS)
  dirty = true
  await schedule()
}

/** Every event, oldest first. Callers must not mutate the array they get back. */
export async function readEvents(): Promise<readonly AnalyticsEvent[]> {
  return load()
}

/** Drops the seeded rows, leaving anything real untouched. */
export async function clearDemoEvents(): Promise<number> {
  const events = await load()
  const before = events.length
  const kept = events.filter((event) => !event.demo)
  if (kept.length === before) return 0
  cache = kept
  dirty = true
  await schedule()
  return before - kept.length
}

/** Wipes the store completely. Only reachable from the admin dashboard. */
export async function clearAllEvents(): Promise<number> {
  const events = await load()
  const removed = events.length
  cache = []
  dirty = true
  await schedule()
  return removed
}
