import { PLANS } from '@/lib/plans'

/**
 * Every word on /early-access, in page order. The page reads from here, so
 * wording changes never touch JSX.
 *
 * A campaign page, not a website: each section answers one question a
 * visitor has before paying — what do I get, what will I learn, what will I
 * build, how does it work, what does it cost — and nothing else.
 *
 * The price is PLANS.earlyaccess — the same number the checkout charges — so
 * the page can never advertise one price and bill another. `was` is the
 * anchor price shown struck through beside it.
 */

export const offer = {
  price: PLANS.earlyaccess.amount,
  was: 25000,
  terms: 'One-time payment · Lifetime access',
  /**
   * When the Early Access price ends — one real moment, the same for every
   * visitor. The countdown in the top bar counts to it, and the order route
   * stops selling Early Access after it, so the timer is a deadline and not
   * a decoration. Set NEXT_PUBLIC_EARLY_ACCESS_ENDS (ISO, with offset) to
   * move it; it is read at build time, so redeploy after changing it.
   */
  endsAt: process.env.NEXT_PUBLIC_EARLY_ACCESS_ENDS || '2026-10-10T23:59:59+05:30',
} as const

export const offerEnded = (now = Date.now()) => now >= Date.parse(offer.endsAt)

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export const savePct = Math.round((1 - offer.price / offer.was) * 100)

export const announcement = {
  lead: 'Early Access',
  offer: `${savePct}% OFF`,
  endsIn: 'ends in',
  ended: 'This offer has ended',
  cta: 'Join Now',
} as const

export const hero = {
  lines: ['Learn More.', 'Pay Less.', 'Build More.'],
  lede: 'Learn the tools, build real projects, and become job-ready — without spending thousands on courses.',
  cta: 'Get Started',
  checks: ['Beginner Friendly', 'Lifetime Access', 'Real Projects'],
} as const

/** What the pass in the hero lists. */
export const valueStack = {
  items: ['10+ Courses', '20+ Projects', '50+ Tools', 'Live Workshops', 'Templates & Resources', 'Community Access', 'Certificate'],
} as const

export const numbers = [
  { value: '10+', label: 'Courses' },
  { value: '50+', label: 'Tools' },
  { value: '20+', label: 'Projects' },
  { value: 'Lifetime', label: 'Access' },
] as const

/** 1 — What you get */
export const get = {
  eyebrow: 'What you get',
  title: `Everything below, for ${inr(offer.price)}.`,
  items: [
    { icon: 'book', title: '10+ Courses', body: 'Learn the fundamentals.' },
    { icon: 'tools', title: '50+ Tools', body: 'The tools companies actually use.' },
    { icon: 'rocket', title: '20+ Projects', body: 'Build instead of just watching.' },
    { icon: 'live', title: 'Live Workshops', body: 'Learn from practitioners.' },
    { icon: 'file', title: 'Templates & Resources', body: 'Prompts, guides and notes.' },
    { icon: 'people', title: 'Community', body: 'Learn with other builders.' },
    { icon: 'badge', title: 'Certificate', body: 'Proof of what you built.' },
    { icon: 'infinity', title: 'Lifetime Access', body: 'Pay once. Keep it.' },
  ],
} as const

/** 2 — What you'll learn */
export const learn = {
  eyebrow: 'What you’ll learn',
  title: 'From AI basics to shipping real work.',
  modules: [
    {
      title: 'AI Foundations',
      learn: ['AI fundamentals', 'LLMs', 'ChatGPT', 'Claude', 'Prompting'],
      build: 'AI Research Assistant',
    },
    {
      title: 'Prompt Engineering',
      learn: ['Prompt frameworks', 'System prompts', 'Structured outputs', 'Advanced prompting'],
      build: 'Personal Prompt Library',
    },
    {
      title: 'AI Automation',
      learn: ['n8n', 'Make', 'APIs', 'AI agents'],
      build: 'Automated Lead System',
    },
    {
      title: 'Build With AI',
      learn: ['Lovable', 'Antigravity', 'Claude Code', 'Deployment'],
      build: 'Portfolio Website',
    },
  ],
  toolsLabel: 'Tools you’ll use — 50+ in all',
  /* `mark` picks the logo: the site's own marks (tools/marks.tsx) for the five
     it already draws, the rest from ToolLogos.tsx. */
  tools: [
    { name: 'Claude', mark: 'claude' },
    { name: 'ChatGPT', mark: 'chatgpt' },
    { name: 'Gemini', mark: 'gemini' },
    { name: 'n8n', mark: 'n8n' },
    { name: 'Lovable', mark: 'lovable' },
    { name: 'Antigravity', mark: 'antigravity' },
    { name: 'Cursor', mark: 'cursor' },
    { name: 'GitHub', mark: 'github' },
    { name: 'Vercel', mark: 'vercel' },
    { name: 'Figma', mark: 'figma' },
    { name: 'Notion', mark: 'notion' },
    { name: 'Canva', mark: 'canva' },
  ],
} as const

/** 3 — What you'll build */
export const build = {
  eyebrow: 'What you’ll build',
  title: 'Don’t just learn. Build something.',
  items: [
    { icon: 'globe', title: 'A Website', body: 'From idea → design → deployment.' },
    { icon: 'spark', title: 'An AI App', body: 'A working application, built with AI tools.' },
    { icon: 'flow', title: 'An Automation', body: 'Repetitive work that now runs itself.' },
    { icon: 'folder', title: 'Your Portfolio', body: 'Projects you can actually show.' },
    { icon: 'rocket', title: 'A Side Project', body: 'Something people can use.' },
  ],
} as const

/** Who teaches it — a small card closing the "what you'll learn" section. */
export const mentor = {
  eyebrow: 'Your mentor',
  name: 'Rochan Reddy',
  initials: 'RR',
  /* A path in /public (e.g. '/mentors/rochan.jpg'). Empty draws the initials. */
  photo: '',
  role: 'Full Stack Developer & DevOps Engineer',
  bio: 'Building products, shipping projects and teaching what actually works.',
} as const

/** 4 — The offer */
export const pricing = {
  eyebrow: 'The offer',
  title: 'One price. Everything included.',
  plan: 'Everything AI · Early Access',
  items: ['10+ Courses', '20+ Projects', '50+ Tools', 'Live Workshops', 'Templates & Resources', 'Community Access', 'Certificate', 'Lifetime Access'],
  cta: 'Get Everything',
  small: 'One-time payment · Instant access · No hidden fees',
} as const

/** 5 — FAQ */
export const faq = {
  eyebrow: 'FAQ',
  title: 'Quick answers.',
  items: [
    { q: 'Is this beginner friendly?', a: 'Yes. Start from the basics and progress toward projects.' },
    { q: 'Do I need coding experience?', a: 'No, unless a specific course requires it.' },
    { q: 'Is this a subscription?', a: 'No. One-time payment.' },
    { q: 'How long do I get access?', a: 'Lifetime.' },
    { q: 'Do I get certificates?', a: 'Yes, if applicable to your program.' },
    { q: 'Can I learn at my own pace?', a: 'Yes.' },
  ],
} as const

export const finalCta = {
  title: ['Stop Collecting Courses.', 'Start Building.'],
  cta: 'Get Started',
  small: 'One-time payment · Instant access · No hidden fees',
} as const

/** Sample certificate — the same specimen and promise the home page makes. */
export const certificate = {
  eyebrow: 'Your certificate',
  title: 'Proof, not promises.',
  body: 'Build skills across the tools you need, put them into practice, and earn verified credentials that show what you can actually do.',
  points: [
    'Verified tool-specific credentials',
    'Earned through practical projects',
    'Build a profile of proven skills',
    'Unlock jobs, freelance work & opportunities',
  ],
} as const

/** The Job & Freelancing Board. */
export const jobs = {
  eyebrow: 'Job board',
  title: 'Then put it to work.',
  body: 'Certification is just the beginning. Apply your skills to real opportunities — to earn, gain experience and build your career.',
  cta: 'Get Started',
} as const

/** Testimonials — the same quotes the home page carries (lib/content.ts). */
export const reviews = {
  eyebrow: 'From the community',
  title: 'Builders become believers.',
} as const
