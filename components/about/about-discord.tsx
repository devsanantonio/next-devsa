import { ArrowUpRight } from "lucide-react"

/**
 * The Discord, on /about: the page a search for "San Antonio tech Discord" can land on. /discord is only a
 * redirect to the invite, so until this there was no page that said what the server is or what happens in it.
 *
 * It follows the origin story, which tells how DEVSA started as a Discord server in September 2023; this says
 * what the server is now. Left, the claim and the way in; right, a dark card drawn like the server's channel
 * list, one channel per weekly rhythm (the bots that post there, per CLAUDE.md: the Monday calendar, the
 * weekday prompts, Build-and-tell Friday). The card is the same dark card the repo cards on /fm and /localhost
 * use. (The first version set "San Antonio's tech Discord. Where DEVSA started." as a four-line headline beside
 * a plain list, and the headline swamped the section.)
 *
 * No member count: it moves every week, and a stale number is worse than none.
 */
const CHANNELS: { name: string; when: string; what: string }[] = [
  { name: "community-calendar", when: "Mondays", what: "The week's meetups, workshops and conferences, from the calendar" },
  { name: "vibe-chat", when: "Weekdays", what: "A question of the day, or a poll, to get people talking" },
  { name: "build-and-tell", when: "Fridays", what: "Show what you built this week, finished or not" },
]

export function AboutDiscord() {
  return (
    <section id="discord" className="w-full scroll-mt-20 bg-white" data-bg-type="light">
      <div className="page-shell grid gap-12 border-t border-gray-200 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">Where DEVSA started</p>
          <h2 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
            San Antonio&apos;s tech{" "}
            <span className="font-light italic text-gray-500">Discord.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600">
            DEVSA began as a Discord server in 2023, and it&apos;s still where the community talks every day: learners and
            builders from across the city&apos;s groups, in one place between the meetups.
          </p>
          <a
            href="/discord"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
          >
            Join the Discord <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* The server, drawn as its channel list: what happens there, and when. */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] text-white">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-3">
            <p className="font-mono text-[12px] text-white/80">DEVSA · Discord</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Every week</p>
          </div>
          <ul className="divide-y divide-neutral-800">
            {CHANNELS.map((c) => (
              <li key={c.name} className="px-5 py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[15px] text-white">
                    <span className="mr-1.5 text-[#00b2a9]">#</span>
                    {c.name}
                  </p>
                  <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-white/50">{c.when}</p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{c.what}</p>
              </li>
            ))}
          </ul>
          <a
            href="/discord"
            className="block border-t border-neutral-800 px-5 py-3.5 font-mono text-[12px] text-white/70 transition-colors hover:text-white"
          >
            <span className="select-none text-[#ff8200]">→ </span>devsa.community/discord
          </a>
        </div>
      </div>
    </section>
  )
}
