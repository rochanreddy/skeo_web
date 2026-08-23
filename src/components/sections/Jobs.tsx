import { AuthButton } from '@/components/ActionButton'
import { Reveal } from '@/components/Reveal'
import { JobBoard } from '@/components/sections/JobBoard'
import { opportunities } from '@/lib/content'

export function Jobs() {
  return (
    <section className="section jobs" id="jobs" aria-labelledby="jobs-title">
      <div className="wrap jobs-layout">
        <Reveal className="jobs-copy">
          <span className="eyebrow">YOUR NEXT STEP</span>
          <h2 id="jobs-title">
            Access to the
            <br />
            Job &amp; Freelancing Board.
          </h2>
          <p>
            Certification is just the beginning.
            <br />
            Apply skills to work through real opportunities
            <br />
            to earn, gain experience, and build your career.
          </p>
          <ul className="opportunity-list" aria-label="What the board opens up">
            {opportunities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <AuthButton mode="signup">Explore the board</AuthButton>
        </Reveal>
        <Reveal delay={1}>
          <JobBoard />
        </Reveal>
      </div>
    </section>
  )
}
