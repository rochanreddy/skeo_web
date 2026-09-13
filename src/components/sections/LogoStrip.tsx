import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/Reveal'
import { LogoRail } from '@/components/sections/LogoRail'
import accenture from '@/assets/employers/accenture.webp'
import anydesk from '@/assets/employers/anydesk-cut.png'
import cognizant from '@/assets/employers/cognizant.webp'
import flipkart from '@/assets/employers/flipkart.webp'
import gushwork from '@/assets/employers/gushwork.webp'
import instawork from '@/assets/employers/instawork.webp'
import mathco from '@/assets/employers/mathco-cut.png'
import mckinsey from '@/assets/employers/mckinsey.webp'
import menler from '@/assets/employers/menler-cut.png'
import menlerNight from '@/assets/employers/menler-night-cut.png'
import microsoft from '@/assets/employers/microsoft.webp'
import mercor from '@/assets/employers/mercor.webp'
import mycaptain from '@/assets/employers/mycaptain-cut.png'
import mygate from '@/assets/employers/mygate.webp'
import nutanix from '@/assets/employers/nutanix-cut.png'
import adobe from '@/assets/employers/adobe.webp'
import pwc from '@/assets/employers/pwc-cut.png'
import razorpay from '@/assets/employers/razorpay.webp'
import ringg from '@/assets/employers/ringg.webp'
import tcs from '@/assets/employers/tcs_new.webp'
import zendesk from '@/assets/employers/Zendesk-cut.png'

/**
 * Where builders end up. Real marks rather than set text, trimmed of their
 * whitespace so the per-logo `height` here is the mark itself — they are drawn
 * at very different scales otherwise.
 *
 * Twenty rather than six: the rail scrolls, so a short list loops visibly
 * and reads as a short list. This is a claim about where people were hired, so
 * it is a list to keep true rather than to lengthen for the look of it — the
 * eight added last come from menler's own HIRING_COMPANIES, which is the same
 * organisation's existing claim rather than a new one.
 *
 * Five of that list were left out because they are dark TILES — a mark with a
 * dark background built into it — which vanish on the night band and cannot be
 * rescued by the ink treatment, since turning the tile white is just a white
 * square: Lyzr, Emergent, Figr, PhysicsWallah, Matters (85% of it is pure
 * black, 1.1:1 against the band). A flat mark on alpha is the opposite case
 * and is fine there, which is why MathCo stays.
 * Four more were left out for resolution — Scaler (48px), Zolve (49px),
 * Cars24 (64px) and Masai (32px) cannot stay crisp at 2x. Autodesk's file is a
 * Windows ICO renamed .png and does not decode at all.
 *
 * The three `-cut` files ship on an opaque white plate in their original form.
 * That plate is invisible on the light band and a white rectangle around the
 * mark on the charcoal one, so it has been knocked out to alpha — colour kept,
 * only the plate removed. Any mark added here wants the same treatment.
 *
 * `ink` marks the ones drawn in near-black with no colour of their own. They
 * are invisible on the night band, so there they are turned white — see
 * .logo-item--ink. A colour mark must NOT be flagged: the same treatment would
 * flatten it to a white silhouette and lose the brand.
 *
 * `night` is the better answer where a brand ships its own dark-ground
 * artwork: the two are swapped by palette, so the mark keeps its real colours
 * on both instead of being filtered into a silhouette on one. Prefer it to
 * `ink` whenever the second file exists.
 */

const EMPLOYERS: {
  name: string
  logo: StaticImageData
  height: number
  ink?: boolean
  night?: StaticImageData
}[] = [
  { name: 'Microsoft', logo: microsoft, height: 30 },
  { name: 'Accenture', logo: accenture, height: 28 },
  { name: 'Razorpay', logo: razorpay, height: 32 },
  { name: 'Flipkart', logo: flipkart, height: 32 },
  { name: 'Adobe', logo: adobe, height: 28 },
  { name: 'Cognizant', logo: cognizant, height: 30 },
  { name: 'TCS', logo: tcs, height: 30 },
  // Trimming turned this from a padded square into a 2:1 wordmark, so it needs
  // less height than it did to sit level with the rest.
  { name: 'PwC', logo: pwc, height: 24, ink: true },
  // A two-line lockup in fine type, where the rest are single bold wordmarks —
  // at a shared height it reads as half their size, so it gets more. Raised
  // again from 34: the type is light enough that the extra height is what
  // makes it legible rather than what makes it loud.
  { name: 'McKinsey & Company', logo: mckinsey, height: 42, ink: true },
  { name: 'Zendesk', logo: zendesk, height: 28, ink: true },
  { name: 'Nutanix', logo: nutanix, height: 28, ink: true },
  // A stacked lockup — mark above wordmark — so like McKinsey it needs more
  // height than a single-line wordmark to carry the same weight.
  // Left in its own colours: the orange hand is 86% of the mark and reads at
  // 7.2:1 on the night band. Only the "BY IMARTICUS" line beneath is dim, and
  // that is 7% of it — not worth flattening the whole lockup to white for.
  { name: 'MyCaptain', logo: mycaptain, height: 38 },
  /* From menler's hiring list. These are app icons rather than wordmarks, so
     the white behind some of them is the icon's own tile and is kept — and
     none is flagged ink, because each already reads in its own colours on both
     bands. Squares take a wordmark's height less a little, the way Microsoft
     and Flipkart already do. */
  { name: 'Ringg AI', logo: ringg, height: 30 },
  { name: 'MyGate', logo: mygate, height: 30 },
  { name: 'Instawork', logo: instawork, height: 30 },
  { name: 'Gushwork', logo: gushwork, height: 30 },
  { name: 'Mercor', logo: mercor, height: 30 },
  // Trimmed to its mark, so it is wider than tall and needs less height.
  { name: 'AnyDesk', logo: anydesk, height: 24 },
  // The one of the eight that is a single flat colour on alpha, like Zendesk
  // and Nutanix — at rgb(45,19,99) it is 1.3:1 on the night band, but because
  // there is no second colour to lose, turning it white costs nothing.
  { name: 'MathCo', logo: mathco, height: 30, ink: true },
  // The navy wordmark is 1.3:1 on the night band, which is no wordmark at all,
  // so the brand's own white artwork stands in there. Both files are the same
  // 996x300, so the swap does not move the row.
  { name: 'menler', logo: menler, height: 26, night: menlerNight },
]

export function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Where skeo builders end up">
      <div className="wrap">
        <Reveal className="logo-strip-row">
          <p>skeo builders go on to teams at</p>
          {/* The marks ride the same rail the quotes do, in the width the label
              leaves. */}
          <LogoRail className="employer-rail" speed={0.35} direction="right">
            {EMPLOYERS.map((item) => (
              <span
                key={item.name}
                className={item.ink ? 'logo-item logo-item--ink' : 'logo-item'}
                title={item.name}
              >
                <Image
                  src={item.logo}
                  alt=""
                  className={item.night ? 'logo-day' : undefined}
                  style={{ height: item.height, width: 'auto' }}
                />
                {/* Both ship; CSS picks. Rendering one or the other from the
                    palette would need the palette during render, and it is not
                    known until after hydration. */}
                {item.night && (
                  <Image
                    src={item.night}
                    alt=""
                    className="logo-night"
                    style={{ height: item.height, width: 'auto' }}
                  />
                )}
              </span>
            ))}
          </LogoRail>
        </Reveal>
      </div>
    </section>
  )
}
