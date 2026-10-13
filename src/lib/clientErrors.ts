import type { Collection } from 'mongodb'
import { mongoConfigured, mongoDb } from '@/lib/db/mongo'

/**
 * Failures buyers hit while verifying or paying, reported by the page itself
 * (src/lib/friendlyError). No name, email or phone — only which step failed,
 * how, and where. Kept for 90 days by a TTL index.
 */

export type ClientErrorDoc = {
  stage: string
  code: string
  message: string
  status: number | null
  page: string
  userAgent: string
  createdAt: Date
}

let indexed = false

async function collection(): Promise<Collection<ClientErrorDoc>> {
  const col = (await mongoDb()).collection<ClientErrorDoc>('client_errors')
  if (!indexed) {
    await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })
    indexed = true
  }
  return col
}

export async function saveClientError(doc: Omit<ClientErrorDoc, 'createdAt'>) {
  if (!mongoConfigured()) return
  await (await collection()).insertOne({ ...doc, createdAt: new Date() })
}

/** The latest 200, and the last 7 days counted by step and kind. */
export async function listClientErrors() {
  if (!mongoConfigured()) return { last7Days: [], latest: [] }
  const col = await collection()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [latest, grouped] = await Promise.all([
    col.find().sort({ createdAt: -1 }).limit(200).toArray(),
    col
      .aggregate<{ _id: { stage: string; code: string }; count: number; last: Date }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { stage: '$stage', code: '$code' }, count: { $sum: 1 }, last: { $max: '$createdAt' } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
  ])
  return {
    last7Days: grouped.map((g) => ({ stage: g._id.stage, code: g._id.code, count: g.count, last: g.last })),
    latest: latest.map(({ _id, ...rest }) => ({ id: String(_id), ...rest })),
  }
}
