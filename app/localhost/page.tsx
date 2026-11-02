import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LocalhostHero } from "@/components/localhost/localhost-hero"
import { FollowTheWater } from "@/components/localhost/follow-the-water"
import { OutrunThe4 } from "@/components/localhost/outrun-the-4"
import { WatchItGetBuilt } from "@/components/localhost/watch-it-get-built"
import { LayerCatalog } from "@/components/localhost/layer-catalog"
import { getCatalog, getStatus } from "@/lib/localhost-data"
import community from "@/public/localhost/community.json"
import permits from "@/public/localhost/permits.json"
import via from "@/public/localhost/via-route-4.json"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "localhost:210 — Build With San Antonio's Open Data"
// Leads with the hero's hook: seven APIs and no one place to find them, which is
// what localhost:210 answers. The three pieces are experiments, not products.
const DESCRIPTION =
  "San Antonio has seven open-data APIs and no one place to find them. localhost:210 is the bridge to every agency publishing them: search all seven at once, and three small experiments to see what's in there: follow the water through three centuries of downtown, watch the City permit what's being built, and race a real VIA bus up San Pedro. A DEVSA project."

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
 * The sections run in time, and their labels say so: 1718 to today, since 2025,
 * right now, next. They also share a place: the water story ends at Geekdom's
 * corner, the permits are the blocks around it, and the bus race starts a
 * block away. Keep that order. "Your turn" is the one light section, because
 * it's where the reader stops watching and starts building; the three pieces
 * are drawn for a dark ground and stay on it.
 *
 * Seven agencies publish San Antonio's open data, not three: the Build section
 * lists all of them (#publishers), and the repo's peek starter reads any of them.
 * Four have no piece here; they're how the question cards reach past the three.
 *
 * "Today" comes from the calendar snapshot in public/localhost/community.json
 * (scripts/build-community.py). Geekdom is a DEVSA partner and the room: DEVSA
 * brings the groups, the groups run their meetups.
 */
/** The City's bond projects under construction downtown since January 2025, from the same file. */
const publicTotal = permits.public.length
const publicBudget = permits.public.reduce((sum, b) => sum + b.budget, 0)
const money = (v: number) => `$${Math.round(v / 1e6)} million`
const geekdom = community.venues.find((v) => v.name === "Geekdom")
const today = { events: geekdom?.events ?? 0, groups: geekdom?.groups ?? [] }

const eyebrow = "font-mono text-[11px] uppercase tracking-widest text-white/50"
const h2 = "mt-4 text-balance font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-4xl lg:text-5xl"
const eyebrowLight = "font-mono text-[11px] uppercase tracking-widest text-gray-500"
const h2Light = h2.replace("text-white", "text-gray-900")
const REPO = "https://github.com/devsanantonio/localhost"

/** Questions to start from, each one command away. Output is real, from a run on Nov 2, 2026, trimmed;
    the numbers move as the agencies update. Curiosity, not products. */
const IDEAS = [
  {
    slug: "funded-projects", source: "Alamo Area MPO · City of San Antonio", title: "Where the money goes.",
    body: "The MPO's 68 funded road and transit projects for 2027–2030, and the City's 370 bond projects, on one map. Which districts' projects run behind?",
    run: "python3 starters/funded-projects/main.py",
    output: ["2027   31 projects   $1,030.0M", "2028   18 projects     $842.9M", "2029    9 projects     $121.9M", "2030   10 projects      $77.1M"],
  },
  {
    slug: "funded-projects", source: "Alamo Area MPO · USGS", title: "When it rains.",
    body: "6,372 road segments, each scored for how much of it floods. Which roads on your commute go under first? creek-levels adds the live gauges.",
    run: "python3 starters/funded-projects/main.py --flooding",
    output: ["2.36 mi   3 segments  Mission Pkwy", "1.61 mi   2 segments  Elbel Rd", "1.39 mi   2 segments  Evans"],
  },
  {
    slug: "permits-near-you", source: "City of San Antonio", title: "The wait.",
    body: "A new $18 million building at 425 San Pedro Ave waited 785 days for its permits. Which kinds of work wait longest, and where?",
    run: "python3 starters/permits-near-you/main.py",
    output: ["28 building permits within 150 m of Geekdom's corner", "Median wait from filing to permit: 63 days."],
  },
]

/** Who publishes San Antonio's open data. The first three have a piece above; the first seven are the hero's "Seven APIs". USGS is the federal extra, labeled as such.
    catalogName is how the repo's weekly catalog and check name each publisher. */
const PUBLISHERS = [
  { name: "Bexar County", catalogName: "Bexar County", href: "https://gis-bexar.opendata.arcgis.com", tags: "1718 · 1896 · census · districts" },
  { name: "City of San Antonio", catalogName: "City of San Antonio", href: "https://data.sanantonio.gov", tags: "permits · 311 · bonds · streets" },
  { name: "VIA Metropolitan Transit", catalogName: "VIA Metropolitan Transit", feeds: true, href: "https://www.viainfo.net/developers-resources/", tags: "routes · stops · live buses" },
  { name: "San Antonio River Authority", catalogName: "San Antonio River Authority", href: "https://sariverauthority-sara-tx.opendata.arcgis.com", tags: "creeks · floodplains · water quality" },
  { name: "Alamo Area MPO", catalogName: "Alamo Area MPO", href: "https://aampo-openmap-nexus-mpo.hub.arcgis.com", tags: "road projects · flood risk · bikes" },
  { name: "Opportunity Home San Antonio", catalogName: "Opportunity Home San Antonio", href: `${REPO}/blob/main/SOURCES.md#opportunity-home-san-antonio`, tags: "housing · low water crossings" },
  { name: "Edwards Aquifer Authority", catalogName: "Edwards Aquifer Authority", href: "https://data.edwardsaquifer.org", tags: "aquifer level · springflow" },
  { name: "USGS", catalogName: "U.S. Geological Survey", feeds: true, href: "https://waterdata.usgs.gov", tags: "federal · live creek gauges, every 15 min" },
]

/** Real output from `python3 main.py --find flood` in starters/peek, October 29, 2026: the first lines of 33. */
const PEEK_FLOOD = [
  ["Oct 19, 2026", "San Antonio River Authority ", "Proposed Nature Based Solution Projects view"],
  ["Sep 30, 2026", "Opportunity Home San Antonio", "Opportunity Home _ Low Water Crossings_WFL1"],
  ["Sep 30, 2026", "City of San Antonio         ", "LowWaterCrossings"],
  ["Jul 15, 2026", "San Antonio River Authority ", "Draft Floodplain Lower San Antonio River"],
]
const ISSUES = `${REPO}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`

/**
 * Each section's close: not another card, but a rule and one line of intent. A question the starter
 * answers, a few numbers about what the source holds, the command, and the way in. The credit line sits
 * under it, small, as part of the same close. Other publishers that pair with a section are in the
 * Build section's list, not repeated here.
 */
function BuildYourOwn({
  starter, label, question, facts, args = "", children,
}: { starter: string; label: string; question: string; facts: [string, string][]; args?: string; children: React.ReactNode }) {
  return (
    // A full-width band at the foot of the section, a shade lighter than the page: it reads as the section's
    // footer, so its end can't be mistaken for the next section's start. The question is set lighter than
    // a section heading on purpose; only section titles are black-weight.
    <div className="mt-16 border-t border-neutral-800 bg-[#121212] md:mt-20">
      <div className="page-shell py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10">
          <div className="min-w-0">
            <p className={eyebrow}>
              <span className="text-[#ff8200]">&gt;</span> Build your own
            </p>
            <p className="mt-2 text-xl font-semibold leading-snug text-white md:text-2xl">{question}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px]">
              {facts.map(([n, what]) => (
                <li key={what}>
                  <span className="text-white">{n}</span> <span className="text-white/60">{what}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-3 md:items-end">
            <code className="max-w-full overflow-x-auto whitespace-nowrap font-mono text-[12px] text-white/70">
              <span className="text-[#ff8200]">$</span> python3 starters/{starter}/main.py{args ? ` ${args}` : ""}
            </code>
            <a
              href={`${REPO}/tree/main/starters/${starter}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
            >
              Start with {label} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-6 border-t border-neutral-800/70 pt-4 text-xs leading-relaxed text-white/50">{children}</p>
      </div>
    </div>
  )
}

const shortDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export default async function LocalhostPage() {
  // The repo's weekly check: catalog counts and which sources answered. Each can be null.
  const [catalog, status] = await Promise.all([getCatalog(), getStatus()])
  const checkedOn = status ? shortDay(status.checked_at.slice(0, 10)) : ""
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <LocalhostHero />

      <section id="bexar-county" className="scroll-mt-24 border-t border-neutral-900 pt-16 md:pt-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}><span className="text-white/80">1718 → today</span> · Bexar County open data</p>
          <h2 className={h2}>
            Follow the water.{" "}
            <span className="font-light italic text-white/50">San Antonio, 1718 to today.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            Before San Antonio had streets, it had acequias: ditches dug from the river and San Pedro Creek. Bexar County
            has mapped every one, with the year it was dug and the year it went dry. Scroll, and three centuries pass over
            downtown.
          </p>
          <div className="mt-10">
            <FollowTheWater today={today} />
          </div>
        </div>
        <BuildYourOwn
          starter="acequias"
          label="Acequias"
          question="Which acequia ran past your street?"
          facts={[["300+", "County map layers"], ["15,349", "buildings from 1896"], ["4,200", "places from 1897"], ["348", "land grants"]]}
        >
          Data: Bexar County Information Technology GIS (Tricentennial historical layers: river, acequias, labores, land
          grants, missions and presidio; 1896 Sanborn maps). Today: the DEVSA community calendar, as of{" "}
          {new Date(`${community.asOf}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          Grantees are named as the County records them. Live creek level: U.S. Geological Survey, gauge 08178500. A
          DEVSA project, not affiliated with Bexar County or USGS.
        </BuildYourOwn>
      </section>

      <section id="city" className="scroll-mt-24 border-t border-neutral-900 pt-16 md:pt-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}><span className="text-white/80">Since 2025</span> · City of San Antonio open data</p>
          <h2 className={h2}>
            Watch downtown get built.{" "}
            <span className="font-light italic text-white/50">Every permit since January 2025.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            The City publishes every permit it issues. Here are the{" "}
            {(permits.permits.length / 4).toLocaleString("en-US")} downtown since January 2025, lit in the order they were
            issued, and in teal the City&apos;s own bond projects: {publicTotal} of them, {money(publicBudget)}.
          </p>
          <div className="mt-10">
            <WatchItGetBuilt />
          </div>
        </div>
        <BuildYourOwn
          starter="permits-near-you"
          label="Permits near you"
          question="What's being built on your block?"
          args="--meters 60"
          facts={[[(permits.permits.length / 4).toLocaleString("en-US"), "permits downtown since 2025"], ["370", "bond projects citywide"], ["½ million", "311 calls"], ["1", "SQL query"]]}
        >
          Data: City of San Antonio Open Data, CC BY 4.0 (permits issued, through{" "}
          {new Date(`${permits.asOf}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          ); bond projects from the City&apos;s Bond Program, citywide programs left out; street centerlines from
          Development Services and Public Works. Permits name a primary contact, often a
          private person; this page never asks for it, and shows homes by their block. A DEVSA project, not affiliated
          with the City of San Antonio.
        </BuildYourOwn>
      </section>

      <section id="via" className="scroll-mt-24 border-t border-neutral-900 pt-16 md:pt-24" data-bg-type="dark">
        <div className="page-shell">
          <p className={eyebrow}><span className="text-white/80">Right now</span> · VIA Metropolitan Transit open data</p>
          <h2 className={h2}>
            Outrun the 4.{" "}
            <span className="font-light italic text-white/50">On VIA&apos;s real schedule.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-white/70">
            VIA publishes every trip its buses make, to the second. Race the next real Route 4 from Navarro &amp;
            Houston, a block from Geekdom, up San Pedro.
          </p>
          <div className="mt-10">
            <OutrunThe4 />
          </div>
        </div>
        <BuildYourOwn
          starter="via-next-bus"
          label="VIA next bus"
          question="When does the next bus leave your stop?"
          args={'"houston & st mary"'}
          facts={[["6,098", "stops"], ["88", "routes"], ["every", "scheduled trip"], ["live", "bus positions"]]}
        >
          Data provided by VIA Metropolitan Transit: the published GTFS schedule, version {via.feed.version.split("_")[0]}.
          Bus times are VIA&apos;s; the runner, the sidewalk and the speed-up are the game. A DEVSA project, not
          affiliated with VIA.
        </BuildYourOwn>
      </section>

      <section id="build" className="scroll-mt-24 bg-white py-16 text-gray-900 md:py-24" data-bg-type="light">
        <div className="page-shell">
          <p className={eyebrowLight}><span className="text-gray-900">Next</span> · Build with us</p>
          <h2 className={h2Light}>
            Your turn.{" "}
            <span className="font-light italic text-gray-500">The data is open, and so is the code.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-gray-600">
            Ten starters, one Python file each, at least one for every publisher, each running in under a minute and
            each taking <code className="font-mono text-[0.9em] text-gray-900">--json</code>. Start from a source, or search all seven at once.
          </p>

          {/* Shown, not described: peek searching every publisher for one word. Real output, trimmed. */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">starters/peek · no sign-up, no keys, Python 3.9+</p>
              <a href={`${REPO}/tree/main/starters/peek`} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70 hover:text-white">
                Open it <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <pre className="overflow-x-auto px-5 py-4 font-mono text-[12px] leading-relaxed text-white/70">
              {/* The clone, which the hero's quickstart box used to show. */}
              <span className="text-[#ff8200]">$</span> <span className="text-white">git clone {REPO} &amp;&amp; cd localhost/starters/peek</span>{"\n\n"}
              <span className="text-[#ff8200]">$</span> <span className="text-white">python3 main.py --find flood</span>{"\n"}
              <span className="text-white/50">33 public layers mention &quot;flood&quot;, newest first</span>{"\n"}
              {PEEK_FLOOD.map(([date, who, title]) => (
                <span key={title}>
                  {date.padEnd(14)}<span className="text-[#00b2a9]">{who}</span>  {title}{"\n"}
                </span>
              ))}
              <span className="text-white/50">…</span>{"\n\n"}
              <span className="text-[#ff8200]">$</span> <span className="text-white">python3 main.py &lt;any layer&gt;</span>
              <span className="text-white/50">   # its fields, first rows and credit line</span>
            </pre>
          </div>

          {/* Who publishes what, as tiles: a name and a few words each. The full story is SOURCES.md. */}
          <div id="publishers" className="mt-10 scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              {/* Says the count, because the hero's "Seven APIs" links here and there are
                  eight tiles: USGS is federal, not one of San Antonio's seven. */}
              <p className={eyebrowLight}>Who publishes what: San Antonio&apos;s seven, plus USGS</p>
              <a href={`${REPO}/blob/main/SOURCES.md`} className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-gray-900">
                What each has, and its terms: SOURCES.md
              </a>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {PUBLISHERS.map((p) => (
                <li key={p.name}>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors duration-200 hover:border-gray-300 hover:bg-white">
                    <span className="text-sm font-medium leading-snug text-gray-900">{p.name}</span>
                    <span className="font-mono text-[11px] leading-relaxed text-gray-600 group-hover:text-gray-900">{p.tags}</span>
                    {(() => {
                      const count = catalog?.by_publisher[p.catalogName]
                      const answered = status?.publishers.find((x) => x.publisher === p.catalogName)
                      if (count === undefined && !answered) return null
                      return (
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-200 pt-2 text-[11px] text-gray-600">
                          {count !== undefined && <span>{count.toLocaleString()} {p.feeds ? (count === 1 ? "feed" : "feeds") : count === 1 ? "layer" : "layers"}</span>}
                          {answered && (
                            <span className="inline-flex items-center gap-1">
                              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${answered.ok ? "bg-emerald-600" : "bg-amber-600"}`} />
                              {answered.ok ? "answered" : "didn't answer"} {checkedOn}
                            </span>
                          )}
                        </span>
                      )
                    })()}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-600">
              Each publisher&apos;s data is its own, under its own terms. DEVSA isn&apos;t affiliated with any of them.
              {status && " Layer counts and answers come from the repo's weekly check, which runs every starter against its live source."}
            </p>
          </div>

          {/* The catalog: one place to find them, literally. Every public layer, searchable, refreshed weekly. */}
          {catalog && (
            <div id="catalog" className="mt-16 scroll-mt-24 border-t border-gray-200 pt-12">
              <p className={eyebrowLight}>Every layer, one list</p>
              <p className="mt-4 max-w-2xl text-balance font-sans text-2xl font-black leading-tight tracking-[-0.01em] text-gray-900 md:text-3xl">
                {catalog.count.toLocaleString()} public layers.{" "}
                <span className="font-light italic text-gray-500">Search them all.</span>
              </p>
              <p className="mt-3 max-w-2xl text-gray-600">
                Every public map layer from every publisher, plus VIA&apos;s feeds, the USGS gauges and the J-17 well.
                Rebuilt every Monday, and in the repo as{" "}
                <a href={`${REPO}/blob/main/data/catalog.json`} className="font-mono text-[0.9em] text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">data/catalog.json</a>.
              </p>
              {/* One column: the list is newest first, so it already shows what changed. A
                  separate "recently updated" column beside it repeated the same layers. */}
              <div className="mt-6 max-w-3xl">
                <LayerCatalog publishers={Object.entries(catalog.by_publisher).map(([name, count]) => ({ name, count }))} />
              </div>
            </div>
          )}

          {/* After the tiles, a change of pace rather than a third grid: the questions read as a numbered
              list, set off by a rule, the way the page's own sections are. */}
          <div className="mt-16 border-t border-gray-200 pt-12">
            <p className={eyebrowLight}>Not sure where to start?</p>
            <p className="mt-4 max-w-2xl text-balance font-sans text-2xl font-black leading-tight tracking-[-0.01em] text-gray-900 md:text-3xl">
              Start with a question.{" "}
              <span className="font-light italic text-gray-500">Here are three.</span>
            </p>
            <ol className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {IDEAS.map((idea, i) => (
                <li key={idea.title}>
                  <a
                    href={`${REPO}/tree/main/starters/${idea.slug}`}
                    className="group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 py-6 md:grid-cols-[3rem_1fr_auto] md:items-baseline md:gap-x-8"
                  >
                    <span className="font-mono text-sm text-[#d6335c]">0{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-lg font-semibold text-gray-900">{idea.title}</span>
                      <span className="mt-1 block text-gray-600">{idea.body}</span>
                      <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest text-gray-600">{idea.source}</span>
                      {/* The answer is one command away: the command, and a few lines of what it printed. */}
                      <span className="mt-4 block overflow-x-auto rounded-lg bg-[#0a0a0a] px-4 py-3 font-mono text-[12px] leading-relaxed text-white/70">
                        <span className="block whitespace-nowrap">
                          <span className="select-none text-[#ff8200]">$ </span>
                          <span className="text-white">{idea.run}</span>
                        </span>
                        {idea.output.map((line) => (
                          <span key={line} className="block whitespace-pre">{line}</span>
                        ))}
                      </span>
                    </span>
                    <span className="col-start-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-gray-600 transition-colors group-hover:text-gray-900 md:col-start-3">
                      starters/{idea.slug} <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Their own agent, their own model account: nothing hosted, nothing billed to DEVSA. */}
          <div className="mt-16 grid gap-6 border-t border-gray-200 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-12">
            <div>
              <p className={eyebrowLight}>Use it with your agent</p>
              <p className="mt-4 text-balance font-sans text-2xl font-black leading-tight tracking-[-0.01em] text-gray-900 md:text-3xl">
                Ask San Antonio.{" "}
                <span className="font-light italic text-gray-500">From your own Claude Code.</span>
              </p>
              <p className="mt-3 text-gray-600">
                The repo&apos;s MCP starter gives any agent the data as tools: search every publisher, look inside a layer,
                run a starter. It runs on your machine, on your own model account, and it hands your agent the same rules
                as{" "}
                <a href={`${REPO}/blob/main/AGENTS.md`} className="font-mono text-[0.9em] text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">AGENTS.md</a>:
                credit every source, no affiliation claims, no neighborhood crime rankings.
              </p>
              <a href={`${REPO}/tree/main/starters/mcp`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">
                Claude Desktop and Cursor setup <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="min-w-0 self-start overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a]">
              <p className="border-b border-neutral-800 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-white/50">Claude Code</p>
              <pre className="overflow-x-auto px-5 py-4 font-mono text-[12px] leading-relaxed text-white/70">
                <span className="text-[#ff8200]">$</span> <span className="text-white">claude mcp add localhost-210 -- python3 starters/mcp/main.py</span>{"\n\n"}
                <span className="text-white/50">&gt; Which council district calls 311 most about potholes?</span>{"\n"}
                <span className="text-white/50">&gt; What&apos;s the aquifer at today?</span>{"\n"}
                <span className="text-white/50">&gt; Find layers about bike lanes. What&apos;s in the newest?</span>
              </pre>
            </div>
          </div>

          {/* One button and three quiet links, where there were four buttons in a row: the
              first issue is the way in; the others are what comes after. */}
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href={ISSUES} className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800">
              Pick up a good first issue <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <a href={`${REPO}/blob/main/SHOWCASE.md`} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-900 hover:decoration-gray-900">
                Add yours to the showcase
              </a>
              <a href="/discord" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-900 hover:decoration-gray-900">
                Show it in #build-and-tell
              </a>
              <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-gray-900 hover:decoration-gray-900">
                Find a meetup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
