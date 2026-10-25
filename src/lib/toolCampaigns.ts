import type { PlanKey } from '@/lib/plans'

/**
 * The single-tool campaign pages, /campaign/<tool>: one course, one price.
 *
 * Each page tells the Everything AI story at the size of one tool — what the
 * course covers, what you build with it, the certificate, the mentors, the
 * reviews, the offer and the questions people ask. The price is not here: it
 * comes from the tool's plan (lib/plans, editable in Sanity), the same number
 * checkout charges.
 *
 * Keep the copy to what the tool really does today. Features change fast, so
 * nothing here quotes a count, a limit or a plan the reader would have to pay
 * the tool's maker for unless it says so.
 */

export type ToolSlug = 'claude' | 'chatgpt' | 'grok' | 'n8n' | 'lovable'

/** The "What you'll build" drawings — see campaign/everything-ai/BuildIcons. */
type BuildKind = 'content' | 'design' | 'voice' | 'bot' | 'flow' | 'agent' | 'globe' | 'folder'

export type ToolCampaign = {
  slug: ToolSlug
  plan: PlanKey
  /** The tool's name as people write it. */
  name: string
  meta: { title: string; description: string }
  hero: {
    /** Three lines; the middle one is highlighted. */
    lines: readonly [string, string, string]
    lede: string
    checks: readonly string[]
  }
  /** What the pass in the hero lists. */
  pass: readonly string[]
  /** The /campaign/ai-showcase/<tool> hero: a one-line pitch, what the
   *  learner asks the tool in the floating chat, and the tool's own features
   *  round the laptop (an icon name from HeroScene's FEATURE_ICONS each). */
  showcase: { lede: string; ask: string; features: readonly { label: string; icon: string }[] }
  learn: { title: string; modules: readonly { title: string; body: string; build: string; isNew?: boolean }[] }
  build: { title: string; items: readonly { icon: BuildKind; title: string; body: string }[] }
  certificate: string
  offer: { items: readonly string[] }
  faq: readonly { q: string; a: string }[]
}

/* Asked on every page, answered the same way. */
const COMMON_FAQ = [
  { q: 'Is this a subscription?', a: 'No. You pay once and the course is yours — no renewals.' },
  { q: 'When do I get access?', a: 'Straight after payment. Your login arrives by email within a few minutes.' },
] as const

export const TOOL_CAMPAIGNS: Record<ToolSlug, ToolCampaign> = {
  claude: {
    slug: 'claude',
    plan: 'claude',
    name: 'Claude',
    meta: {
      title: 'Claude Course — Chat, Projects, Cowork and Claude Code',
      description:
        'Learn Claude for real work: prompts and Projects, long-document research, Cowork on your own files, and building software with Claude Code. One-time payment, certificate included.',
    },
    hero: {
      lines: ['Stop chatting.', 'Work with Claude.', 'Ship real things.'],
      lede: 'Chat, Projects, Cowork and Claude Code — learn how people actually get work done with Claude, from a 60-page report to a working app.',
      checks: ['Beginner Friendly', 'Certificate', 'Real Projects'],
    },
    pass: ['6 Modules', '4 Projects', 'Chat & Projects', 'Cowork', 'Claude Code', 'Certificate'],
    showcase: {
      lede: 'Chat, Projects, Cowork & Claude Code — from first prompt to a shipped app. No coding needed.',
      ask: 'Read this 60-page report and give me the 5 decisions',
      features: [
        { label: 'Chat', icon: 'chat' },
        { label: 'Projects', icon: 'folder' },
        { label: 'Research', icon: 'read' },
        { label: 'Cowork', icon: 'laptop' },
        { label: 'Claude Code', icon: 'terminal' },
        { label: 'Connectors', icon: 'plug' },
      ],
    },
    learn: {
      title: 'Every way to work with Claude.',
      modules: [
        { title: 'Claude Foundations', body: 'The models, the apps, and what Claude is best at.', build: 'Your Claude workspace' },
        { title: 'Prompts & Projects', body: 'Instructions and files Claude keeps for every chat.', build: 'A reusable Project' },
        { title: 'Research & Long Documents', body: 'Read, compare and summarise long files with sources.', build: 'A research brief' },
        { title: 'Claude Cowork', body: 'Hand Claude multi-step tasks on your own files.', build: 'A weekly report, done for you', isNew: true },
        { title: 'Claude Code', body: 'Describe what you want; Claude writes and runs the code.', build: 'A working web app' },
        { title: 'Connectors & Automations', body: 'Connect Claude to your tools so it works where you do.', build: 'A connected assistant' },
      ],
    },
    build: {
      title: 'Four projects, all with Claude.',
      items: [
        { icon: 'content', title: 'A Research Brief', body: 'Long reports read, compared and summarised.' },
        { icon: 'bot', title: 'A Project Assistant', body: 'Knows your files, answers like your team.' },
        { icon: 'flow', title: 'A Cowork Routine', body: 'A weekly task Claude now does for you.' },
        { icon: 'globe', title: 'A Web App', body: 'Built and shipped with Claude Code.' },
      ],
    },
    certificate: 'Finish the projects and earn a verified Claude certificate that shows what you can actually do with it.',
    offer: { items: ['6 Modules', '4 Projects', 'Chat & Projects', 'Claude Cowork', 'Claude Code', 'Certificate'] },
    faq: [
      { q: 'Do I need a paid Claude plan?', a: 'You can start on the free plan. Some features, like Cowork and Claude Code, need a paid Claude plan — each lesson says when.' },
      { q: 'Do I need to know how to code?', a: 'No. Claude Code is taught from zero: you describe what you want and learn to guide Claude as it builds.' },
      ...COMMON_FAQ,
      { q: 'Do I get a certificate?', a: 'Yes. Complete the projects and you get a verified Claude certificate.' },
    ],
  },

  chatgpt: {
    slug: 'chatgpt',
    plan: 'chatgpt',
    name: 'ChatGPT',
    meta: {
      title: 'ChatGPT Course — Projects, custom GPTs, deep research and agent mode',
      description:
        'Go past simple prompts: organise work in Projects, draft in Canvas, build custom GPTs, run deep research with sources and hand tasks to agent mode. One-time payment, certificate included.',
    },
    hero: {
      lines: ['You use ChatGPT.', 'Now master it.', 'Get hours back.'],
      lede: 'Projects, Canvas, custom GPTs, deep research, images and agent mode — the parts of ChatGPT most people never open, taught on real work.',
      checks: ['Beginner Friendly', 'Certificate', 'Real Projects'],
    },
    pass: ['6 Modules', '4 Projects', 'Custom GPTs', 'Deep Research', 'Agent Mode', 'Certificate'],
    showcase: {
      lede: 'Projects, custom GPTs, deep research & agent mode — the parts of ChatGPT most people never open.',
      ask: 'Compare my top 5 competitors, with sources',
      features: [
        { label: 'Projects', icon: 'folder' },
        { label: 'Canvas', icon: 'pen' },
        { label: 'Custom GPTs', icon: 'bot' },
        { label: 'Deep Research', icon: 'search' },
        { label: 'Images', icon: 'image' },
        { label: 'Agent mode', icon: 'pointer' },
      ],
    },
    learn: {
      title: 'From quick answers to finished work.',
      modules: [
        { title: 'ChatGPT Foundations', body: 'Models, memory and custom instructions, set up right.', build: 'Your ChatGPT setup' },
        { title: 'Projects & Canvas', body: 'Keep chats and files together; edit drafts side by side.', build: 'A writing workspace' },
        { title: 'Custom GPTs', body: 'Package your instructions and files into a GPT.', build: 'Your own GPT' },
        { title: 'Deep Research', body: 'Multi-step research that comes back with sources.', build: 'A cited market report' },
        { title: 'Images, Files & Data', body: 'Create images and get answers from spreadsheets.', build: 'A visual content kit' },
        { title: 'Agent Mode', body: 'Hand ChatGPT longer tasks that take many steps.', build: 'A task it runs for you', isNew: true },
      ],
    },
    build: {
      title: 'Four projects, all with ChatGPT.',
      items: [
        { icon: 'bot', title: 'A Custom GPT', body: 'Your instructions and files, in one assistant.' },
        { icon: 'agent', title: 'A Research Report', body: 'Deep research, every claim with a source.' },
        { icon: 'content', title: 'A Content Kit', body: 'Posts, emails and images in your voice.' },
        { icon: 'flow', title: 'An Agent Task', body: 'A chore ChatGPT now finishes on its own.' },
      ],
    },
    certificate: 'Finish the projects and earn a verified ChatGPT certificate that shows what you can actually do with it.',
    offer: { items: ['6 Modules', '4 Projects', 'Custom GPTs', 'Deep Research', 'Agent Mode', 'Certificate'] },
    faq: [
      { q: 'Do I need ChatGPT Plus?', a: 'You can start on the free plan. Some features, like agent mode, need a paid ChatGPT plan — each lesson says when.' },
      { q: 'I already use ChatGPT. Is this too basic?', a: 'The first module sets things up properly; the rest is Projects, GPTs, deep research and agent mode, which most daily users never touch.' },
      ...COMMON_FAQ,
      { q: 'Do I get a certificate?', a: 'Yes. Complete the projects and you get a verified ChatGPT certificate.' },
    ],
  },

  grok: {
    slug: 'grok',
    plan: 'grok',
    name: 'Grok',
    meta: {
      title: 'Grok Course — live research from X and Grok Bots that work for you',
      description:
        'Learn Grok for real work: live answers from X and the web, research you can check, images with Grok Imagine, and Grok Bots that take on your routines. One-time payment, certificate included.',
    },
    hero: {
      lines: ['What’s happening now?', 'Ask Grok.', 'Then let it work.'],
      lede: 'Live answers from X and the web, and Grok Bots — always-on AI agents you message like a coworker and teach a routine once.',
      checks: ['Beginner Friendly', 'Certificate', 'Real Projects'],
    },
    pass: ['6 Modules', '4 Projects', 'Live X Research', 'Grok Imagine', 'Grok Bots', 'Certificate'],
    showcase: {
      lede: 'Live answers from X & the web, Grok Imagine, and Grok Bots that run your routines.',
      ask: 'What is X saying about our launch today?',
      features: [
        { label: 'Live from X', icon: 'radio' },
        { label: 'DeepSearch', icon: 'search' },
        { label: 'Imagine', icon: 'image' },
        { label: 'Grok Bots', icon: 'bot' },
        { label: 'Routines', icon: 'repeat' },
        { label: 'Team bots', icon: 'users' },
      ],
    },
    learn: {
      title: 'From live answers to bots that work.',
      modules: [
        { title: 'Grok Foundations', body: 'Grok on the web, the app and X, and its modes.', build: 'Your Grok setup' },
        { title: 'Live Research', body: 'What people on X and the web say, right now.', build: 'A daily trend brief' },
        { title: 'Research You Can Check', body: 'Longer research with the posts and pages behind it.', build: 'A cited deep dive' },
        { title: 'Grok Imagine', body: 'Images and short clips from a line of text.', build: 'A visual set for a post' },
        { title: 'Grok Bots', body: 'Message a bot like a coworker; teach it a routine once.', build: 'Your first Grok Bot', isNew: true },
        { title: 'Bots for a Team', body: 'Run bots side by side and bring them into Slack.', build: 'A team bot in Slack', isNew: true },
      ],
    },
    build: {
      title: 'Four projects, all with Grok.',
      items: [
        { icon: 'globe', title: 'A Trend Tracker', body: 'What X is saying about your topic, daily.' },
        { icon: 'agent', title: 'A Cited Deep Dive', body: 'Research with every source linked.' },
        { icon: 'design', title: 'A Visual Set', body: 'Images and clips made with Grok Imagine.' },
        { icon: 'bot', title: 'A Grok Bot', body: 'An always-on agent that runs your routine.' },
      ],
    },
    certificate: 'Finish the projects and earn a verified Grok certificate that shows what you can actually do with it.',
    offer: { items: ['6 Modules', '4 Projects', 'Live X Research', 'Grok Imagine', 'Grok Bots', 'Certificate'] },
    faq: [
      { q: 'Do I need a paid Grok or X plan?', a: 'You can start free. Grok Bots and some heavier features come with xAI’s paid plans — each lesson says when.' },
      { q: 'What is a Grok Bot?', a: 'An AI agent from xAI that stays on: you message it like a coworker, show it a routine once, and it keeps doing it.' },
      ...COMMON_FAQ,
      { q: 'Do I get a certificate?', a: 'Yes. Complete the projects and you get a verified Grok certificate.' },
    ],
  },

  n8n: {
    slug: 'n8n',
    plan: 'n8n',
    name: 'n8n',
    meta: {
      title: 'n8n Course — automations and AI agents, without writing code',
      description:
        'Learn n8n from zero: workflows that run on their own, AI agents with memory and tools, RAG over your documents, and human approval before anything goes out. One-time payment, certificate included.',
    },
    hero: {
      lines: ['Stop doing it by hand.', 'Automate it with n8n.', 'Add AI agents.'],
      lede: 'Workflows that run on their own, AI agents with memory and tools, and chatbots that answer from your documents — built visually, no code needed.',
      checks: ['No Code Needed', 'Certificate', 'Real Projects'],
    },
    pass: ['6 Modules', '4 Projects', 'Workflows', 'AI Agents', 'RAG Chatbots', 'Certificate'],
    showcase: {
      lede: 'Workflows that run themselves & AI agents with memory and tools. Built visually, no code.',
      ask: 'When a lead fills the form, reply and add them to my CRM',
      features: [
        { label: 'Triggers', icon: 'zap' },
        { label: 'Workflows', icon: 'workflow' },
        { label: 'AI Agent', icon: 'bot' },
        { label: 'Memory', icon: 'database' },
        { label: 'RAG', icon: 'filesearch' },
        { label: 'Approvals', icon: 'check' },
      ],
    },
    learn: {
      title: 'From one trigger to AI agents.',
      modules: [
        { title: 'n8n Foundations', body: 'Nodes, triggers and runs; cloud or self-hosted.', build: 'Your n8n workspace' },
        { title: 'Your First Workflows', body: 'Connect Gmail, Sheets, Slack and forms.', build: 'A lead capture flow' },
        { title: 'Data & Logic', body: 'Filter, branch, merge and reshape data, no code.', build: 'A daily report' },
        { title: 'AI Agents', body: 'The AI Agent node with tools and memory.', build: 'A support agent', isNew: true },
        { title: 'Chat With Your Documents', body: 'RAG: store documents in a vector store and ask them.', build: 'A docs chatbot', isNew: true },
        { title: 'Approvals & Going Live', body: 'Human sign-off, error alerts and running for real.', build: 'A flow with approval' },
      ],
    },
    build: {
      title: 'Four projects, all with n8n.',
      items: [
        { icon: 'flow', title: 'A Lead Pipeline', body: 'Form to CRM to inbox, without a click.' },
        { icon: 'agent', title: 'An AI Support Agent', body: 'Reads the question, checks, replies.' },
        { icon: 'bot', title: 'A Docs Chatbot', body: 'Answers from your own documents.' },
        { icon: 'content', title: 'A Content Pipeline', body: 'Drafted by AI, approved by you, posted.' },
      ],
    },
    certificate: 'Finish the projects and earn a verified n8n certificate that shows what you can actually do with it.',
    offer: { items: ['6 Modules', '4 Projects', 'Workflows', 'AI Agents', 'RAG Chatbots', 'Certificate'] },
    faq: [
      { q: 'Do I need to know how to code?', a: 'No. n8n is visual: you connect nodes. Where a line of logic helps, the lesson shows exactly what to write.' },
      { q: 'Do I need to pay for n8n?', a: 'No. You can follow along on n8n’s free trial or run n8n yourself for free; the course shows both.' },
      ...COMMON_FAQ,
      { q: 'Do I get a certificate?', a: 'Yes. Complete the projects and you get a verified n8n certificate.' },
    ],
  },

  lovable: {
    slug: 'lovable',
    plan: 'lovable',
    name: 'Lovable',
    meta: {
      title: 'Lovable Course — build and ship a web app from a prompt',
      description:
        'Learn Lovable from idea to live app: design the screens, add logins and a database with Supabase, sync the code to GitHub and publish on your own link. One-time payment, certificate included.',
    },
    hero: {
      lines: ['Have an app idea?', 'Build it with Lovable.', 'Ship it this week.'],
      lede: 'Describe it, and Lovable builds it — screens, logins, a database and a live link. Learn to steer it from first prompt to launch.',
      checks: ['No Code Needed', 'Certificate', 'Real Projects'],
    },
    pass: ['6 Modules', '4 Projects', 'Prompt to App', 'Supabase', 'GitHub', 'Certificate'],
    showcase: {
      lede: 'Describe it and Lovable builds it — screens, logins, a database and a live link. No code.',
      ask: 'Build a booking app for my salon, with logins',
      features: [
        { label: 'Prompt', icon: 'chat' },
        { label: 'Design', icon: 'palette' },
        { label: 'Supabase', icon: 'database' },
        { label: 'Logins', icon: 'lock' },
        { label: 'GitHub sync', icon: 'branch' },
        { label: 'Publish', icon: 'globe' },
      ],
    },
    learn: {
      title: 'From a prompt to a live app.',
      modules: [
        { title: 'Lovable Foundations', body: 'How Lovable builds, and prompts that steer it.', build: 'Your first app' },
        { title: 'Design the Screens', body: 'Layouts, styles and visual edits that look right.', build: 'A landing page' },
        { title: 'Logins & a Database', body: 'Supabase for sign-up, accounts and saved data.', build: 'An app with accounts' },
        { title: 'Features & Integrations', body: 'Forms, uploads, payments and APIs.', build: 'A booking app' },
        { title: 'Own Your Code', body: 'Sync to GitHub and keep every change.', build: 'Your code on GitHub' },
        { title: 'Publish & Launch', body: 'Go live on a lovable.app link or your own domain.', build: 'A live product' },
      ],
    },
    build: {
      title: 'Four projects, all with Lovable.',
      items: [
        { icon: 'globe', title: 'A Landing Page', body: 'Designed, built and live in an afternoon.' },
        { icon: 'design', title: 'A Booking App', body: 'Accounts, a database and forms that work.' },
        { icon: 'content', title: 'An Internal Tool', body: 'A dashboard your team actually uses.' },
        { icon: 'folder', title: 'A Portfolio', body: 'Your work, on your own link.' },
      ],
    },
    certificate: 'Finish the projects and earn a verified Lovable certificate that shows what you can actually do with it.',
    offer: { items: ['6 Modules', '4 Projects', 'Prompt to App', 'Logins & Database', 'GitHub Sync', 'Certificate'] },
    faq: [
      { q: 'Do I need to know how to code?', a: 'No. You build by describing what you want. You will learn to read what Lovable makes, but never have to write it.' },
      { q: 'Do I need a paid Lovable plan?', a: 'You can start on the free plan. A custom domain and heavier use need a paid Lovable plan — each lesson says when.' },
      ...COMMON_FAQ,
      { q: 'Do I get a certificate?', a: 'Yes. Complete the projects and you get a verified Lovable certificate.' },
    ],
  },
}

export const TOOL_SLUGS = Object.keys(TOOL_CAMPAIGNS) as ToolSlug[]

const list = (xs: readonly string[]) =>
  xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs.join('')

/**
 * A tool page's FAQ as shown and as marked up: one answer-first question on
 * what the course covers, written from the modules and projects above so it
 * can never disagree with them, then the hand-written ones. "What does the
 * n8n course cover?" is the question people put to search and answer engines;
 * this is the page answering it in one quotable paragraph.
 */
export function toolFaq(c: ToolCampaign): readonly { q: string; a: string }[] {
  const modules = c.learn.modules.map((m) => m.title)
  const projects = c.build.items.map((b) => b.title.replace(/^(A|An) /, ''))
  return [
    {
      q: `What does the ${c.name} course cover?`,
      a: `${modules.length} modules: ${list(modules)}. Along the way you build ${projects.length} projects — ${list(projects)} — and earn a verified ${c.name} certificate. It is self-paced, with a one-time payment.`,
    },
    ...c.faq,
  ]
}
