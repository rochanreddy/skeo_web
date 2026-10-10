import { getCliClient } from 'sanity/cli'
import docs from './seed-data.json'

/**
 * `npm run seed` — creates the fixed documents the Studio edits, filled with
 * the values the website runs on today (seed-data.json, exported from
 * src/lib/catalog.ts's defaults).
 *
 * createIfNotExists, so it is safe to run again: a document that already
 * exists is left exactly as the editors have it. To start a document over,
 * delete it in Vision first.
 */
const client = getCliClient({ apiVersion: '2025-02-19' })

const tx = client.transaction()
for (const doc of docs) tx.createIfNotExists(doc as { _id: string; _type: string })
const result = await tx.commit()
console.log(`Seeded: ${result.results.length} document(s) checked, ${result.results.filter((r) => r.operation === 'create').length} created.`)
