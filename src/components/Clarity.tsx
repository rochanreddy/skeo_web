/**
 * Microsoft Clarity — heatmaps and session recordings, for seeing where a
 * visitor hesitates on the way to paying, which neither GA nor the admin
 * dashboard can show.
 *
 * Same rules as <GoogleAnalytics />: the live site only, never `npm run dev` or
 * a Vercel preview, and never /admin. NEXT_PUBLIC_CLARITY_ID overrides the
 * project below; set it to an empty string to switch Clarity off.
 *
 * Clarity always masks what is typed into a form. What the checkout and the
 * thank-you page *display* — the buyer's name, email and phone — is masked as
 * well, with data-clarity-mask on those elements, so a recording never carries
 * someone's contact details.
 */

/** skeo's Clarity project (www.skeoai.com). Public: it is in every page's HTML. */
const DEFAULT_CLARITY_ID = 'yt28b81v1h'

const live = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview'

const CLARITY_ID = (process.env.NEXT_PUBLIC_CLARITY_ID ?? (live ? DEFAULT_CLARITY_ID : '')).trim()

export function Clarity() {
  // A project id is short and alphanumeric; anything else is treated as unset.
  if (!/^[a-z0-9]{6,20}$/i.test(CLARITY_ID)) return null
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `if(location.pathname.indexOf('/admin')!==0){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}")}`,
      }}
    />
  )
}
