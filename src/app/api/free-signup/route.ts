import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { validateEmail, validateName, validatePhone } from '@/lib/validation'

/**
 * POST /api/free-signup: the free campaign page (lib/landings isFreeCampaign).
 * No payment: the LMS makes the account with full access (item `free`) and
 * emails the login, so the inbox is the only way in and a made-up address gets
 * nothing. One account per email: the LMS order id is derived from the email,
 * so a second sign-up with it replays the first instead of making another.
 *
 * Body: { name, email, phone }. Answers { ok: true } or { ok: false, error }.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// The LMS can be asleep on Render and take 20s or more to wake.
export const maxDuration = 60

/* A light brake on one address hammering the route. Per server instance, so it
   only slows abuse down; the one-account-per-email rule is the real limit. */
const hits = new Map<string, number[]>()
function tooMany(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 5
}

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  if (tooMany(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many sign-ups from here. Please try again in a few minutes.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as { name?: unknown; email?: unknown; phone?: unknown } | null
  const name = String(body?.name ?? '').trim().slice(0, 80)
  const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 120)
  const phone = String(body?.phone ?? '').trim().slice(0, 20)
  const invalid = validateName(name) || validateEmail(email) || validatePhone(phone)
  if (invalid) return NextResponse.json({ ok: false, error: invalid }, { status: 400 })

  const base = (process.env.SKEO_LMS_API_URL || '').replace(/\/+$/, '')
  const secret = process.env.SKEO_PROVISION_SECRET || ''
  if (!base || !secret) {
    console.error('[free-signup] SKEO_LMS_API_URL / SKEO_PROVISION_SECRET are not set.')
    return NextResponse.json({ ok: false, error: 'Sign-up is not available right now. Please try again later.' }, { status: 503 })
  }

  const orderId = `FREE-${createHash('sha256').update(email).digest('hex').slice(0, 12).toUpperCase()}`
  try {
    const res = await fetch(`${base}/api/skeo/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ orderId, email, name, phone, items: ['free'] }),
      signal: AbortSignal.timeout(50_000),
    })
    // 409: the same sign-up is already being processed; it will finish.
    if (res.ok || res.status === 409) return NextResponse.json({ ok: true, email })
    const detail = (await res.json().catch(() => ({}))) as { error?: string }
    console.error(`[free-signup] ${orderId}: LMS ${res.status}: ${detail.error || 'no detail'}`)
  } catch (err) {
    console.error(`[free-signup] ${orderId}: LMS unreachable:`, err)
  }
  return NextResponse.json(
    { ok: false, error: 'We could not set up your account just now. Please try again in a minute.' },
    { status: 502 },
  )
}
