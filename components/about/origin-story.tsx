import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * Why DEVSA exists, on the page where that belongs.
 *
 * ## The subject is the gap, not the founder
 *
 * The first draft of this page was an origin story: the founder's job history,
 * the year he changed careers, the retirement account he spent doing it. All
 * true and all his to tell, and wrong here for a reason that has nothing to do
 * with privacy.
 *
 * This site's whole argument is that DEVSA is infrastructure and the groups
 * run themselves. A founder-centered about page contradicts that quietly, and
 * to a sponsor doing diligence it reads as key-person risk — "what happens if
 * he leaves" is not the thought this page should produce. The board section
 * below is a better answer to "who runs this" than any origin story, because
 * it names more than one person.
 *
 * What came out, specifically: a child in high school, which is biography
 * rather than origin and invites a judgment that has nothing to do with the
 * organization; the 401(k), which is a financial disclosure a sponsor does not
 * need; and the list of three service jobs, which was a résumé. The one part
 * kept is that he came up through service work, because the people this site
 * is for are often doing the same thing now.
 *
 * ## The page leads with the founding, because that is the only part that is
 * ## only here
 *
 * It did not. It opened on "There Were Meetups. Nothing Held Them Together." —
 * which is the *site's* thesis, argued already by the homepage hero and again
 * by the Building Together hero. So the page spent its first screen repeating
 * the site and did not reach its own material until the second paragraph of
 * body copy.
 *
 * Diffed against the other two pages, /about adds exactly two things: when and
 * how DEVSA started, and a URL for "who runs this" that is not an anchor
 * buried in a pitch aimed at somebody else. The headline is now those two
 * dates, and the FoundingFacts strip under the hero is the rest of the packet
 * — founded, incorporated, governed, scale.
 *
 * That packet is the real argument for this page existing. It is not an
 * editorial one. A grantmaker, a corporate sponsorship committee and a
 * journalist all check the same four facts, and before this they were spread
 * across three pages with the founding date written down nowhere at all.
 *
 * ## The hero
 *
 * Full-bleed photograph with the left-to-right ramp, the same construction as
 * /buildingtogether and the homepage, rather than the two-column card this
 * started as.
 *
 * Not the founder in a room of empty chairs, which is what it was: that frame
 * is a portrait, and running it here put the same person in the hero of two
 * top-level pages.
 *
 * Four people at a DEVSA meetup in July 2024, name tags still on, confirmed by
 * Jesse rather than inferred from the frame.
 *
 * The slot briefly held a monochrome shot of a table of people at Geekdom,
 * picked because it looked like the headline. It was a group of interns
 * working out of the Geekdom office — not DEVSA — so the page was telling the
 * wrong story convincingly, which is worse than telling none. What a
 * photograph depicts cannot be read off the file, so this one was checked
 * before it shipped.
 *
 * ## The ramp was softened for this photograph, then put back
 *
 * It is a selfie, so the nearest face sits at about 19% of the frame, under
 * the solid end of the ramp. The ramp was opened up (0.66 by 42% instead of
 * 54%) to rescue him, on the theory that a group photograph missing one of the
 * group is worse than a different photograph.
 *
 * Rendered, it did not rescue him — he is a silhouette either way, because at
 * 19% no realistic ramp is light enough to show a face and still dark enough
 * to carry a headline. What the softening did do was bring the middle of the
 * frame up, so the second and third faces sat directly under the h1 and the
 * subtitle and competed with them.
 *
 * So the stops are the shared ones again. The trade had a cost and no benefit,
 * and the standard ramp also measures better on this image: h1 10.84:1,
 * subtitle 8.66:1, eyebrow 5.87:1 at the usual /55, against 5.67 / 5.66 / 4.17
 * soft — where /55 actually failed its 4.5 floor and forced the eyebrow to
 * /70. Measured against the brightest pixel in every column, not eyeballed.
 *
 * The lesson worth keeping: tune a ramp to a photograph only when a render
 * shows it working. This one was reasoned about and measured, and both said
 * yes while the screen said no.
 *
 * The filename carries the moment rather than the slot, because an asset named
 * about-hero is one that gets replaced in place, and replacing in place is how
 * three images this week went on serving stale bytes from the optimizer.
 */
export function AboutHero() {
  return (
    <section
      className="relative flex min-h-[70dvh] flex-col justify-center overflow-hidden bg-black lg:min-h-dvh"
      data-bg-type="dark"
    >
      <Image
        src="/photos/about-first-year-meetup.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      {/* The ramp, matching the other two heroes: solid where the copy sits,
          open where the room shows. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.92) 36%, rgba(0,0,0,0.74) 54%, rgba(0,0,0,0.40) 72%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {/* Below lg the copy runs the full width, so the ramp alone leaves words
          over the lit part of the room. */}
      <div aria-hidden className="absolute inset-0 z-10 bg-black/55 lg:hidden" />
      {/* The transition out of the hero, the same fade /buildingtogether uses
          so the photograph resolves to the ground below rather than stopping
          on an edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-20 h-32 bg-linear-to-t from-black to-transparent"
      />

      <div className="page-shell relative z-30 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/55">
            About DEVSA
          </p>
          <h1 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
            <span className="block">A Discord Server in 2023.</span>
            <span className="block">
              <span className="font-light italic text-white/55">
                A 501(c)(3) in
              </span>{" "}
              2024.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-xl font-light leading-[1.45] text-white/70 md:text-2xl">
            A volunteer-governed nonprofit that keeps San Antonio&apos;s tech
            community groups on one calendar, in one public directory, and in
            one room a few times a year.
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * The diligence packet, scannable.
 *
 * Four facts, because a grantmaker, a sponsorship committee and a journalist
 * all look for the same four and none of them read the prose first. The last
 * two are live, both from Firestore — the group count and the partner count —
 * so neither can drift the way a written-down number does.
 *
 * The first label says "Started", not "Founded". Founding a thing and opening
 * a Discord server are not the same act — anyone can do the second in under a
 * minute — and using the institutional verb for it both oversells the moment
 * and puts two different foundings in one row, since the cell beside it says
 * the organization was incorporated six months later. "Founded" is reserved
 * for March 2024, which is also what the page's JSON-LD `foundingDate`
 * carries.
 *
 * The partner count replaced a board count that read `boardMembers.length`.
 * Three is a true number and a weak one: a reader scanning for scale sees a
 * small board rather than a governed organization, and the board is named in
 * full further down this page, where "who runs this" is actually answered.
 * Partners is the number that belongs beside the groups, because the two
 * together say how much of the city this reaches.
 *
 * The `min-h-[2.5em]` on the value is for the two-column mobile layout, where
 * "September 2023" wraps to two lines and "March 2024" does not, which would
 * otherwise leave the two labels in that row sitting at different heights. Two
 * lines of `leading-tight` is 2.5em, so reserving it makes every label land on
 * the same baseline. Dropped at md, where all four values fit on one line.
 */
export function FoundingFacts({
  communityCount,
  partnerCount,
}: {
  communityCount?: number
  partnerCount?: number
}) {
  const facts = [
    { value: "September 2023", label: "Started as a Discord server" },
    { value: "March 2024", label: "Incorporated as a 501(c)(3)" },
    {
      value: communityCount ? String(communityCount) : "Every",
      label: "Community groups on the calendar",
    },
    {
      value: partnerCount ? String(partnerCount) : "—",
      label: "Partners backing the work",
    },
  ]

  return (
    <section className="w-full bg-white" data-bg-type="light">
      <div className="page-shell pt-16 md:pt-24">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-gray-200 py-10 md:grid-cols-4 md:gap-x-10">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="min-h-[2.5em] text-2xl font-black leading-tight tracking-[-0.02em] text-gray-900 md:min-h-0 md:text-3xl">
                {fact.value}
              </dt>
              <dd className="mt-3 text-sm leading-snug text-gray-500">
                {fact.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** The story, with the city as its subject. */
export function OriginProse() {
  return (
    <section className="w-full bg-white" data-bg-type="light">
      <div className="page-shell pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="max-w-3xl space-y-6 text-lg leading-[1.7] text-gray-600 md:text-xl">
          <p>
            The city had meetups. Python people and Linux people, designers and
            security folks and game developers, each running their own nights in
            their own rooms. What it did not have was anything connecting them —
            no shared calendar, no way for one group to reach another&apos;s
            people, and nothing that kept a conversation going after everyone
            went home.
          </p>
          <p>
            DEVSA started in September 2023 as a Discord server, which is not
            much of a claim — anyone can make one in under a minute, and most
            of them are empty by the weekend. It was made by someone who had
            come up through service work, taught himself to code, and gone
            looking for the city&apos;s builders only to find them scattered
            across rooms that never met.
          </p>
          <p>
            The server was never the point. What mattered was that people kept
            turning up in it, and that it eventually grew enough to put on an
            event. That event is where it stopped being a chat room and became
            something community groups and partners wanted to build with.
          </p>
          <p>
            Six months later it was a nonprofit. Incorporating as a 501(c)(3)
            in March 2024 is what made the rest of it possible — grants it could
            actually accept, sponsorship it could hold properly, and{" "}
            <Link
              href="#team"
              className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
            >
              a board
            </Link>{" "}
            standing between the organization and any one person.
          </p>
          <p>
            <strong className="font-semibold text-gray-900">
              The groups still run themselves.
            </strong>{" "}
            That was never the part that needed fixing. What DEVSA added was the
            connective tissue around them, and what that comes to in practice is
            set out on{" "}
            <Link
              href="/buildingtogether"
              className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
            >
              Building Together
            </Link>
            .
          </p>
        </div>

        {/* The coworking room, which has nowhere else to be linked from. */}
        <div className="mt-14 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
            Also in the record
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            For a while DEVSA kept a coworking room at Geekdom, open to the
            community and staffed by volunteers. It closed in September 2026.
            The page is still up because the people who gave it their time, and
            Geekdom for giving it the room, are worth keeping on the record.
          </p>
          <Link
            href="/coworking-space"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900"
          >
            The coworking space
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
