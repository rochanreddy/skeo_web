'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { ChatGptMark, ClaudeMark, GeminiMark, N8nMark } from '@/components/tools/marks'

/* The tools a certificate can vouch for.
 *
 * Picking one rewrites the specimen rather than swapping a single word: each
 * carries its own mark, its own accent — taken from the tool's real brand
 * colour — the credential it awards, and what that credential says was
 * demonstrated. A certificate for n8n should not look like a certificate for
 * Claude with the noun changed. */
const CERT_TOOLS = [
  {
    name: 'Claude',
    Mark: ClaudeMark,
    accent: '#d97757',
    award: 'Claude Practitioner',
    skills: 'prompt design, research and shipped work',
    detail: '12 lessons · 4 projects',
  },
  {
    name: 'ChatGPT',
    Mark: ChatGptMark,
    accent: '#10a37f',
    award: 'ChatGPT Practitioner',
    skills: 'everyday workflows, custom GPTs and analysis',
    detail: '10 lessons · 3 projects',
  },
  {
    name: 'Gemini',
    Mark: GeminiMark,
    accent: '#4285f4',
    award: 'Gemini Practitioner',
    skills: 'multimodal prompting, image and video',
    detail: '9 lessons · 3 projects',
  },
  {
    name: 'n8n',
    Mark: N8nMark,
    accent: '#ea4b71',
    award: 'Automation Practitioner',
    skills: 'workflow automation and AI agents',
    detail: '11 lessons · 4 projects',
  },
]

/**
 * The specimen certificate and the tool pills that rewrite it. They sit in
 * opposite columns of the credential grid, so one client component owns both;
 * the surrounding copy arrives as children and stays server-rendered.
 */
export function CertificatePicker({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState(CERT_TOOLS[0])
  const { Mark } = tool

  return (
    <>
      {/* The accent rides a custom property, so the glow, the rule and the seal
          all retint from one value. */}
      <Reveal className="certificate" style={{ '--cert-accent': tool.accent } as CSSProperties}>
        <div className="cert-glow" aria-hidden="true" />
        <div className="cert-inner">
          <div className="cert-head">
            <span className="cert-mark" aria-hidden="true">
              S
            </span>
            {/* Re-keyed so the badge replays its entrance on every change — the
                one part of the card the eye is most likely to be resting on. */}
            <span className="cert-badge" key={tool.name}>
              <Mark className="cert-badge-mark" />
              {tool.name}
            </span>
          </div>

          <small>CERTIFICATE OF PROFICIENCY</small>
          <p className="cert-presented">This certificate is presented to</p>
          <h3>Your Name</h3>

          {/* Announced on change: the pills are the only thing that rewrites it. */}
          <p aria-live="polite">
            for demonstrating practical proficiency as a <b>{tool.award}</b> — {tool.skills}.
          </p>

          <div className="cert-foot">
            <span>Issued Jun 2026 · {tool.detail}</span>
            <i>skeo</i>
          </div>
        </div>
      </Reveal>

      <Reveal className="credential-copy" delay={1}>
        {children}
        <ul className="cert-tools">
          {CERT_TOOLS.map((option) => (
            <li key={option.name}>
              <button
                type="button"
                className="cert-tool"
                style={{ '--cert-accent': option.accent } as CSSProperties}
                aria-pressed={option.name === tool.name}
                onClick={() => setTool(option)}
              >
                <option.Mark className="cert-tool-mark" />
                <span>{option.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  )
}
