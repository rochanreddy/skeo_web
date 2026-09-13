import { mongoConfigured } from '@/lib/db/mongo'
import type { AnalyticsEvent } from './events'
import * as fileStore from './store.file'
import * as mongoStore from './store.mongo'

/**
 * Which store the events go to.
 *
 * MongoDB whenever MONGODB_URI is set, and the JSON file when it is not. The
 * choice is made once here so the four callers — /api/track, the stats route,
 * the export and the seeder — go on importing the same five functions and
 * knowing nothing about either.
 *
 * The fallback exists so the site runs on a machine with no cluster, not
 * because it is a real option in production: on Vercel the filesystem is
 * ephemeral and unshared, so the file store silently loses everything. Hence
 * the warning below — a dashboard that is quietly empty is worse than one that
 * tells you why.
 *
 * Server-only.
 */

const usingMongo = mongoConfigured()

if (!usingMongo && process.env.NODE_ENV === 'production') {
  console.warn(
    'analytics: MONGODB_URI is not set, so events are going to a JSON file. ' +
      'On a serverless host that file is per-instance and is wiped on deploy — ' +
      'the admin dashboard will under-report or come back empty.',
  )
}

const store = usingMongo ? mongoStore : fileStore

/** Which backing store is live — the admin says so on screen. */
export const storeKind = (): 'mongodb' | 'file' => (usingMongo ? 'mongodb' : 'file')

export const append = (event: AnalyticsEvent): Promise<void> => store.append(event)

export const appendMany = (batch: AnalyticsEvent[]): Promise<void> => store.appendMany(batch)

export const readEvents = (): Promise<readonly AnalyticsEvent[]> => store.readEvents()

export const clearDemoEvents = (): Promise<number> => store.clearDemoEvents()

export const clearAllEvents = (): Promise<number> => store.clearAllEvents()
