import { Reveal } from '@/components/Reveal'
import { ChatGptMark, ClaudeMark, GeminiMark, N8nMark } from '@/components/tools/marks'

const proofPoints = [
  'Verified tool-specific credentials',
  'Earned through practical projects',
  'Build a profile of proven skills',
  'Unlock jobs, freelance work & opportunities',
]

/* The tools a certificate actually vouches for, shown as their own marks. */
const certTools = [
  { name: 'Claude', Mark: ClaudeMark },
  { name: 'ChatGPT', Mark: ChatGptMark },
  { name: 'Gemini', Mark: GeminiMark },
  { name: 'n8n', Mark: N8nMark },
]

export function Certification() {
  return (
    <section className="section proof-section" id="certification" aria-labelledby="certification-title">
      <div className="wrap credential">
        <Reveal className="certificate">
          <div className="cert-glow" aria-hidden="true" />
          <div className="cert-inner">
            <span className="cert-mark" aria-hidden="true">
              S
            </span>
            <small>CERTIFICATE OF COMPLETION</small>
            <h3>
              28-Day AI Tools
              <br />
              Challenge
            </h3>
            <p>
              This certifies that <b>Alex Morgan</b> has demonstrated practical proficiency across 10+ AI tools.
            </p>
            <div>
              <span>Issued Jun 2026</span>
              <i>skeo</i>
            </div>
          </div>
        </Reveal>
        <Reveal className="credential-copy" delay={1}>
          <span className="eyebrow">PROOF, NOT PROMISES</span>
          <h2 id="certification-title">
            Certificates with
            <br />
            real signal.
          </h2>
          <p>
            Build skills across the tools you need, from beginner to advanced.
            <br />
            Put them into practice, earn verified credentials, and
            <br />
            build a profile that shows what you can actually do.
          </p>
          <ul>
            {proofPoints.map((point) => (
              <li key={point}>
                <b aria-hidden="true">✓</b> {point}
              </li>
            ))}
          </ul>
          <ul className="cert-tools">
            {certTools.map(({ name, Mark }) => (
              <li key={name} title={name}>
                <Mark className="cert-tool-mark" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
