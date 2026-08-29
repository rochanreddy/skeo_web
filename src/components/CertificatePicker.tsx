'use client'

import { useState, type ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { ChatGptMark, ClaudeMark, GeminiMark, N8nMark } from '@/components/tools/marks'

/* The tools a certificate can vouch for. Picking one rewrites the specimen. */
const CERT_TOOLS = [
  { name: 'Claude', Mark: ClaudeMark },
  { name: 'ChatGPT', Mark: ChatGptMark },
  { name: 'Gemini', Mark: GeminiMark },
  { name: 'n8n', Mark: N8nMark },
]

/**
 * The specimen certificate and the tool pills that rewrite it. They sit in
 * opposite columns of the credential grid, so one client component owns both;
 * the surrounding copy arrives as children and stays server-rendered.
 */
export function CertificatePicker({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState(CERT_TOOLS[0])

  return (
    <>
      <Reveal className="certificate">
        <div className="cert-glow" aria-hidden="true" />
        <div className="cert-inner">
          <span className="cert-mark" aria-hidden="true">
            S
          </span>
          <small>CERTIFICATE OF PROFICIENCY</small>
          <p className="cert-presented">This certificate is presented to</p>
          <h3>Alex Morgan</h3>
          {/* Announced on change: the pills are the only thing that rewrites it. */}
          <p aria-live="polite">
            for demonstrating practical proficiency in <b>{tool.name}</b>, from foundational concepts to advanced
            applications, through hands-on learning and real-world projects.
          </p>
          <div>
            <span>Issued Jun 2026</span>
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
