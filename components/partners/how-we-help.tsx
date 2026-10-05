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
 * gives a group access to that network — the active learners and frontline
 * people in the industries that drive the city. None of that was written down
 * anywhere on the site.
 *
 * The third one said "The audience … from the calendar", which undersold it in
 * two directions. The calendar is a mechanism, not the thing of value, and
 * "audience" is the word a sales funnel uses. DEVSA is not a lead generator for
 * anyone's business; the only funnel it runs points active learners at the
 * specialty group that matches what they are into. What a group actually gets
 * is access to a community of builders — which is also why partners are here,
 * since DEVSA reaches those industries through frontline employees rather than
 * at the executive level the partners already occupy.
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
  photo: "/hero/sastw-workshop.webp",
  /* The drive dates, the session time and the venue used to sit here, feeding a
     facts strip under the caption. Every one of them was already on the page:
     the venue in "The room" above, the four days of drop-offs and the afternoon
     on Linux in the caption itself. Said twice it read as an event listing, and
     for an afternoon that has already run, exact times date the section rather
     than evidence it. Removed rather than left set-but-unread, which is the
     state that rots — they are all in lib/give-a-lot.ts in next-sasw if the
     strip is ever wanted back. */
} as const

/** What DEVSA brought, in the order a group needs it. */
const ROLES = [
  {
    label: "The room",
    /* Not "a venue no single community group could have booked on its own",
       which this said and which is not true — the Central Library takes
       bookings, and a group could make one. The real thing DEVSA brought is
       the relationship: it already works with LaunchSA, so the ask arrived
       warm and with a concept attached rather than cold from a stranger.
       Overclaiming exclusivity made DEVSA sound like a gatekeeper, which is
       the opposite of what this section is arguing. */
    body: "From a partner DEVSA already works with. LaunchSA hosted the drive on the Central Library's first floor — the relationship was already built, so the ask was a warm conversation with a concept attached rather than a cold one.",
  },
  {
    label: "The people who can teach",
    body: "From the people DEVSA knows. learnOPENtech ran two and a half hours on Linux and open source, and handled the rebuilds and the certified drive erasure.",
  },
  {
    label: "Access to a network",
    body: "A community of builders — the active learners and the frontline people already working in the industries that drive this city, from student organizations through to working professionals. Not everyone is on Discord, or LinkedIn, or X. They come here.",
  },
] as const

export function HowWeHelp() {
  return (
    <section className="w-full bg-neutral-950" data-bg-type="dark">
      <div className="page-shell py-20 md:py-28">
        {/* Building Together's own eyebrow, matching WhyDevsa directly above
            and GetInvolved below: sans, text-sm md:text-base, 0.2em. The mono
            11px form this started as belongs to /events and the conference
            pages. white/50 clears 4.5:1 on this ground; /40 does not. */}
        <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/50">
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
          who can teach, and a way to reach the builders who would want to be
          there.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
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

          {/* Volunteering was here and has been pulled.
          
              The copy said Youth Code Jam "needs people who can teach kids to
              code" and Project Quest "needs the ones already in them", under
              "when a partner needs hands". Three problems, in rising order.
          
              It characterised two organisations' needs without either of them
              saying so. Project Quest has run since 1992, describes itself as
              "nationally-recognized" and as having "helped thousands find
              amazing in-demand careers"; Youth Code Jam runs teacher
              professional development and free community outreach. Neither
              presents itself as short-handed, and publishing that they are —
              with DEVSA as the one who supplies the hands — is not ours to say.
          
              It had no destination. /api/volunteers is an event-specific open
              call (Access Granted's), not a route into partner programmes.
              There is no page, form or link for this, so a reader moved by it
              had nowhere to go.
          
              And it did not read as an invitation. No heading, no action, no
              link — ambiguous enough that it was unclear whether it was copy
              for visitors at all.
          
              Volunteering is still a real gap and worth saying. Putting it back
              needs two things first: somewhere for a reader to land, and the
              partners' own words for what they actually want. */}
          </div>

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
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
