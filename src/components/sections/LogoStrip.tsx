import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/Reveal'
import { LogoRail } from '@/components/sections/LogoRail'
import accenture from '@/assets/employers/accenture.webp'
import cognizant from '@/assets/employers/cognizant.webp'
import flipkart from '@/assets/employers/flipkart.webp'
import microsoft from '@/assets/employers/microsoft.webp'
import adobe from '@/assets/employers/adobe.webp'
import razorpay from '@/assets/employers/razorpay.webp'

/**
 * Where builders end up. Real marks rather than set text, trimmed of their
 * whitespace so the per-logo `height` here is the mark itself — the six are
 * drawn at very different scales otherwise.
 */

const EMPLOYERS: { name: string; logo: StaticImageData; height: number }[] = [
  { name: 'Microsoft', logo: microsoft, height: 30 },
  { name: 'Accenture', logo: accenture, height: 28 },
  { name: 'Razorpay', logo: razorpay, height: 32 },
  { name: 'Flipkart', logo: flipkart, height: 32 },
  { name: 'Adobe', logo: adobe, height: 28 },
  { name: 'Cognizant', logo: cognizant, height: 30 },
]

export function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Where skeo builders end up">
      <div className="wrap">
        <Reveal className="logo-strip-row">
          <p>skeo builders go on to teams at</p>
          {/* Points the label at the marks — decorative, so it stays out of the
              accessibility tree and the sentence reads straight through. */}
          <span className="logo-strip-cue" aria-hidden="true">
            <svg className="logo-strip-arrow" viewBox="0 0 24 24" focusable="false">
              {/* Drawn to the edges of the viewBox — the glyph is the box, so the
                  rendered size is the size it actually reads at. */}
              <path
                d="M3 2 11 12 3 22M12.5 2 20.5 12l-8 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {/* The marks ride the same rail the quotes do, in the width the label
              and the arrow leave. */}
          <LogoRail className="employer-rail" speed={0.35}>
            {EMPLOYERS.map((item) => (
              <span key={item.name} className="logo-item" title={item.name}>
                <Image src={item.logo} alt="" style={{ height: item.height, width: 'auto' }} />
              </span>
            ))}
          </LogoRail>
        </Reveal>
      </div>
    </section>
  )
}
