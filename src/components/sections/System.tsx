import { Fragment } from 'react'
import { Reveal } from '@/components/Reveal'
import { moduleFlow, outcomes, pathSteps } from '@/lib/content'

export function System() {
  return (
    <section className="section system" id="how-it-works" aria-labelledby="system-title">
      <div className="wrap">
        <Reveal className="center-heading">
          <span className="eyebrow">THE SKILLORA SYSTEM</span>
          <h2 id="system-title">From module to opportunity.</h2>
          <p>Three simple ideas hold the whole platform together.</p>
        </Reveal>

        <Reveal className="system-block">
          <div className="system-block-head">
            <span className="eyebrow">EVERY MODULE</span>
            <h3>What’s inside a module</h3>
            <p>Every challenge is broken into the same four steps, so you always know what’s next.</p>
          </div>
          <div className="module-flow">
            {moduleFlow.map((step, i) => (
              <Fragment key={step.title}>
                {i > 0 && (
                  <div className="flow-arrow" aria-hidden="true">
                    →
                  </div>
                )}
                <div className="flow-step">
                  <span className="flow-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <b>{step.title}</b>
                  <small>{step.body}</small>
                </div>
              </Fragment>
            ))}
          </div>
        </Reveal>

        <Reveal className="system-block" delay={1}>
          <div className="system-block-head">
            <span className="eyebrow">THE PATH</span>
            <h3>How it works</h3>
            <p>The same five-step path, every time you start something new on Skillora.</p>
          </div>
          <div className="path-flow">
            {pathSteps.map((step, i) => (
              <Fragment key={step.num}>
                {i > 0 && (
                  <div className="flow-arrow" aria-hidden="true">
                    →
                  </div>
                )}
                <div className="path-step">
                  <span className="path-num">{step.num}</span>
                  <b>{step.title}</b>
                  <small>{step.body}</small>
                </div>
              </Fragment>
            ))}
          </div>
        </Reveal>

        <Reveal className="system-block" delay={2}>
          <div className="system-block-head">
            <span className="eyebrow">WHY YOU’RE HERE</span>
            <h3>Learn by outcome</h3>
            <p>Pick the outcome you care about — the modules follow.</p>
          </div>
          <div className="outcome-grid">
            {outcomes.map((outcome) => (
              <div className="outcome-card" key={outcome.title}>
                <span className="outcome-icon" aria-hidden="true">
                  {outcome.icon}
                </span>
                <b>{outcome.title}</b>
                <small>{outcome.body}</small>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
