import { countInWords } from "@/lib/count-words"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { FUNDER_CONTACT } from "@/lib/contact"

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
      className="relative flex flex-col justify-center overflow-hidden bg-black md:min-h-[60dvh] lg:min-h-dvh"
      data-bg-type="dark"
    >
      {/* No photograph on phones: the copy runs the full width there, so the
          room was only ever a dimmed texture behind the words, and the hero is
          type on black at its own height instead of 60% of the screen. The
          tiny phone entry in `sizes` keeps the priority preload from fetching
          a full-width image that is never shown. */}
      <Image
        src="/photos/about-first-year-meetup.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="(max-width: 767px) 16px, 100vw"
        className="hidden object-cover object-center opacity-70 md:block"
      />
      {/* The ramp, matching the other two heroes: solid where the copy sits,
          open where the room shows. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.92) 36%, rgba(0,0,0,0.74) 54%, rgba(0,0,0,0.40) 72%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {/* Below lg the copy runs the full width, so the ramp alone leaves words
          over the lit part of the room. */}
      <div aria-hidden className="absolute inset-0 z-10 hidden bg-black/55 md:block lg:hidden" />
      {/* The transition out of the hero, the same fade /buildingtogether uses
          so the photograph resolves to the ground below rather than stopping
          on an edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-20 hidden h-32 bg-linear-to-t from-black to-transparent md:block"
      />

      <div className="page-shell relative z-30 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/55">
            About DEVSA
          </p>
          <h1 className="mt-5 font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
            <span className="block">A Discord Server <span className="whitespace-nowrap">in 2023.</span></span>
            <span className="block">
              <span className="font-light italic text-white/55">
                A 501(c)(3) in
              </span>{" "}
              2024.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-xl font-light leading-[1.45] text-white/70 md:text-2xl lg:max-w-[46rem]">
            {/* Introduces the phrase the story below explains: civic
                infrastructure, then what it is and who governs it.
                text-pretty and the non-breaking space keep "board" from
                landing alone on the last line at laptop and monitor widths. */}
            Civic infrastructure for San Antonio&apos;s tech community: one
            calendar, one public directory, one channel to follow, and one room
            a few times a year, governed by a volunteer&nbsp;board.
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
 * On phones the two dates use short forms (see `short` below) so every value
 * stays on one line at two columns, and the labels line up without reserving
 * height.
 */
export function FoundingFacts({
  communityCount,
  partnerCount,
}: {
  communityCount?: number
  partnerCount?: number
}) {
  // `short` is the phone form: at two columns "September 2023" wrapped while
  // "March 2024" did not, and the space reserved to keep the labels level left
  // a gap under every one-line value. Short forms keep every value to one line,
  // so nothing needs reserving. "501(c)(3)" is held together, because it was
  // breaking after "(c)".
  const facts: { value: string; short?: string; label: React.ReactNode }[] = [
    { value: "September 2023", short: "Sept 2023", label: "Started as a Discord server" },
    { value: "March 2024", short: "Mar 2024", label: <>Incorporated as a <span className="whitespace-nowrap">501(c)(3)</span></> },
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
      <div className="page-shell pt-10 md:pt-24">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-gray-200 py-10 md:grid-cols-4 md:gap-x-10">
          {facts.map((fact) => (
            <div key={fact.value}>
              <dt className="text-2xl font-black leading-tight tracking-[-0.02em] text-gray-900 md:text-3xl">
                {fact.short ? (
                  <>
                    <span className="md:hidden">{fact.short}</span>
                    <span className="hidden md:inline">{fact.value}</span>
                  </>
                ) : (
                  fact.value
                )}
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

/**
 * The story, with the city as its subject.
 *
 * It opens on the problem and on what DEVSA is, before how it started. The
 * first paragraph used to be "The city had meetups…", which said the local
 * half of this; the statement that replaced it adds the city-scale stake (a
 * city that cannot show its builders to each other has a harder time keeping
 * them) and names DEVSA as civic infrastructure, the phrase a funder reads
 * as public good rather than as a product. Everything in it is checkable:
 * San Antonio is the seventh-largest US city, the count comes from the live
 * directory, and the four things listed all exist. No borrowed statistics.
 *
 * It stops short of "and the groups still run themselves": that line is the
 * story's closing beat, further down, and saying it here would spend it.
 */
export function OriginProse({ communityCount }: { communityCount?: number }) {
  const groups = communityCount ? `${countInWords(communityCount)} tech groups` : "The city's tech groups"
  return (
    <section className="w-full bg-white" data-bg-type="light">
      <div className="page-shell pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="max-w-3xl space-y-6 text-lg leading-[1.7] text-gray-600 md:text-xl">
          <p>
            San Antonio is one of the largest cities in the country, and it has
            never lacked people who build things. What it lacks is anything that
            connects them. {groups} run their own meetups, on their own
            calendars, for their own audiences, and most of them can&apos;t see
            each other. A student finishing a program, a developer new to the
            city, an engineer deciding whether to stay: none of them has one
            place to find the people doing the work they want to do. People stay
            where they&apos;ve found their people, and a city that can&apos;t
            show its builders to each other has a harder time keeping them.
          </p>
          <p>
            DEVSA is the{" "}
            <strong className="font-semibold text-gray-900">civic infrastructure</strong>{" "}
            for that first part: a shared calendar every group publishes to, a
            public directory anyone can search, one channel to follow for the
            groups that have none of their own, and a few rooms a year where
            all of it meets. A volunteer board runs it as a 501(c)(3).
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

/**
 * The record, for anyone who has to verify it.
 *
 * A grantmaker, a corporate match portal and a donor-advised fund all ask for
 * the same handful of fields before they will process anything, and until this
 * none of them were on the site. The 501(c)(3) claim appeared in eleven places
 * and was nowhere backed by a number anyone could check.
 *
 * Everything here is already public. The EIN is on the 990-N, which is marked
 * "Open to Public Inspection", and the whole record is in the IRS Tax Exempt
 * Organization Search. Publishing it is not disclosure, it is saving a program
 * officer a lookup.
 *
 * What is deliberately NOT here: the address of record, which is residential;
 * budget figures, which would need maintaining to stay honest; and any history
 * of who has or has not funded DEVSA. An earlier draft carried a paragraph on
 * where the money had come from and a line about the one grant application
 * DEVSA has made. Both were true and both were oversharing — a funding history
 * is something to answer when a funder asks, not something to lead with on a
 * public page.
 *
 * Built in FoundingFacts' shape — the same bordered row on white — because it
 * is the same kind of thing: facts to scan, not an argument to read.
 *
 * 509(a)(2) is stated rather than just "501(c)(3)" because the distinction is
 * load-bearing. It is the public-support test built on program service and
 * exempt-function income rather than on gifts and grants, which is a different
 * organization than a 509(a)(1) and a funder reading carefully will know it.
 */
const IRS_TEOS_URL =
  "https://apps.irs.gov/app/eos/details/?ein=992066455&name=DEVSA&city=San%20Antonio&state=TX&countryAbbr=US&dba=&type=CHARITIES,%20DETERMINATIONLETTERS,%20EPOSTCARD&orgTags=CHARITIES&orgTags=DETERMINATIONLETTERS&orgTags=EPOSTCARD"

export function TheRecord() {
  const facts: { label: string; value: string }[] = [
    { label: "Legal name", value: "DEVSA" },
    { label: "EIN", value: "99-2066455" },
    { label: "IRS status", value: "501(c)(3) public charity, 509(a)(2)" },
    { label: "Exemption effective", value: "March 12, 2024" },
    { label: "Fiscal year", value: "January 1 – December 31" },
    { label: "Contributions", value: "Tax-deductible under Section 170" },
    // The 990-N is a postcard: name, EIN, receipts under $50,000. Stated, not
    // posted — the filed copy carries the residential address of record, which
    // this section leaves out on purpose. The IRS link below lets a funder see it.
    { label: "Annual filing", value: "Form 990-N (e-Postcard), 2025" },
    { label: "Code of conduct", value: "Adopted October 12, 2026" },
  ]

  return (
    <section id="the-record" className="w-full scroll-mt-20 bg-white" data-bg-type="light">
      <div className="page-shell py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-gray-500">
            For Funders
          </p>
          <h2 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
            On the{" "}
            <span className="font-light italic text-gray-400">Record</span>.
          </h2>
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 border-y border-gray-200 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm leading-snug text-gray-500">{fact.label}</dt>
              <dd className="mt-2 text-xl font-black leading-tight tracking-[-0.01em] text-gray-900">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* IRS Tax Exempt Organization Search: the determination letter and every
            e-Postcard, from the source, so no one has to take this page's word for it.
            The IRS blocks automated requests, so this link was not machine-checked. */}
        <p className="mt-6 text-sm text-gray-500">
          <a
            href={IRS_TEOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
          >
            Verify with the IRS
          </a>{" "}
          · <Link href="/code-of-conduct" className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900">Code of conduct</Link>
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Need something that is not here?{" "}
          <a
            href={`mailto:${FUNDER_CONTACT}`}
            className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
          >
            {FUNDER_CONTACT}
          </a>
        </p>
      </div>
    </section>
  )
}
