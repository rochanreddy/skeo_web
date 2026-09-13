'use client'

import Image, { type StaticImageData } from 'next/image'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { ChatGptMark, ClaudeMark, GeminiMark, LovableMark, N8nMark } from '@/components/tools/marks'
import anthropic from '@/assets/accreditation/anthropic.webp'
import sarvam from '@/assets/accreditation/sarvam-cut.png'
import msme from '@/assets/accreditation/msme.webp'
import startupIndia from '@/assets/accreditation/startup-india.png'

/* The bodies that stand behind the credential. Every one gets the same box and
 * is scaled to fit inside it — see .cert-accred-logo, where the sizing lives.
 *
 * These are the same four the accreditation strip under the hero carries, so
 * the claim made at the top of the page and the claim printed on the
 * certificate are the same claim. Change one and change the other. */
const CERT_ACCREDITORS: { name: string; logo: StaticImageData; square?: boolean }[] = [
  { name: 'Startup India', logo: startupIndia },
  { name: 'Ministry of MSME, Government of India', logo: msme },
  // Icon only, where the rest are wordmarks — see .cert-accred-logo--square.
  { name: 'Sarvam AI', logo: sarvam, square: true },
  { name: 'Anthropic', logo: anthropic },
]

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
    detail: '12 lessons · 4 projects',
    /* Goes into the credential id, so two certificates never read alike. */
    code: 'CL',
  },
  {
    name: 'ChatGPT',
    Mark: ChatGptMark,
    accent: '#10a37f',
    detail: '10 lessons · 3 projects',
    code: 'GP',
  },
  {
    name: 'Gemini',
    Mark: GeminiMark,
    accent: '#4285f4',
    detail: '9 lessons · 3 projects',
    code: 'GM',
  },
  {
    name: 'n8n',
    Mark: N8nMark,
    accent: '#ea4b71',
    detail: '11 lessons · 4 projects',
    code: 'N8',
  },
  {
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
          {/* The mark on the left, the bodies that stand behind the credential
              on the right — a printed certificate heads itself this way, and it
              puts the accreditation where it is read as a claim rather than as
              a footnote. */}
          <div className="cert-head">
            <span className="cert-brand">
              <b>skeo</b>
            </span>
            <span className="cert-accred-row">
              {CERT_ACCREDITORS.map((body) => (
                <Image
                  key={body.name}
                  src={body.logo}
                  alt={body.name}
                  title={body.name}
                  className={body.square ? 'cert-accred-logo cert-accred-logo--square' : 'cert-accred-logo'}
                />
              ))}
            </span>
          </div>

          <div className="cert-title-row">
            <small>CERTIFICATE OF PROFICIENCY — {tool.name.toUpperCase()}</small>
            {/* Re-keyed so the badge replays its entrance on every change — the
                one part of the card the eye is most likely to be resting on. */}
            <span className="cert-badge" key={tool.name}>
              <Mark className="cert-badge-mark" />
              {tool.name}
            </span>
          </div>

          {/* Grouped so the three lines that name the holder can be centred as
              one block in whatever height is left between the title row and the
              foot — see .cert-body. Without the wrapper they stack against the
              title row and leave the space below them empty, which is what the
              departed signature blocks used to fill. */}
          <div className="cert-body">
            <p className="cert-presented">This certificate is proudly presented to</p>
            <h3>Your Name</h3>

            {/* One citation for every tool, with the name dropped into it —
                the same words a real certificate would carry whichever course
                it was awarded for. Announced on change: the pills are the only
                thing that rewrites it. */}
            <div className="cert-citation" aria-live="polite">
              <p>
                for successfully demonstrating proficiency in <b>{tool.name}</b>, including its core
                features, advanced capabilities, workflows, and practical applications with the ability
                to solve real-world problems and create meaningful outcomes.
              </p>
            </div>
          </div>

          {/* What makes the credential checkable: when it was issued, what it
              took, and the id someone would quote to verify it. The signature
              blocks that sat opposite are gone — unsigned is honest for a
              specimen, where two named roles were a claim about people. */}
          <div className="cert-foot">
            <span className="cert-meta">Issued Jun 2026 · {tool.detail}</span>
            <span className="cert-id">SKEO-{tool.code}-2606-0000</span>
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
