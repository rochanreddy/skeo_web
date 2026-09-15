import { MongoClient, type Db } from 'mongodb'

/**
 * skeo's own MongoDB connection. Its own cluster and its own database — it
 * shares nothing with menler.
 *
 * The official driver rather than Mongoose, which the other apps use. Events
 * are genuinely heterogeneous — every type carries different props — so a
 * schema layer would be fighting the data rather than describing it, and this
 * module needs no models to do its job.
 *
 * THE CACHE IS THE POINT. A serverless function is created and destroyed per
 * request burst, so connecting per request opens a new pool every time and
 * Atlas closes the door at its connection limit. Holding the promise on
 * globalThis lets every invocation that reuses a warm instance reuse the same
 * pool, and the promise (not the client) so two requests racing on a cold start
 * share one connect rather than starting two.
 *
 * Server-only. Importing it from a client component will fail the build.
 */

const URI = process.env.MONGODB_URI
/** Named so a cluster can host more than one thing without them colliding. */
const DB_NAME = process.env.MONGODB_DB || 'skeo'

/** True when a database is configured at all — see store.ts for what happens
 *  when it is not. */
export const mongoConfigured = () => Boolean(URI)

declare global {
  // eslint-disable-next-line no-var
  var _skeoMongo: Promise<MongoClient> | undefined
}

function connect(): Promise<MongoClient> {
  if (!URI) {
    return Promise.reject(
      new Error('MONGODB_URI is not set — nothing to connect to.'),
    )
  }
  const client = new MongoClient(URI, {
    // Small on purpose: many short-lived serverless instances each holding a
    // handful of sockets is how an Atlas connection limit gets reached.
    maxPoolSize: 10,
    // Fail fast rather than hanging a request for the default 30s — a page
    // that says something went wrong beats one that never answers.
    serverSelectionTimeoutMS: 8000,
  })
  return client.connect()
}

/**
 * The shared connection. In development the module is re-evaluated on every
 * hot reload, so the promise is parked on globalThis there too — otherwise
 * each save leaks another pool until Atlas refuses new ones.
 */
export function mongoClient(): Promise<MongoClient> {
  if (!global._skeoMongo) {
    global._skeoMongo = connect().catch((err) => {
      // Clear the slot so the next request retries instead of being handed a
      // rejected promise forever.
      global._skeoMongo = undefined
      throw err
    })
  }
  return global._skeoMongo
}

export async function mongoDb(): Promise<Db> {
  const client = await mongoClient()
  return client.db(DB_NAME)
}
