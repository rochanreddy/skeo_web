# Sanity — editing prices and the campaign

skeo's prices, plan names and the Everything AI campaign copy can be edited in
Sanity Studio (**https://skeo.sanity.studio**) without a code change or deploy.

## What can be edited

| In the Studio | Shows up on |
|---|---|
| **Pricing & courses → each plan**: name, label, price, what's included, one-line description | Home page pricing card, cart, checkout, thank-you page, Google markup, llms.txt |
| **Pricing & courses → Coming soon row**: heading and line | The last row of the tool list |
| **Campaign — Everything AI**: end date, original (struck-through) price, terms, top bar, hero, offer box, FAQ | /campaign/everything-ai and /campaign/ai-showcase |

The Early Access **price** is the "Everything AI — Early Access" plan, not a
campaign field — it is the number checkout charges, so it exists once.

**Not editable here, on purpose:** adding or removing a course, the logos, and
what the LMS unlocks. Those need code (`src/lib/plans.ts`), because a plan that
exists only in Sanity would be a price for something nobody can receive.

## How a change goes live

1. Edit, then **Publish**. Drafts are never shown.
2. Pages pick it up within **60 seconds** — or within a few seconds once the
   webhook below is set up.
3. **Checkout always charges the published price at that moment**, read
   straight from Sanity (never cached). If Sanity cannot be reached, it charges
   the price in the code — a CMS outage never stops a sale.

## Safety checks

Every value is checked twice: by the Studio before it can be published, and by
the website before it is used (`src/lib/cms.ts`). A value the website rejects is
ignored for that field only — the site keeps the code's value and logs
`[cms] … rejected` in Vercel. The rules:

- Prices: whole rupees, ₹1 to ₹1,00,000. The Studio warns from ₹5,000 up.
- The original price must be higher than the Early Access price.
- The end date must be a real date.
- Lists can't be empty, and have a maximum length so the layout holds.

## One-time setup

The code is ready. These steps need a Sanity account with admin rights on
the menler organisation (team@menler.in does not currently have permission to
create projects).

1. **Create the project.** At https://www.sanity.io/manage → menler organisation →
   *Create project*, name it `skeo`, dataset `production`, and set the dataset
   to **Public** (the site reads published content without a token — drafts stay
   private either way). Copy the project ID.
2. **Put the project ID in two places:**
   - `studio/env.ts` — replace `REPLACE_WITH_PROJECT_ID`.
   - Vercel → skeo_web → Settings → Environment Variables: `SANITY_PROJECT_ID`,
     then redeploy.
3. **Studio.** Sanity 6 needs **Node 22.12+**. This machine has Node 20, so either
   upgrade Node or prefix commands with `npx -y -p node@22`. In `studio/`:
   ```
   npx sanity login
   npm run deploy-schema
   npm run seed          # fills Sanity with today's prices and copy
   npm run deploy        # publishes https://skeo.sanity.studio
   ```
   Invite editors under sanity.io/manage → skeo → Members.
4. **Instant updates (optional but recommended).** Add a Vercel env var
   `SANITY_REVALIDATE_SECRET` (any random string of 16+ characters) and redeploy. Then
   at sanity.io/manage → skeo → API → Webhooks → *Create webhook*:
   - URL: `https://www.skeoai.com/api/revalidate`
   - Dataset: production · Trigger on: create, update, delete
   - Filter: `_type in ["plan", "comingSoon", "campaign"]`
   - HTTP method: POST · Header: `x-skeo-revalidate-secret` = the same secret

## Where the code is

- `src/lib/catalog.ts` — the editable values and the code defaults.
- `src/lib/cms.ts` — reads Sanity, checks each field, falls back.
- `src/components/CatalogProvider.tsx` — hands the same values to the cart and checkout in the browser.
- `src/app/api/revalidate/route.ts` — the webhook endpoint.
- `studio/` — the Studio (its own npm project; the website's build ignores it).
