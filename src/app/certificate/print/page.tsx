import type { Metadata } from 'next'
import { CERT_TOOLS, mix, type CertTool } from '@/lib/cert-tools'

export const metadata: Metadata = {
  title: 'Certificate print sheets',
  robots: { index: false, follow: false },
}

/* One 1920x1200 landscape sheet per tool.
 *
 * This is the export surface, not a second design: it reuses CERT_TOOLS so the
 * copy can never drift from the live card, but it deliberately breaks three
 * habits of the on-page version.
 *
 *  - Every colour is a literal. The card mixes its accent with `color-mix()`,
 *    which Canva and most PDF importers hand back unresolved, so the artwork
 *    lands black. `mix()` flattens the same maths at render time.
 *  - The glow is a radial gradient, not `filter: blur(70px)`. A blur filter
 *    forces the whole panel to rasterise on the way into a PDF, which costs
 *    the text its selectability — the thing that keeps it editable in Canva.
 *  - Nothing is fluid. A fixed pixel box is what makes `@page` produce an
 *    exact-size sheet rather than a letterbox.
 *
 * Print with background graphics on, margins none. `?tool=claude` narrows it
 * to a single sheet; bare, it prints all four as a four-page PDF.
 */

const SHEET_W = 1920
const SHEET_H = 1200

function Sheet({ tool }: { tool: CertTool }) {
  const { Mark } = tool
  const frameLine = mix(tool.accent, '#e6dcff', 55)
  const badgeLine = mix(tool.accent, '#241d39', 60)
  const badgeFill = mix(tool.accent, '#2e2548', 18)
  const awardInk = mix(tool.accent, '#ffffff', 45)
  const sealRing = mix(tool.accent, '#241d39', 30)

  return (
    <section className="sheet" style={{ width: SHEET_W, height: SHEET_H }}>
      {/* Sits behind the frame and bleeds off the corner, the way the blurred
          orb does on the site — a gradient just survives the trip to PDF. */}
      <div
        className="sheet-glow"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${tool.accent} 0%, ${mix(
            tool.accent,
            '#241d39',
            55,
          )} 38%, rgba(36,29,57,0) 72%)`,
        }}
      />

      <div className="sheet-frame" style={{ borderColor: frameLine }}>
        <header className="sheet-head">
          <span className="sheet-seal" style={{ boxShadow: `0 0 0 9px ${sealRing}` }}>
            S
          </span>
          <span className="sheet-badge" style={{ borderColor: badgeLine, background: badgeFill }}>
            <Mark className="sheet-badge-mark" />
            {tool.name}
          </span>
        </header>

        <p className="sheet-kicker">CERTIFICATE OF PROFICIENCY</p>
        <p className="sheet-presented">This certificate is presented to</p>
        <h1 className="sheet-name">Your Name</h1>

        <p className="sheet-body">
          for demonstrating practical proficiency as a{' '}
          <b style={{ color: awardInk }}>{tool.award}</b> — {tool.skills}.
        </p>

        <footer className="sheet-foot">
          <span>Issued Jun 2026 · {tool.detail}</span>
          <i>skeo</i>
        </footer>
      </div>
    </section>
  )
}

export default async function CertificatePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>
}) {
  const { tool: wanted } = await searchParams
  const sheets = wanted ? CERT_TOOLS.filter((t) => t.slug === wanted) : CERT_TOOLS

  return (
    <main className="sheet-stack">
      <style>{SHEET_CSS}</style>
      {(sheets.length ? sheets : CERT_TOOLS).map((tool) => (
        <Sheet key={tool.slug} tool={tool} />
      ))}
    </main>
  )
}

/* Scoped to the route rather than added to globals.css: none of it belongs to
   the site, and the palette patches must not reach in here. */
const SHEET_CSS = `
.noise, .skip-link, .palette-switcher { display: none !important; }
body { background: #6b6580; }

.sheet-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px 0;
}

.sheet {
  position: relative;
  overflow: hidden;
  flex: none;
  background: #241d39;
  color: #fff;
  font-family: var(--font);
}

.sheet-glow {
  position: absolute;
  width: 1150px;
  height: 1150px;
  right: -260px;
  top: -520px;
  border-radius: 50%;
}

.sheet-frame {
  position: absolute;
  inset: 72px;
  border: 2px solid;
  background: rgba(46, 37, 72, 0.7);
  padding: 76px 88px;
  display: flex;
  flex-direction: column;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-seal {
  font: 500 52px var(--mono);
  width: 96px;
  height: 96px;
  line-height: 96px;
  text-align: center;
  border-radius: 26px;
  background: #c8baff;
  color: #352758;
  flex: none;
}

.sheet-badge {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 14px 30px 14px 24px;
  border: 2px solid;
  border-radius: 999px;
  font: 700 26px var(--font);
  color: #fff;
}

.sheet-badge-mark { width: 34px; height: 34px; flex: none; }

.sheet-kicker {
  font: 500 20px var(--mono);
  letter-spacing: 3.4px;
  color: #bfb4dc;
  margin-top: 108px;
}

.sheet-presented {
  font-size: 30px;
  color: #d0c7e7;
  margin-top: 40px;
}

.sheet-name {
  font-size: 128px;
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -6px;
  margin: 18px 0 44px;
}

.sheet-body {
  font-size: 30px;
  line-height: 1.62;
  color: #d0c7e7;
  max-width: 940px;
}

.sheet-body b { font-weight: 700; }

/* Pinned to the frame so the rule lands in the same place whatever the body
   copy runs to — the four sheets have to stack identically in a deck. */
.sheet-foot {
  margin-top: auto;
  border-top: 2px solid #746898;
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: #c4bbdc;
  font: 24px var(--mono);
}

.sheet-foot i { font: 700 34px var(--font); color: #fff; font-style: normal; }

@page { size: ${SHEET_W}px ${SHEET_H}px; margin: 0; }

@media print {
  body { background: #fff; }
  .sheet-stack { display: block; gap: 0; padding: 0; }
  .sheet { break-after: page; }
  .sheet:last-child { break-after: auto; }
}
`
