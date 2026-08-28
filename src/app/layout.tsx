import type { Metadata, Viewport } from 'next'
import { DM_Mono, Manrope } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import { ModalProvider } from '@/components/modals/ModalProvider'
import { PaletteSwitcher } from '@/components/PaletteSwitcher'
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
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-palette="claude" className={cn(manrope.variable, dmMono.variable)}>
      {/* Preview scaffolding. data-palette is served on <html> rather than
          written by the script, so the patch blocks in globals.css match from
          the very first byte — with no attribute a palette would get its
          tokens but not its patches. The script only overrides it with a
          stored choice, before first paint, so a reload does not flash the
          default on the way to the chosen one.
          Delete both with the PaletteSwitcher once a palette is picked. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var p=localStorage.getItem('skeo-palette');if(p&&['claude','indigo','violet','oat','graphite','charcoal','original','mono'].indexOf(p)>-1)document.documentElement.dataset.palette=p}catch(e){}",
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
        <PaletteSwitcher />
      </body>
    </html>
  )
}
