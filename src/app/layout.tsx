import type { Metadata, Viewport } from 'next'
import { DM_Mono, Manrope } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import { CatalogProvider } from '@/components/CatalogProvider'
import { Clarity } from '@/components/Clarity'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { ModalProvider } from '@/components/modals/ModalProvider'
import { SiteSchema } from '@/components/StructuredData'
import { getCatalog } from '@/lib/cms'
import { site } from '@/lib/site'
import './globals.css'
import { cn } from '@/lib/utils'

// Self-hosted at build time: no render-blocking request to fonts.googleapis.com,
// and `display: swap` plus automatic fallback metrics keep CLS at zero.
// Manrope is the brand face — every tracking value in globals.css is tuned to
// its widths, and it carries the 800 weight the headlines and buttons rely on.
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

/* Search-console ownership tags, read from the environment so the tokens are
   set in Vercel rather than committed. Unset means the tag is simply absent —
   DNS verification works just as well and needs none of this. */
const verification: Metadata['verification'] = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  yandex: process.env.YANDEX_VERIFICATION || undefined,
  other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
}

/* Site-wide defaults only. No canonical and no og:url here: anything set at
   the root is inherited by every route that does not override it, which is
   how a 404 or a new page ends up declaring itself to be the home page. Each
   indexable page sets its own through pageMeta (lib/seo). */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: { type: 'website', siteName: site.name, locale: site.locale },
  twitter: { card: 'summary_large_image' },
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  category: 'education',
  keywords: [
    'AI courses India',
    'learn AI tools',
    'Claude course',
    'ChatGPT course',
    'Gemini',
    'n8n automation course',
    'Lovable',
    'AI certification',
    'AI projects for portfolio',
    'AI job board',
    'prompt engineering course',
  ],
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification,
}

export const viewport: Viewport = {
  themeColor: '#14121c',
  width: 'device-width',
  initialScale: 1,
  // Both, now that the site ships a night palette — this is what tells the
  // browser to render form controls, scrollbars and caret to match.
  colorScheme: 'light dark',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog()
  return (
    <html
      lang="en"
      data-palette="claude"
      className={cn(manrope.variable, dmMono.variable)}
      /* The script below rewrites data-palette before React hydrates, so for a
         night reader the DOM says "charcoal" where the server said "claude" and
         React reports a hydration mismatch. The mutation is the point, not a
         bug: the alternatives are shipping no attribute (the patch blocks then
         miss, see below) or writing it after hydration (a white flash first).

         This suppresses ONE level — attributes and text on <html> itself. It
         does not reach the tree inside, so a real mismatch anywhere in the page
         is still reported. */
      suppressHydrationWarning
    >
      {/* data-palette is served on <html> rather than written by the script, so
          the patch blocks in globals.css match from the very first byte — with
          no attribute a palette gets its tokens but not its patches.

          The script only overrides it, and it has to run here in <head>, before
          first paint: a returning night-mode reader would otherwise get a full
          white page for one frame on the way to their theme. Falls back to the
          system preference so a first visit at night opens dark. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=localStorage.getItem('skeo-palette');var p=(s==='charcoal'||s==='claude')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'charcoal':'claude');document.documentElement.dataset.palette=p}catch(e){}",
          }}
        />
        <GoogleAnalytics />
        <Clarity />
      </head>
      <body>
        <a className="skip-link" href="#top">
          Skip to content
        </a>
        <div className="noise" aria-hidden="true" />
        <CatalogProvider catalog={catalog}>
          <ModalProvider>{children}</ModalProvider>
        </CatalogProvider>
        <Analytics />
        <SiteSchema />
      </body>
    </html>
  )
}
