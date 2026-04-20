"use client"

import { motion } from "motion/react"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

function V0Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      <path d="M14.066 6.028v2.22h5.729q.075-.001.148.005l-5.853 5.752a2 2 0 01-.024-.309V8.247h-2.353v5.45c0 2.322 1.935 4.222 4.258 4.222h5.675v-2.22h-5.675q-.03 0-.059-.003l5.729-5.629q.006.082.006.166v5.465H24v-5.465a4.204 4.204 0 00-4.205-4.205zM0 8.245l8.28 9.266c.839.94 2.396.346 2.396-.914V8.245H8.19v5.44l-4.86-5.44z" />
    </svg>
  )
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
      <path d="M12 1.608l12 20.784H0z" />
    </svg>
  )
}

function ZeroToAgentLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 608 99" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.920054 81.0244V71.1489L43.5645 10.7733H2.37894V1.34664H54.5623V11.2222L11.9178 71.5977H55.6845V81.0244H0.920054ZM81.2396 82.3711C64.4063 82.3711 53.9696 70.1389 53.9696 51.2855C53.9696 32.4322 64.4063 20.2 80.7907 20.2C96.2774 20.2 107.051 31.4222 107.051 51.3977V54.2033H63.8452C64.5185 66.9966 70.9152 73.3933 81.2396 73.3933C88.9829 73.3933 94.0329 69.4655 96.0529 63.4055L106.153 64.1911C103.011 74.8522 93.8085 82.3711 81.2396 82.3711ZM63.8452 45.8989H96.7263C95.8285 34.4522 89.544 29.1777 80.7907 29.1777C71.5885 29.1777 65.4163 34.9011 63.8452 45.8989ZM112.525 81.0244V21.5466H120.829L121.166 32.5444C123.298 25.0255 128.012 21.5466 135.306 21.5466H141.142V30.5244H135.418C126.441 30.5244 121.952 35.35 121.952 45.1133V81.0244H112.525ZM167.611 82.3711C151.115 82.3711 140.341 70.2511 140.341 51.2855C140.341 32.32 151.115 20.2 167.611 20.2C183.996 20.2 194.769 32.32 194.769 51.2855C194.769 70.2511 183.996 82.3711 167.611 82.3711ZM167.611 73.3933C178.497 73.3933 184.893 65.0889 184.893 51.2855C184.893 37.4822 178.497 29.1777 167.611 29.1777C156.613 29.1777 150.217 37.4822 150.217 51.2855C150.217 65.0889 156.613 73.3933 167.611 73.3933ZM248.438 81.0244C237.665 81.0244 232.615 76.3111 232.615 65.7622V29.8511H223.862V21.5466H232.615V7.63108H242.042V21.5466H257.865V29.8511H242.042V65.5377C242.042 70.9244 244.398 72.72 249.336 72.72H257.865V81.0244H248.438ZM284.796 82.3711C268.299 82.3711 257.526 70.2511 257.526 51.2855C257.526 32.32 268.299 20.2 284.796 20.2C301.18 20.2 311.954 32.32 311.954 51.2855C311.954 70.2511 301.18 82.3711 284.796 82.3711ZM284.796 73.3933C295.681 73.3933 302.078 65.0889 302.078 51.2855C302.078 37.4822 295.681 29.1777 284.796 29.1777C273.798 29.1777 267.401 37.4822 267.401 51.2855C267.401 65.0889 273.798 73.3933 284.796 73.3933Z" fill="#ADAEB2" />
      <path d="M376.089 42.6444V29.8511H371.824V17.0577H363.295V29.8511H359.031V42.6444H354.767V46.9089H380.353V42.6444H376.089ZM337.709 81.0244V68.2311H341.973V55.4377H346.238V42.6444H350.502V29.8511H354.767V17.0577H359.031V8.52886H363.295V-3.12715e-05H371.824V8.52886H376.089V17.0577H380.353V29.8511H384.618V42.6444H388.882V55.4377H393.147V68.2311H397.411V81.0244H388.882V68.2311H384.618V55.4377H350.502V68.2311H346.238V81.0244H337.709ZM407.219 68.2311V63.9666H402.955V34.1155H407.219V29.8511H411.483V25.5866H415.748V21.3222H437.07V25.5866H441.335V29.8511H420.012V34.1155H415.748V38.38H411.483V59.7022H415.748V63.9666H420.012V68.2311H441.335V72.4955H437.07V76.76H415.748V72.4955H411.483V68.2311H407.219ZM402.955 89.5533V81.0244H411.483V85.2889H415.748V89.5533H441.335V85.2889H445.599V68.2311H441.335V59.7022H445.599V38.38H441.335V29.8511H445.599V21.3222H454.128V89.5533H449.863V93.8177H441.335V98.0822H415.748V93.8177H407.219V89.5533H402.955ZM470.445 38.38V46.9089H504.56V38.38H500.296V34.1155H496.032V29.8511H478.974V34.1155H474.709V38.38H470.445ZM466.18 72.4955V63.9666H461.916V38.38H466.18V29.8511H470.445V25.5866H474.709V21.3222H500.296V25.5866H504.56V29.8511H508.825V38.38H513.089V55.4377H470.445V63.9666H474.709V68.2311H478.974V72.4955H500.296V68.2311H504.56V63.9666H513.089V72.4955H508.825V76.76H500.296V81.0244H474.709V76.76H470.445V72.4955H466.18ZM520.858 81.0244V21.3222H529.387V29.8511H533.651V34.1155H529.387V81.0244H520.858ZM559.238 81.0244V34.1155H554.974V29.8511H533.651V25.5866H537.916V21.3222H559.238V25.5866H563.502V29.8511H567.767V81.0244H559.238ZM581.83 72.4955V29.8511H573.301V21.3222H581.83V8.52886H590.359V21.3222H607.416V29.8511H590.359V72.4955H607.416V81.0244H590.359V76.76H586.094V72.4955H581.83Z" fill="currentColor" />
    </svg>
  )
}

interface ResourceLink {
  name: string
  href: string
  type?: string
}

interface TrackSection {
  title: string
  description: string
  quickStart: string[]
  resources: ResourceLink[]
}

const generalResources: ResourceLink[] = [
  { name: "Vercel Docs", href: "https://vercel.com/docs" },
  { name: "Vercel AI Platform", href: "https://vercel.com/ai" },
  { name: "AI Templates Gallery", href: "https://vercel.com/templates/ai" },
  { name: "AI SDK Docs", href: "https://ai-sdk.dev/docs" },
  { name: "v0", href: "https://v0.app/ref/MVBIAI" },
  { name: "AI SDK", href: "https://ai-sdk.dev/" },
  { name: "Agents Docs", href: "https://ai-sdk.dev/docs/ai-sdk-core/agents" },
  { name: "MCP Docs", href: "https://vercel.com/docs/mcp" },
  { name: "Integrations", href: "https://vercel.com/integrations" },
  { name: "Agent Skills & Resources", href: "https://vercel.com/docs/agent-resources" },
  { name: "Sandbox", href: "https://vercel.com/docs/functions/sandbox" },
  { name: "Workflow SDK", href: "https://useworkflow.dev/" },
  { name: "AI Gateway & Models", href: "https://vercel.com/ai-gateway/models" },
  { name: "AI SDK 6 Announcement", href: "https://vercel.com/blog/ai-sdk-6" },
  { name: "llms.txt", href: "https://ai-sdk.dev/llms.txt" },
  { name: "vercel/ai GitHub", href: "https://github.com/vercel/ai" },
]

const learningResources: ResourceLink[] = [
  { name: "Vercel Academy", href: "https://vercel.com/academy" },
  { name: "AI SDK Course", href: "https://vercel.com/academy/ai-sdk" },
  { name: "AI Summary App Course", href: "https://vercel.com/academy/ai-summary-app-with-nextjs" },
  { name: "Building AI Agents Guide", href: "https://vercel.com/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk" },
]

const tracks: TrackSection[] = [
  {
    title: "The Efficiency Win (WDK)",
    description:
      "Build a \"durable\" agent that handles asynchronous tasks—like a follow-up bot that never sleeps. Your agents survive crashes, resume after deploys, and can pause for minutes or months.",
    quickStart: [
      'Scaffold a Next.js app: npx create-next-app@latest --no-src-dir',
      'Add WDK: npx workflow@latest',
      'Wrap your Next.js config: export default withWorkflow(nextConfig)',
      'Create workflow functions with "use workflow" and steps with "use step"',
      'Use DurableAgent from @workflow/ai/agent for AI agent workflows',
      'Get a Gateway API key from the Vercel AI Gateway',
      'Deploy to Vercel — it auto-provisions queues, persistence, and routing',
    ],
    resources: [
      { name: "Workflow SDK Docs", href: "https://useworkflow.dev/", type: "Docs" },
      { name: "Workflow on Vercel", href: "https://vercel.com/docs/workflow", type: "Docs" },
      { name: "Building Durable AI Agents", href: "https://useworkflow.dev/docs/ai", type: "Guide" },
      { name: "vercel/workflow", href: "https://github.com/vercel/workflow", type: "Repo" },
      { name: "Introducing WDK", href: "https://vercel.com/blog/introducing-workflow", type: "Blog" },
      { name: "Agent Patterns", href: "https://www.aisdkagents.com/explore/ai-agent-frameworks", type: "Patterns" },
    ],
  },
  {
    title: "The UI Breakthrough (v0 + MCP)",
    description:
      "Use v0 by Vercel to spin up a professional interface that talks to your real-world data in minutes via Model Context Protocol. Describe what you want and iterate in real time.",
    quickStart: [
      "Open v0.app and describe the app you want to build",
      "Iterate on UI and logic with natural language prompts",
      "Add AI features with the AI SDK — v0 scaffolds the integration for you",
      "Connect an MCP server",
      "Deploy to Vercel with one click",
      "To build your own MCP server, see the deployment guide",
    ],
    resources: [
      { name: "v0 by Vercel", href: "https://v0.app/ref/MVBIAI", type: "Tool" },
      { name: "MCP on Vercel", href: "https://vercel.com/docs/mcp", type: "Docs" },
      { name: "Vercel MCP Server", href: "https://vercel.com/docs/agent-resources/vercel-mcp", type: "Docs" },
      { name: "Deploy MCP Servers", href: "https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel", type: "Guide" },
      { name: "AI SDK MCP Tools", href: "https://ai-sdk.dev/docs/ai-sdk-core/mcp", type: "Docs" },
      { name: "MCP + AI Templates", href: "https://vercel.com/templates/ai", type: "Templates" },
    ],
  },
  {
    title: "The Connection Spark (ChatSDK)",
    description:
      "Build an agent that lives where you already work—Slack, Discord, or GitHub. Write your bot logic once with the Chat SDK, then deploy to every platform via swappable adapters.",
    quickStart: [
      "Install: npm install chat @chat-adapter/slack @chat-adapter/discord",
      "Pick a state adapter: @chat-adapter/state-redis (production) or state-memory (dev)",
      "Create a Chat instance with your adapters and state",
      "Wire up handlers: bot.onNewMention, bot.onSubscribedMessage, bot.onReaction",
      "Add AI — thread.post() accepts AI SDK text streams natively",
      "Use the AI Gateway for zero-config access to any model provider",
      "Deploy to Vercel — adapters auto-detect credentials from env vars",
    ],
    resources: [
      { name: "Chat SDK Docs", href: "https://chat-sdk.dev/", type: "Docs" },
      { name: "vercel/chat", href: "https://github.com/vercel/chat", type: "Repo" },
      { name: "ChatSDK Launch Blog", href: "https://vercel.com/blog/chat-sdk-brings-agents-to-your-users", type: "Blog" },
      { name: "Knowledge Agent Template", href: "https://vercel.com/templates/nuxt/chat-sdk-knowledge-agent", type: "Template" },
      { name: "Community Agent Template", href: "https://github.com/vercel-labs/community-agent-template", type: "Template" },
    ],
  },
]

const proTips = [
  {
    title: "Use the AI Gateway",
    description:
      "Skip managing individual API keys. One endpoint for OpenAI, Anthropic, Google, and more with built-in fallbacks.",
  },
  {
    title: "Add the Vercel Plugin + Skills",
    description:
      "If you're using a coding agent (Claude Code, Cursor, etc.), add the Vercel plugin skill to your project for best-practice guidance.",
  },
  {
    title: "Feed llms.txt to your LLM",
    description:
      "The full AI SDK docs are available as one Markdown file at ai-sdk.dev/llms.txt. Feed it to your LLM for accurate, up-to-date code generation.",
  },
  {
    title: "Start from a template",
    description:
      "Clone the Chatbot template, Knowledge Agent template, or a WDK example and customize.",
  },
  {
    title: "Use AI SDK DevTools",
    description:
      "AI SDK 6 has built-in DevTools for debugging multi-step agent flows. Full visibility into LLM calls, tool use, and trajectories.",
  },
  {
    title: "Deploy early, iterate fast",
    description:
      "Push to Vercel after your first working feature. Every git push creates a preview deployment you can share with teammates and judges.",
  },
]

function ResourceCard({ resource }: { resource: ResourceLink }) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 border border-white/10 bg-white/2 px-4 py-3.5 transition-colors hover:bg-white/5 hover:border-white/20"
    >
      <div className="flex items-center gap-3 min-w-0">
        {resource.type && (
          <span className="shrink-0 font-geist-mono text-[10px] uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5">
            {resource.type}
          </span>
        )}
        <span className="font-geist-mono text-sm text-white/90 group-hover:text-white truncate">
          {resource.name}
        </span>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 group-hover:text-white/70 transition-colors" />
    </a>
  )
}

export function ZeroToAgentResources() {
  return (
    <div className="relative">
      {/* Top accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2">
            <VercelLogo className="w-4 h-4 text-white" />
            <span className="font-geist-pixel-square text-xs font-medium uppercase tracking-[0.2em] text-white/70 leading-none">
              Vercel Community Event
            </span>
          </div>

          <ZeroToAgentLogo className="w-full max-w-lg text-white" />

          <div className="flex items-center gap-4">
            <span className="font-geist-mono text-sm text-white/50 tracking-wider">
              04.25.26
            </span>
            <span className="font-geist-mono text-sm text-white/50 uppercase tracking-wider">
              San Antonio/TX
            </span>
          </div>

          <h2 className="text-white text-2xl sm:text-3xl font-semibold leading-tight max-w-2xl">
            Find Your People. Build Your Future.
          </h2>

          <p className="text-white/70 text-base sm:text-lg font-normal leading-7 max-w-2xl">
            DEVSA is the official San Antonio community partner for Zero to Agent—a
            global 10-day initiative designed to take you from idea to deployed agent
            using the full power of the{" "}
            <VercelLogo className="inline-block w-3.5 h-3.5 text-white align-text-center" />{" "}
            <span className="text-white font-medium">Vercel</span> AI SDK and AI Gateway.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://luma.com/hwfvt791"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 bg-white text-black text-sm font-medium uppercase tracking-wider px-6 py-3 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <span className="font-geist-pixel-square leading-none">Register</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/events"
              className="group inline-flex items-center gap-2.5 border border-white/20 text-white text-sm font-medium uppercase tracking-wider px-6 py-3 transition-all hover:bg-white/5 active:scale-[0.98]"
            >
              <span className="font-geist-pixel-square leading-none">Back to Events</span>
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

      {/* General Resources */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-8">
            General Resources
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {generalResources.map((r) => (
              <a
                key={r.name}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 border border-white/10 bg-white/2 px-4 py-3.5 transition-colors hover:bg-white/5 hover:border-white/20"
              >
                <span className="font-geist-mono text-sm text-white/90 group-hover:text-white truncate">
                  {r.name}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 group-hover:text-white/70 transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Learning */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-8">
            Learning
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {learningResources.map((r) => (
              <a
                key={r.name}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 border border-white/10 bg-white/2 px-4 py-3.5 transition-colors hover:bg-white/5 hover:border-white/20"
              >
                <span className="font-geist-mono text-sm text-white/90 group-hover:text-white truncate">
                  {r.name}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 group-hover:text-white/70 transition-colors" />
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Tracks */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-2">
            Choose Your Track
          </h2>
          <p className="text-white/70 text-sm leading-6 max-w-2xl">
            Zero to Agent features three specialized hackathon tracks. Pick the path that fits your vision.
          </p>
        </motion.div>
      </section>
      {tracks.map((track, i) => (
        <section key={track.title}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  {track.title}
                </h2>
                <p className="text-white/70 text-sm leading-6 max-w-2xl">
                  {track.description}
                </p>
              </div>

              {/* Quick Start */}
              <div className="border border-white/10 bg-white/2">
                <div className="border-b border-white/10 px-4 py-2.5">
                  <span className="font-geist-mono text-[10px] uppercase tracking-wider text-white/50">
                    Quick Start
                  </span>
                </div>
                <ol className="p-4 space-y-2.5">
                  {track.quickStart.map((step, j) => (
                    <li key={j} className="flex gap-3 text-sm">
                      <span className="font-geist-mono text-white/40 shrink-0">{j + 1}.</span>
                      <span className="font-geist-mono text-white/80 leading-6">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Resources */}
              <div className="grid gap-2 sm:grid-cols-2">
                {track.resources.map((r) => (
                  <ResourceCard key={r.name} resource={r} />
                ))}
              </div>
            </motion.div>
          </div>
          {i < tracks.length - 1 && (
            <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          )}
        </section>
      ))}

      <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Why You Should Be There */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Why You Should Be There
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/2 p-6 space-y-2">
              <p className="font-geist-mono text-2xl text-white font-bold">$30</p>
              <h3 className="font-geist-mono text-sm text-white font-semibold">
                <V0Logo className="inline-block w-4 h-4 text-white align-text-bottom" />{" "}
                Credits
              </h3>
              <p className="font-geist-mono text-xs text-white/60 leading-5">
                Every attendee receives $30 in{" "}
                <V0Logo className="inline-block w-3 h-3 text-white/70 align-text-bottom" />{" "}
                credits to power their builds during the event.
              </p>
            </div>
            <div className="border border-white/10 bg-white/2 p-6 space-y-2">
              <p className="font-geist-mono text-2xl text-white font-bold">$6K+</p>
              <h3 className="font-geist-mono text-sm text-white font-semibold">Global Prize Pool</h3>
              <p className="font-geist-mono text-xs text-white/60 leading-5">
                Compete for a piece of the $6,000+ global prize pool, including{" "}
                <VercelLogo className="inline-block w-2.5 h-2.5 text-white/70 align-text-bottom" />{" "}
                Vercel Platform and Pro credits.
              </p>
            </div>
            <div className="border border-white/10 bg-white/2 p-6 space-y-2">
              <p className="font-geist-mono text-2xl text-white font-bold">Zero to <span className="font-geist-pixel-square text-2xl font-bold">Agent</span></p>
              <h3 className="font-geist-mono text-sm text-white font-semibold">Limited Edition Swag</h3>
              <p className="font-geist-mono text-xs text-white/60 leading-5">
                Score limited edition Zero to Agent swag available only for this event.
              </p>
            </div>
          </div>

          {/* AI Agent Showcase callout */}
          <div className="border border-white/10 bg-white/2 p-6 space-y-3">
            <h3 className="font-geist-mono text-sm text-white font-semibold">
              Invitation to the 2nd Annual AI Agent Showcase
            </h3>
            <p className="text-white/70 text-sm leading-6 max-w-3xl">
              Want to showcase the agent you built? Sign up for the 2nd Annual AI Agent Showcase,
              powered by the Geeks&amp;&amp; family—a science fair-style event where you can present your agent to the San Antonio tech community on May 2nd. 
            </p>
          </div>
        </motion.div>
      </section>

      <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Pro Tips */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <h2 className="font-geist-pixel-square text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Pro Tips
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {proTips.map((tip) => (
              <div
                key={tip.title}
                className="border border-white/10 bg-white/2 p-5 space-y-2"
              >
                <h3 className="font-geist-mono text-sm text-white font-semibold">
                  {tip.title}
                </h3>
                <p className="font-geist-mono text-xs text-white/60 leading-5">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
        <div className="border border-white/10 bg-white/2 p-8 sm:p-10 text-center space-y-5">
          <p className="text-white text-lg sm:text-xl font-semibold leading-tight">
            Turn &ldquo;I have an idea&rdquo; into &ldquo;I just shipped it.&rdquo;
          </p>
          <p className="text-white/60 text-sm leading-6 max-w-lg mx-auto">
            Come join the active builders in San Antonio and find your breakthrough shipping real AI agents with{" "}
            <V0Logo className="inline-block w-4 h-4 text-white align-text-bottom" />{" "}
            and{" "}
            <VercelLogo className="inline-block w-3 h-3 text-white align-text-center" />{" "}
            <span className="text-white font-medium">Vercel</span>.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="https://luma.com/hwfvt791"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-white text-black text-sm font-semibold uppercase tracking-wider px-5 py-2.5 transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <span className="font-geist-pixel-square leading-none">Register</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <p className="text-white/50 text-xs pt-2">
            New to{" "}
            <V0Logo className="inline-block w-4 h-4 text-white/50 align-text-bottom" />?{" "}
            <a
              href="https://v0.app/ref/MVBIAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline underline-offset-2 hover:text-white"
            >
              Sign up here
            </a>{" "}
            for an extra $5 in credits.
          </p>
          <p className="text-white/40 text-xs">
            Questions? Hit up the{" "}
            <a
              href="https://community.vercel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline underline-offset-2 hover:text-white/80"
            >
              Vercel Community
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <V0Logo className="w-4 h-4 text-white/30" />
            <span className="font-geist-mono text-[10px] font-normal text-white/30 uppercase tracking-[0.15em] leading-none">
              Powered by
            </span>
            <VercelLogo className="w-3 h-3 text-white/30" />
          </div>
        </div>
      </section>

      {/* Bottom accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
