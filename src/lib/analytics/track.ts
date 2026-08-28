'use client'

import { randomId, type EventProps, type EventType } from './events'

/**
 * How the site reports what happened. One function, called from the component
 * that owns the moment.
 *
 * Two ids travel with every event. The visitor id lives in localStorage and
 * makes "unique visitors" mean something across days; the session id lives in
 * sessionStorage and dies with the tab. Both are random — they identify a
 * browser, not a person, and nothing links them to a name until someone
 * volunteers one by buying or registering.
 */

const VISITOR_KEY = 'skeo.vid'
const SESSION_KEY = 'skeo.sid'

/** Storage is unavailable in private mode and behind some blockers. */
function stored(store: 'local' | 'session', key: string): string {
  try {
    const box = store === 'local' ? window.localStorage : window.sessionStorage
    const existing = box.getItem(key)
    if (existing) return existing
    const fresh = randomId()
    box.setItem(key, fresh)
    return fresh
  } catch {
    // Nothing persists, so this visit counts as its own visitor. Better than
    // dropping the event and under-reporting traffic outright.
    return randomId()
  }
}

export const visitorId = () => stored('local', VISITOR_KEY)
export const sessionId = () => stored('session', SESSION_KEY)

/**
 * Fire and forget: tracking must never block a click or surface an error to
 * someone buying a tool. `keepalive` lets the request outlive the page when
 * the event is the last thing before a navigation.
 */
export function track(type: EventType, props?: EventProps): void {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({
    type,
    visitorId: visitorId(),
    sessionId: sessionId(),
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    props,
  })

  try {
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // An ad blocker, an offline tab: the page carries on regardless.
  }
}
