/**
 * Remembers that this visitor proved an identifier for the current browser
 * tab, so a second gated step does not ask for a code again — "verify once".
 *
 * sessionStorage, so it clears when the tab closes. Ported from menler, which
 * runs the same rule across its campaign forms.
 */

const KEY = 'skeo_verified_lead'

export type VerifiedLead = {
  email?: string
  otp_token?: string
  otp_channel?: string
  otp_identifier?: string
}

export function getVerifiedLead(): VerifiedLead | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as VerifiedLead) : null
  } catch {
    return null
  }
}

export function saveVerifiedLead(data: VerifiedLead) {
  try {
    const prev = getVerifiedLead() || {}
    sessionStorage.setItem(KEY, JSON.stringify({ ...prev, ...data }))
  } catch {
    /* storage unavailable — verification just will not be remembered */
  }
}
