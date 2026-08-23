'use client'

import { useState } from 'react'
import {
  BACKGROUND_GROUPS,
  WORK_DOMAINS,
  backgroundComplete,
  needsDomain,
  needsText,
  resolveBackground,
} from '@/lib/backgrounds'

/**
 * The background question, owning its own two or three inputs and handing the
 * parent a single resolved string. `onChange` receives '' until the answer is
 * complete, so a half-filled follow-up can't be submitted as a bare
 * "Working Professional".
 */
export function BackgroundField({
  id,
  onChange,
  label = 'Select…',
  invalid = false,
  describedBy,
}: {
  id?: string
  onChange: (value: string) => void
  label?: string
  invalid?: boolean
  describedBy?: string
}) {
  const [group, setGroup] = useState('')
  const [domain, setDomain] = useState('')
  const [text, setText] = useState('')

  // Only a complete answer is reported — otherwise someone who abandoned the
  // follow-up would be filed under a group nobody finished choosing.
  const push = (g: string, d: string, t: string) =>
    onChange(backgroundComplete(g, d, t) ? resolveBackground(g, d, t) : '')

  function pickGroup(g: string) {
    setGroup(g)
    setDomain('')
    setText('')
    push(g, '', '')
  }

  function pickDomain(d: string) {
    setDomain(d)
    // Keep whatever was typed only while it is still being asked for.
    const t = d === 'Other' ? text : ''
    setText(t)
    push(group, d, t)
  }

  function typeText(t: string) {
    setText(t)
    push(group, domain, t)
  }

  return (
    <>
      <select
        id={id}
        value={group}
        onChange={(e) => pickGroup(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      >
        <option value="" disabled hidden>
          {label}
        </option>
        {BACKGROUND_GROUPS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {needsDomain(group) && (
        <select
          className="bg-followup"
          value={domain}
          onChange={(e) => pickDomain(e.target.value)}
          aria-label="Your domain"
        >
          <option value="" disabled hidden>
            Which domain?
          </option>
          {WORK_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      )}

      {needsText(group, domain) && (
        <input
          className="bg-followup"
          type="text"
          value={text}
          onChange={(e) => typeText(e.target.value)}
          placeholder={group === 'Other' ? 'Tell us your background' : 'Type your domain'}
          aria-label="Your background"
          maxLength={80}
        />
      )}
    </>
  )
}
