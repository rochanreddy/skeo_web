import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/Reveal'
import { SwipeRail } from '@/components/SwipeRail'
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

/**
 * Three passes of the list, the way LogoRail builds its track: one on screen,
 * one entering, one leaving, so the phone rail loops with no seam. Passes 1 and
 * 2 are `display: none` above 680px, where the strip is still the four-column
 * grid it has always been — the desktop DOM order, and so the stagger delays on
 * .reveal-stagger's first four children, are untouched by their presence.
 */
const RAIL_PASSES = [0, 1, 2]

export function Accreditation() {
  return (
    <section className="accred-strip" aria-label="skeo accreditations">
      <Reveal className="wrap">
        <p>We are accredited by</p>
        {/* Nothing but a plain block above 680px. Below it, the window the
            marks travel through — see .accred-rail in globals.css. SwipeRail
            attaches the drag engine within that same query and leaves the
            element alone outside it. */}
        <SwipeRail className="accred-rail" query="(max-width: 680px)" speed={0.43} direction="right">
          <div className="accred-logos reveal-stagger">
            {RAIL_PASSES.map((pass) =>
              ACCREDITORS.map((item) => (
                <span
                  key={`${pass}-${item.name}`}
                  className={pass === 0 ? 'accred-item' : 'accred-item accred-item--pass'}
                  /* The repeats are the same four marks over again; a screen
                     reader should hear the list once. */
                  aria-hidden={pass > 0 || undefined}
                >
                  <Image
                    src={item.logo}
                    alt={pass === 0 && !item.wordmark ? item.name : ''}
                    className="accred-logo"
                    style={{ height: item.height, width: 'auto' }}
                  />
                  {/* The name in text, where the artwork does not carry it. The
                      image's alt goes empty in that case: the pair would otherwise
                      announce the name twice to a screen reader. */}
                  {item.wordmark && <b className="accred-word">{item.wordmark}</b>}
                </span>
              )),
            )}
          </div>
        </SwipeRail>
      </Reveal>
    </section>
  )
}
