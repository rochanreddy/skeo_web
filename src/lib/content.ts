/**
 * Single source of truth for the landing page copy.
 * Sections read from here so wording changes never require touching JSX.
 */

export const employers = ['microsoft', 'amazon', 'accenture', 'Razorpay', 'deloitte.', 'flipkart'] as const

export const problems = [
  { mark: '01', title: 'Too many tools', body: 'Claude, ChatGPT, Gemini, Lovable, n8n — new ones every month.' },
  { mark: '02', title: 'No structure', body: 'Random videos and threads don’t add up to a real skill.' },
  { mark: '03', title: 'No proof', body: 'Watching a tutorial isn’t something you can show anyone.' },
  {
    mark: '04',
    title: 'No next step',
    body: 'Even after learning, most people don’t know how to turn it into opportunity.',
  },
] as const

export const promiseStats = [
  { value: '10+', label: 'AI tools, one place' },
  { value: '15 min', label: 'a day, structured' },
  { value: '1', label: 'certification system' },
] as const

export const tools = [
  'Claude',
  'ChatGPT',
  'Gemini',
  'Lovable',
  'n8n',
  'Cursor',
  'Notion',
  'Perplexity',
  'Zapier',
  'Figma',
] as const

export const moduleFlow = [
  { icon: '📘', title: 'Lessons', body: 'Short, practical, no fluff' },
  { icon: '🛠️', title: 'Practice', body: 'Try it yourself, guided' },
  { icon: '🚀', title: 'Projects', body: 'Build something real' },
  { icon: '🎓', title: 'Certificate', body: 'Proof you can share' },
] as const

export const pathSteps = [
  { num: '01', title: 'Pick', body: 'Choose a tool or module' },
  { num: '02', title: 'Learn', body: 'Short-form, on the go' },
  { num: '03', title: 'Practice', body: 'Hands-on, guided reps' },
  { num: '04', title: 'Build', body: 'Ship a real project' },
  { num: '05', title: 'Prove', body: 'Certify and get discovered' },
] as const

export const outcomes = [
  { icon: '💼', title: 'Work', body: 'Do your job faster with AI' },
  { icon: '🧱', title: 'Build', body: 'Ship AI-powered products' },
  { icon: '⚙️', title: 'Automate', body: 'Cut the busywork with workflows' },
  { icon: '🎨', title: 'Create', body: 'Produce content at AI speed' },
  { icon: '📈', title: 'Grow', body: 'Turn skills into opportunities' },
] as const

export const projects = [
  {
    art: 'pink',
    glyph: '✺',
    category: 'CONTENT CREATION',
    title: 'Animated Carousels',
    body: 'Design scroll-stopping carousels with AI-assisted visuals and motion.',
  },
  {
    art: 'blue',
    glyph: '⌁',
    category: 'AUTOMATION',
    title: 'An always-on content engine',
    body: 'Build an intelligent workflow that does the busywork.',
  },
  {
    art: 'yellow',
    glyph: '◉',
    category: 'PRODUCTIVITY',
    title: 'Your personal research copilot',
    body: 'Turn a messy brief into a source-backed point of view.',
  },
] as const

export const jobs = [
  { title: 'AI Content Freelancer', meta: 'Remote · Freelance' },
  { title: 'Junior AI Ops', meta: 'Bengaluru · Full-time' },
  { title: 'Prompt Engineer Intern', meta: 'Remote · Internship' },
] as const

export const comparison = {
  legacy: [
    'Watch another video',
    'Pass a multiple-choice quiz',
    'Collect a generic certificate',
    'Hope someone notices',
  ],
  skillora: [
    'Build something every day',
    'Learn tools in real context',
    'Earn proof through projects',
    'Get discovered for real work',
  ],
} as const

export const audiences = [
  { title: 'Students & college students', body: 'Get ahead before you graduate.' },
  { title: 'Fresh graduates', body: 'Stand out with proof, not just a degree.' },
  { title: 'Working professionals', body: 'Stay relevant in your current role.' },
  { title: 'Career switchers', body: 'Build a portfolio in a new direction.' },
  { title: 'Freelancers & creators', body: 'Add AI to your existing craft.' },
  { title: 'Job seekers', body: 'Turn learning into opportunities.' },
] as const

export const testimonials = [
  {
    quote:
      'Skillora gave me the structure I was missing. Three weeks later, I had a portfolio I was actually proud to send out.',
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
    a: 'Not at all. Skillora is designed to make practical AI accessible, whether you work in design, marketing, operations, or are just getting started.',
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
] as const
