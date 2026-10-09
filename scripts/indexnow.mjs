#!/usr/bin/env node
/**
 * Tells IndexNow engines (Bing, Yandex, Seznam, Naver — and through Bing,
 * ChatGPT search and Copilot) that the site has changed, instead of waiting
 * for their next crawl.
 *
 *   node scripts/indexnow.mjs                 every URL in the live sitemap
 *   node scripts/indexnow.mjs /about /terms   just these paths
 *
 * Run it after a deploy that changes content. The key is not a secret: the
 * protocol proves ownership by the engine fetching public/<key>.txt from the
 * site, so the file and this constant have to stay in step.
 */

const HOST = 'www.skeoai.com'
const KEY = '349ff793ed6fa8d7f2e1027abab599cc'

const paths = process.argv.slice(2)

async function urlsFromSitemap() {
  const res = await fetch(`https://${HOST}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml answered ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

const urlList = paths.length ? paths.map((p) => `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`) : await urlsFromSitemap()

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})

// 200 and 202 both mean accepted; 202 is "key not verified yet" on a first submit.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URL(s)`)
for (const u of urlList) console.log(`  ${u}`)
if (res.status >= 400) process.exit(1)
