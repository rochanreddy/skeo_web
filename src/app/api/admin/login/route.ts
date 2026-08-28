import { NextResponse } from 'next/server'
import {
  SESSION_COOKIE,
  checkPassword,
  clearAttempts,
  clientIp,
  createSessionToken,
  recordFailure,
  sessionCookieOptions,
  tooManyAttempts,
} from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Wait ten minutes and try again.' },
      { status: 429 },
    )
  }

  let password: unknown
  try {
    const body = (await request.json()) as Record<string, unknown>
    password = body.password
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 })
  }

  if (!checkPassword(password)) {
    recordFailure(ip)
    // One message for both a wrong password and an unknown one — nothing here
    // should help someone work out which half they got right.
    return NextResponse.json({ ok: false, error: 'That password is not right.' }, { status: 401 })
  }

  clearAttempts(ip)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions)
  return response
}
