import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CATALOG_TAG } from '@/lib/cms'

/**
 * POST /api/revalidate — called by a Sanity webhook whenever a price, a plan or
 * the campaign is published, so the change is on the site in seconds instead
 * of after the minute every page would otherwise wait (lib/cms).
 *
 * Guarded by a shared secret: SANITY_REVALIDATE_SECRET here, and the same value
 * in the webhook's "Secret" header on sanity.io/manage. Without it set, the
 * route refuses everything — the pages still update on their own within a
 * minute, so nothing depends on this being reachable.
 */

export const runtime = 'nodejs'

function same(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  const given = request.headers.get('x-skeo-revalidate-secret') ?? ''
  if (!secret || secret.length < 16 || !same(given, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  revalidateTag(CATALOG_TAG)
  return NextResponse.json({ ok: true, revalidated: CATALOG_TAG, at: new Date().toISOString() })
}
