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
    <section className="logo-strip" aria-label="Where Skeo builders end up">
      <Reveal>
        <p>Skeo builders go on to teams at</p>
        <LogoRail>
          {EMPLOYERS.map((item) => (
            <span key={item.name} className="logo-item" title={item.name}>
              <Image src={item.logo} alt="" style={{ height: item.height, width: 'auto' }} />
            </span>
          ))}
        </LogoRail>
      </Reveal>
    </section>
  )
}
