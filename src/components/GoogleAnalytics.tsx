import Script from 'next/script'
import { GA_ID, gaEnabled } from '@/lib/analytics/ga'

/**
 * Loads Google Analytics 4 on the live site. Renders nothing in development or
 * on a preview deployment — see lib/analytics/ga.ts for which stream and why.
 *
 * Two pieces, on purpose. The inline script is tiny and runs first: it creates
 * the queue and gtag(), so anything the page reports while gtag.js is still
 * downloading is kept. The library itself loads after the page is interactive
 * and never holds up first paint.
 *
 * /admin is left unconfigured — no page views, no events — for the same reason
 * <Analytics /> skips it: the operator's own refreshes are not traffic.
 */
export function GoogleAnalytics() {
  if (!gaEnabled) return null
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;if(location.pathname.indexOf('/admin')!==0){gtag('js',new Date());gtag('config','${GA_ID}')}`,
        }}
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  )
}
