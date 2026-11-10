import { claudeSyllabus, toolLibrary } from './content'

/**
 * Every tool's curriculum, at overview depth: what each module covers, not
 * every lesson in it. Claude's lives in content.ts (llms.txt reads it too);
 * the other four are here, from the Skeo tool content document. Module
 * titles and lesson counts follow that document; lessons, assignments and
 * project briefs open up after enrolling.
 */

export type Syllabus = {
  eyebrow: string
  title: string
  intro: string
  stats: readonly string[]
  modules: readonly { title: string; meta: string; topics: readonly string[] }[]
  footnote: string
  cta: { label: string; href: string }
}

const footnote = claudeSyllabus.footnote
const cta = claudeSyllabus.cta

/* The card's own four figures, so the overlay and the card it opens from agree. */
const statsOf = (id: string) => toolLibrary.find((t) => t.id === id)?.facts.map((f) => f.label) ?? []

const chatgpt: Syllabus = {
  eyebrow: 'Curriculum',
  title: 'What you learn in ChatGPT',
  intro:
    'Nine modules, from setting ChatGPT up properly to a live build other people use. Every lesson ends in an assignment on your own work.',
  stats: statsOf('chatgpt'),
  modules: [
    {
      title: 'Start: setting up ChatGPT the right way',
      meta: '4 lessons',
      topics: [
        'One app, three modes: Chat, Work and Codex',
        'Where ChatGPT lives: web, mobile and desktop',
        'Plans, models and limits, and the Think slider',
        'Personalisation, memory and privacy controls',
      ],
    },
    {
      title: 'Core: everyday features, mastered',
      meta: '6 lessons',
      topics: [
        'Prompts that work: context, goal, format, audience',
        'Search for live, sourced answers',
        'Deep research: cited, multi-source investigations',
        'Files, data and analysis: clean sheets, charts and insights',
        'Vision, voice and audio: images, notes and recordings in',
      ],
    },
    {
      title: 'Advanced: power features most people never touch',
      meta: '5 lessons',
      topics: [
        'Image generation and editing, in one consistent style',
        'Projects as a persistent workspace',
        'Documents and Slides, plus the Word and PowerPoint add-ins',
        'Advanced prompting, and ChatGPT as a thinking partner',
      ],
    },
    {
      title: 'Connect: ChatGPT and your tools',
      meta: '3 lessons',
      topics: [
        'Plugins: Drive, Gmail, Calendar, Slack, Notion, Canva and more',
        'Filling the gaps with external video, design and automation tools',
        'ChatGPT inside other apps and the built-in browser',
      ],
    },
    {
      title: 'Automate: letting ChatGPT work for you',
      meta: '4 lessons',
      topics: [
        'ChatGPT Work: delegating real multi-step tasks',
        'Scheduled tasks that run without you',
        'Dots: always-on agents with rules and check-ins',
        'Work, scheduled task or dot: choosing the right one',
      ],
    },
    {
      title: 'Build: making real things',
      meta: '4 lessons',
      topics: [
        'Plugins you build yourself, now that custom GPTs are retiring',
        'Sites: web apps and dashboards from a prompt',
        'Codex: vibe-building small tools without deep coding',
        'Bonus builds: quizzes, games and calculators',
      ],
    },
    {
      title: 'Ship: going live',
      meta: '3 lessons',
      topics: [
        'Publishing and sharing: private, team or public',
        'Shipping safely: verify numbers, data and permissions',
        'Responsible use, and positioning it in your career',
      ],
    },
    {
      title: 'Real-world use case library',
      meta: '8 domains',
      topics: [
        'Personal productivity, work and office tasks',
        'Students, job seekers and freelancers',
        'Content creators and small businesses',
        'Automation thinking: Work, scheduled tasks, dots or external tools',
      ],
    },
    {
      title: 'Capstone: ship your proof of work',
      meta: '5 to choose from',
      topics: [
        'An AI work system running 3 real weekly tasks',
        'A live Site used by at least one real person',
        'A content engine, from research to video to deck',
        'A research brief turned into Slides and a Site, or a delegated workflow',
      ],
    },
  ],
  footnote,
  cta,
}

const grok: Syllabus = {
  eyebrow: 'Curriculum',
  title: 'What you learn in Grok & Grok Bot',
  intro:
    'Nine modules, from real-time research on the web and X to Grok Bot agents that do the work in your apps. Every lesson ends in an assignment on your own work.',
  stats: statsOf('grok'),
  modules: [
    {
      title: 'Start: what Grok is and getting set up',
      meta: '4 lessons',
      topics: [
        'Grok, Imagine, Grok Bot and Grok Build: what each is for',
        'Where Grok lives: web, mobile, inside X and the Bot apps',
        'Plans, the weekly usage pool and costs',
        'Personalisation, memory and privacy, and your first trend brief',
      ],
    },
    {
      title: 'Core: everyday features, mastered',
      meta: '5 lessons',
      topics: [
        'Fast and Expert thinking modes',
        'Real-time search across the web and X',
        'Deep research, and a fact-check routine you can trust',
        'Files, documents and vision: contracts, bills and screenshots',
        'Voice for brainstorming, practice and live questions',
      ],
    },
    {
      title: 'Advanced: power features',
      meta: '5 lessons',
      topics: [
        'Grok Imagine: images in one consistent style',
        'Grok Imagine: short videos with motion and sound',
        'Projects, memory and persistent context',
        'Prompting for trends, sentiment, competitors and fact-checks',
        'Grok on X: threads, fact-checks and viral posts',
      ],
    },
    {
      title: 'Connect: Grok and your tools',
      meta: '3 lessons',
      topics: [
        'Connectors: Gmail, Calendar, Drive, Outlook, Salesforce and more',
        'MCP: extending Grok Bot with more tools',
        'When to hand off to Canva, n8n, Lovable, Claude or ChatGPT',
      ],
    },
    {
      title: 'Automate: Grok Bot agents',
      meta: '5 lessons',
      topics: [
        'What a Bot is: a named AI teammate with its own cloud computer',
        'Setting up your first Bot',
        'Routines: work that runs on its own',
        'Bot teams that delegate to each other',
        'Agent safety: permissions and approvals',
      ],
    },
    {
      title: 'Build: real systems',
      meta: '4 lessons',
      topics: [
        'Designing a system before building it',
        'Build one: trend intelligence, content engine, competitor watch and more',
        'Grok Build, the coding agent (optional)',
        'Testing your system with real, messy inputs',
      ],
    },
    {
      title: 'Ship: going live',
      meta: '5 lessons',
      topics: [
        'Publishing to X and social, with sources',
        'Delivering work to others through routines',
        'Verifying before you ship, and controlling usage and cost',
        'Responsible use, and positioning it in your career',
      ],
    },
    {
      title: 'Real-world use case library',
      meta: '8 domains',
      topics: [
        'Personal productivity, students and job seekers',
        'Content creators and marketers',
        'Freelancers, agencies and small businesses',
        'Automation thinking: chat, Bot or routine',
      ],
    },
    {
      title: 'Capstone: ship your proof of work',
      meta: '5 to choose from',
      topics: [
        'A trend intelligence system delivering weekly reports',
        'A content engine, from trend to published post',
        'A competitor watch, or a personal ops Bot with approval rules',
        'A cross-tool build: Grok researches, Lovable or n8n acts',
      ],
    },
  ],
  footnote,
  cta,
}

const n8n: Syllabus = {
  eyebrow: 'Curriculum',
  title: 'What you learn in n8n',
  intro:
    'Nine modules, from your first workflow to AI agents running real systems around the clock. Every lesson ends in an assignment on your own work.',
  stats: statsOf('n8n'),
  modules: [
    {
      title: 'Start: what n8n is and getting set up',
      meta: '7 lessons',
      topics: [
        'Workflows, triggers and nodes, and where n8n fits beside AI chat',
        'Cloud or self-hosted, plans and executions',
        'Installing, running and updating n8n locally with Docker',
        'Local vs live: tunnels, Cloud or a small server',
        'A tour of the editor, and your first workflow in 10 minutes',
      ],
    },
    {
      title: 'Core: how workflows think',
      meta: '6 lessons',
      topics: [
        'Triggers: manual, schedule, app, webhook, form and chat',
        'Nodes, items, data flow and pinned data',
        'Expressions and transforming messy data',
        'Logic: If, Switch, Merge, Wait and AI routing',
        'Credentials and built-in Data Tables',
      ],
    },
    {
      title: 'Advanced: power features',
      meta: '5 lessons',
      topics: [
        'Loops and batching around rate limits',
        'Sub-workflows: build once, reuse everywhere',
        'Error handling: retries, error branches and alert workflows',
        'Organising and versioning large workflows',
        'Building with n8n Assistant',
      ],
    },
    {
      title: 'Connect: n8n and your world',
      meta: '5 lessons',
      topics: [
        'Your everyday app stack: Google, Microsoft, Slack, Notion and more',
        'Messaging: WhatsApp, Telegram, Slack and Discord',
        'Any app, through webhooks and HTTP Request',
        'AI models inside n8n: text, vision, image, video and audio',
        'MCP: connecting agents to tools, both ways',
      ],
    },
    {
      title: 'Automate: AI workflows and agents',
      meta: '5 lessons',
      topics: [
        'AI steps in a workflow, with structured output',
        'The AI Agent node: model, prompt, memory and tools',
        'Knowledge and RAG: AI that answers from your documents',
        'n8n Agents: build once, use anywhere',
        'Human-in-the-loop approvals before action',
      ],
    },
    {
      title: 'Build: real systems',
      meta: '3 lessons',
      topics: [
        'Designing an automation before building it',
        'Build one: lead engine, content pipeline, support bot and more',
        'Testing like a pro, edge cases included',
      ],
    },
    {
      title: 'Ship: going live',
      meta: '5 lessons',
      topics: [
        'Publishing workflows, with test and live URLs',
        'Embedding forms and chatbots, and sharing workflows',
        'Monitoring and proving value with time saved',
        'Shipping safely and controlling cost',
        'Responsible automation, and positioning it in your career',
      ],
    },
    {
      title: 'Real-world use case library',
      meta: '8 domains',
      topics: [
        'Personal productivity, work and office',
        'Students, freelancers and content creators',
        'Small business, sales and marketing',
        'Automation thinking: workflow or agent, and when not to automate',
      ],
    },
    {
      title: 'Capstone: ship your proof of work',
      meta: '5 to choose from',
      topics: [
        'A live lead engine with time-saved tracking',
        'An AI support agent on a real page, with human handoff',
        'A daily intelligence system, or a content pipeline end to end',
        'A cross-tool build: Claude or ChatGPT triggering n8n through MCP',
      ],
    },
  ],
  footnote,
  cta,
}

const lovable: Syllabus = {
  eyebrow: 'Curriculum',
  title: 'What you learn in Lovable',
  intro:
    'Nine modules, from your first app in ten minutes to a live product with logins, payments and real users. Every lesson ends in an assignment on your own work.',
  stats: statsOf('lovable'),
  modules: [
    {
      title: 'Start: what Lovable is and getting set up',
      meta: '4 lessons',
      topics: [
        'Real web apps from plain language, with code you own',
        'Plans, credits and costs',
        'Workspace, devices and privacy',
        'Your first app in 10 minutes',
      ],
    },
    {
      title: 'Core: building with Lovable day to day',
      meta: '5 lessons',
      topics: [
        'The three modes: Chat, Plan and Build',
        'Prompting an app: outcomes and users, not code',
        'Visual edits, design systems and Figma import',
        'Iterating safely with versions, drafts and restore',
        'Files, images and generated assets',
      ],
    },
    {
      title: 'Advanced: power features',
      meta: '4 lessons',
      topics: [
        'Project knowledge and Skills: teaching Lovable your way',
        'Big builds: goal runs and subagents',
        'Debugging by prompt, with browser testing',
        'Chats as your thinking and planning partner',
      ],
    },
    {
      title: 'Connect: backend, data and external tools',
      meta: '6 lessons',
      topics: [
        'Lovable Cloud: database, accounts, storage and server logic',
        'Users, login and admin roles',
        'Storage, app emails and scheduled jobs',
        'Payments with Stripe or Paddle',
        'Connectors, plus Git sync and export',
      ],
    },
    {
      title: 'Automate: AI features and agent-ready apps',
      meta: '5 lessons',
      topics: [
        'Adding AI features without API keys',
        'Multimodal AI: images, video, voice and music',
        'Smart search, RAG and decisions',
        'Automations inside your app',
        'Agent-ready apps that Claude and ChatGPT can use',
      ],
    },
    {
      title: 'Build: real products',
      meta: '3 lessons',
      topics: [
        'Spec before you build',
        'Build one: booking app, client portal, AI micro-SaaS and more',
        'Testing like a real user, on desktop and mobile',
      ],
    },
    {
      title: 'Ship: going live and getting users',
      meta: '7 lessons',
      topics: [
        'Publishing, and connecting a custom domain',
        'SEO, AI search and social previews',
        'Security scans and a Trust Center',
        'Analytics, growth and cost control for live apps',
        'Responsible building, and positioning it in your career',
      ],
    },
    {
      title: 'Real-world use case library',
      meta: '8 domains',
      topics: [
        'Personal projects and student tools',
        'Freelancers and content creators',
        'Small businesses, startups and teams',
        'Building thinking: Lovable, Claude Artifacts, ChatGPT Sites or n8n',
      ],
    },
    {
      title: 'Capstone: ship your proof of work',
      meta: '5 to choose from',
      topics: [
        'A live product on a custom domain with real users',
        'An AI micro-SaaS with payments and a usage limit',
        'A business booking system, or an agent-ready tool',
        'A launch campaign with 7 days of visitor results',
      ],
    },
  ],
  footnote,
  cta,
}

const SYLLABI: Record<string, Syllabus> = { claude: claudeSyllabus, chatgpt, grok, n8n, lovable }

/** A tool's curriculum by its id in the tool library; Claude's when unknown. */
export function syllabusFor(id: string | undefined): Syllabus {
  return (id && SYLLABI[id]) || claudeSyllabus
}
