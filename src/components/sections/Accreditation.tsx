import Image, { type StaticImageData } from 'next/image'
import anthropic from '@/assets/accreditation/anthropic.webp'
import googleEducation from '@/assets/accreditation/google-education.webp'
import msme from '@/assets/accreditation/msme.webp'
import startupIndia from '@/assets/accreditation/startup-india.png'

/**
 * The accreditation band directly under the hero — the first thing after the
 * pitch, since it is what makes the rest of the page credible.
 * Logos are static imports so Next reads their real dimensions. They ship
 * trimmed of their whitespace margins, so the per-mark `height` here is the
 * mark itself and the four read as one row despite their different shapes.
 */

const ACCREDITORS: { name: string; logo: StaticImageData; height: number }[] = [
  { name: 'Startup India', logo: startupIndia, height: 24 },
  { name: 'Ministry of MSME, Government of India', logo: msme, height: 46 },
  { name: 'Google for Education', logo: googleEducation, height: 34 },
  { name: 'Anthropic', logo: anthropic, height: 15 },
]

export function Accreditation() {
  return (
    <section className="accred-strip" aria-label="Skillora accreditations">
      <div className="wrap">
        <p>We are accredited by</p>
        <div className="accred-logos">
          {ACCREDITORS.map((item) => (
            <span key={item.name} className="accred-item">
              <Image
                src={item.logo}
                alt={item.name}
                className="accred-logo"
                style={{ height: item.height, width: 'auto' }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
