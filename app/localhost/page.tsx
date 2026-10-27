import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LocalhostHero } from "@/components/localhost/localhost-hero"
import { FollowTheWater } from "@/components/localhost/follow-the-water"
import { OutrunThe4 } from "@/components/localhost/outrun-the-4"
import { WatchItGetBuilt } from "@/components/localhost/watch-it-get-built"
import community from "@/public/localhost/community.json"
import permits from "@/public/localhost/permits.json"
import via from "@/public/localhost/via-route-4.json"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "localhost:210 — Build With San Antonio's Open Data"
const DESCRIPTION =
  "San Antonio has an API. Follow the water through three centuries of downtown, watch the City permit what's being built, and race a real VIA bus up San Pedro. Built on Bexar County, City of San Antonio and VIA open data. A DEVSA project."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/localhost" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteUrl}/localhost`,
    siteName: "DEVSA",
    type: "website",
    images: [{ url: `${siteUrl}/api/og/localhost`, width: 1200, height: 630, alt: "localhost:210: San Antonio has an API.", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${siteUrl}/api/og/localhost`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/**
 * localhost:210 — DEVSA's open-data project, on the site.
 *
 * One section per source, each with a single piece built from it that's worth
 * the visit. Bexar County's is "Follow the water": downtown from 1718, told
 * through the acequias, ending at Geekdom's corner and the meetups DEVSA brings
 * there today. VIA's is "Outrun the 4", a race against a real Route 4 trip
 * on the published schedule. The City's is "Watch downtown get built", every
 * building permit issued downtown since January 2025, in the order it was issued.
 *
 * "Today" comes from the calendar snapshot in public/localhost/community.json
 * (scripts/build-community.py). Geekdom is a DEVSA partner and the room: DEVSA
 * brings the groups, the groups run their meetups.
 */
const geekdom = community.venues.find((v) => v.name === "Geekdom")
const today = { events: geekdom?.events ?? 0, groups: geekdom?.groups ?? [] }

const eyebrow = "font-mono text-[11px] uppercase tracking-widest text-white/50"
const h2 = "mt-4 text-balance font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl"
const link = "font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
const REPO = "https://github.com/devsanantonio/localhost"

/** Where to take a starter. Each section above already links its starter; these say what to make with one. */
const IDEAS = [
  { slug: "via-next-bus", source: "VIA Metropolitan Transit", title: "A departure board", body: "The next buses from the stop outside a library, a coworking lobby or a dorm, on a screen by the door. via-next-bus already answers the question; give it a face." },
  { slug: "permits-near-you", source: "City of San Antonio", title: "The wait", body: "Four25 San Pedro waited 785 days from filing to permit. Which kinds of work wait longest, and where? Chart filing-to-permit by type or council district." },
  { slug: "acequias", source: "Bexar County", title: "Your walk, in 1720", body: "Which acequias did your route to work cross, and when did they go dry? Put them under today's streets and see which ones the streets still follow." },
]
const ISSUES = `${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`

/** One card per section: what else the source publishes, and the starter that gets you into it. */
function BuildYourOwn({ starter, label, children }: { starter: string; label: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:flex-row md:items-center md:justify-between md:gap-10">
      <div className="max-w-3xl">
        <p className={eyebrow}>Build your own</p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{children}</p>
      </div>
      <a
        href={`${REPO}/tree/main/starters/${starter}`}
        className="inline-flex shrink-0 self-start md:self-center items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10"
      >
        Start with {label} <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  )
}

export default function LocalhostPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <LocalhostHero />

      <section id="bexar-county" className="scroll-mt-24 border-t border-neutral-900 py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}>Bexar County open data</p>
          <h2 className={h2}>
            Follow the water.{" "}
            <span className="font-light italic text-white/50">San Antonio, 1718 to today.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            Before San Antonio had streets it had acequias, irrigation ditches dug from the river and San Pedro Creek.
            Bexar County has mapped every one, with the year it was dug and the year it went dry, along with the fields
            and land grants they fed, in maps it made for San Antonio&apos;s 300th anniversary. They&apos;re published in
            its map services rather than on its open-data portal, which starts at 1896. Scroll, and three centuries pass over downtown: each ditch appears in the year the
            County dates it and fades in the year it was abandoned.
          </p>
          <div className="mt-10">
            <FollowTheWater today={today} />
          </div>
          <BuildYourOwn starter="acequias" label="Acequias">
            The County publishes more than 300 map layers: the acequias, missions and land grants of the 1700s, cattle
            drives and railroads, 15,349 buildings from 1896, 4,200 places from 1897, and every district map from Congress
            to your voter precinct. The starter tells you which acequias ran near any point, and maps them all with a
            year slider.
          </BuildYourOwn>
          <p className="mt-6 text-xs leading-relaxed text-white/50">
            Data: Bexar County Information Technology GIS (Tricentennial historical layers: river, acequias, labores, land
            grants, missions and presidio; 1896 Sanborn maps). Today: the DEVSA community calendar, as of{" "}
            {new Date(`${community.asOf}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            Grantees are named as the County records them. A DEVSA project, not affiliated with Bexar County.
          </p>
        </div>
      </section>

      <section id="city" className="scroll-mt-24 border-t border-neutral-900 py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}>City of San Antonio open data</p>
          <h2 className={h2}>
            Watch downtown get built.{" "}
            <span className="font-light italic text-white/50">Every permit since January 2025.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            Before anyone builds, remodels or rewires downtown, the City issues a permit, and it publishes every one.
            This is {(permits.permits.length / 4).toLocaleString("en-US")} of them, lit in the order they were issued,
            on the City&apos;s own map of its streets. Click a spot and the page asks the City&apos;s API what&apos;s
            being built there, live from your browser, and shows you the request.
          </p>
          <div className="mt-10">
            <WatchItGetBuilt />
          </div>
          <BuildYourOwn starter="permits-near-you" label="Permits near you">
            Every permit citywide, with its type, dates, declared value and square footage, and next to it 311 service
            calls, fire inspections, street and sidewalk projects and low-water crossings. The starter sends the same SQL
            as the map above for any point you give it, and says how long each permit took.
          </BuildYourOwn>
          <p className="mt-6 text-xs leading-relaxed text-white/50">
            Data: City of San Antonio Open Data, CC BY 4.0 (permits issued, through{" "}
            {new Date(`${permits.asOf}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            ); street centerlines from Development Services and Public Works. Permits name a primary contact, often a
            private person; this page never asks for it, and shows homes by their block. A DEVSA project, not affiliated
            with the City of San Antonio.
          </p>
        </div>
      </section>

      <section id="via" className="scroll-mt-24 border-t border-neutral-900 py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}>VIA Metropolitan Transit open data</p>
          <h2 className={h2}>
            Outrun the 4.{" "}
            <span className="font-light italic text-white/50">On VIA&apos;s real schedule.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            VIA publishes every trip its buses make, stop by stop and to the second. Press Run and you&apos;re at
            Navarro &amp; Houston, a block from Geekdom, with the next real Route 4 one stop behind you. The bus
            keeps its timetable, 24 times faster; you run 4% faster than it can average, so a clean run wins. Beat it up
            San Pedro to as many stops as you can.
          </p>
          <div className="mt-10">
            <OutrunThe4 />
          </div>
          <BuildYourOwn starter="via-next-bus" label="VIA next bus">
            6,098 stops, 88 routes and every scheduled trip through January 10, 2027, in GTFS, the format every transit
            app reads, plus where the buses are right now as GTFS-realtime. The starter tells you when the next bus leaves
            any stop.
          </BuildYourOwn>
          <p className="mt-6 text-xs leading-relaxed text-white/50">
            Data provided by VIA Metropolitan Transit: the published GTFS schedule, version {via.feed.version.split("_")[0]}.
            Bus times are VIA&apos;s; the runner, the sidewalk and the speed-up are the game. A DEVSA project, not
            affiliated with VIA.
          </p>
        </div>
      </section>

      <section id="build" className="scroll-mt-24 border-t border-neutral-900 py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}>Build with us</p>
          <h2 className={h2}>
            Your turn.{" "}
            <span className="font-light italic text-white/50">The data is open, and so is the code.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            Each starter is one Python file that asks one source a real question, and runs in under a minute. The repo
            has five, from the 1897 city directory to 311 by district, and{" "}
            <a href={`${REPO}/blob/main/SOURCES.md`} className={link}>SOURCES.md</a> covers everything the three publish,
            and their terms. Three places to take one:
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {IDEAS.map((idea) => (
              <a
                key={idea.slug}
                href={`${REPO}/tree/main/starters/${idea.slug}`}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900/70"
              >
                <p className={eyebrow}>Idea · {idea.source}</p>
                <p className="flex-1 text-white/80">
                  <span className="font-semibold text-white">{idea.title}.</span> {idea.body}
                </p>
                <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 group-hover:text-white">
                  Start from starters/{idea.slug} <ArrowUpRight className="h-3.5 w-3.5" />
                </p>
              </a>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={ISSUES} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100">
              Pick up a good first issue <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href={`${REPO}/blob/main/SHOWCASE.md`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10">
              Add yours to the showcase <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="/discord" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10">
              Show it in #build-and-tell
            </a>
            <Link href="/events" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30 hover:bg-white/10">
              Build with people: find a meetup
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
