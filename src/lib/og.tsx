import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

/**
 * The images skeo hands to other people's screens: the link card a chat app or
 * LinkedIn draws when someone shares a page, the logo search engines put
 * beside the name, the icon a phone saves to its home screen.
 *
 * Drawn here rather than exported from a design tool, so the wording follows
 * the site and nothing needs re-exporting when it changes. Rendered once, at
 * build time.
 *
 * Manrope is read from src/assets/fonts (SIL Open Font License) rather than
 * fetched, so a build never depends on Google Fonts being reachable.
 */

/* The Claude palette from globals.css. */
export const brand = {
  paper: '#fafaf7',
  ink: '#191817',
  ink2: '#4a4741',
  ink3: '#625c53',
  accent: '#bd5a38',
  manilla: '#ebdbbc',
  kraft: '#d4a27f',
} as const

async function fonts() {
  const dir = join(process.cwd(), 'src/assets/fonts')
  const [medium, bold] = await Promise.all([
    readFile(join(dir, 'Manrope-Medium.ttf')),
    readFile(join(dir, 'Manrope-ExtraBold.ttf')),
  ])
  return [
    { name: 'Manrope', data: medium, weight: 500 as const, style: 'normal' as const },
    { name: 'Manrope', data: bold, weight: 800 as const, style: 'normal' as const },
  ]
}

/** The "S" tile from app/icon.svg, at any size. */
function Mark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: brand.ink,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        fontWeight: 800,
        letterSpacing: '-0.02em',
      }}
    >
      S
    </div>
  )
}

/** A square logo or icon: the mark, edge to edge. */
export async function markImage(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Manrope' }}>
        <Mark size={size} />
      </div>
    ),
    { width: size, height: size, fonts: await fonts() },
  )
}

export const cardSize = { width: 1200, height: 630 }

/** The 1200×630 link card. */
export async function cardImage({
  eyebrow,
  title,
  accent,
  lede,
  chips,
}: {
  eyebrow: string
  title: string
  /** The second line of the headline, set in the accent colour as h1 <em> is on the site. */
  accent: string
  lede: string
  chips: readonly string[]
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: brand.paper,
          color: brand.ink,
          fontFamily: 'Manrope',
          borderBottom: `14px solid ${brand.accent}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Mark size={64} />
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em' }}>skeo</div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 22,
              fontWeight: 500,
              color: brand.ink3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.035em' }}>{title}</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.035em', color: brand.accent }}>
            {accent}
          </div>
          <div style={{ marginTop: 26, fontSize: 30, fontWeight: 500, color: brand.ink2, lineHeight: 1.35, maxWidth: 940 }}>
            {lede}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                background: brand.manilla,
                fontSize: 22,
                fontWeight: 800,
                color: brand.ink,
              }}
            >
              {c}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 800, color: brand.ink3 }}>skeoai.com</div>
        </div>
      </div>
    ),
    { ...cardSize, fonts: await fonts() },
  )
}

/** The card most pages share: the home page's promise. */
export const siteCard = () =>
  cardImage({
    eyebrow: 'Learn AI by building',
    title: 'Master the AI tools',
    accent: 'that matter.',
    lede: 'Claude, ChatGPT, Gemini, n8n, Lovable and more — short challenges, real projects, verified certificates.',
    chips: ['Real projects', 'Certificates', 'Job board'],
  })
