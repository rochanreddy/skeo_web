import { AuthButton } from '@/components/ActionButton'
import { Reveal } from '@/components/Reveal'
import { ToolStage } from '@/components/sections/ToolStage'

export function Hero() {
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <Reveal className="hero-copy">
        <div className="eyebrow">
          <span className="live-dot" aria-hidden="true" /> AI skills shouldn’t take months to learn
        </div>
        <h1 id="hero-title">
          Master the AI tools
          <br />
          <em>that matter.</em>
        </h1>
        <p>
          Claude, ChatGPT, Gemini, automation, and more — in one structured system. Learn by doing, build real proof of
          work, and unlock opportunities.
        </p>
        <div className="hero-buttons">
          <AuthButton mode="signup">Start learning</AuthButton>
          <a className="text-link" href="#projects">
            Learn more <span aria-hidden="true">↘</span>
          </a>
        </div>
        <div className="proof">
          <div className="avatars" aria-hidden="true">
            <b>AM</b>
            <b>RS</b>
            <b>NK</b>
            <b>JP</b>
          </div>
          <div>
            <strong>15,000+ builders</strong>
            <span>are already building their AI edge</span>
          </div>
        </div>
      </Reveal>

      {/* The float/tilt transforms live inside ToolStage: `.reveal.visible` sets
          transform:none, which would otherwise flatten them once revealed. */}
      <Reveal className="tool-stage-frame" delay={1}>
        <ToolStage />
      </Reveal>
    </section>
  )
}
