/**
 * The background question, asked exactly as menler.in asks it.
 *
 * Two levels rather than one flat list: where someone is in their career, with
 * the detail asked only when it applies. A working professional is asked their
 * domain, and anyone who doesn't fit types their own. Both sites store the one
 * resolved string, so a lead reads the same wherever it was captured.
 */

export const BACKGROUND_GROUPS = [
  'Student',
  'Graduate',
  'Working Professional',
  'Founder / Business Owner',
  'Other',
] as const

/** Domains shown once someone says they work. */
export const WORK_DOMAINS = [
  'Analyst',
  'Engineering',
  'Finance',
  "Founder's Office",
  'Human Resources (HR)',
  'Marketing & Sales',
  'Operations',
  'Product Management',
  'Program Management',
  'Strategy & Consulting',
  'Other',
] as const

/** Groups that ask a follow-up, and which kind. */
export const needsDomain = (group: string) => group === 'Working Professional'
export const needsText = (group: string, domain: string) =>
  group === 'Other' || (needsDomain(group) && domain === 'Other')

/**
 * One string for storage — "Working Professional (Finance)" — so every lead
 * describes its background in the same vocabulary.
 */
export function resolveBackground(group: string, domain: string, text: string): string {
  const typed = String(text || '').trim()
  if (!group) return ''
  if (group === 'Other') return typed
  if (!needsDomain(group)) return group
  const detail = domain === 'Other' ? typed : String(domain || '').trim()
  return detail ? `${group} (${detail})` : group
}

/** True once the answer is complete enough to submit. */
export function backgroundComplete(group: string, domain: string, text: string): boolean {
  if (!group) return false
  if (group === 'Other') return Boolean(String(text || '').trim())
  if (!needsDomain(group)) return true
  if (!domain) return false
  return domain !== 'Other' || Boolean(String(text || '').trim())
}
