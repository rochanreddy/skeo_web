/**
 * Turn a failure while verifying or paying into what the buyer needs: a message
 * that says what happened and what to do, and whether "Try again" can help —
 * and report it, so the team sees failures before anyone writes in.
 *
 * The same idea as menler's src/lib/friendlyError.js, with skeo's two steps:
 *   'verify'  the SMS / email code before checkout
 *   'order'   asking our server to start a payment
 *   'payment' opening Cashfree's payment page
 */

export type Stage = 'verify' | 'order' | 'payment'
export type Friendly = { message: string; retry: boolean; code: string }

/** An error that knows how it happened: no connection, too slow, or a reply with a status. */
export type ApiError = Error & { kind?: 'network' | 'timeout' | 'http'; status?: number }

export const apiError = (message: string, props: { kind: ApiError['kind']; status?: number }): ApiError =>
  Object.assign(new Error(message), props)

const OTP_HINTS: [RegExp, string, boolean][] = [
  [/cancel|closed|dismiss/i, 'Verification was closed before the code was entered. Tap Try again to get a new code.', true],
  [/invalid|incorrect|wrong|mismatch/i, "That code didn't match. Try again and enter the latest code you received.", true],
  [/expire/i, 'That code has expired. Try again to get a new one.', true],
  [/limit|too many|attempt/i, 'Too many verification attempts. Please wait a few minutes before trying again.', false],
  [/not ready|could not load|load the verification/i, "We couldn't load the verification step. Check your connection and try again.", true],
]

export function friendlyError(err: unknown, stage: Stage): Friendly {
  const e = err as ApiError | undefined
  const raw = String(e?.message ?? '')

  if (e?.kind === 'network' || /failed to fetch|networkerror|load failed/i.test(raw)) {
    return { code: 'network', retry: true, message: "We couldn't connect to skeo. Check your internet connection and try again." }
  }
  if (e?.kind === 'timeout') {
    return { code: 'timeout', retry: true, message: 'Our server is taking longer than usual. Please wait a few seconds and try again.' }
  }
  if (e?.status === 429) {
    return { code: 'rate_limited', retry: false, message: 'Too many attempts in a short time. Please wait a few minutes and try again.' }
  }
  if (e?.status && e.status >= 500) {
    // 503 is our own "payments are not set up" — its wording is already right.
    if (e.status === 503 && raw) return { code: 'server_503', retry: false, message: raw }
    return { code: `server_${e.status}`, retry: true, message: 'Something went wrong on our side. Please try again in a moment.' }
  }
  if (e?.status && e.status >= 400) {
    // Our own messages ("Early Access has ended…", "Enter a valid phone") are
    // already written for the buyer; retrying them unchanged does not help.
    return { code: `client_${e.status}`, retry: false, message: raw || 'Please check your details and try again.' }
  }

  if (stage === 'verify') {
    for (const [re, message, retry] of OTP_HINTS) if (re.test(raw)) return { code: 'otp', retry, message }
    return { code: 'otp', retry: true, message: "We couldn't verify your number. Please try again." }
  }
  if (stage === 'payment') {
    return { code: 'payment_page', retry: true, message: "The payment page didn't open. Nothing was charged — please try again." }
  }
  return { code: 'unknown', retry: true, message: raw || 'Something went wrong. Please try again.' }
}

/** Log a failure for the team. Fire-and-forget: reporting must never cause a second error. */
export function reportError(stage: Stage, err: unknown, f: Friendly = friendlyError(err, stage)) {
  try {
    const e = err as ApiError | undefined
    void fetch('/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        stage,
        code: f.code,
        message: String(e?.message ?? '').slice(0, 300),
        status: e?.status ?? null,
        page: window.location.pathname,
      }),
    }).catch(() => {})
  } catch {
    /* never let logging break the page */
  }
}
