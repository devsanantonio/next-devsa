import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * End of day on the last day the room is open, Central. Written with an
 * explicit -05:00 (CDT on this date) rather than trusting the server's clock,
 * which on Vercel is UTC — without the offset the banner would flip to past
 * tense at 7pm on the 18th, San Antonio time.
 */
const CLOSES = "2026-09-19T23:59:59-05:00"

export type ClosingPhase = "open" | "closed"

export function getClosingPhase(now: Date = new Date()): ClosingPhase {
  return now.getTime() <= new Date(CLOSES).getTime() ? "open" : "closed"
}

/**
 * Banner across the top of /coworking-space announcing the closure.
 *
 * Sits above the hero rather than inside it because someone arriving from the
 * announcement needs the news before they read anything about hours, parking
 * or how to get in — all of which the page still describes in the present
 * tense until it is rewritten.
 *
 * It carries both tenses and picks one from the date. That is a hedge against
 * this page not being revisited on the 19th: the worst version of this route
 * is one still inviting people to a room that closed last week, and the cost
 * of preventing that is a second string. The page revalidates hourly so the
 * switch happens without a deploy.
 *
 * Temporary by design. It goes when the page is rewritten in past tense —
 * see the phase-two notes on this closure.
 */
export function ClosingNotice({ phase }: { phase: ClosingPhase }) {
  const closed = phase === "closed"

  return (
    <aside className="w-full bg-[#08090e] text-white">
      {/* pt clears the fixed navbar. Not calc(...-var(--header-height)) —
          that custom property is defined nowhere in the app, so the whole
          declaration is dropped and the copy tucks under the header. The
          hero below this still has that bug; see the note in
          components/pysa/2025/hero-section.tsx, which hit it first. */}
      <div className="page-shell pb-10 pt-28 md:pb-14 md:pt-32">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.26em] text-[#ef426f]">
          {closed ? "Closed September 19, 2026" : "Closing September 19, 2026"}
        </p>

        <h2 className="mt-5 max-w-4xl text-balance font-sans text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.1] tracking-[-0.02em]">
          {closed
            ? "Our coworking space at Geekdom has closed."
            : "Our coworking space at Geekdom closes September 19."}
        </h2>

        <p className="mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-white/70">
          {closed ? (
            <>
              Thank you to the volunteers who kept the doors open Monday through Friday,
              and to Geekdom for the home base on historic Houston Street. We gave up the
              room, not the relationship &mdash; DEVSA programming and community meetups
              at Geekdom continue exactly as they have.
            </>
          ) : (
            <>
              We&rsquo;re giving up the room, not the relationship. DEVSA programming and
              community meetups at Geekdom continue exactly as they have, and every meetup
              on the Community Calendar is still on it.
            </>
          )}
        </p>

        <Link
          href="/events"
          className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-white/90"
        >
          Find your people
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  )
}
