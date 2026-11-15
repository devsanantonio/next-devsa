import { ArrowUpRight } from "lucide-react"

/**
 * The Discord, on /about: the page a search for "San Antonio tech Discord" can land on. /discord is only a
 * redirect to the invite, so until this there was no page that said what the server is or what happens in it.
 *
 * It follows the origin story, which tells how DEVSA started as a Discord server in September 2023; this says
 * what the server is now. The three rhythms are the bots that post there (CLAUDE.md: the Monday digest, the
 * weekday prompts, Build-and-tell Friday). No member count: it moves every week, and a stale number is worse
 * than none.
 */
const RHYTHM: [string, string][] = [
  ["Mondays", "The week's community calendar, posted in #community-calendar"],
  ["Weekdays", "A question of the day, or a poll, in #vibe-chat"],
  ["Fridays", "Build-and-tell in #build-and-tell: show what you made this week"],
]

export function AboutDiscord() {
  return (
    <section id="discord" className="w-full scroll-mt-20 bg-white" data-bg-type="light">
      <div className="page-shell grid gap-10 border-t border-gray-200 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">The Discord</p>
          <h2 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
            San Antonio&apos;s tech Discord.{" "}
            <span className="font-light italic text-gray-500">Where DEVSA started.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl">
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
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
          {RHYTHM.map(([when, what]) => (
            <li key={when} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <span className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500">{when}</span>
              <span className="text-base leading-relaxed text-gray-900 md:text-lg">{what}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
