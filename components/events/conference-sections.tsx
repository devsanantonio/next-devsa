import Image from "next/image"
import type { Conference } from "@/data/conferences"
import { getEventBrand } from "@/lib/event-brands"

/**
 * The parts a conference page is built from, as three independent sections.
 *
 * This was one component rendering a reel, the lineup and a room photo in a
 * fixed order. That held exactly as long as every page wanted the same
 * arrangement, which lasted about a day — the reels then came off all three
 * pages and the photograph took their place.
 *
 * A single component could only have served that by growing boolean props
 * that reorder its own children, which is the shape a component takes just
 * before it becomes unmaintainable.
 *
 * So the page composes instead. Each section knows how to render itself and
 * nothing about what sits above it, which is the same split argued for when
 * deciding what to port from next-sasw: primitives travel, page compositions
 * do not.
 */

function accentOf(conference: Conference) {
  return getEventBrand(conference.brand)?.accent ?? conference.accent ?? "#ffffff"
}

/**
 * One wide photograph of the room.
 *
 * An establishing shot, never a speaker portrait — see the note on `photo` in
 * data/conferences.ts for why the obvious grid of speaker tiles does not work
 * with this material.
 */
export function ConferenceRoom({ conference }: { conference: Conference }) {
  const { photo, photoAlt, photoWidth, photoHeight } = conference
  if (!photo) return null

  return (
    <section className="page-shell pb-14 md:pb-20">
      <figure className="overflow-hidden rounded-2xl border border-white/10">
        <Image
          src={photo}
          alt={photoAlt ?? ""}
          width={photoWidth ?? 1600}
          height={photoHeight ?? 900}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="block h-auto w-full"
          priority
        />
      </figure>
    </section>
  )
}

/** The afternoon, as it ran. */
export function ConferenceLineup({ conference }: { conference: Conference }) {
  const { sessions, name, lastRun } = conference
  if (!sessions || sessions.length === 0) return null
  const accent = accentOf(conference)

  return (
    <section className="page-shell pb-16 md:pb-24">
      <div id="lineup" className="max-w-3xl scroll-mt-20">
        <h2 className="font-sans text-2xl md:text-3xl font-black tracking-[-0.02em] text-white">
          The afternoon
        </h2>
        <p className="mt-3 text-sm text-white/45">
          How {name} ran the last time, {lastRun}.
        </p>

        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {sessions.map((session) => (
            <li
              key={`${session.time}-${session.title}`}
              className="grid gap-1 py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-5"
            >
              {/* Tabular figures so the times form a column rather than a
                  ragged edge — the list is read down the clock. */}
              <span
                className="font-mono text-xs tabular-nums tracking-wide sm:pt-1"
                style={{ color: accent }}
              >
                {session.time}
              </span>
              <div className="min-w-0">
                <p className="text-base font-medium leading-snug text-white">
                  {session.title}
                </p>
                {session.people && (
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {session.people}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
