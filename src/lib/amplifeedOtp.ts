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
  }
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
        reject(new Error('Could not load the verification service.'))
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

/** Open the widget for one identifier on one channel. */
export function sendOtpFull(
  identifier: string,
  channel: string,
  alt?: { channel: string; identifier: string } | null,
): Promise<Switched> {
  return new Promise((resolve, reject) => {
    const init = getInit()
    if (!init) {
      reject(new Error('Verification service is not ready. Please try again.'))
      return
    }
    let stop = () => {}
    const stopDigits = enhanceOtpDigits()
    const done = <T,>(fn: (v: T) => void) => (v: T) => {
      stop()
      stopDigits()
      fn(v)
    }
    const ok = done(resolve)
    const bad = done(reject)

    init({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      identifier,
      ...(channel ? { channel } : {}),
      success: (data) => ok({ token: tokenFrom(data), channel, identifier }),
      failure: (err) => {
        // Surface Amplifeed's own reason rather than a generic message.
        console.error('OTP failure:', err)
        const e = err as Record<string, unknown> | string | null
        const msg =
          (e &&
            (typeof e === 'string'
              ? e
              : (e.message || e.msg || e.error || e.code || e.type) as string)) ||
          'OTP verification failed.'
        bad(new Error(typeof msg === 'string' ? msg : 'OTP verification failed.'))
      },
    })

    if (alt && alt.identifier) {
      stop = watchForSwitchLink(alt.channel, () => {
        stop()
        closeOtpWidget()
        sendOtpFull(alt.identifier, alt.channel, { channel, identifier }).then(resolve, reject)
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
 * no "+", per the widget — so +91 99999 99999 goes in as "919999999999".
 *
 * `email` makes the widget's "Use email instead" link work: without it that
 * link retries the phone number over email and always fails.
 */
export async function verifySmsOtp(phone: string, opts: { email?: string } = {}): Promise<OtpResult> {
  const digits = String(phone || '').replace(/\D/g, '')
  const clean = String(opts.email || '').trim()
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
