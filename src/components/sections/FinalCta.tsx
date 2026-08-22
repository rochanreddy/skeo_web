import { AuthButton } from '@/components/ActionButton'

export function FinalCta() {
  return (
    <section className="final-cta wrap" aria-labelledby="final-cta-title">
      <div className="cta-orb" aria-hidden="true" />
      <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
      <h2 id="final-cta-title">
        The people who build
        <br />
        <em>will lead.</em>
      </h2>
      <p>Join thousands of ambitious people building their AI edge, one module at a time.</p>
      <AuthButton mode="signup" className="button light-button">
        Register
      </AuthButton>
      <small>15 minutes a day · Learn on your schedule · Cancel anytime</small>
    </section>
  )
}
