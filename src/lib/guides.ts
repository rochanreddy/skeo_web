/**
 * The guides at /guides/<slug> — every word, in page order.
 *
 * Written for search and answer engines as much as for readers: each guide
 * opens with a one-paragraph answer to the question in its title (the part an
 * engine quotes), then the detail, then a short FAQ that is marked up exactly
 * as shown. The page, the JSON-LD and llms.txt all read from here.
 *
 * Facts about other companies' products are kept to what those products have
 * shipped and are unlikely to rename — no model version numbers and no prices,
 * which go stale within months and make a guide look abandoned.
 */

export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: readonly string[] }
  | { type: 'steps'; items: readonly { title: string; text: string }[] }
  | { type: 'table'; head: readonly string[]; rows: readonly (readonly string[])[] }

export type Guide = {
  slug: string
  /** The page's h1, and the question it answers. */
  title: string
  /** <title> and the share card; the layout appends "· skeo". */
  metaTitle: string
  description: string
  /** ISO dates. `updated` is shown on the page and marked up as dateModified. */
  published: string
  updated: string
  readMins: number
  /** The answer, first. */
  answer: string
  sections: readonly { heading: string; blocks: readonly GuideBlock[] }[]
  faq: readonly { q: string; a: string }[]
  cta: { title: string; text: string; label: string; href: string }
  keywords: readonly string[]
}

export const GUIDES: readonly Guide[] = [
  {
    slug: 'how-to-learn-n8n',
    title: 'How to learn n8n in 2026',
    metaTitle: 'How to learn n8n in 2026 — a 4-week plan for beginners',
    description:
      'A practical 4-week plan to learn n8n from zero: workflows, data and logic, AI agents, chatting with your documents and going live — no coding required.',
    published: '2026-10-26',
    updated: '2026-10-26',
    readMins: 7,
    answer:
      'n8n is a workflow automation tool: you connect apps with blocks called nodes, and work that used to be done by hand runs on its own. You can learn it in about four weeks at 30–60 minutes a day — week 1 the basics (triggers, nodes, data), week 2 logic, week 3 AI agents, week 4 chatting with your documents and putting workflows live. You do not need to code; build one small, real workflow every week instead of watching tutorials.',
    sections: [
      {
        heading: 'What is n8n?',
        blocks: [
          { type: 'p', text: 'n8n (said “n-eight-n”) lets you build automations on a visual canvas. Each workflow starts with a trigger — a form is submitted, an email arrives, it is 9am on Monday — and then runs a chain of nodes that read, change and send data between your apps.' },
          { type: 'p', text: 'It connects to hundreds of apps out of the box, and to almost anything else through its HTTP Request node. What made it popular with AI builders is its AI nodes: you can drop a language model, an AI agent with tools, or a search over your own documents straight into a workflow.' },
        ],
      },
      {
        heading: 'Do you need to know how to code?',
        blocks: [
          { type: 'p', text: 'No. Most workflows are built by dragging nodes and filling in fields. Two things help, and both are learnable in an afternoon:' },
          { type: 'list', items: [
            'Reading JSON — the shape data takes as it moves between nodes.',
            'Simple expressions — small snippets in {{ }} that pull a value from an earlier step, like a customer’s name.',
          ] },
          { type: 'p', text: 'There is a Code node for JavaScript or Python when you need it, but plenty of people use n8n for years without opening it.' },
        ],
      },
      {
        heading: 'n8n Cloud or self-hosted?',
        blocks: [
          { type: 'table', head: ['', 'n8n Cloud', 'Self-hosted'], rows: [
            ['Set-up', 'Sign up and start building', 'You run it on your own server or computer'],
            ['Cost', 'Paid plans, with a free trial', 'The Community Edition is free to run'],
            ['Upkeep', 'n8n handles updates and uptime', 'You handle updates, backups and security'],
            ['Best for', 'Learning fast, small teams', 'Developers, or data that must stay in-house'],
          ] },
          { type: 'p', text: 'For learning, start on the cloud trial or run it locally on your laptop. Decide about hosting once you have a workflow worth keeping.' },
        ],
      },
      {
        heading: 'A 4-week plan to learn n8n',
        blocks: [
          { type: 'steps', items: [
            { title: 'Week 1 — The basics', text: 'Triggers, nodes, credentials and how data flows as JSON. Build: a form that saves each reply to Google Sheets and sends you an email.' },
            { title: 'Week 2 — Data and logic', text: 'IF and Switch to branch, Merge to combine, loops over many items, and expressions to reshape data. Build: a lead tracker that sorts new leads and alerts the right person.' },
            { title: 'Week 3 — AI agents', text: 'Add a chat model, then an AI Agent node with memory and tools (search, a sheet, an API). Ask the model for structured JSON so the next node never breaks. Build: a support agent that answers common questions and hands the rest to a human.' },
            { title: 'Week 4 — Your documents, and going live', text: 'Load your PDFs into a vector store and let the agent answer from them, with sources. Then add error workflows, a human approval step before anything reaches a customer, and run it on a schedule. Build: a document chatbot your team can use.' },
          ] },
        ],
      },
      {
        heading: 'Five beginner projects worth building',
        blocks: [
          { type: 'list', items: [
            'Lead pipeline — form → AI scores the lead → message to your team → row in your CRM.',
            'Meeting notes → action items — transcript in, decisions, owners and dates out.',
            'Weekly report — numbers pulled on a schedule, a short written summary emailed every Monday.',
            'Content pipeline — one long post turned into drafts for LinkedIn, a newsletter and short tips.',
            'Document chatbot — answers questions from your own PDFs and shows where each answer came from.',
          ] },
        ],
      },
      {
        heading: 'Mistakes that slow beginners down',
        blocks: [
          { type: 'list', items: [
            'Starting with the impressive workflow instead of the boring, frequent one.',
            'Letting an AI node return free text — ask for JSON and check it.',
            'Sending anything to a customer without a human approval step.',
            'No error workflow, so a failed run goes unnoticed for days.',
            'Watching tutorials for weeks without shipping a single workflow.',
          ] },
        ],
      },
    ],
    faq: [
      { q: 'How long does it take to learn n8n?', a: 'About four weeks at 30–60 minutes a day to build useful workflows with AI agents. You will be making simple automations in your first week.' },
      { q: 'Is n8n free?', a: 'The self-hosted Community Edition is free to run. n8n Cloud is a paid service with a free trial.' },
      { q: 'Is n8n better than Zapier or Make?', a: 'n8n gives you more control, can be self-hosted and has strong AI agent features. Zapier is quicker for simple two-app automations. Pick n8n if you want to build AI workflows or keep data on your own server.' },
      { q: 'Can I get a job with n8n skills?', a: 'Automation and AI workflow skills are in demand for operations, marketing and freelance roles. A portfolio of three or four working n8n workflows, each solving a real problem, is what gets noticed.' },
    ],
    cta: {
      title: 'Learn n8n with real projects',
      text: 'Everything AI covers n8n automations and AI agents alongside Claude, ChatGPT and 50+ other tools — with projects and a certificate.',
      label: 'See Everything AI',
      href: '/campaign/everything-ai',
    },
    keywords: ['how to learn n8n', 'n8n tutorial', 'n8n for beginners', 'n8n AI agent', 'n8n course', 'workflow automation'],
  },
  {
    slug: 'claude-vs-chatgpt-for-work',
    title: 'Claude vs ChatGPT for work',
    metaTitle: 'Claude vs ChatGPT for work — which should you use, and when?',
    description:
      'Claude vs ChatGPT for real work: long documents, writing, coding, images, automation and custom assistants — a task-by-task comparison and how to choose.',
    published: '2026-10-26',
    updated: '2026-10-26',
    readMins: 6,
    answer:
      'Both are excellent, and most professionals end up using both. Claude is usually the stronger choice for long documents, careful writing and coding — Claude Code in particular. ChatGPT is broader: built-in image generation, voice, custom GPTs and a large ecosystem. Choose by your main task: mostly reading, writing and building software, start with Claude; mostly varied everyday tasks that include images, start with ChatGPT. Learn one deeply first, then add the other.',
    sections: [
      {
        heading: 'Task by task',
        blocks: [
          { type: 'table', head: ['Task', 'Claude', 'ChatGPT'], rows: [
            ['Long documents and research', 'Strong at reading long reports and contracts closely and citing what it used', 'Deep research runs multi-step web research with sources'],
            ['Writing in your voice', 'Known for natural, less formulaic writing', 'Canvas makes editing a draft together easy'],
            ['Coding', 'Claude Code works inside your real project: edits files and runs commands', 'Writes and explains code well in chat'],
            ['Images', 'Focused on text, code and analysis', 'Image generation built in'],
            ['Multi-step tasks', 'Cowork takes on tasks across your own files', 'Agent mode carries out tasks on the web'],
            ['Reusable assistants', 'Projects keep your files and instructions for every chat', 'Projects, plus custom GPTs you can share'],
            ['Connecting your tools', 'Connectors (built on MCP) link it to apps you use', 'Apps and connectors link it to your tools'],
          ] },
          { type: 'p', text: 'Both have a free plan and paid plans, and both add features often — check what the free plan includes before you decide.' },
        ],
      },
      {
        heading: 'When to pick Claude',
        blocks: [
          { type: 'list', items: [
            'Your work is reading: reports, research papers, policies, contracts.',
            'You write a lot and want drafts that need less fixing.',
            'You build software, or want to — Claude Code is one of the most capable coding tools available.',
            'You want an assistant that sticks closely to detailed instructions.',
          ] },
        ],
      },
      {
        heading: 'When to pick ChatGPT',
        blocks: [
          { type: 'list', items: [
            'You need images, voice conversations or both in the same tool.',
            'You want to build and share custom GPTs with your team.',
            'Your tasks are varied and you want one tool that does a bit of everything.',
            'Your company already uses it, so templates and habits exist.',
          ] },
        ],
      },
      {
        heading: 'The smarter answer: learn one properly',
        blocks: [
          { type: 'p', text: 'The difference between a beginner and an expert is far bigger than the difference between Claude and ChatGPT. What matters most transfers between them:' },
          { type: 'list', items: [
            'Give context: who it is for, what good looks like, an example.',
            'Keep reference files and instructions in a Project so you stop re-explaining yourself.',
            'Ask for structure — tables, checklists, step-by-step plans — and ask it to list its assumptions.',
            'Check anything that matters: numbers, names, dates and claims.',
          ] },
          { type: 'p', text: 'Pick the one that fits your main task, use it every day for a month on real work, then add the other for what it does better.' },
        ],
      },
    ],
    faq: [
      { q: 'Is Claude better than ChatGPT?', a: 'Neither is better at everything. Claude is often preferred for long documents, writing and coding; ChatGPT for images, voice, custom GPTs and breadth. The better one is the one that fits your main task.' },
      { q: 'Which is better for coding?', a: 'Claude, for most developers — especially Claude Code, which works inside your project, edits files and runs commands. ChatGPT is also strong for explaining and writing code in chat.' },
      { q: 'Can I use both?', a: 'Yes, and many professionals do. A common split is Claude for documents, writing and code, and ChatGPT for images and quick everyday questions.' },
      { q: 'Do I need a paid plan?', a: 'No. Both have free plans that are enough to learn on. Paid plans add higher limits and features like Claude Code, Cowork, deep research and agent mode.' },
    ],
    cta: {
      title: 'Get good at Claude, fast',
      text: 'The skeo Claude Course covers Chat, Projects, long-document research, Cowork and Claude Code — with four real projects and a verified certificate.',
      label: 'See the Claude Course',
      href: '/campaign/claude',
    },
    keywords: ['Claude vs ChatGPT', 'Claude or ChatGPT for work', 'is Claude better than ChatGPT', 'Claude vs ChatGPT for coding', 'best AI assistant for work'],
  },
  {
    slug: 'what-is-claude-code',
    title: 'What is Claude Code?',
    metaTitle: 'What is Claude Code? How it works and how to start',
    description:
      'Claude Code is Anthropic’s AI coding tool: describe what you want and it reads your project, edits files and runs commands. What it does, who it is for and how to start.',
    published: '2026-10-26',
    updated: '2026-10-26',
    readMins: 6,
    answer:
      'Claude Code is Anthropic’s AI coding tool. Instead of copying code in and out of a chat, you give it a task in plain English and it works inside your actual project: it reads the code, plans the change, edits files, runs commands and tests, and shows you what it did for you to review. It runs in the terminal, in editors like VS Code and JetBrains, in the Claude desktop app and on the web, and it needs a paid Claude plan or an API account.',
    sections: [
      {
        heading: 'What Claude Code does',
        blocks: [
          { type: 'list', items: [
            'Explains a codebase you have never seen: “how does login work here?”',
            'Builds features across many files at once, not one snippet at a time.',
            'Fixes bugs: reads the error, finds the cause, makes the change and runs the tests.',
            'Runs commands for you — installs, builds, tests, git — asking permission first.',
            'Writes commit messages and pull request descriptions.',
          ] },
        ],
      },
      {
        heading: 'How is it different from asking a chatbot for code?',
        blocks: [
          { type: 'table', head: ['', 'Chat', 'Claude Code'], rows: [
            ['Sees your project', 'Only what you paste in', 'Reads the files it needs itself'],
            ['Makes changes', 'You copy code back by hand', 'Edits the files directly'],
            ['Checks its work', 'You run it and report errors', 'Runs the build and tests itself'],
            ['Size of task', 'A function or a snippet', 'A feature across many files'],
          ] },
          { type: 'p', text: 'The skill shifts from typing code to directing the work: describing the task clearly, reviewing what it changed, and steering it when it goes the wrong way.' },
        ],
      },
      {
        heading: 'Who is it for?',
        blocks: [
          { type: 'p', text: 'Developers use it to move faster on real codebases. But it is also how many non-programmers now build their first working apps and internal tools: you describe what you want, and learn to read and judge what it produces. You do not need to be an expert — you do need to review the result, and to learn the basics as you go.' },
        ],
      },
      {
        heading: 'How to start with Claude Code',
        blocks: [
          { type: 'steps', items: [
            { title: 'Get access', text: 'A paid Claude plan, or an API account on the Claude Console. Install it using the instructions in Anthropic’s documentation, or use it from the Claude desktop app or the web.' },
            { title: 'Open a project', text: 'Start it in a project folder that is under git, so every change can be seen and undone.' },
            { title: 'Ask it to explain first', text: '“Explain how this project is organised.” It is the fastest way to learn a codebase and to see how Claude reads it.' },
            { title: 'Make one small change', text: 'A specific, checkable task: “add a dark mode toggle to the settings page.” Review the changes before you accept them.' },
            { title: 'Write a CLAUDE.md', text: 'A file in the project with your conventions, how to run the tests and what never to touch. Claude Code reads it at the start of every session.' },
          ] },
        ],
      },
      {
        heading: 'Tips for getting good results',
        blocks: [
          { type: 'list', items: [
            'Be specific about the outcome, and say how you will check it.',
            'For bigger work, ask for a plan first and agree it before any code is written.',
            'Keep tasks small and commit after each one that works.',
            'Read the changes. You are responsible for what goes live, not the tool.',
            'Never paste passwords or API keys into the conversation.',
          ] },
        ],
      },
    ],
    faq: [
      { q: 'Is Claude Code free?', a: 'No. It needs a paid Claude plan or an API account with usage billing. The free Claude plan does not include it.' },
      { q: 'Do I need to know how to code to use Claude Code?', a: 'It helps, but beginners do build working apps with it by describing what they want and reviewing the result. You will learn faster if you ask it to explain each change.' },
      { q: 'Where does Claude Code run?', a: 'In your terminal, in editors such as VS Code and JetBrains, in the Claude desktop app and on the web.' },
      { q: 'Is it safe to let it run commands?', a: 'By default it asks before running commands or editing files, and you can choose what it may do without asking. Work in a git project so every change can be reviewed and undone.' },
    ],
    cta: {
      title: 'Learn Claude Code from zero',
      text: 'The skeo Claude Course teaches Claude Code step by step — no coding background needed — and you finish by shipping a working web app.',
      label: 'See the Claude Course',
      href: '/campaign/claude',
    },
    keywords: ['what is Claude Code', 'Claude Code tutorial', 'how to use Claude Code', 'Claude Code for beginners', 'AI coding tool'],
  },
]

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug)
