import { Reveal } from '@/components/Reveal'

const proofPoints = ['Verifiable public profile', 'Project-based assessment', 'Unlocks the Job & Freelancing Board']

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
              <i>skillora</i>
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
            Skillora certificates are earned by doing the work — not by watching. Every certificate is a step toward the
            Job &amp; Freelancing Board, not the finish line.
          </p>
          <ul>
            {proofPoints.map((point) => (
              <li key={point}>
                <b aria-hidden="true">✓</b> {point}
              </li>
            ))}
          </ul>
          <a className="text-link" href="/profiles/sample">
            See a sample profile <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
