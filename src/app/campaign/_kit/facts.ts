import { get, inr, learn, offer, savePct } from '@/lib/earlyAccess'
import { testimonials } from '@/lib/content'

/**
 * What every beginner-facing campaign variant says about Everything AI, in
 * plain words. The numbers and promises are the ones lib/earlyAccess already
 * makes — price, deadline, what is included — so no variant can advertise
 * something the checkout or the main campaign page does not.
 *
 * The variants differ in how they say it, never in what they offer: they all
 * sell the same Early Access, through the same checkout.
 */

export { inr, offer, savePct }

export const price = inr(offer.price)
export const was = inr(offer.was)

/** "10 Oct" — the real deadline, as a date anyone can read. */
export const endsOn = new Date(offer.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })

export const product = 'Everything AI'

/** One sentence: what this is. */
export const whatItIs =
  'Everything AI is an online program by skeo that teaches you to use AI tools — ChatGPT, Claude, Gemini and 50+ more — for real work, step by step, in plain language.'

/** What is included, as the main campaign page lists it. */
export const included = get.items.map((i) => ({ title: i.title, body: i.body }))

export const modules = learn.modules

/** Things a beginner will be able to do — everyday outcomes, not features. `icon` names a glyph in _kit/Icons. */
export const outcomes = [
  { icon: 'write', title: 'Write in minutes', body: 'Emails, reports, posts and notes — drafted with AI, finished by you.' },
  { icon: 'research', title: 'Research anything', body: 'Understand a new topic in an evening, with sources you can check.' },
  { icon: 'design', title: 'Make designs', body: 'Posters, social posts and a brand kit — no design degree needed.' },
  { icon: 'automate', title: 'Automate boring work', body: 'Let tasks you repeat every week run on their own.' },
  { icon: 'web', title: 'Build a website', body: 'Put a real site online — with no code to start.' },
  { icon: 'work', title: 'Get work with it', body: 'Show your projects and certificate, and apply through the job board.' },
] as const

/** Plain answers. Matches the main campaign page's FAQ, with the beginner questions first. */
export const faqs = [
  { q: 'I have never used AI. Is this for me?', a: 'Yes. It starts from the very basics — what AI is and how to talk to it — and builds up one step at a time.' },
  { q: 'Do I need to know coding?', a: 'No coding is needed to start. A few later projects use code, and they show you each step.' },
  { q: 'How do I learn — live or recorded?', a: 'Mostly at your own pace, online, whenever suits you. There are live workshops too.' },
  { q: 'What happens after I pay?', a: 'You get your login by email straight away, and can start the first lesson the same day.' },
  { q: 'Is it a subscription?', a: `No. You pay ${inr(offer.price)} once. There are no monthly fees.` },
  { q: 'How long can I use it?', a: 'For life. Pay once and keep it, including courses added later.' },
  { q: 'Do I get a certificate?', a: 'Yes — earned by finishing the projects, so it shows what you can actually do.' },
] as const

/** Three real quotes from the site's testimonials, for social proof. */
export const quotes = testimonials.slice(0, 3)

/** The tools named on the page, with the mark each one draws. */
export const tools = learn.tools
