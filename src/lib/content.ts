/**
 * Single source of truth for the landing page copy.
 * Sections read from here so wording changes never require touching JSX.
 */

export const problems = [
  { mark: '01', title: 'Too many tools', body: 'New tools drop every week, every month.' },
  { mark: '02', title: 'No structure', body: 'Random videos and threads don’t add up to a real skill.' },
  { mark: '03', title: 'No proof', body: 'Watching a tutorial isn’t something you can show anyone.' },
  {
    mark: '04',
    title: 'No next step',
    body: 'Even after learning, don’t know how to turn it into an opportunity.',
  },
] as const

/* Split into a number and its suffix so the value can be counted up rather than
   printed. `1000+` matches how the job board section already states the same
   figure — it read as a flat `1000` here. */
export const promiseStats = [
  { value: 5, suffix: '+', label: 'AI Tools' },
  { value: 30, suffix: '', label: 'Minutes A Day' },
  { value: 100, suffix: '', label: 'Real Time Projects' },
  { value: 1000, suffix: '+', label: 'Job & Monetization Opportunities' },
] as const

/**
 * The single tool the library section puts on stage.
 * `poster` is the left-hand panel — it is drawn in markup, not an image,
 * so the copy stays editable and nothing needs re-exporting.
 */
/* The product walkthrough. Leave `src` empty until the cut exists — the poster
   renders as plain content rather than a dead button while it is missing. Point
   it at a file in /public (or any direct video URL) to switch the lightbox on. */
export const walkthrough = {
  src: '',
  label: 'Watch how Skeo works',
  duration: '2 MIN',
} as const

/* Frames the tool library. Without it the section opened cold on a card, with
   no heading to say what the reader was looking at. */
export const toolsIntro = {
  eyebrow: 'Tool library',
  title: 'Start with one tool. Go deep.',
  body: 'Every module takes a single tool from first principles to shipped work.',
} as const

export const featuredTool = {
  badge: 'Featured tool',
  name: 'Claude',
  maker: 'by Anthropic',
  tagline: 'From a blank page to shipped work, in one tool.',
  poster: {
    logo: '/claude.svg',
    kicker: 'AI tool library',
    lines: ['Learn Claude', 'end to end'],
    note: 'Prompting, research, and real deliverables.',
    footer: 'Module 01 · Beginner friendly',
  },
  capsules: ['Claude Chat', 'Claude Cowork', 'Claude Code'],
  facts: [
    { icon: 'book', label: '12 lessons' },
    { icon: 'clock', label: '3.5 hours' },
    { icon: 'rocket', label: '4 projects' },
    { icon: 'compass', label: 'Self-paced' },
  ],
  blurb:
    'Master Claude from foundations to advanced, apply it to real-world problems, build powerful projects, and turn your skills into new opportunities.',
  cta: { label: 'Start Learning', href: '#pricing' },
} as const

export const projects = [
  {
    art: 'pink',
    icon: 'learn',
    category: 'LEARN',
    title: 'Master the tools, from foundations to advanced.',
    body: 'Build a strong understanding of each tool and learn how to use it confidently in real-world scenarios.',
  },
  {
    art: 'blue',
    icon: 'build',
    category: 'BUILD',
    title: 'Apply what you learn. Build what matters.',
    body: 'Turn your knowledge into workflows, automations, and real projects that solve meaningful problems.',
  },
  {
    art: 'yellow',
    icon: 'monetize',
    category: 'MONETIZE',
    title: 'Turn AI skills into opportunities.',
    body: 'Use your skills to create value, unlock career opportunities, freelance, or build something of your own.',
  },
] as const

export const jobs = [
  { title: 'AI Content Freelancer', meta: 'Remote · Freelance' },
  { title: 'Junior AI Ops', meta: 'Bengaluru · Full-time' },
  { title: 'Prompt Engineer Intern', meta: 'Remote · Internship' },
] as const

/* What the board opens up — listed beside the copy, not as sample roles. */
export const opportunities = [
  '1000+ Monetization Opportunities',
  'Freelance Projects',
  'Internships',
  'Full Time Jobs',
] as const

export const comparison = {
  legacy: [
    'Fixed, all-in-one courses',
    'Watch lessons & complete quizzes',
    'Certificate of completion',
    'Finish the course & figure out what’s next',
    'Limited ways to apply your skills',
  ],
  skeo: [
    'Individual AI tools & modules',
    'Learn by building real projects',
    'Verified proof of practical skills',
    'Access jobs, internships & freelancing',
    '1,000+ monetization opportunities',
  ],
} as const

export const testimonials = [
  {
    quote:
      'Skeo gave me the structure I was missing. Three weeks later, I had a portfolio I was actually proud to send out.',
    name: 'Priya Shah',
    role: 'Product Designer, Mumbai',
  },
  {
    quote:
      'I went from opening ChatGPT once a week to building automations my whole team now uses. That felt like a superpower.',
    name: 'Marcus Chen',
    role: 'Operations Lead, Singapore',
  },
  {
    quote:
      'Not another course. Actual momentum, actual output, and a community that keeps you moving.',
    name: 'Aisha Rahman',
    role: 'Growth Marketer, London',
  },
  {
    quote:
      'The daily builds are the whole trick. Fifteen minutes is small enough that I never skipped it, and it compounded fast.',
    name: 'Daniel Okafor',
    role: 'Founder, Lagos',
  },
  {
    quote:
      'I applied through the Job Board with three shipped projects attached. That conversation went very differently.',
    name: 'Sofia Almeida',
    role: 'AI Ops Analyst, Lisbon',
  },
  {
    quote:
      'My team ran the 28-day module together. We now have shared automations instead of shared bookmarks.',
    name: 'Ravi Menon',
    role: 'Engineering Manager, Bengaluru',
  },
] as const

export const faqs = [
  {
    q: 'Do I need a technical background?',
    a: 'Not at all. Skeo is designed to make practical AI accessible, whether you work in design, marketing, operations, or are just getting started.',
  },
  {
    q: 'How much time does a module take?',
    a: 'Most daily builds take 30–60 minutes. The pace is intentional: enough to make real progress without upending your life.',
  },
  {
    q: 'Are the certificates recognized?',
    a: 'Every certificate links to the actual projects and assessments behind it — so it represents concrete proof, not just completion.',
  },
  {
    q: 'Does completing a module guarantee a job?',
    a: 'No platform can promise that, and we won’t pretend otherwise. What you get is verified proof of work and access to the Job & Freelancing Board — real opportunities to apply to, not a guaranteed outcome.',
  },
  {
    q: 'Can I cancel whenever I want?',
    a: 'Absolutely. There are no long-term commitments. You can manage or cancel your membership at any time.',
  },
  {
    q: 'Do I have to pay for the AI tools as well?',
    a: 'No. Every build is designed around the free tier of each tool, and where a paid plan genuinely changes what is possible, we say so before you start rather than after.',
  },
  {
    q: 'What do I actually walk away with?',
    a: 'Finished work — carousels, automations, research briefs and the rest — sitting in a portfolio you own, plus the certificate that links straight to it.',
  },
  {
    q: 'The tools change every month. Does the content?',
    a: 'Yes. Modules are revised as the tools shift, and your access covers those revisions — you are not buying a snapshot of how Claude or n8n worked this quarter.',
  },
] as const
