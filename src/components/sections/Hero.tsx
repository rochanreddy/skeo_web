import { AuthButton } from '@/components/ActionButton'
import { Reveal } from '@/components/Reveal'

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
          <AuthButton mode="signup">Register</AuthButton>
          <a className="text-link" href="#projects">
            See what you’ll build <span aria-hidden="true">↘</span>
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

      {/* The perspective tilt lives on an inner element: `.reveal.visible` sets
          transform:none, which would otherwise flatten it once revealed. */}
      <Reveal className="product-shot-frame" delay={1}>
        <div className="product-shot" role="img" aria-label="Example Skillora challenge dashboard">
          <div className="window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <small>skillora / dashboard</small>
            <div className="bar-avatar">S</div>
          </div>
          <div className="dashboard" aria-hidden="true">
            <aside>
              <div className="mini-logo">S</div>
              <div className="side-item active">⌂</div>
              <div className="side-item">◈</div>
              <div className="side-item">♧</div>
              <div className="side-item">▱</div>
              <div className="side-bottom">?</div>
            </aside>
            <div className="dash-main">
              <div className="dash-head">
                <div>
                  <span className="overline">YOUR ACTIVE MODULE</span>
                  <h3>28-Day AI Tools Challenge</h3>
                </div>
                <span className="streak">⚡ 9 day streak</span>
              </div>
              <div className="progress-row">
                <span>Week 2 of 4</span>
                <strong>43%</strong>
              </div>
              <div className="progress">
                <i />
              </div>
              <div className="today-card">
                <div className="card-label">
                  TODAY’S BUILD <span>DAY 09</span>
                </div>
                <h4>Automate a research workflow with n8n</h4>
                <p>Turn scattered sources into a brief your team can trust.</p>
                <div className="task">
                  <span className="check">✓</span>
                  <span>Set up your research workspace</span>
                  <small>Done</small>
                </div>
                <div className="task current">
                  <span className="play">▶</span>
                  <span>Build the synthesis workflow</span>
                  <small>42 min</small>
                </div>
                <button type="button" tabIndex={-1}>
                  Continue building <span>→</span>
                </button>
              </div>
            </div>
            <div className="dash-right">
              <div className="xp">
                <span>YOUR XP</span>
                <strong>1,280</strong>
                <small>+150 today</small>
              </div>
              <div className="ring">
                <b>4</b>
                <span>
                  modules
                  <br />
                  shipped
                </span>
              </div>
              <div className="next">
                <span>NEXT MILESTONE</span>
                <p>
                  Unlock the
                  <br />
                  <b>Job Board</b>
                </p>
                <i>↗</i>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="hero-orb orb-one" aria-hidden="true" />
      <div className="hero-orb orb-two" aria-hidden="true" />
    </section>
  )
}
