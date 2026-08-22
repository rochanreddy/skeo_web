# Skillora

The Skillora landing page, converted from the single-file `skillora-preview.html`
prototype to a Next.js 15 App Router app (TypeScript, React 19, no runtime deps).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # fully static export of / plus robots.txt and sitemap.xml
npm run typecheck  # tsc --noEmit
npm run lint
```

## Layout

```
src/
  app/
    layout.tsx        Fonts, metadata, viewport, skip link, modal provider
    page.tsx          Section composition — the whole page in one readable list
    globals.css       Tokens → base → one block per section → responsive → motion/print
    robots.ts         /robots.txt
    sitemap.ts        /sitemap.xml
    not-found.tsx     404
  components/
    Nav.tsx           Sticky header, mobile menu, scroll-spy       (client)
    Footer.tsx
    Reveal.tsx        Scroll-reveal wrapper                        (client)
    ActionButton.tsx  Auth / checkout triggers                     (client)
    StructuredData.tsx  JSON-LD (Organization, WebSite, FAQPage, Course)
    modals/           Modal shell + auth + checkout                (client)
    sections/         One component per page section               (server)
  lib/
    site.ts           Site constants and nav links
    content.ts        All marketing copy
    plans.ts          Pricing plans and module rows
    validation.ts     Email, password, card (Luhn), expiry, CVC
```

Every section is a server component. The only client code is the header, the
reveal wrapper, the modal triggers, the modals, and the testimonial carousel —
about 7 kB of the page's JS.

## What changed from the prototype

**Architecture**

- Sections split into components; all copy moved into `lib/content.ts` and
  `lib/plans.ts` so wording and pricing changes never touch JSX.
- Modal state lives in a context (`ModalProvider`) instead of `data-*` attributes
  and global DOM queries, so any section can raise a dialog.
- Plans are typed (`PlanKey`), and the checkout modal renders whichever plan the
  trigger names — including a card-free variant for the Teams enquiry.

**Performance**

- Manrope and DM Mono are self-hosted via `next/font/google`: no render-blocking
  request to `fonts.googleapis.com`, and fallback metrics keep CLS at zero.
- The page prerenders to static HTML at build time.

**Accessibility**

- Skip-to-content link, `:focus-visible` rings, and `aria-labelledby` on every
  section.
- Modals render in a portal with a real focus trap, focus restored to the
  trigger on close, and scroll lock that compensates for the scrollbar so the
  page doesn't shift.
- Modal triggers are `<button>`s, not `<a href="#">` — they no longer jump the
  page to the top before hydration.
- Field-level validation errors are wired up with `aria-invalid` and
  `aria-describedby`, and focus moves to the first invalid field on submit.
- `prefers-reduced-motion` disables reveals, tilts, and smooth scrolling.

**Behaviour**

- The testimonial arrows now work: they page through six quotes with dots, a
  live region, and labelled controls. In the prototype they were inert.
- Header is sticky with a scroll shadow and a scroll-spy that highlights the
  current section.
- The mobile menu closes on Escape and on an outside click, and the hamburger
  animates to an X.
- Card validation runs a Luhn checksum, rejects expired dates, and shows the
  detected network (Visa / Mastercard / Amex / Discover / RuPay).
- Signup passwords get a strength meter and an 8-character + letters-and-digits
  rule; submit buttons show a pending state.
- FAQ entries use `<details name="faq">`, so opening one closes the others.

**Layout scale**

- `.wrap` went from `min(1170px, 100% - 48px)` to `min(1440px, 100% - 96px)`,
  so the page fills the screen instead of stranding ~135px of dead margin
  either side on a 1440px laptop. Gutters are 48px.
- The hero headline scales with it: `clamp(45px, 5.1vw, 78px)`, up from a 72px
  cap. 78px is the ceiling that still holds "Master the AI tools" on one line
  in the 677px column the hero gets at the 1440px wrap.

These two are a matched pair — the headline cap is derived from the wrap width.
Change one and re-check the other, or the headline wraps mid-phrase again.

**Responsive fixes**

- The headline previously capped at 72px while its column stopped growing at
  550px, so above ~1340px "Master the AI tools" broke mid-phrase into three
  lines. Now tuned per band — including the 681–900px tablet range and sub-400px
  phones — and measured single-line from 320px to 2560px.
- Several grids used percentage tracks summing to 100% *plus* a gap
  (`.comparison`, `.credential`, `.faq`), which always overflow by the gap
  width — visible as a horizontal scrollbar once the wrap's side margins
  shrink below the overflow. Converted to `fr`, which subtracts the gap first.
- The trust-strip logos couldn't reflow, overflowing below ~800px. They wrap now.
- Verified zero horizontal overflow at 320 / 360 / 375 / 390 / 430 / 600 / 681 /
  700 / 768 / 820 / 900 / 1024 / 1280 / 1440 / 1920 / 2560px.

**Two prototype bugs fixed**

- The product shot's 3D tilt was destroyed by `.reveal.visible { transform: none }`
  landing on the same element. The tilt now lives on an inner element.
- `.button span` styled the button's own label at 20px/400. A `.btn-label` rule
  restores the label's type and leaves only the trailing arrow oversized.

**SEO**

- Full Metadata API config (canonical, OpenGraph, Twitter, robots), a viewport
  export with `themeColor`, `robots.ts`, `sitemap.ts`, and JSON-LD for
  Organization, WebSite, FAQPage, and each purchasable Course.

## Troubleshooting

**`Cannot read properties of undefined (reading 'call')`** in the dev overlay.
This is webpack's stale-chunk error, not a code fault — it happens when
`next build` or `next start` writes into `.next` while `next dev` is watching the
same directory. Stop the dev server, delete `.next`, and restart:

```bash
rm -rf .next && npm run dev
```

Don't run `npm run build` and `npm run dev` against this folder at the same time.

## Notes

- `skillora-preview.html` is kept at the repo root as the reference original.
- Auth and checkout submit against a simulated delay; wire them to real
  endpoints in `AuthModal.tsx` and `PurchaseModal.tsx` where the `setTimeout`
  stand-ins are.
- `site.url` in `lib/site.ts` drives canonical URLs, the sitemap, and JSON-LD —
  point it at the real domain before deploying.
