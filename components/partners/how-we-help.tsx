import Image from "next/image"

/**
 * How DEVSA actually helps a community group put something on.
 *
 * ## The gap this fills
 *
 * The hero states the problem and the limit: twenty-three groups with no
 * shared room, and "DEVSA was built to close that gap, and nothing more than
 * that." (That copy was its own WhyDevsa section until it was promoted — it is
 * a premise, which is what a hero needs to be.) PartnerCta, below, offers to "build programs with the ecosystem".
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
  /* Its own asset, not a borrowed one.
  
     This was /hero/sastw-workshop.webp — the same file as frame 14 of the
     homepage marquee, so the one photograph illustrating DEVSA's worked
     example was also scrolling past on the front page. Pointing a second
     surface at /hero/ is what caused it, so this lives beside the lockup it
     is captioned with instead, where nothing else will reach for it.
  
     4W1A7028, after two other frames from the same shoot were tried and
     rejected for the same reason. The caption's claim is that everyone who
     sat through the session left with a working machine, so the frame has to
     show somebody being helped at a machine rather than somebody presenting.
  
     4W1A7065 showed exactly that and could not be used: the camera original
     clips the top of the head of the woman in the pink sweater at the back of
     the room, and nothing recovers what the sensor never caught. Cropping her
     out was tried and is worse — it throws away a third of the room to hide a
     mistake. This frame has the same moment with every head whole and room
     above them.
  
     Cropped only at the top, where the wall is empty. That leaves 1366x1408,
     which is 0.97:1 — near enough to the card's own shape that object-cover
     fills it with almost nothing lost on any edge. */
  /* The filename carries the frame, deliberately.
  
     This asset was replaced three times while the right photograph was being
     found, and each time it kept the name session.webp — so the URL never
     changed, and Next's image optimizer and the browser both went on serving
     the first bytes they had cached. The page looked unchanged while the file
     on disk was correct, which is a confusing failure to debug.
  
     Renaming on a content change is the fix: a new URL misses every cache by
     construction. If this frame is ever swapped again, rename it again. */
  photo: "/give-a-lot/learnopentech-session.webp",
  photoWidth: 1400,
  photoHeight: 1443,
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
        {/* Building Together's own eyebrow, matching the hero above and
            GetInvolved below: sans, text-sm md:text-base, 0.2em. The mono
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

        {/* Stretch, not center.

            The gap this section had was ~245px of nothing above the first
            role, because the figure column was far taller than the text one.
            Centring only moved half of it to the top; the column still ended
            early and still looked like something was missing.

            Introducing the worked example in this column instead of under the
            photograph fixes it properly: the reader meets the three roles,
            then meets the activation where all three happened, and the
            photograph opposite is what that looked like. The text column grows
            by roughly the amount it was short, and the figure stretches to
            match it, so there is no slack left to distribute. */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-16">
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
          
              It characterised two organizations' needs without either of them
              saying so. Project Quest has run since 1992, describes itself as
              "nationally-recognized" and as having "helped thousands find
              amazing in-demand careers"; Youth Code Jam runs teacher
              professional development and free community outreach. Neither
              presents itself as short-handed, and publishing that they are —
              with DEVSA as the one who supplies the hands — is not ours to say.
          
              It had no destination. /api/volunteers is an event-specific open
              call (Access Granted's), not a route into partner programs.
              There is no page, form or link for this, so a reader moved by it
              had nowhere to go.
          
              And it did not read as an invitation. No heading, no action, no
              link — ambiguous enough that it was unclear whether it was copy
              for visitors at all.
          
              Volunteering is still a real gap and worth saying. Putting it back
              needs two things first: somewhere for a reader to land, and the
              partners' own words for what they actually want. */}

            {/* The worked example, introduced rather than captioned.

                The lockup used to sit under the photograph in the opposite
                column, where it was a credit on a picture. Here it is the
                thing being introduced: the three roles above are the claim,
                and this is the afternoon all three happened on. It also gives
                this column the height it was missing.

                It stays the partner's own hand-lettered wordmark rather than
                the drive's name set in our type — that name belongs to them,
                on a page whose argument is that they are the ones who run
                this. Placed, not restyled, which is the call next-sasw made
                when it carried the activation. */}
            <div className="mt-10 border-t border-white/10 pt-8 lg:mt-12 lg:pt-10">
              <p className="text-[15px] leading-relaxed text-white/50">
                All three of those, on one afternoon:
              </p>
              <Image
                src={GIVE_A_LOT.lockup}
                alt={GIVE_A_LOT.fullName}
                width={GIVE_A_LOT.lockupWidth}
                height={GIVE_A_LOT.lockupHeight}
                unoptimized
                className="mt-4 h-auto w-full max-w-[13rem]"
              />
              <p className="mt-5 text-[15px] leading-relaxed text-white/70">
                learnOPENtech ran it. LaunchSA housed it. DEVSA put it on the
                calendar. Four days of drop-offs, one afternoon on Linux, and
                everyone who sat through the session left with a working
                machine.
              </p>
            </div>
          </div>

          {/* The photograph, and nothing else in this column.

              It was a 2.5:1 letterbox strip at a fixed 224px — a slot for a
              header image rather than a frame for a photograph — and this one
              is documentary: a volunteer crouched beside somebody at a donated
              laptop, a third attendee at the edge. It is the only frame of the
              eleven from that shoot that shows what the caption claims, which
              is that everyone who sat through the session left with a machine.

              h-full from lg so the card matches whatever height the text
              column lands at, which is what removes the gap rather than
              hiding it. Below lg the columns stack and h-full means nothing,
              so it keeps an explicit 3:2 there.

              object-cover, and no matting needed: the frame was cut to 0.97:1
              to match this card, so cover fills it while losing almost nothing
              on any edge. An earlier frame here was 3:2 against a near-square
              card, which cover cropped by a fifth on each side and contain
              answered with a band of black — both symptoms of an asset shaped
              for a different slot than the one it sits in. */}
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black lg:h-full">
            <Image
              src={GIVE_A_LOT.photo}
              alt="Attendees at laptops during a learnOPENtech session at LaunchSA, one leaning in to help another, at the Give-a-LOT drive"
              width={GIVE_A_LOT.photoWidth}
              height={GIVE_A_LOT.photoHeight}
              sizes="(max-width: 1024px) 100vw, 700px"
              className="aspect-3/2 w-full object-cover lg:aspect-auto lg:h-full"
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
