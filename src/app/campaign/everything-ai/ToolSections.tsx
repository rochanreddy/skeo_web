import { getCatalog } from '@/lib/cms'
import { Accreditation } from '@/components/sections/Accreditation'
import { inr, learn as learnCode, pricing as pricingCode } from '@/lib/earlyAccess'
import { toolFaq, type ToolCampaign } from '@/lib/toolCampaigns'
import { BuildIcon } from './BuildIcons'
import { FaqList } from './FaqList'
import { ModuleList } from './ModuleList'
import { PlayOnView } from './PlayOnView'
import { Buy, Certificate, Deco, Head, Mentors, OfferIcon, OfferItem, Ornament, Reviews, TRUST_ICONS } from './Sections'

/**
 * Everything below the hero on a one-tool page — /campaign/<tool> and
 * /campaign/ai-showcase/<tool> — in the order the Everything AI page uses:
 * learn → build → certificate → mentors → reviews → offer → FAQ. Every button
 * buys this tool's course, at the price its plan sets. Render it inside .ea.
 */
export async function ToolSections({ c }: { c: ToolCampaign }) {
  const { plans } = await getCatalog()
  const price = inr(plans[c.plan].amount)
  const course = `${c.name} Course`
  const trust = pricingCode.small
    .split('·')
    .map((x) => x.trim())
    .filter(Boolean)
  return (
    <div className="ea-flow">
      <Accreditation />

      {/* 1. What you'll learn */}
      <section className="ea-sec ea-sec-soft ea-tool-learn" id="learn">
        <Deco kind="marks" />
        <div className="ea-container">
          <Head eyebrow={learnCode.eyebrow} title={c.learn.title} />
          <ModuleList modules={c.learn.modules} />
        </div>
      </section>

      {/* 2. What you'll build — each icon acts out what it is on hover */}
      <section className="ea-sec ea-build-sec ea-build-four" id="build">
        <Deco kind="prompt" />
        <div className="ea-container">
          <Head eyebrow="What you’ll build" title={c.build.title} />
          <ul className="ea-builds">
            {c.build.items.map((b) => (
              <li key={b.title} className={`ea-b-${b.icon}`}>
                <span className="ea-b-icon" aria-hidden="true">
                  <BuildIcon kind={b.icon} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Certificate */}
      <Certificate
        body={c.certificate}
        tool={c.name}
        points={['Verified, tool-specific credential', 'Earned through practical projects', 'Build a profile of proven skills']}
      />

      {/* 4. Mentors */}
      <Mentors />

      {/* 5. Testimonials */}
      <Reviews />

      {/* 6. The offer — one course, one price, no anchor */}
      <section className="ea-sec ea-sec-soft" id="offer">
        <Ornament kind="offer" />
        <div className="ea-container">
          <Head eyebrow="The offer" title={`The ${course}. One price.`} />
          <div className="ea-deal">
            <div className="ea-deal-pass">
              <div className="ea-deal-top">
                <span className="ea-deal-plan">{course}</span>
                <span className="ea-deal-save">One course</span>
              </div>
              <p className="ea-deal-price">
                <strong>{price}</strong>
                <span>
                  <em>one-time</em>
                </span>
              </p>
              <p className="ea-deal-note">Your login arrives by email straight after payment.</p>
              <Buy plan={c.plan} className="button ea-cta ea-deal-cta">
                Get the {course}
              </Buy>
              <ul className="ea-deal-trust">
                {trust.map((x, n) => {
                  const T = TRUST_ICONS[n % TRUST_ICONS.length]
                  return (
                    <li key={x}>
                      <T strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                      {x}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="ea-deal-list">
              <p className="ea-deal-h">What’s included</p>
              <ul>
                {c.offer.items.map((i) => (
                  <li key={i}>
                    <span className="ea-deal-ico">
                      <OfferIcon item={i.replace(/^\d+ Modules$/, 'course')} />
                    </span>
                    <span>
                      <OfferItem item={i} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="ea-sec ea-faq-sec" id="faq">
        <Ornament kind="faq" />
        <div className="ea-container ea-faq-wrap">
          <div className="ea-faq-side">
            <span className="ea-eyebrow">FAQ</span>
            <h2>Quick answers.</h2>
            <p>What people ask before they start the {course}.</p>
            <div className="ea-faq-help">
              <b>Still have a question?</b>
              <span>Write to us and a real person replies within a day.</span>
              <a href="mailto:support@skeoai.com">support@skeoai.com</a>
            </div>
          </div>
          <FaqList items={toolFaq(c)} />
        </div>
      </section>

      <PlayOnView selector=".ea-builds li" />
    </div>
  )
}
