import { PLANS } from '@/lib/plans'

/**
 * Every word on /early-access, in page order. The page reads from here, so
 * wording changes never touch JSX.
 *
 * The price is PLANS.earlyaccess — the same number the checkout charges — so
 * the page can never advertise one price and bill another. `was` is the
 * anchor price shown struck through beside it.
 */

export const offer = {
  price: PLANS.earlyaccess.amount,
  was: 4999,
  terms: 'One-time payment · Lifetime access',
} as const

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export const announcement = {
  text: `Early Access is Open · Limited Seats · Starting at ${inr(offer.price)}`,
  cta: 'Join Now',
} as const

export const hero = {
  lines: ['Learn More.', 'Pay Less.', 'Build More.'],
  lede: 'Learn the tools, build real projects, and become job-ready — without spending thousands on courses.',
  cta: 'Get Started',
  checks: ['Beginner Friendly', 'Lifetime Access', 'Real Projects'],
} as const

export const numbers = [
  { value: '10+', label: 'Courses' },
  { value: '50+', label: 'Tools' },
  { value: '20+', label: 'Projects' },
  { value: 'Lifetime', label: 'Access' },
] as const

export const whatYouGet = {
  title: ['One Membership.', 'A Lot More to Learn.'],
  cards: [
    { icon: 'book', title: 'Courses', body: 'Learn the fundamentals.' },
    { icon: 'tools', title: 'Tools', body: 'Learn the tools companies actually use.' },
    { icon: 'rocket', title: 'Projects', body: 'Build instead of just watching.' },
    { icon: 'live', title: 'Workshops', body: 'Learn directly from practitioners.' },
    { icon: 'file', title: 'Resources', body: 'Templates, prompts, guides and notes.' },
    { icon: 'people', title: 'Community', body: 'Learn with other builders.' },
  ],
} as const

/** What the pass in the hero lists. */
export const valueStack = {
  items: ['10+ Courses', '20+ Projects', '50+ Tools', 'Live Workshops', 'Templates & Resources', 'Community Access', 'Certificate'],
} as const

export const build = {
  title: ['Don’t Just Learn.', 'Build Something.'],
  items: [
    { title: 'Build a Website', body: 'From idea → design → deployment.' },
    { title: 'Build an AI App', body: 'Use AI tools to create a working application.' },
    { title: 'Automate a Workflow', body: 'Turn repetitive work into automation.' },
    { title: 'Build Your Portfolio', body: 'Create projects you can actually show.' },
    { title: 'Launch a Side Project', body: 'Go from idea to something people can use.' },
  ],
} as const

/* `mark` is one of the brand marks the site already draws (tools/marks.tsx);
   the rest are set as a monogram chip rather than fetched as logos. */
export const tools = {
  title: ['Learn the Tools.', 'Not Just the Theory.'],
  note: '50+ tools. One place to learn them.',
  list: [
    { name: 'Claude', mark: 'claude' },
    { name: 'ChatGPT', mark: 'chatgpt' },
    { name: 'Gemini', mark: 'gemini' },
    { name: 'n8n', mark: 'n8n' },
    { name: 'Lovable', mark: 'lovable' },
    { name: 'Antigravity' },
    { name: 'Cursor' },
    { name: 'GitHub' },
    { name: 'Vercel' },
    { name: 'Figma' },
    { name: 'Notion' },
    { name: 'Canva' },
  ],
} as const

export const curriculum = {
  title: 'Everything You Need to Learn.',
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
} as const

export const steps = [
  { title: 'Join', body: 'Get instant access.' },
  { title: 'Learn', body: 'Follow the structured learning path.' },
  { title: 'Build', body: 'Create projects and apply what you learn.' },
] as const

export const mentor = {
  title: ['Learn From People', 'Who Actually Build.'],
  name: 'Rochan Reddy',
  initials: 'RR',
  role: 'Full Stack Developer & DevOps Engineer',
  bio: 'Building products, shipping projects and teaching what actually works.',
} as const

/**
 * PLACEHOLDERS — replace with real students' words before relying on them.
 * While `sample` is true the section is drawn locally and on preview
 * deployments only, never on the live site: a made-up review in front of a
 * paying visitor is a claim the business cannot stand behind.
 */
export const testimonials = {
  title: 'People Are Building With It.',
  sample: true,
  list: [
    { quote: 'I stopped watching tutorials and finally built my first project.', name: 'Rahul', role: 'Student' },
    { quote: 'The best part was having everything in one place.', name: 'Ananya', role: 'Developer' },
    { quote: 'I automated my weekly reports in the first week.', name: 'Karthik', role: 'Working Professional' },
  ],
} as const

export const finalStack = {
  title: ['One Price.', 'Everything Included.'],
  items: ['Courses', 'Projects', 'Tools', 'Workshops', 'Templates', 'Community', 'Lifetime Access'],
  note: 'One-time payment',
  cta: 'Get Everything',
} as const

export const faqs = [
  { q: 'Is this beginner friendly?', a: 'Yes. Start from the basics and progress toward projects.' },
  { q: 'Do I need coding experience?', a: 'No, unless a specific course requires it.' },
  { q: 'Is this a subscription?', a: 'No. One-time payment.' },
  { q: 'How long do I get access?', a: 'Lifetime.' },
  { q: 'Do I get certificates?', a: 'Yes, if applicable to your program.' },
  { q: 'Can I learn at my own pace?', a: 'Yes.' },
] as const

export const finalCta = {
  title: ['Stop Collecting Courses.', 'Start Building.'],
  cta: 'Get Started',
  small: 'One-time payment · Instant access · No hidden fees',
} as const
