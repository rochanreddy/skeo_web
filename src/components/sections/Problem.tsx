import { Reveal } from '@/components/Reveal'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { problems } from '@/lib/content'

export function Problem() {
  return (
    <section className="section wrap problem" id="problem" aria-labelledby="problem-title">
      <Reveal className="center-heading">
        <span className="eyebrow">THE PROBLEM</span>
        <h2 id="problem-title">AI isn’t one skill anymore.</h2>
        <p>Most people still don’t know where to start or what’s actually worth learning and free tutorials pile up.</p>
      </Reveal>
      <div className="problem-grid">
        {problems.map((problem, i) => (
          <Reveal key={problem.mark} delay={(i % 3) as 0 | 1 | 2}>
            <SpotlightCard className="problem-card">
              <span className="problem-mark">{problem.mark}</span>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
