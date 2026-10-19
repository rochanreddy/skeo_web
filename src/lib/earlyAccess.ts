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
  /* Hook: name the fear, flip it, then the payoff. The middle line is highlighted. */
  lines: ['Don’t fear AI.', 'Master it.', 'Get paid for it.'],
  lede: 'ChatGPT, Claude & 50+ AI tools — learn them, build real projects and get job-ready, for the price of a pizza.',
  cta: 'Get Started',
  checks: ['Beginner Friendly', 'Lifetime Access', 'Real Projects'],
} as const

/** What the pass in the hero lists. */
export const valueStack = {
  /* Laid out in two columns, filled top to bottom: the numbers on the left,
     everything else on the right. */
  items: ['10+ Courses', '20+ Projects', '50+ Tools', '100+ Jobs', 'Live Workshops', 'Templates & Resources', 'Community Access', 'Certificate'],
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
    { icon: 'briefcase', title: '100+ Jobs', body: 'Real openings to put it to work.' },
  ],
} as const

/** 2 — What you'll learn */
export const learn = {
  eyebrow: 'What you’ll learn',
  title: 'From using AI to building with it.',
  /* Four levels, ten modules, numbered straight through. `isNew` puts a
     "New" badge on a module. */
  levels: [
    {
      label: 'Level 1 · Use AI',
      tagline: 'Do your everyday work faster.',
      modules: [
        { title: 'AI Foundations', build: 'Personal AI Research Assistant', body: 'Learn how ChatGPT, Claude and Grok work, and get answers you can trust.' },
        { title: 'Prompt Engineering', build: 'Personal Prompt Library', body: 'Write prompts that get the right output the first time.' },
      ],
    },
    {
      label: 'Level 2 · Create with AI',
      tagline: 'Make more, in less time.',
      modules: [
        { title: 'AI for Writing & Research', build: 'Content Engine', body: 'Posts, emails, reports and summaries in your voice, in minutes.' },
        { title: 'AI for Design & Visuals', build: 'Brand Kit', body: 'Logos, images and social creatives without a designer.' },
        { title: 'AI for Video & Voice', build: 'AI-Made Reel', body: 'Scripts, voiceovers and edits for short-form video.' },
      ],
    },
    {
      label: 'Level 3 · Automate with AI',
      tagline: 'Put repeat work on autopilot.',
      modules: [
        { title: 'AI for Data & Analysis', build: 'Smart Dashboard', body: 'Turn spreadsheets into insights and charts by asking in plain English.', isNew: true },
        { title: 'AI Automation', build: 'Automated Lead System', body: 'Workflows in n8n that capture, sort and follow up on their own.' },
        { title: 'AI Agents', build: 'Personal AI Agent', body: 'Agents that research, decide and act for you.' },
      ],
    },
    {
      label: 'Level 4 · Build with AI',
      tagline: 'Ship products, without a dev team.',
      modules: [
        { title: 'Build With AI', build: 'Portfolio Website', body: 'Design and launch your own site with Lovable. No code.' },
        { title: 'Code & Ship With AI', build: 'Live Web App', body: 'Turn an idea into a working app with Claude.' },
      ],
    },
  ],
  toolsLabel: 'Tools you’ll use — 50+ in all',
  /* `mark` picks the logo: the site's own marks (tools/marks.tsx) for the five
     it already draws, the rest from ToolLogos.tsx. */
  tools: [
    { name: 'Claude', mark: 'claude' },
    { name: 'ChatGPT', mark: 'chatgpt' },
    { name: 'Grok', mark: 'grok' },
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
    { icon: 'content', title: 'A Content Studio', body: 'Posts, carousels and videos, made in minutes.' },
    { icon: 'design', title: 'A Design System', body: 'Logos, colours and visuals, always on-brand.' },
    { icon: 'voice', title: 'An AI Voice', body: 'Scripts and voiceovers that sound human.' },
    { icon: 'bot', title: 'An AI Bot', body: 'Answers questions and chats, 24/7.' },
    { icon: 'flow', title: 'An Automation', body: 'Repetitive work that now runs itself.' },
    { icon: 'agent', title: 'An AI Agent', body: 'Researches, decides and acts for you.' },
    { icon: 'globe', title: 'A Web App', body: 'From idea → design → deployment.' },
    { icon: 'folder', title: 'A Portfolio', body: 'All your work, live and ready to show.' },
  ],
} as const

/**
 * Who teaches it — a row of cards closing the "what you'll learn" section,
 * three across on desktop. Add a mentor by adding an entry; the row centres
 * whatever is here. `photo` is a path in /public (e.g. '/mentors/rochan.jpg');
 * empty draws the initials.
 */
export const mentors = {
  eyebrow: 'Your mentors',
  title: 'Learn from people who build with AI.',
  people: [
    {
      name: 'Rochan Reddy',
      initials: 'RR',
      photo: '',
      role: 'Full Stack Developer & DevOps Engineer',
      bio: 'Building products, shipping projects and teaching what actually works.',
    },
    /* Placeholders until the real mentors are confirmed — swap name, initials,
       role, bio (and a photo) for the real people. */
    {
      name: 'Ananya Rao',
      initials: 'AR',
      photo: '',
      role: 'AI Automation Specialist',
      bio: 'Turns repetitive work into workflows that run themselves.',
    },
    {
      name: 'Karthik Menon',
      initials: 'KM',
      photo: '',
      role: 'Product Designer & AI Builder',
      bio: 'Designs and ships products with AI, from first sketch to launch.',
    },
  ],
} as const

/** 4 — The offer */
export const pricing = {
  eyebrow: 'The offer',
  title: 'One price. Everything included.',
  plan: 'Everything AI · Early Access',
  items: ['10+ Courses', '20+ Projects', '50+ Tools', 'Live Workshops', 'Templates & Resources', 'Community Access', 'Certificate', '100+ Jobs', 'Lifetime Access'],
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
