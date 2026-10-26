import Script from 'next/script'
import { META_PIXEL_ID, metaEnabled } from '@/lib/analytics/meta'

/**
 * Loads the Meta Pixel on the live site, once NEXT_PUBLIC_META_PIXEL_ID is set.
 *
 * Same two pieces as <GoogleAnalytics />: a tiny inline script that creates
 * fbq() and its queue first, so an event fired while fbevents.js is still
 * downloading waits instead of being lost, and the library itself after the
 * page is interactive.
 *
 * It does NOT fire a PageView: <Analytics /> reports every page view, first
 * load included, and passes it on (lib/analytics/meta.ts). Firing one here too
 * would count each landing twice. /admin is never initialised.
 */
export function MetaPixel() {
  if (!metaEnabled) return null
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document);if(location.pathname.indexOf('/admin')!==0){fbq('init','${META_PIXEL_ID}')}`,
        }}
      />
      <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />
    </>
  )
}
