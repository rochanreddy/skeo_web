import { AuthButton } from '@/components/ActionButton'
import { Reveal } from '@/components/Reveal'
import { jobs } from '@/lib/content'

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
            Certification isn’t the finish line. Every completed module unlocks real job and freelance opportunities to
            apply to — not a guaranteed placement, but a real shot.
          </p>
          <AuthButton mode="signup">Explore the board</AuthButton>
        </Reveal>
        <Reveal as="ul" className="job-preview" delay={1} aria-label="Sample open roles">
          {jobs.map((job) => (
            <li className="job-card" key={job.title}>
              <div>
                <b>{job.title}</b>
                <span>{job.meta}</span>
              </div>
              <i aria-hidden="true">↗</i>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
