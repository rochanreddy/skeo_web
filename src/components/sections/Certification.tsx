import { CertificatePicker } from '@/components/CertificatePicker'

const proofPoints = [
  'Verified tool-specific credentials',
  'Earned through practical projects',
  'Build a profile of proven skills',
  'Unlock jobs, freelance work & opportunities',
]

export function Certification() {
  return (
    <section className="section proof-section" id="certification" aria-labelledby="certification-title">
      <div className="wrap credential">
        <CertificatePicker>
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
        </CertificatePicker>
      </div>
    </section>
  )
}
