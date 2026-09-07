import type { ComponentType } from 'react'
import { ChatGptMark, ClaudeMark, GeminiMark, N8nMark } from '@/components/tools/marks'

export type CertTool = {
  /** Slug used by the print route's ?tool= query. */
  slug: string
  name: string
  Mark: ComponentType<{ className?: string }>
  accent: string
  award: string
  skills: string
  detail: string
}

/* The tools a certificate can vouch for.
 *
 * Picking one rewrites the specimen rather than swapping a single word: each
 * carries its own mark, its own accent — taken from the tool's real brand
 * colour — the credential it awards, and what that credential says was
 * demonstrated. A certificate for n8n should not look like a certificate for
 * Claude with the noun changed.
 *
 * Shared with the print sheets at /certificate/print so the exported PDF can
 * never drift from what the site shows. */
export const CERT_TOOLS: CertTool[] = [
  {
    slug: 'claude',
    name: 'Claude',
    Mark: ClaudeMark,
    accent: '#d97757',
    award: 'Claude Practitioner',
    skills: 'prompt design, research and shipped work',
    detail: '12 lessons · 4 projects',
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    Mark: ChatGptMark,
    accent: '#10a37f',
    award: 'ChatGPT Practitioner',
    skills: 'everyday workflows, custom GPTs and analysis',
    detail: '10 lessons · 3 projects',
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    Mark: GeminiMark,
    accent: '#4285f4',
    award: 'Gemini Practitioner',
    skills: 'multimodal prompting, image and video',
    detail: '9 lessons · 3 projects',
  },
  {
    slug: 'n8n',
    name: 'n8n',
    Mark: N8nMark,
    accent: '#ea4b71',
    award: 'Automation Practitioner',
    skills: 'workflow automation and AI agents',
    detail: '11 lessons · 4 projects',
  },
]

/**
 * Flattens a two-colour srgb mix to a plain hex string.
 *
 * The live card leans on `color-mix()`, which is fine in a browser but arrives
 * in Canva as an unresolved function — imported artwork ends up black. The
 * print sheets call this instead so every colour on the page is a literal the
 * exporter can carry through.
 */
export function mix(from: string, to: string, pct: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  }
  const a = parse(from)
  const b = parse(to)
  const w = pct / 100
  return (
    '#' +
    a
      .map((channel, i) => Math.round(channel * w + b[i] * (1 - w)).toString(16).padStart(2, '0'))
      .join('')
  )
}
