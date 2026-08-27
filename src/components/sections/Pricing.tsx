import { PurchaseButton } from '@/components/ActionButton'
import { ModuleCart } from '@/components/ModuleCart'
import { Reveal } from '@/components/Reveal'
import { PLANS } from '@/lib/plans'

export function Pricing() {
  const allAccess = PLANS.member

  return (
    <section className="section pricing" id="pricing" aria-labelledby="pricing-title">
      <div className="wrap">
        <Reveal className="center-heading">
          <span className="eyebrow">SIMPLE PRICING</span>
          <h2 id="pricing-title">
            Individual Tool.
            <br />
            Or all at once.
          </h2>
          <p>Pick the AI tools you need, learn from beginner to advanced <br/> and unlock opportunities along the way.</p>
        </Reveal>

        <div className="pricing-two">
          <Reveal as="article" className="modules-card">
            <span className="plan">INDIVIDUAL MODULES</span>
            <h3>Pay once, own the module</h3>
            <p>Choose any tool, learn it end-to-end, build projects, earn your certification,<br/> and unlock opportunities</p>
            <ModuleCart />
          </Reveal>

          <Reveal as="article" className="price-card pro allaccess-card" delay={1}>
            <span className="popular">MOST POPULAR</span>
            <span className="plan">{allAccess.eyebrow}</span>
            <h3>{allAccess.title}</h3>
            <div className="price">
              {allAccess.price} <small>{allAccess.period}</small>
            </div>
            <p>Every module, every tool, one membership.</p>
            <ul>
              {allAccess.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <PurchaseButton plan="member">Start 7-day free trial</PurchaseButton>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
