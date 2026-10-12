import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getCampaign } from "@/lib/campaigns"
import { DD } from "@/components/demo-day/theme"
import { ConfluenciaDisplay, ConfluenciaName } from "@/components/demo-day/wordmark"
import { CampaignText } from "@/components/partners/campaign-name"
import {
  DEMO_DAY_DEADLINE,
  DEMO_DAY_DESCRIPTOR,
  DEMO_DAY_INDUSTRIES,
  DEMO_DAY_PAVILION_YEAR,
} from "@/lib/demo-day"

/**
 * DEVSA Demo Day, as a page of its own.
 *
 * ## What it is
 *
 * One event a year, alongside the four conferences rather than competing with
 * them for the same volunteers:
 *
 * - **Brief.** A lead industry partner explains their field — how the work gets
 *   done, where it breaks, where AI could fit into it.
 * - **Build.** Four weeks. Builders from the groups on the calendar, student
 *   organizations and independent builders take those problems on.
 * - **Demo.** The strongest teams present to the partner and invited investors
 *   in a closed afternoon; the evening opens the stage to everyone. The open
 *   half is what builds DEVSA an audience of its own, which is the point of
 *   owning the stage.
 *
 * ## It only happens if it is funded
 *
 * No funding, no Demo Day — and the decision has a date: funded by
 * DEMO_DAY_DEADLINE (lib/demo-day.ts), January 31, 2027. That deadline is
 * stated at the top, in the ask and in the terms, because an ask without a
 * date is easy to postpone. The *event* date is still a goal (April 2027) and
 * is only ever said with its condition. The lead partner's paid seat is the
 * likeliest thing to decide it, which is why it is the first way to back it.
 *
 * ## Order
 *
 * Masthead → flags → industries → Brief / Build / Demo → why DEVSA → the ask →
 * the form → the terms. Industries come before the format because a lead
 * partner's first question is "is this for my industry?". The Fiesta and theme
 * note sits with the terms, not in the masthead, where it pushed the buttons
 * down.
 *
 * ## Left out until it is true
 *
 * - **A dollar goal.** An owned stage costs roughly $41–55k against an
 *   unquoted venue. `goal` in lib/campaigns.ts is optional, and the terms show
 *   it only once it is set. It doubles as the go/no-go line, so it needs a
 *   decision date beside it when it lands.
 * - **The venue, the investors, the student organizations and any sponsor by
 *   name.** None has agreed to anything yet.
 * - **The prize.** A year of AI subscriptions for the top three teams is the
 *   intended one, added once a build partner has committed to it.
 * - **Model access for every builder.** The concept paper promised it; most of
 *   these builders pay for their own, and the rest is a build partner's to
 *   give, not a line in the budget.
 *
 * ## The look
 *
 * Night sky, papel picado and strings of lights, after Fiesta 2027's
 * "Cosmic Nights" theme — see components/demo-day/theme.tsx for the palette,
 * its measured contrast, and what it deliberately does not borrow.
 */
export const DEMO_DAY_ACCENT = DD.marigold

const DEMO_DAY = getCampaign("demo-day")

/**
 * The masthead: the name leads.
 *
 * It used to sit beside the papel picado sheet (DEVSA's mark and DEMO DAY cut
 * from marigold paper). Two big pieces of lettering competed, and on a phone
 * the sheet came first, so the first words a visitor read were "DEMO DAY",
 * not the event's name. The sheet now works off this page — the share card,
 * social, the /about band, print — and "A DEVSA Demo Day" says in words what
 * it said in paper.
 *
 * CONFLUENCIA is the display cut (Big Shoulders Inline). The h1 carries the
 * descriptor for screen readers and search. The builders' strip hangs above
 * this on phones and below it from lg up — see the page.
 */
export function DemoDayHero() {
  return (
    <section className="page-shell relative pb-12 pt-4 md:pb-16 md:pt-6 lg:pt-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
        Our first campaign
      </p>
      {/* 16.5vw fits the eleven letters inside the gutters on any phone;
          11rem from lg is as wide as the shell comfortably holds. */}
      <h1 className="mt-4">
        <ConfluenciaDisplay className="block text-[16.5vw] text-white lg:text-[11rem]" />
        <span className="sr-only">, {DEMO_DAY_DESCRIPTOR}</span>
      </h1>
      <p
        className="mt-3 font-sans text-2xl font-black tracking-[-0.02em] md:text-4xl"
        style={{ color: DD.marigold }}
      >
        {/* The edition, from the same year the pavilion line uses, so the
            two cannot disagree. Hero only: the share title, tab title and
            small labels keep the undated "a DEVSA Demo Day" so search results
            don't age. The funding condition sits a few lines below. */}
        DEVSA Demo Day {DEMO_DAY_PAVILION_YEAR}
      </p>
      <p className="mt-6 max-w-2xl text-balance font-sans text-xl font-black leading-[1.1] tracking-[-0.02em] text-white md:text-2xl">
        San Antonio&apos;s builders, on a stage DEVSA owns.
      </p>
      <p
        className="mt-6 max-w-2xl border-l-2 pl-5 text-pretty text-lg text-white/80 md:text-xl"
        style={{ borderColor: DEMO_DAY_ACCENT }}
      >
        Once a year, an industry partner brings the problem, San Antonio&apos;s
        builders bring the work, and investors are in the room when they show it.
      </p>
      <p className="mt-4 max-w-2xl pl-5.5 text-base font-semibold text-white md:text-lg">
        It happens if it is funded by {DEMO_DAY_DEADLINE}.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a
          href="#inquire-lead"
          className="group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
          style={{ backgroundColor: DD.marigold, color: DD.ink }}
        >
          Lead <ConfluenciaName />
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        {/* ?campaign= designates the gift — see lib/campaigns.ts. */}
        <Link
          href="/buildingtogether?campaign=demo-day#donate"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10"
        >
          Support <ConfluenciaName />
        </Link>
      </div>
    </section>
  )
}

const STEPS = [
  {
    label: "Brief",
    color: DD.pink,
    body: "An industry partner explains their field: where the work breaks, and where AI could help.",
  },
  {
    label: "Build",
    color: DD.turquoise,
    body: "Four weeks. Builders from our groups, student organizations and across the city take it on.",
  },
  {
    label: "Demo",
    color: DD.marigold,
    body: "The best teams present to the partner and invited investors. That evening, the stage opens to everyone.",
  },
]

export function DemoDaySteps() {
  return (
    <section className="page-shell pb-16 pt-12 md:pb-24 md:pt-16">
      <ol className="grid gap-10 md:grid-cols-3 md:gap-12">
        {STEPS.map((step, i) => (
          <li key={step.label}>
            <p
              className="font-mono text-xs tabular-nums tracking-wide"
              style={{ color: step.color }}
            >
              0{i + 1}
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
              {step.label}
            </p>
            <p className="mt-3 text-base leading-relaxed text-white/65 md:text-lg">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/*
 * The industries a year's brief can come from — the spotlight.
 *
 * Named so a reader at an aerospace company or a hospital system can see
 * themselves in the lead seat, and so each year has an identity: not a
 * general showcase, that year's industry. Six, chosen with Jesse:
 *
 * - AI is deliberately not one. It is what every Demo Day builds with; the
 *   industry is where the problem comes from. An "AI year" would be the one
 *   year without a real-world brief.
 * - "Military & defense", not "military": the contractors and agencies a lead
 *   partner would come from, not only the bases.
 *
 * A list of where a brief can come from, never a schedule: no year is assigned
 * to an industry and no partner is implied, because nothing is funded or
 * signed. One festival color each, so a year's sheet can later be cut in its
 * industry's color.
 */
const INDUSTRIES = DEMO_DAY_INDUSTRIES.map((i) => ({ name: i.name, color: DD[i.color] }))

export function DemoDayIndustries() {
  return (
    <section className="page-shell pb-16 md:pb-24">
      <div className="border-t border-white/10 pt-10 md:pt-14">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
          One industry a year · The pavilion
        </p>
        <h2 className="mt-5 max-w-4xl text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
          Each year, one industry that drives San Antonio gets the pavilion.
        </h2>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 md:mt-14 md:gap-x-12 md:gap-y-4">
          {INDUSTRIES.map((industry) => (
            <li
              key={industry.name}
              className="text-3xl font-black leading-tight tracking-[-0.02em] md:text-5xl"
              style={{ color: industry.color }}
            >
              {industry.name}
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl text-lg leading-[1.6] text-white/70 md:mt-14 md:text-xl">
          The lead partner brings the brief from their industry. The builders
          spend four weeks on its real problems. The investors in the room know
          the field.{" "}
          <strong className="font-semibold text-white">
            One industry, one room, one year&apos;s work on stage.
          </strong>{" "}
          The {DEMO_DAY_PAVILION_YEAR} pavilion goes to the lead partner&apos;s
          industry.
        </p>
      </div>
    </section>
  )
}

/**
 * Why DEVSA, in the site's own register.
 *
 * The homepage and Building Together make their case with specifics, not
 * superlatives — "the other altitude", "the people doing the work", "DEVSA put
 * it on the calendar". A first draft here led with "No one else in San Antonio
 * can put this room together" over a row of counted numbers, which was louder
 * than anything else on the site. The conviction stays; it is carried by what
 * DEVSA already has (the builders, the groups, the partners, on one calendar)
 * and what it has already run, said plainly.
 *
 * No figures. Counts from another site's schedule would need maintaining and
 * defending; the events themselves make the point.
 */
export function DemoDayWhy() {
  return (
    <section className="page-shell pb-16 md:pb-24">
      <div className="max-w-3xl border-t border-white/10 pt-10">
        <h2 className="font-sans text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
          The room is already here
        </h2>
        <p className="mt-5 text-lg leading-[1.6] text-white/70 md:text-xl">
          Builders, community groups and partners already meet on DEVSA&apos;s
          calendar. This fall we ran The Rand for Startup + Tech Week: The Model,
          Access Granted, PySanAntonio and the groups we host all year. We&apos;ve
          run Give-a-LOT, and brought the city&apos;s builders to{" "}
          <Link
            href="/events/zero-to-agent"
            className="font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
          >
            Zero to Agent
          </Link>{" "}
          and SheBuilds.{" "}
          <strong className="font-semibold text-white">
            Every one was someone else&apos;s stage. <ConfluenciaName /> is ours.
          </strong>
        </p>
      </div>
    </section>
  )
}

/*
 * The ask, made directly and in the site's words. Each row says what the
 * partner gets in plain terms; the buttons follow the site's own CTAs
 * ("Partner With Us", "Support DEVSA") rather than "talk to us". The lead seat
 * comes first: it is the single decision most likely to make Demo Day happen.
 * Each commitment opens the inquiry form below with that option chosen; giving
 * goes to the designated donation form.
 */
const WAYS: { name: string; body: React.ReactNode; cta: React.ReactNode; href: string }[] = [
  {
    name: "Lead partner",
    body: "The other altitude: set the brief for your industry and sit in the room when the builders show you what they made. One paid seat a year.",
    cta: (
      <>
        Lead <ConfluenciaName />
      </>
    ),
    href: "#inquire-lead",
  },
  {
    name: "Build partner",
    body: "Your AI tools in the hands of San Antonio's builders for four weeks, and a year of them as the prize for the top three teams.",
    cta: "Partner With Us",
    href: "#inquire-build",
  },
  {
    name: "Evening sponsor",
    body: "Your name on the open showcase: the night the whole community comes into the room.",
    cta: "Sponsor the Evening",
    href: "#inquire-evening",
  },
  {
    name: "Give",
    body: (
      <>
        Any amount, designated to <ConfluenciaName />. DEVSA is a 501(c)(3).
      </>
    ),
    cta: (
      <>
        Support <ConfluenciaName />
      </>
    ),
    href: "/buildingtogether?campaign=demo-day#donate",
  },
]

export function DemoDayBacking() {
  return (
    <section id="back-it" className="page-shell scroll-mt-20 pb-16 md:pb-24">
      <div className="max-w-4xl border-t border-white/10 pt-10">
        {/* The same scale as the industries heading: the spotlight and the ask
            are the page's two loud statements, and the ask should not read as
            the smaller of them. */}
        <h2 className="max-w-4xl text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
          {/* The display cut here too: at heading size the inline strokes hold,
              and the page's two biggest moments — the name and the ask — share
              one face. 0.89em so its capitals stand exactly as tall as the
              heading's: at 1em Big Shoulders' caps measure 48px against
              Geist's 42.6px. Smaller mentions stay stencil. */}
          What it takes to activate{" "}
          <ConfluenciaDisplay className="inline-block align-baseline text-[0.89em] leading-none" />
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-[1.6] text-white/70 md:text-xl">
          Two things, by {DEMO_DAY_DEADLINE}.{" "}
          <strong className="font-semibold text-white">
            A lead partner from one of these industries
          </strong>
          , in the paid seat that sets the brief, and{" "}
          <strong className="font-semibold text-white">
            the funding to put it on our own stage
          </strong>
          . This is what each part looks like.
        </p>

        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {WAYS.map((way) => {
            // Page routes go through Link; in-page anchors stay plain <a>, because
            // Link changes the hash without firing `hashchange`, and the inquiry
            // form listens for it to preselect the option the button named.
            const internal = way.href.startsWith("/")
            const className =
              "group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold"
            const label = (
              <>
                {way.cta}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )
            return (
              <li
                key={way.name}
                className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-6"
              >
                <p className="text-base font-semibold text-white">{way.name}</p>
                <p className="text-base leading-relaxed text-white/65">{way.body}</p>
                {internal ? (
                  <Link href={way.href} className={className} style={{ color: DD.marigold }}>
                    {label}
                  </Link>
                ) : (
                  <a href={way.href} className={className} style={{ color: DD.marigold }}>
                    {label}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/**
 * The funding rule, then when and where the look comes from — the fine print,
 * stated where a donor or a board member will look for it.
 *
 * The Fiesta note moved here from the masthead. The date is a goal, not a
 * commitment, so it says "our goal" and not "join us on". Fiesta is named
 * because it says when; the next clause says it is not an official Fiesta
 * event, which matters for a registered mark (Fiesta®) and for a reader who
 * would otherwise assume a listing. The theme is credited to the parade whose
 * theme it is.
 */
export function DemoDayTerms() {
  return (
    <section className="page-shell pb-20 md:pb-28">
      <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
          The terms
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/75">
          <CampaignText campaign="demo-day" text={DEMO_DAY.ifUnfunded} />
          {DEMO_DAY.goal && (
            <>
              {" "}
              The goal is{" "}
              <strong className="font-semibold text-white">
                {DEMO_DAY.goal.amount}
              </strong>
              , {DEMO_DAY.goal.covers}.
            </>
          )}{" "}
          DEVSA is a 501(c)(3), so gifts may be tax-deductible —{" "}
          <Link
            href="/about#the-record"
            className="font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
          >
            the record
          </Link>
          .
        </p>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-white/55">
          When, and the look
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/75">
          Our goal is April 2027, during Fiesta week. <ConfluenciaName /> isn&apos;t an
          official Fiesta event; its look follows the 2027 Fiesta Flambeau
          Parade theme,{" "}
          <span className="italic text-white">Cosmic Nights: A Universe of Lights</span>
          , because the open evening is a night under lights too.
        </p>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-white/55">
          The name
        </p>
        <p className="mt-3 text-base leading-relaxed text-white/75">
          San Antonio&apos;s 1968 World&apos;s Fair celebrated a{" "}
          <span className="italic text-white">confluence of civilizations in the Americas</span>.
          <ConfluenciaName /> is a smaller one: an industry&apos;s problem, the city&apos;s
          builders and the people who invest in what they make, in one room. Each
          year&apos;s industry gets the pavilion, the way the fair&apos;s nations did.
        </p>
      </div>
    </section>
  )
}
