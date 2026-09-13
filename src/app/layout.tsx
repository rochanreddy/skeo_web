import type { Metadata, Viewport } from 'next'
import { DM_Mono, Manrope } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import { ModalProvider } from '@/components/modals/ModalProvider'
import { StructuredData } from '@/components/StructuredData'
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'AI skills',
    'AI courses',
    'Claude',
    'ChatGPT',
    'Gemini',
    'n8n',
    'AI certification',
    'AI job board',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: site.twitter,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#14121c',
  width: 'device-width',
  initialScale: 1,
  // Both, now that the site ships a night palette — this is what tells the
  // browser to render form controls, scrollbars and caret to match.
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </head>
      <body>
        <a className="skip-link" href="#top">
          Skip to content
        </a>
        <div className="noise" aria-hidden="true" />
        <ModalProvider>{children}</ModalProvider>
        <Analytics />
        <StructuredData />
      </body>
    </html>
  )
}
