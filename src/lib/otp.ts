/**
 * Stand-in for the OTP service. There is no SMS or email provider wired up yet,
 * so "sending" is a delay and every code is checked against one fixed demo
 * value — enough to exercise the whole step-2 flow, including the wrong-code
 * and resend paths, without a backend.
 *
 * Replacing this file with real calls is the entire integration: the modal only
 * knows `sendOtp`, `verifyOtp` and `DEMO_OTP`.
 */

export const OTP_LENGTH = 6

/** Shown on screen precisely because nothing is delivered anywhere. */
export const DEMO_OTP = '123456'

/** Seconds before "Resend code" becomes available again. */
export const RESEND_SECONDS = 30

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function sendOtp(_to: { email: string; phone: string }): Promise<void> {
  await wait(700)
}

/* Short on purpose: this delay is pure theatre, and it sits directly between
   the last digit typed and /checkout appearing — the one place in the flow
   where invented latency is felt as the site being slow. */
export async function verifyOtp(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await wait(250)
  if (code.length < OTP_LENGTH) return { ok: false, error: 'Enter all six digits.' }
  if (code !== DEMO_OTP) return { ok: false, error: 'That code is not right. Check and try again.' }
  return { ok: true }
}
