import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/Reveal'
import anthropic from '@/assets/accreditation/anthropic.webp'
import sarvam from '@/assets/accreditation/sarvam-cut.png'
import msme from '@/assets/accreditation/msme.webp'
import startupIndia from '@/assets/accreditation/startup-india.png'

/**
 * The accreditation band directly under the hero — the first thing after the
 * pitch, since it is what makes the rest of the page credible.
 * Logos are static imports so Next reads their real dimensions. They ship
 * trimmed of their whitespace margins, so the per-mark `height` here is the
 * mark itself and the four read as one row despite their different shapes.
 */

const ACCREDITORS: {
  name: string
  logo: StaticImageData
  height: number
  /** Set where the supplied artwork is an icon with no name in it. */
  wordmark?: string
}[] = [
  { name: 'Startup India', logo: startupIndia, height: 24 },
  { name: 'Ministry of MSME, Government of India', logo: msme, height: 46 },
  // The only one shipped as a bare icon, so the name is set beside it rather
  // than left off — a mark nobody can read is not an accreditation. It also
  // drops to a wordmark's height now the text is carrying the name; at 42 it
  // was oversized precisely because it had to say everything on its own.
  { name: 'Sarvam AI', logo: sarvam, height: 27, wordmark: 'Sarvam' },
  { name: 'Anthropic', logo: anthropic, height: 15 },
]

export function Accreditation() {
  return (
    <section className="accred-strip" aria-label="skeo accreditations">
      <Reveal className="wrap">
        <p>We are accredited by</p>
        <div className="accred-logos reveal-stagger">
          {ACCREDITORS.map((item) => (
            <span key={item.name} className="accred-item">
              <Image
                src={item.logo}
                alt={item.wordmark ? '' : item.name}
                className="accred-logo"
                style={{ height: item.height, width: 'auto' }}
              />
              {/* The name in text, where the artwork does not carry it. The
                  image's alt goes empty in that case: the pair would otherwise
                  announce the name twice to a screen reader. */}
              {item.wordmark && <b className="accred-word">{item.wordmark}</b>}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
