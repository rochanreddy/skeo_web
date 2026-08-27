'use client'

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { OTP_LENGTH } from '@/lib/otp'

/**
 * Six single-digit boxes behaving the way people expect a code field to:
 * typing walks forward, Backspace on an empty box walks back, arrows move
 * without editing, and pasting the whole code from an SMS fills every box at
 * once instead of dropping five digits into the first one.
 *
 * The value is owned by the parent — this component holds no code of its own.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  invalid = false,
  describedBy,
  id,
}: {
  value: string
  onChange: (next: string) => void
  onComplete?: (code: string) => void
  invalid?: boolean
  describedBy?: string
  id?: string
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('')

  // Autofocus the first box when the step appears, so the code can be typed
  // straight away without reaching for the mouse.
  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  function focusBox(index: number) {
    refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus()
  }

  function write(next: string) {
    const clean = next.replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(clean)
    if (clean.length === OTP_LENGTH) onComplete?.(clean)
    return clean
  }

  function handleInput(index: number, raw: string) {
    // A phone keyboard can hand over several digits at once (autofill); take
    // them all rather than only the first.
    const typed = raw.replace(/\D/g, '')
    if (!typed) return
    const next = (value.slice(0, index) + typed + value.slice(index + typed.length)).slice(0, OTP_LENGTH)
    const written = write(next)
    focusBox(Math.min(index + typed.length, written.length))
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) {
        write(value.slice(0, index) + value.slice(index + 1))
        focusBox(index)
      } else if (index > 0) {
        write(value.slice(0, index - 1) + value.slice(index))
        focusBox(index - 1)
      }
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const written = write(event.clipboardData.getData('text'))
    focusBox(written.length)
  }

  return (
    <div className={`otp-boxes${invalid ? ' invalid' : ''}`} onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          // One shared label would read "digit 1 of 6" six times; the aria-label
          // on each box says which one it is instead.
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          value={digits[i] ?? ''}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      ))}
    </div>
  )
}
