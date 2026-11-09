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
   printed. `1 Lakh+` matches how the job board section states the same figure. */
/* `short` is the phone wording and nothing else. A third of a small phone
 * cannot hold 'Real Time Projects' on one line at a size worth reading, but
 * the desktop chip has room to spare — so the full label stays the label, and
 * the stylesheet swaps in the short one below 680px. Both are rendered; the
 * hidden one is display:none, so a screen reader is only ever read one. */
export const promiseStats = [
  { value: 5, suffix: '+', label: 'AI Tools', short: 'AI Tools' },
  { value: 30, suffix: '', label: 'Minutes A Day', short: 'Minutes/Day' },
  { value: 100, suffix: '', label: 'Real Time Projects', short: 'Real Projects' },
  { value: 1, suffix: ' Lakh+', label: 'Job Opportunities', short: 'Job Openings' },
] as const

/**
 * The single tool the library section puts on stage.
 * `poster` is the left-hand panel — it is drawn in markup, not an image,
 * so the copy stays editable and nothing needs re-exporting.
 */
/* The product walkthrough. Leave `src` empty until the cut exists — the poster
   renders as plain content rather than a dead button while it is missing. Point
   it at a file in /public (or any direct video URL) to switch the player on.
   `poster` is the thumbnail shown until someone presses play. */
export const walkthrough = {
  src: '/walkthrough.mp4',
  poster: '/walkthrough-poster.jpg',
  label: 'Watch how skeo works',
  duration: '2 MIN',
} as const

/* Frames the tool library. Without it the section opened cold on a card, with
   no heading to say what the reader was looking at. */
export const toolsIntro = {
  eyebrow: 'Tool library',
  title: 'Pick a tool. Go deep.',
  body: 'Every tool is taken from first principles to shipped work.',
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
    footer: 'From beginner to advanced level',
  },
  capsules: ['Claude Chat', 'Claude Cowork', 'Claude Code'],
  /* The same four figures the curriculum overlay opens with — see
     claudeSyllabus.stats below. A card that promises one shape of course and
     an overlay that describes another is the reader's first reason to doubt
     either, and this is the one pair of numbers they see back to back. */
  facts: [
    { icon: 'book', label: '8+ modules' },
    { icon: 'rocket', label: '10+ projects' },
    { icon: 'clock', label: '5+ hours' },
    { icon: 'compass', label: 'Self-paced' },
  ],
  blurb:
    'Master Claude from foundations to advanced, apply it to real-world problems, build powerful projects, and turn your skills into new opportunities.',
  cta: { label: 'Start Learning', href: '#pricing' },
  /* The quiet half of the pair on the card — opens the curriculum overlay for
     the reader who wants to see what is taught before paying for it. */
  syllabus: { label: 'View Curriculum' },
} as const

type LibraryTool = {
  id: string
  badge: string
  name: string
  maker: string
  tagline: string
  poster: { logo: string; kicker: string; lines: readonly string[]; note: string; footer: string }
  capsules: readonly string[]
  facts: readonly { icon: string; label: string }[]
  blurb: string
  cta: { label: string; href: string }
  /* Only tools with a written curriculum get the overlay button. */
  syllabus?: { label: string }
}

/**
 * Every tool in the library, in the order the tabs show them. Claude leads —
 * it is the featured track and the only one with a curriculum overlay — and
 * the rest are drawn on the same card, so the switcher changes the content,
 * never the shape.
 */
export const toolLibrary: readonly LibraryTool[] = [
  { id: 'claude', ...featuredTool },
  {
    id: 'chatgpt',
    badge: 'Included tool',
    name: 'ChatGPT',
    maker: 'by OpenAI',
    tagline: 'The everyday assistant, used like a professional.',
    poster: {
      logo: '/logos/chatgpt.svg',
      kicker: 'AI tool library',
      lines: ['Learn ChatGPT', 'end to end'],
      note: 'Prompting, custom GPTs, and daily workflows.',
      footer: 'From beginner to advanced level',
    },
    capsules: ['ChatGPT Chat', 'Custom GPTs', 'Deep Research'],
    facts: [
      { icon: 'book', label: '6+ modules' },
      { icon: 'rocket', label: '8+ projects' },
      { icon: 'clock', label: '10 hours' },
      { icon: 'compass', label: 'Self-paced' },
    ],
    blurb:
      'Go past quick questions: structure prompts, build your own GPTs, run cited research and turn ChatGPT into a dependable part of your working day.',
    cta: { label: 'Start Learning', href: '#pricing' },
  },
  {
    id: 'grok',
    badge: 'Included tool',
    name: 'Grok',
    maker: 'by xAI',
    tagline: 'Real-time answers, straight from what is happening now.',
    poster: {
      logo: '/logos/grok.svg',
      kicker: 'AI tool library',
      lines: ['Learn Grok', 'end to end'],
      note: 'Live search, trend research, and image generation.',
      footer: 'From beginner to advanced level',
    },
    capsules: ['Grok Chat', 'DeepSearch', 'Grok Imagine'],
    facts: [
      { icon: 'book', label: '5+ modules' },
      { icon: 'rocket', label: '6+ projects' },
      { icon: 'clock', label: '8 hours' },
      { icon: 'compass', label: 'Self-paced' },
    ],
    blurb:
      'Use Grok for what it does best: live research on fast-moving topics, trend and audience analysis, and visuals — then put it to work on real briefs.',
    cta: { label: 'Start Learning', href: '#pricing' },
  },
  {
    id: 'n8n',
    badge: 'Included tool',
    name: 'n8n',
    maker: 'Workflow automation',
    tagline: 'Connect your apps and let the busywork run itself.',
    poster: {
      logo: '/logos/n8n.svg',
      kicker: 'AI tool library',
      lines: ['Learn n8n', 'end to end'],
      note: 'Workflows, AI agents, and real automations.',
      footer: 'From beginner to advanced level',
    },
    capsules: ['Workflows', 'AI Agents', 'Integrations'],
    facts: [
      { icon: 'book', label: '7+ modules' },
      { icon: 'rocket', label: '10+ projects' },
      { icon: 'clock', label: '12 hours' },
      { icon: 'compass', label: 'Self-paced' },
    ],
    blurb:
      'Build automations that move data between the tools you already use, add AI agents to them, and ship workflows that save hours every week.',
    cta: { label: 'Start Learning', href: '#pricing' },
  },
  {
    id: 'lovable',
    badge: 'Included tool',
    name: 'Lovable',
    maker: 'AI app builder',
    tagline: 'From an idea to a live web app — without writing the code.',
    poster: {
      logo: '/logos/lovable.svg',
      kicker: 'AI tool library',
      lines: ['Learn Lovable', 'end to end'],
      note: 'Prompt-to-app, databases, and deployment.',
      footer: 'From beginner to advanced level',
    },
    capsules: ['Prompt to App', 'Supabase', 'Publishing'],
    facts: [
      { icon: 'book', label: '6+ modules' },
      { icon: 'rocket', label: '5+ projects' },
      { icon: 'clock', label: '10 hours' },
      { icon: 'compass', label: 'Self-paced' },
    ],
    blurb:
      'Describe what you want and build it: landing pages, internal tools and full apps with logins and data — published on a link you can share.',
    cta: { label: 'Start Learning', href: '#pricing' },
  },
]

/**
 * The Claude curriculum, at overview depth.
 *
 * Deliberately not the full syllabus: each module lists what it covers, not
 * every lesson and assignment inside it. The point of the overlay is to answer
 * “what will I actually learn?” in a minute of reading — the lesson-by-lesson
 * detail is what someone gets after enrolling.
 */
export const claudeSyllabus = {
  eyebrow: 'Curriculum',
  title: 'What you learn in Claude',
  intro:
    'Eight modules, from how the model actually works to a capstone you ship. Every lesson ends in an assignment on your own work.',
  /* The same four the card carries — see featuredTool.facts. They were
     different figures describing the same course (8 modules / 41 lessons / 40
     assignments), which is not wrong but reads as a second course when the
     overlay opens straight off the card. */
  stats: ['8+ modules', '10+ projects', '5+ hours', 'Self-paced'],
  modules: [
    {
      title: 'Foundations: How AI and Claude actually work',
      meta: '8 lessons',
      topics: [
        'What generative AI is — and why sounding right is not being right',
        'Tokens, context windows, and why Claude forgets',
        'Hallucinations: why they happen and how to catch them',
        'The surfaces: Chat, Projects, Artifacts, Cowork, Code',
        'Choosing a model, and when to let Claude think longer',
      ],
    },
    {
      title: 'Working with Claude well',
      meta: '9 lessons',
      topics: [
        'The 4D framework: delegation, description, discernment, diligence',
        'Prompt craft: context, constraints, examples, chaining, iteration',
        'Spotting prompt injection hidden inside content',
        'Projects and Artifacts as a persistent workspace',
        'Skills and Plugins — teaching Claude your way, once',
      ],
    },
    {
      title: 'The visual and creative layer',
      meta: '5 lessons',
      topics: [
        'Feeding Claude screenshots, whiteboards and scanned pages',
        'Diagrams, charts and interactive Artifacts',
        'Claude Design for prototypes, decks and one-pagers',
        'Turning transcripts into structured briefs',
      ],
    },
    {
      title: 'Reaching further: data, tools and research',
      meta: '6 lessons',
      topics: [
        'Connectors and MCP — letting Claude reach your real tools',
        'Research: cited, multi-source deep dives you can verify',
        'Claude inside Chrome, Excel, Word, PowerPoint and Outlook',
        'Cowork: working sessions on your actual files',
      ],
    },
    {
      title: 'Delegation, automation and building',
      meta: '6 lessons',
      topics: [
        'Subagents, and delegating without losing the thread',
        'Scheduled and recurring tasks that run without you',
        'Claude Code: building real tools without deep coding',
        'Knowing when a specialist tool beats Claude',
      ],
    },
    {
      title: 'Devices, teams and enterprise',
      meta: '7 lessons',
      topics: [
        'Claude on mobile, desktop, and tagged into Slack',
        'API basics: system prompts and citations',
        'Team controls, data, privacy and permissions',
        'Picking the right plan — and staying AI-literate after this course',
      ],
    },
    {
      title: 'Real-world use case library',
      meta: '8 domains',
      topics: [
        'Personal productivity, inbox triage and meeting prep',
        'Reports, decks, spreadsheets and research briefs',
        'Study, freelance and small-business workflows',
        'Claude as a thinking partner: debate, red-team, pressure-test',
      ],
    },
    {
      title: 'Capstone: ship your proof of work',
      meta: '5 to choose from',
      topics: [
        'A personal AI operating system running your real week',
        'A cited research brief on a decision that matters',
        'An automation suite, or a tool built with Claude Code',
        'A visual showcase you can put in front of someone',
      ],
    },
  ],
  footnote: 'Overview only — lessons, assignments and project briefs open up when you enrol.',
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
  '1 Lakh+ Opportunities',
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
    'Individual AI tools',
    'Learn by building real projects',
    'Verified proof of practical skills',
    'Access jobs, internships & freelancing',
    '1,000+ monetization opportunities',
  ],
} as const

/* `photo` is a square portrait in public/testimonials/ — every avatar on the site follows it. */
export type Testimonial = { quote: string; name: string; role: string; photo?: string }

export const testimonials: readonly Testimonial[] = [
  {
    quote:
      'skeo gave me the structure I was missing. Three weeks later, I had a portfolio I was actually proud to send out.',
    name: 'Hareesh Guntapalli',
    photo: '/testimonials/hareesh-guntapalli.svg',
    role: 'Product Designer, Mumbai',
  },
  {
    quote:
      'I went from opening ChatGPT once a week to building automations my whole team now uses. That felt like a superpower.',
    name: 'Akhil Satwik',
    photo: '/testimonials/akhil-satwik.svg',
    role: 'Operations Lead, Singapore',
  },
  {
    quote:
      'Not another course. Actual momentum, actual output, and a community that keeps you moving.',
    name: 'Megha Reddy',
    photo: '/testimonials/megha-reddy.svg',
    role: 'Growth Marketer, London',
  },
  {
    quote:
      'The daily builds are the whole trick. Fifteen minutes is small enough that I never skipped it, and it compounded fast.',
    name: 'Mithresh Uttarwar',
    photo: '/testimonials/mithresh-uttarwar.svg',
    role: 'Founder, Lagos',
  },
  {
    quote:
      'I applied through the Job Board with three shipped projects attached. That conversation went very differently.',
    name: 'Poojitha Polagani',
    photo: '/testimonials/poojitha-polagani.svg',
    role: 'AI Ops Analyst, Lisbon',
  },
  {
    quote:
      'My team ran the 28-day tool together. We now have shared automations instead of shared bookmarks.',
    name: 'Rochan Reddy',
    photo: '/testimonials/rochan-reddy.svg',
    role: 'Engineering Manager, Bengaluru',
  },
  {
    quote:
      'I fit the builds between lectures. By the end of the semester I had six projects live and my classmates still had notes.',
    name: 'Satwika Reddy',
    photo: '/testimonials/satwika-reddy.svg',
    role: 'Final-Year CS Student, Pune',
  },
  {
    quote:
      'My internship interview turned into a demo of what I had shipped. Nobody asked about my grades.',
    name: 'Yogini Chaganti',
    photo: '/testimonials/yogini-chaganti.svg',
    role: 'Engineering Student, Madrid',
  },
]

export const faqs = [
  {
    q: 'Do I need a technical background?',
    a: 'Not at all. skeo is designed to make practical AI accessible, whether you work in design, marketing, operations, or are just getting started.',
  },
  {
    q: 'How much time does a tool take?',
    a: 'Most daily builds take 30–60 minutes. The pace is intentional: enough to make real progress without upending your life.',
  },
  {
    q: 'Are the certificates recognized?',
    a: 'Every certificate links to the actual projects and assessments behind it — so it represents concrete proof, not just completion.',
  },
  {
    q: 'Does completing a tool guarantee a job?',
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
    a: 'Yes. Every tool is revised as it shifts, and your access covers those revisions — you are not buying a snapshot of how Claude or n8n worked this quarter.',
  },
] as const
