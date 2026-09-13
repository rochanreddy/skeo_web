import type { Collection } from 'mongodb'
import { mongoDb } from '@/lib/db/mongo'
import type { AnalyticsEvent } from './events'

/**
 * The events, in skeo's own MongoDB.
 *
 * Same five functions as the file store, so nothing above either of them knows
 * which is in use.
 *
 * NOTHING IS CACHED IN MEMORY HERE, and that is the difference that matters.
 * The file store holds the events in a module variable because it is the only
 * writer. On Vercel there are many instances, each with its own memory, so a
 * cache would mean one instance serving a dashboard that is missing everything
 * the others recorded. Every read goes to the database.
 *
 * Server-only.
 */

const COLLECTION = 'analytics_events'

/** The same ceiling the file store keeps, enforced by a capped-by-age sweep
 *  rather than by slicing an array — see trim(). */
const MAX_EVENTS = 50_000

let indexed = false

async function events(): Promise<Collection<AnalyticsEvent>> {
  const db = await mongoDb()
  const col = db.collection<AnalyticsEvent>(COLLECTION)

  /* Created once per warm instance. Both indexes earn their place: `at` is the
     sort for every read and the key the trim works on, and `demo` is the one
     field the seeded rows are told apart by. createIndex is idempotent, so
     repeating it on a new instance costs a round trip and nothing else. */
  if (!indexed) {
    indexed = true
    try {
      await col.createIndex({ at: 1 })
      await col.createIndex({ demo: 1 })
    } catch (err) {
      // An index that cannot be built is not a reason to drop the event that
      // was being written; it only makes the read slower.
      indexed = false
      console.warn('analytics: could not create indexes', err)
    }
  }
  return col
}

/** Drop the oldest rows once the collection outgrows the ceiling. */
async function trim(col: Collection<AnalyticsEvent>): Promise<void> {
  const total = await col.estimatedDocumentCount()
  if (total <= MAX_EVENTS) return
  const excess = total - MAX_EVENTS
  const oldest = await col
    .find({}, { projection: { _id: 1 }, sort: { at: 1 }, limit: excess })
    .toArray()
  if (oldest.length === 0) return
  await col.deleteMany({ _id: { $in: oldest.map((d) => d._id) } })
}

/** Appends one event. Resolves once the database has it. */
export async function append(event: AnalyticsEvent): Promise<void> {
  const col = await events()
  await col.insertOne({ ...event })
  await trim(col)
}

/** Appends many at once — one round trip for the lot. Used by the seeder. */
export async function appendMany(batch: AnalyticsEvent[]): Promise<void> {
  if (batch.length === 0) return
  const col = await events()
  await col.insertMany(batch.map((e) => ({ ...e })))
  await trim(col)
}

/**
 * Every event, oldest first.
 *
 * The whole collection, because aggregate.ts computes the dashboard in JS and
 * expects the lot. That is honest at this ceiling and would not be past it —
 * when it stops being, the fix is to move the counting into the database
 * rather than to page this.
 */
export async function readEvents(): Promise<readonly AnalyticsEvent[]> {
  const col = await events()
  const rows = await col
    .find({}, { projection: { _id: 0 }, sort: { at: 1 }, limit: MAX_EVENTS })
    .toArray()
  return rows as AnalyticsEvent[]
}

/** Drops the seeded rows, leaving anything real untouched. */
export async function clearDemoEvents(): Promise<number> {
  const col = await events()
  const result = await col.deleteMany({ demo: true })
  return result.deletedCount ?? 0
}

/** Wipes the store completely. Only reachable from the admin dashboard. */
export async function clearAllEvents(): Promise<number> {
  const col = await events()
  const result = await col.deleteMany({})
  return result.deletedCount ?? 0
}
