import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * The header of /coworking-space, now that the room is closed.
 *
 * This began as a temporary banner above a page still written in the present
 * tense, and carried both tenses so it could flip itself on 19 September if
 * nobody got to the rewrite in time. It did flip, on its own, and the rewrite
 * followed — so the second string and the date arithmetic are gone. What is
 * left is the page's opening statement.
 */
export function ClosingNotice() {
  return (
    <aside className="w-full bg-[#08090e] text-white">
      {/* pt clears the fixed navbar. Not calc(...-var(--header-height)) —
          that custom property is defined nowhere in the app, so the whole
          declaration is dropped and the copy tucks under the header. */}
      <div className="page-shell pb-12 pt-28 md:pb-16 md:pt-32">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.26em] text-[#ef426f]">
          Closed September 19, 2026
        </p>

        <h2 className="mt-5 max-w-4xl text-balance font-sans text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.1] tracking-[-0.02em]">
          Our coworking space at Geekdom has closed.
        </h2>

        <p className="mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-white/70">
          For two years this room was where the community showed up, Monday to Friday,
          kept open by volunteers. We gave up the room, not the relationship &mdash; DEVSA
          programming and community meetups at Geekdom continue exactly as they have, and
          every meetup is still on the Community Calendar.
        </p>

        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-white/70">
          We are not opening another space. Putting up a second room downtown would only
          fragment a community that is working to consolidate. There is far more value for
          San Antonio in channeling active builders into our partners&rsquo; rooms than in
          holding our own.
        </p>

        <Link
          href="/events"
          className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-white/90"
        >
          Find your people
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  )
}
