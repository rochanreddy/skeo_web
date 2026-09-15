import type { ComponentType } from 'react'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'

export type CertTool = {
  /** Slug used by the print route's ?tool= query. */
  slug: string
  name: string
  Mark: ComponentType<{ className?: string }>
  accent: string
  detail: string
  /** Goes into the credential id, so two certificates never read alike. */
  code: string
}

/* The tools a certificate can vouch for.
 *
 * Picking one rewrites the specimen rather than swapping a single word: each
 * carries its own mark, its own accent — taken from the tool's real brand
 * colour — how much work it took, and the code that goes into its credential
 * id. A certificate for n8n should not look like a certificate for Claude with
 * the noun changed.
 *
 * Shared with the print sheets at /certificate/print so the exported PDF can
 * never drift from what the site shows. */
export const CERT_TOOLS: CertTool[] = [
  {
    slug: 'claude',
    name: 'Claude',
    Mark: ClaudeMark,
    accent: '#d97757',
    detail: '12 lessons · 4 projects',
    code: 'CL',
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    Mark: ChatGptMark,
    accent: '#10a37f',
    detail: '10 lessons · 3 projects',
    code: 'GP',
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    Mark: GeminiMark,
    accent: '#4285f4',
    detail: '9 lessons · 3 projects',
    code: 'GM',
  },
  {
    slug: 'n8n',
    name: 'n8n',
    Mark: N8nMark,
    accent: '#ea4b71',
    detail: '11 lessons · 4 projects',
    code: 'N8',
  },
  {
    slug: 'lovable',
    name: 'Lovable',
    Mark: LovableMark,
    // The mark is a three-stop gradient; this is its middle stop, which is the
    // colour the logo actually reads as at pill size.
    accent: '#ff7eb0',
    detail: '10 lessons · 4 projects',
    code: 'LV',
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
