/**
 * Amplifeed OTP — the same verification menler's campaign pages use.
 *
 * Ported from menler's src/lib/amplifeedOtp.js. The shape of the flow is the
 * important part, and it is NOT the shape a hand-rolled OTP has: the provider
 * draws its own code-entry dialog, checks the code itself, and resolves with a
 * short-lived access token. There is no code for this app to compare — so
 * nothing here asks the visitor to type one.
 *
 * widgetId and tokenAuth are PUBLIC client keys and are meant to sit in
 * front-end code. Anything secret stays server-side, which is why the token a
 * verification produces is only worth something to a backend that checks it
 * with Amplifeed — see the note in VerifyModal about what that means here.
 *
 * The awkward parts below (digit spreading, the switch-link rebind) are carried
 * over deliberately. Each one fixes a real defect in the third party's widget
 * and each is written defensively: if their markup moves, the patch simply
 * stops matching and the widget behaves as it shipped.
 */

import { getVerifiedLead, saveVerifiedLead } from './verifiedSession'

export type OtpResult = {
  otp_token: string
  otp_channel: string
  otp_identifier: string
}

type InitOptions = {
  widgetId: string
  tokenAuth: string
  identifier: string
  channel?: string
  success: (data: unknown) => void
  failure: (err: unknown) => void
}

declare global {
  interface Window {
    initSendOTP?: (options: InitOptions) => void
    initSendOtp?: (options: InitOptions) => void
    /* The widget's own handle (otp-provider.js): the live SDK, whose
       getLatestReqId() is set only once a code has really been sent. */
    __AmplifeedOtp?: { closeModal?: () => void; getSdk?: () => { getLatestReqId?: () => string | null } | null }
  }
}

/** A verification failure that knows why: the widget's code, or one of ours. */
export type OtpError = Error & { code?: string }

const otpError = (code: string, message: string): OtpError => Object.assign(new Error(message), { code })

/**
 * Failures that mean the code could not be SENT, as opposed to a wrong code or
 * the visitor closing the dialog: the bot check never passed, Amplifeed refused
 * the send or blocked this network, or the service did not load. Trying again
 * does not get past these, so a paid checkout continues without the code (see
 * VerifyModal); only Cashfree answering PAID unlocks anything.
 */
export const OTP_UNSENDABLE = new Set([
  'SEND_TIMEOUT',
  'SEND_FAILED',
  'CAPTCHA_REQUIRED',
  'NETWORK_ERROR',
  'IP_LOCKED',
  'NOT_READY',
  'LOAD_FAILED',
])

/** How long the code may take to go out (the bot check included) before we give up on it. */
const SEND_TIMEOUT_MS = 30_000

/**
 * The SMS identifier: country code and number, digits only, no "+". A buyer
 * who types their 10-digit Indian mobile (the usual case) gets 91 in front;
 * a leading 0 is a trunk prefix and is dropped. Returns null for a number our
 * SMS cannot reach (the provider only delivers inside India), so the caller
 * can verify by email instead.
 */
export function smsIdentifier(phone: string): string | null {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 10 && /^[6-9]/.test(digits)) digits = `91${digits}`
  return /^91[6-9]\d{9}$/.test(digits) ? digits : null
}

/* ── Local development only: skip the widget ──────────────────────────────
 *
 * Amplifeed's widget needs a Cloudflare Turnstile pass before it will send
 * anything, and that call fails on a dev machine — which makes the whole
 * checkout flow untestable locally even though nothing downstream is broken.
 * With this on, verification resolves at once with a token that is obviously
 * not real, so the rest of the flow can be exercised.
 *
 * It has to be asked for by name in a local .env (gitignored), and it is paired
 * with a NODE_ENV check at every use so a production build cannot reach it. */
const DEV_BYPASS = process.env.NEXT_PUBLIC_OTP_DEV_BYPASS === '1'
const isDev = process.env.NODE_ENV !== 'production'

const devToken = (channel: string, identifier: string): OtpResult => {
  console.warn(`[otp] dev bypass — no ${channel} code sent to ${identifier}. Local only.`)
  // Deliberately unmistakable: if this ever reaches a real record, it was not a
  // verified visitor and the row should be read as a local test.
  return { otp_token: 'DEV-BYPASS-NOT-VERIFIED', otp_channel: channel, otp_identifier: identifier }
}

/* Amplifeed keys start wgt_ / otpta_. A stale value from the retired MSG91
   widget is ignored rather than used, so a leftover env var cannot pin this to
   a widget that no longer exists. */
const envWidget = process.env.NEXT_PUBLIC_AMPLIFEED_WIDGET_ID
const envToken = process.env.NEXT_PUBLIC_AMPLIFEED_TOKEN_AUTH
export const WIDGET_ID =
  envWidget && envWidget.startsWith('wgt_') ? envWidget : 'wgt_wSs5xDXuN29LToxM2F7pGdTM'
export const TOKEN_AUTH =
  envToken && envToken.startsWith('otpta_') ? envToken : 'otpta_1juDK90sM71bSmXNY011--pZzgeMiLvf'

const OTP_HOSTS = ['https://www.amplifeed.tech/embed/otp/v1/otp-provider.js']

const getInit = () =>
  (typeof window !== 'undefined' && (window.initSendOTP || window.initSendOtp)) || null

let loadPromise: Promise<void> | undefined

/** Load otp-provider.js once, trying each host in turn. */
export function loadOtpProvider(): Promise<void> {
  if (getInit()) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise<void>((resolve, reject) => {
    let i = 0
    const tryNext = () => {
      if (i >= OTP_HOSTS.length) {
        // Forget the failed attempt, so the next press loads it afresh.
        loadPromise = undefined
        reject(otpError('LOAD_FAILED', 'Could not load the verification service.'))
        return
      }
      const s = document.createElement('script')
      s.src = OTP_HOSTS[i++]
      s.async = true
      s.onload = () => resolve()
      s.onerror = tryNext
      document.body.appendChild(s)
    }
    tryNext()
  })
  return loadPromise
}

/* The newer widget hands back an object whose `.message` is the token; older
   builds passed the string straight through. Accept both. */
const tokenFrom = (data: unknown): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as { message: unknown }).message)
  }
  return String(data)
}

const CHANNEL_LABELS: Record<string, string> = {
  sms: 'phone number',
  email: 'email',
  whatsapp: 'WhatsApp number',
  voice: 'phone number',
}
const HOST_SELECTOR = '#amplifeed-otp-host'

const otpShadow = (): ShadowRoot | null => {
  const host = typeof document !== 'undefined' && document.querySelector(HOST_SELECTOR)
  return (host && (host as HTMLElement).shadowRoot) || null
}

/* Their closeModal() also clears the countdown, so click their button rather
   than tearing the host out ourselves. */
function closeOtpWidget() {
  try {
    const btn = otpShadow()?.querySelector<HTMLButtonElement>('button.close')
    if (btn) btn.click()
  } catch {
    /* widget already gone */
  }
}

/* Paste and SMS autofill both drop everything after the first digit: their six
   boxes are maxLength=1 and share one handler that slices the value to its
   first character, and autocomplete="one-time-code" sits on box 0 alone — which
   is exactly where the phone puts the whole code. One cause, both symptoms.
   Fixed by listening on the shadow root in the CAPTURE phase, so the event is
   seen before the box handles it, then spreading the digits ourselves. Their
   verify reads the boxes back out of the DOM, so setting values is enough. */
function spreadDigits(root: ShadowRoot, target: EventTarget | null, rawValue: unknown): boolean {
  const boxes = Array.from(root.querySelectorAll<HTMLInputElement>('input.digit'))
  if (!boxes.length) return false
  const digits = String(rawValue || '').replace(/\D/g, '')
  if (digits.length < 2) return false
  const at = boxes.indexOf(target as HTMLInputElement)
  const begin = digits.length >= boxes.length || at < 0 ? 0 : at
  for (let i = 0; begin + i < boxes.length; i++) boxes[begin + i].value = digits[i] || ''
  const lastFilled = Math.min(begin + digits.length, boxes.length) - 1
  const focusTarget = boxes[lastFilled + 1] || boxes[lastFilled]
  if (focusTarget && focusTarget.focus) focusTarget.focus()
  return true
}

function enhanceOtpDigits(): () => void {
  if (typeof MutationObserver === 'undefined') return () => {}
  let root: ShadowRoot | null = null
  const isDigit = (el: EventTarget | null) =>
    el instanceof HTMLElement && el.classList && el.classList.contains('digit')

  const onPaste = (e: Event) => {
    const ev = e as ClipboardEvent
    if (!isDigit(ev.target) || !root) return
    const text = ev.clipboardData ? ev.clipboardData.getData('text') : ''
    if (String(text).replace(/\D/g, '').length < 2) return
    ev.preventDefault()
    ev.stopPropagation()
    spreadDigits(root, ev.target, text)
  }

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement | null
    if (!isDigit(target) || !root || !target) return
    if (String(target.value || '').replace(/\D/g, '').length < 2) return
    e.stopPropagation()
    spreadDigits(root, target, target.value)
  }

  const attach = () => {
    const sh = otpShadow()
    if (!sh || sh === root) return
    root = sh
    sh.addEventListener('paste', onPaste, true)
    sh.addEventListener('input', onInput, true)
    /* maxLength=1 makes the browser truncate a paste or autofill before any
       script sees it. Widen the boxes so the whole code can land; it is put
       back to one digit per box the moment it does. */
    sh.querySelectorAll<HTMLInputElement>('input.digit').forEach((b, _i, all) => {
      b.maxLength = all.length
    })
  }

  const obs = new MutationObserver(attach)
  try {
    obs.observe(document.body, { childList: true, subtree: true })
  } catch {
    /* no body yet */
  }
  attach()
  const poll = window.setInterval(attach, 300)
  return () => {
    window.clearInterval(poll)
    obs.disconnect()
    if (root) {
      root.removeEventListener('paste', onPaste, true)
      root.removeEventListener('input', onInput, true)
    }
  }
}

/* The widget's own "Use <channel> instead" link retries against the SAME
   identifier it opened with — so from SMS it asks the API to email a phone
   number, which answers RESEND_TOO_SOON during the cooldown and fails outright
   after it. The link cannot work as shipped. Rebound here to close and reopen
   against the address the visitor already typed. */
function watchForSwitchLink(channel: string, onSwitch: () => void): () => void {
  if (typeof MutationObserver === 'undefined') return () => {}
  const wanted = `use ${CHANNEL_LABELS[channel] || channel} instead`
  let patched = false
  const tryPatch = () => {
    if (patched) return
    const root = otpShadow()
    if (!root) return
    const link = Array.from(root.querySelectorAll<HTMLButtonElement>('button.link')).find(
      (b) => (b.textContent || '').trim().toLowerCase() === wanted,
    )
    if (!link) return
    patched = true
    // Cloning drops the widget's own listener; ours is the only one left.
    const fresh = link.cloneNode(true) as HTMLButtonElement
    link.replaceWith(fresh)
    fresh.addEventListener('click', (e) => {
      e.preventDefault()
      onSwitch()
    })
  }
  const obs = new MutationObserver(tryPatch)
  try {
    obs.observe(document.body, { childList: true, subtree: true })
  } catch {
    /* no body yet */
  }
  tryPatch()
  const poll = window.setInterval(tryPatch, 300)
  return () => {
    window.clearInterval(poll)
    obs.disconnect()
  }
}

type Switched = { token: string; channel: string; identifier: string }

/*
 * Two defects in the widget, both of which leave a buyer stuck on the code
 * screen, and both patched from outside like the ones above:
 *
 * 1. VERIFY WORKS BEFORE ANY CODE WAS SENT. Given the number up front, the
 *    widget opens straight on the code boxes and sends in the background, and
 *    only once Cloudflare's bot check passes. If that check is slow or never
 *    passes (Instagram's and Facebook's in-app browsers), no code goes out, yet
 *    Verify is live: the buyer types something, presses it, and gets
 *    "reqId is required". Held here: Verify stays disabled until the SDK has a
 *    request id, and if none arrives within SEND_TIMEOUT_MS the dialog is
 *    closed and the failure reported as SEND_TIMEOUT.
 *
 * 2. CLOSING IT IS SILENT. The X, Escape and a tap outside remove the dialog
 *    without calling success or failure, so a promise waiting on it never
 *    settles and the button behind it spins forever. Watched here: the dialog
 *    going away settles it, with the last failure seen or CANCELLED.
 */
function guardWidget(onClosed: () => void, onSendTimeout: () => void): () => void {
  const started = Date.now()
  let seen = false
  let timedOut = false
  let held: HTMLButtonElement | null = null
  const sent = () => Boolean(window.__AmplifeedOtp?.getSdk?.()?.getLatestReqId?.())

  const tick = () => {
    const root = otpShadow()
    if (!root) {
      if (seen) {
        stop()
        onClosed()
      } else if (!timedOut && Date.now() - started > SEND_TIMEOUT_MS) {
        // The dialog never appeared at all.
        timedOut = true
        stop()
        onSendTimeout()
      }
      return
    }
    seen = true
    const verify = Array.from(root.querySelectorAll<HTMLButtonElement>('button.btn')).find(
      (btn) => (btn.textContent || '').trim().toLowerCase() === 'verify',
    )
    if (!sent()) {
      if (verify && !verify.disabled) {
        verify.disabled = true
        held = verify
      }
      if (!timedOut && Date.now() - started > SEND_TIMEOUT_MS) {
        timedOut = true
        onSendTimeout()
      }
    } else if (held) {
      held.disabled = false
      held = null
    }
  }

  const poll = window.setInterval(tick, 250)
  const stop = () => window.clearInterval(poll)
  return stop
}

/** The widget's failure, as an OtpError carrying its code (IP_LOCKED, SEND_FAILED, ...). */
function toOtpError(err: unknown): OtpError {
  const e = err as Record<string, unknown> | string | null
  if (typeof e === 'string') return otpError(e, e)
  const code = String((e && (e.code || e.error || e.type)) || 'ERROR')
  const msg = (e && (e.message || e.msg || e.error || e.code || e.type)) || 'OTP verification failed.'
  return otpError(code, typeof msg === 'string' ? msg : 'OTP verification failed.')
}

/**
 * Open the widget for one identifier on one channel.
 *
 * Settles once: with the token when the code is accepted, or, when the dialog
 * goes away without one, with the last failure it showed (or CANCELLED). A
 * failure while it is still open (a wrong code, a send to retry) does NOT
 * settle it: the widget shows that error itself and the buyer can try again in
 * place. Rejecting there left a buyer who corrected a typo verified in the
 * widget but stuck on our side, because the promise had already failed.
 */
export function sendOtpFull(
  identifier: string,
  channel: string,
  alt?: { channel: string; identifier: string } | null,
): Promise<Switched> {
  return new Promise((resolve, reject) => {
    const init = getInit()
    if (!init) {
      reject(otpError('NOT_READY', 'Verification service is not ready. Please try again.'))
      return
    }
    let settled = false
    let lastError: OtpError | null = null
    let stopSwitch = () => {}
    const stopDigits = enhanceOtpDigits()
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      stopSwitch()
      stopDigits()
      stopGuard()
      fn()
    }
    const stopGuard = guardWidget(
      () => finish(() => reject(lastError ?? otpError('CANCELLED', 'Verification was closed before it finished.'))),
      () => {
        lastError = otpError('SEND_TIMEOUT', 'The verification code could not be sent.')
        // Closing it settles through the guard's close branch; if it never
        // opened, settle here.
        if (otpShadow()) closeOtpWidget()
        else finish(() => reject(lastError))
      },
    )

    init({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      identifier,
      ...(channel ? { channel } : {}),
      success: (data) => finish(() => resolve({ token: tokenFrom(data), channel, identifier })),
      failure: (err) => {
        // Amplifeed's own reason, kept for when the dialog closes.
        console.error('OTP failure:', err)
        lastError = toOtpError(err)
        // Refused before any code went out (blocked network, failed bot
        // check): no point leaving the buyer on a code screen for nothing.
        const sentAlready = Boolean(window.__AmplifeedOtp?.getSdk?.()?.getLatestReqId?.())
        if (!sentAlready && lastError.code && OTP_UNSENDABLE.has(lastError.code)) closeOtpWidget()
      },
    })

    if (alt && alt.identifier) {
      stopSwitch = watchForSwitchLink(alt.channel, () => {
        // Settle this one first, so closing it is not read as a cancel.
        finish(() => {
          closeOtpWidget()
          sendOtpFull(alt.identifier, alt.channel, { channel, identifier }).then(resolve, reject)
        })
      })
    }
  })
}

/** Verify an EMAIL, reusing this tab's token if the same address already did. */
export async function verifyEmailOtp(email: string): Promise<OtpResult> {
  const clean = String(email || '').trim()
  if (isDev && DEV_BYPASS) return devToken('email', clean)
  const prev = getVerifiedLead()
  if (prev?.otp_token && String(prev.email || '').toLowerCase() === clean.toLowerCase()) {
    return {
      otp_token: prev.otp_token,
      otp_channel: prev.otp_channel || 'email',
      otp_identifier: prev.otp_identifier || clean,
    }
  }
  await loadOtpProvider()
  const r = await sendOtpFull(clean, 'email')
  saveVerifiedLead({ email: clean, otp_token: r.token, otp_channel: 'email', otp_identifier: clean })
  return { otp_token: r.token, otp_channel: 'email', otp_identifier: clean }
}

/**
 * Verify a PHONE by SMS. The identifier must be digits only, country code and
 * no "+", per the widget, so +91 99999 99999, or plain 99999 99999, goes in as
 * "919999999999" (smsIdentifier). A number outside India is verified by email
 * instead, since the SMS cannot reach it.
 *
 * `email` makes the widget's "Use email instead" link work: without it that
 * link retries the phone number over email and always fails.
 */
export async function verifySmsOtp(phone: string, opts: { email?: string } = {}): Promise<OtpResult> {
  const clean = String(opts.email || '').trim()
  const digits = smsIdentifier(phone)
  // Outside India the text would never arrive: the same proof by email instead.
  if (!digits && clean) return verifyEmailOtp(clean)
  if (!digits) throw otpError('SEND_FAILED', 'Enter a 10-digit Indian mobile number.')
  if (isDev && DEV_BYPASS) return devToken('sms', digits)
  await loadOtpProvider()
  const r = await sendOtpFull(digits, 'sms', clean ? { channel: 'email', identifier: clean } : null)
  // If they switched mid-flow, the record must say email, not the sms it opened on.
  if (r.channel === 'email') {
    saveVerifiedLead({
      email: r.identifier,
      otp_token: r.token,
      otp_channel: 'email',
      otp_identifier: r.identifier,
    })
    return { otp_token: r.token, otp_channel: 'email', otp_identifier: r.identifier }
  }
  return { otp_token: r.token, otp_channel: 'sms', otp_identifier: digits }
}
