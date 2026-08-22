/** Small, dependency-free validators shared by the auth and checkout forms. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required.'
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Mix letters and numbers.'
  return null
}

export function validateName(value: string): string | null {
  if (value.trim().length < 2) return 'Tell us what to call you.'
  return null
}

/** Strength score 0-4, used to drive the signup password meter. */
export function passwordStrength(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  return Math.min(score, 4)
}

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}

/** Luhn checksum — catches typos that a length check alone would let through. */
export function luhn(digits: string): boolean {
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48
    if (d < 0 || d > 9) return false
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return digits.length > 0 && sum % 10 === 0
}

export function validateCardNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Card number is required.'
  if (digits.length < 15) return 'Card number looks too short.'
  if (!luhn(digits)) return 'That card number fails its checksum — check for a typo.'
  return null
}

export function validateExpiry(value: string, now: Date = new Date()): string | null {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim())
  if (!match) return 'Use MM / YY.'
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return 'Month must be between 01 and 12.'
  const expiryEnd = new Date(year, month, 1)
  if (expiryEnd <= now) return 'That card has expired.'
  return null
}

export function validateCvc(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 3) return 'CVC must be 3 or 4 digits.'
  return null
}

/** Detects the network so checkout can show a friendly brand label. */
export function cardBrand(value: string): string | null {
  const d = value.replace(/\D/g, '')
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  if (/^6(?:011|5)/.test(d)) return 'Discover'
  if (/^(60|65|81|82)/.test(d)) return 'RuPay'
  return null
}
