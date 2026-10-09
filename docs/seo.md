# SEO, AEO and GEO on skeoai.com

What the site does for search engines (SEO), answer engines such as Google's AI
Overviews (AEO), and generative engines such as ChatGPT, Perplexity, Claude and
Gemini (GEO), where each piece lives, and the steps that cannot be done from
code.

## The one rule

`site.url` in `src/lib/site.ts` is **https://www.skeoai.com**, because that is
where Vercel serves the site: the apex `skeoai.com` 308-redirects to www.
Every canonical, og:url, sitemap entry, robots `Sitemap:` line and structured
data `@id` is built from it. If the primary domain in Vercel is ever switched
to the apex, change this value in the same deploy.

## What is in the code

| Piece | File | Notes |
|---|---|---|
| Per-page title, description, canonical, OG and Twitter card | `src/lib/seo.ts` → `pageMeta()` | Every indexable page goes through it. The root layout deliberately sets no canonical or og:url, so a page that forgets cannot claim to be the home page. |
| Share image (1200×630) | `src/app/opengraph-image.tsx`, drawn in `src/lib/og.tsx` | Rendered at build time in Manrope (`src/assets/fonts`, OFL). |
| Logo for search results | `/logo.png` (`src/app/logo.png/route.tsx`) | 512×512. Referenced by `Organization.logo`. |
| Apple touch icon and manifest | `src/app/apple-icon.tsx`, `src/app/manifest.ts`, `/icon-192.png` | |
| Structured data (JSON-LD) | `src/components/StructuredData.tsx` | Site-wide: `Organization` + `EducationalOrganization` and `WebSite`. Home: `WebPage`, `FAQPage`, `ItemList` of `Course`. `/campaign/everything-ai`: `Course` with the offer and its deadline, plus its own `FAQPage`. `/about`: `AboutPage`. Subpages: `BreadcrumbList`. |
| robots.txt | `src/app/robots.ts` | Answer-engine crawlers named and allowed. `/admin`, `/api`, `/checkout` and `/thank-you` are disallowed. |
| sitemap.xml | `src/app/sitemap.ts` | Add every new indexable page here. |
| llms.txt | `src/app/llms.txt/route.ts` | Plain-prose summary for LLM tools, generated from the same data the pages render. |
| Search-console verification | `src/app/layout.tsx` | Reads `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` and `YANDEX_VERIFICATION` from the environment. |
| IndexNow | `public/349ff793ed6fa8d7f2e1027abab599cc.txt`, `scripts/indexnow.mjs` | `npm run indexnow` after a deploy that changes content, or `npm run indexnow -- /about` for specific pages. |

Rules the structured data follows, which should be kept:

- FAQ markup appears only on the page that shows that FAQ, word for word.
- No figure appears in markup that the page does not show.
- Prices are INR, the currency of record in `lib/plans`.

## Manual steps (cannot be done from code)

1. **Google Search Console.** Add a *Domain* property for `skeoai.com` and verify
   it with the DNS TXT record (this covers www and the apex). Alternatively, use a
   URL-prefix property for `https://www.skeoai.com/`, put the token in Vercel as
   `GOOGLE_SITE_VERIFICATION`, and redeploy. Then submit
   `https://www.skeoai.com/sitemap.xml`, and use URL Inspection → *Request
   indexing* on `/` and `/campaign/everything-ai`.
2. **Bing Webmaster Tools.** Import the site from Search Console (one click), or
   verify with `BING_SITE_VERIFICATION`. Submit the sitemap. Bing's index feeds
   ChatGPT search, Copilot and DuckDuckGo, so this matters for GEO as much as
   for Bing itself. Then run `npm run indexnow`.
3. **Social profiles.** The footer's LinkedIn, Instagram and Facebook icons point
   at the bare platforms, not skeo's profiles. When the real profiles exist, put
   their URLs in `components/Footer.tsx` and in `site.sameAs` (`lib/site.ts`).
   `sameAs` is how search and answer engines tie the brand's accounts to this
   site.
4. **Validate** the live pages once deployed:
   - https://search.google.com/test/rich-results
   - https://validator.schema.org
   - https://www.opengraph.xyz (share card preview)
5. **Google Business Profile**, only if skeo has a registered address it is willing
   to publish. It is not required for an online-only business.

## Off-site GEO (where answer engines learn about a brand)

Answer engines quote what other sites say about a brand more than what the brand
says about itself. Over time, these have the most effect:

- A LinkedIn company page and a consistent one-line description everywhere:
  "skeo teaches Claude, ChatGPT and other AI tools through short challenges that
  end in real projects and a verified certificate."
- Listings on course directories and review sites (Class Central, G2, Trustpilot),
  and on Product Hunt.
- Answers on Reddit and Quora threads asking where to learn Claude or AI tools
  in India, written by a named person who discloses the affiliation.
- Learners sharing their certificates publicly. Each one links back to the site.

## Before adding a page

- Export `metadata = pageMeta({ path, title, description })`. Keep the title under
  about 60 characters and the description under about 155.
- Add the page to `sitemap.ts`, and to `llms.txt` if it describes the product.
- Give it one `<h1>`, real text rather than text inside a modal or image, and a
  `BreadcrumbSchema`.
