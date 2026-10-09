import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

/* The crawlers that read for an answer engine rather than for an index.
   They are already permitted by the wildcard rule below — a bare Allow: / lets
   everyone in — so naming them changes nothing about what they may fetch. It
   is here to be explicit: a site that wants to be quoted should say so, and
   the day one of these needs a different rule from the rest, the block to edit
   already exists. */
const ANSWER_ENGINES = [
  'GPTBot',          // OpenAI, training and retrieval
  'OAI-SearchBot',   // ChatGPT search
  'ChatGPT-User',    // a person asking ChatGPT to open a link
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended', // Gemini; separate from Googlebot, which indexes
  'Applebot-Extended',
  'CCBot',           // Common Crawl, which several models train from
  'cohere-ai',
  'Amazonbot',       // Alexa / Rufus answers
  'meta-externalagent', // Meta AI
  'DuckAssistBot',   // DuckDuckGo's answers
  'MistralAI-User',  // Le Chat opening a link
]

/* /admin is a login screen and /api answers only to the app; /checkout and
   /thank-you are steps in a purchase, meaningless without the cart or the
   order behind them. None is content, all are noindex in their own metadata —
   this just stops a crawler spending its visits asking. */
const PRIVATE = ['/admin', '/api', '/checkout', '/thank-you']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: ANSWER_ENGINES, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
