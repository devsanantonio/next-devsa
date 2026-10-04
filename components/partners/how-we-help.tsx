import Image from "next/image"

/**
 * How DEVSA actually helps a community group put something on.
 *
 * ## The gap this fills
 *
 * WhyDevsa, directly above, states the problem and the limit: twenty groups
 * with no shared room, and "DEVSA was built to close that gap, and nothing more
 * than that." PartnerCta, below, offers to "build programs with the ecosystem".
 * Both are true and both are abstract — one is a mission statement, the other a
 * category list. Nowhere did this site say what DEVSA actually *does* for a
 * group that wants to run something, and nowhere did it show a single instance
 * of it having happened.
 *
 * The three things it does are specific: it finds the room, through partners
 * who have one; it finds the people who can teach, through the network; and it
 * puts the thing in front of twenty-plus groups through the calendar. None of
 * that was written down anywhere on the site.
 *
 * ## Why one example rather than three bullets
 *
 * Give-a-LOT is the whole model in one afternoon, and it is documented rather
 * than characterised: the facts, the dates and the two halves below are from
 * lib/give-a-lot.ts in the next-sasw repo, which carried the activation during
 * Startup + Tech Week. learnOPENtech ran it. LaunchSA, a DEVSA partner, housed
 * it. DEVSA put it on the calendar.
 *
 * Said as a list of capabilities it would read as marketing. Said as one thing
 * that happened, with the dates and the terms attached, it is checkable — and
 * the sentence that matters most is the one admitting DEVSA did not run it.
 */
const GIVE_A_LOT = {
  lockup: "/give-a-lot/lockup.svg",
  lockupWidth: 630,
  lockupHeight: 230,
  fullName: "Give-a-LOT Computer Donation Drive",
  driveLabel: "Drop-off · Sept 28 – Oct 1",
  dateLabel: "Friday, October 2, 2026",
  timeLabel: "12 – 2:30 PM",
  venue: "LaunchSA",
  venueDetail: "Central Library, 1st Floor",
  photo: "/hero/sastw-workshop.webp",
} as const

/** What DEVSA brought, in the order a group needs it. */
const ROLES = [
  {
    label: "The room",
    body: "From a partner who has one. LaunchSA put the drive on the Central Library's first floor — a venue no single community group could have booked on its own.",
  },
  {
    label: "The people who can teach",
    body: "From the network. learnOPENtech ran two and a half hours on Linux and open source, and handled the rebuilds and the certified drive erasure.",
  },
  {
    label: "The audience",
    body: "From the calendar. One listing in front of twenty-plus groups, which is the part a specialty group cannot do for itself.",
  },
] as const

export function HowWeHelp() {
  return (
    <section className="w-full bg-neutral-950" data-bg-type="dark">
      <div className="page-shell py-20 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
          How It Works
        </p>
        <h2 className="mt-4 max-w-3xl text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
          We Don&apos;t Run Your Event.{" "}
          <span className="font-light italic text-white/50">
            We Make It Possible.
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg md:text-xl font-light leading-[1.45] text-white/65">
          Most groups here are specialty groups with their own people and their
          own subject. They don&apos;t need running. They need a room, someone
          who can teach, and an audience that knows it&apos;s happening.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <ul className="space-y-8">
            {ROLES.map((role) => (
              <li key={role.label} className="border-l-2 border-white/15 pl-5">
                <p className="font-sans text-base font-semibold text-white">
                  {role.label}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-white/55">
                  {role.body}
                </p>
              </li>
            ))}
          </ul>

          {/* The worked example. The lockup is the partner's own — a
              hand-lettered wordmark on amber — so it is placed rather than
              restyled, which is the same call next-sasw made when it carried
              this activation. */}
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image
              src={GIVE_A_LOT.photo}
              alt="A learnOPENtech session at LaunchSA, attendees at laptops during the Give-a-LOT drive"
              width={800}
              height={1067}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="h-56 w-full object-cover sm:h-64"
            />
            <figcaption className="p-6 sm:p-7">
              <Image
                src={GIVE_A_LOT.lockup}
                alt={GIVE_A_LOT.fullName}
                width={GIVE_A_LOT.lockupWidth}
                height={GIVE_A_LOT.lockupHeight}
                unoptimized
                className="h-auto w-full max-w-[16rem]"
              />
              <p className="mt-5 text-[15px] leading-relaxed text-white/70">
                learnOPENtech ran it. LaunchSA housed it. DEVSA put it on the
                calendar. Four days of drop-offs, one afternoon on Linux, and
                everyone who sat through the session left with a working
                machine.
              </p>
              <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] uppercase tracking-wider text-white/40">
                <div>
                  <dt className="sr-only">Drive</dt>
                  <dd>{GIVE_A_LOT.driveLabel}</dd>
                </div>
                <div>
                  <dt className="sr-only">Session</dt>
                  <dd>
                    {GIVE_A_LOT.dateLabel} · {GIVE_A_LOT.timeLabel}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Venue</dt>
                  <dd>
                    {GIVE_A_LOT.venue} — {GIVE_A_LOT.venueDetail}
                  </dd>
                </div>
              </dl>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
