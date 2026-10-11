import { markImage } from '@/lib/og'

/**
 * /favicon.ico — the "S" tile from app/icon.svg, at 16, 32 and 48px in one file.
 *
 * app/icon.svg is what modern browsers use, but /favicon.ico is the address
 * every browser, RSS reader and crawler asks for first whether a page links it
 * or not, and it was answering 404. Drawn by the same code as /logo.png, so the
 * three can never disagree.
 *
 * An .ico is a small directory followed by images; since Windows Vista the
 * images may be PNGs, which is what ImageResponse produces, so no image library
 * is needed to build one.
 */
export const dynamic = 'force-static'

const SIZES = [16, 32, 48]

export async function GET() {
  const pngs = await Promise.all(SIZES.map(async (s) => new Uint8Array(await (await markImage(s)).arrayBuffer())))

  const header = 6
  const entry = 16
  let offset = header + entry * pngs.length
  const ico = new Uint8Array(offset + pngs.reduce((n, p) => n + p.length, 0))
  const view = new DataView(ico.buffer)

  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type: icon
  view.setUint16(4, pngs.length, true)

  pngs.forEach((png, i) => {
    const at = header + entry * i
    view.setUint8(at, SIZES[i]) // width
    view.setUint8(at + 1, SIZES[i]) // height
    view.setUint8(at + 2, 0) // no palette
    view.setUint8(at + 3, 0) // reserved
    view.setUint16(at + 4, 1, true) // colour planes
    view.setUint16(at + 6, 32, true) // bits per pixel
    view.setUint32(at + 8, png.length, true)
    view.setUint32(at + 12, offset, true)
    ico.set(png, offset)
    offset += png.length
  })

  return new Response(ico, {
    headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' },
  })
}
