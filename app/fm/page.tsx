import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { FmLink } from "@/components/fm/fm-link"
import { FmHero } from "@/components/fm/fm-hero"
import { jsonLdScript } from "@/lib/json-ld"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "DEVSA FM — A Night in San Antonio, in ASCII"
// Under ~155 characters, so search results show all of it.
const DESCRIPTION =
  "DEVSA FM is DEVSA's lofi livestream: downtown San Antonio at night in ASCII, with Tejano lofi, on YouTube. It's open source, and anyone can build a scene."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/fm" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteUrl}/fm`,
    siteName: "DEVSA",
    type: "website",
    images: [
      {
        url: `${siteUrl}/api/og/fm`,
        width: 1200,
        height: 630,
        alt: "DEVSA FM's night bus rolling past Mission San José in ASCII, under the headline: a night in San Antonio, in ASCII",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${siteUrl}/api/og/fm`],
    creator: "@devsatx",
    site: "@devsatx",
  },
}

/**
 * DEVSA FM — the livestream, on the site. Two sections and nothing more:
 *
 *   the hero   what DEVSA FM is, where to watch it, and the night bus playing as its picture (with Sound on)
 *   the repo   what the devsa-fm repo is for and how a scene gets from a pull request to the stream
 *
 * The scenes themselves, stills and all, live in the repo's README; this page points there. It once ran every
 * scene live in a player, with a picker and a song for each; framed on the page, the scenes ran on its own
 * thread and it locked up while switching, and it was more page than the stream needs (2026-11-14).
 *
 * The hero is the night bus, full-bleed and the height of the screen, with the words over its dark side
 * (components/fm/fm-hero.tsx). The >FM alt mark is the hero's sound control.
 * The music is credited to Patrick Robinson, from the DEVSA community, on the video beside Sound on.
 * Vercel Analytics: fm_build (from hero or repo), fm_youtube, and fm_sound in the video.
 */

const REPO = "https://github.com/devsanantonio/devsa-fm"
const YOUTUBE = "https://www.youtube.com/@devsatx"
// The channel's live address: always whichever stream is on now. A single broadcast's link turns into a
// recording when that stream ends.
const LIVE = "https://www.youtube.com/@devsatx/live"

/**
 * The places waiting to be drawn: the repo's "good first scene" issues, by number. Shown as plain chips, each
 * opening its issue. When one is built or closed, take it out here (and add a new one when an issue is opened).
 */
const PLACES: [number, string][] = [
  [1, "La Villita"],
  [2, "Hemisfair and the Tower"],
  [3, "A bus stop in the rain"],
  [4, "San Pedro Creek"],
  [5, "The Japanese Tea Garden"],
  [6, "A mission under the stars"],
]

/**
 * The starter scene's render loop, abridged from devsa-fm's scene/starter.html (same names, same order), as
 * the proof that a scene is one small HTML file: the place in greys, the greys as characters, colour where
 * there's light. Each line is [code, comment]; keep it in step with the starter if that changes.
 */
const CODE: [string, string?][] = [
  ["function paint(t) {", "1. the place, in grays"],
  ["  g.fillStyle = fm.gray(.02)", "the night"],
  ["  g.fillRect(0, 0, W, H)"],
  ["  g.fillStyle = fm.gray(.12)", "downtown, dim"],
  ["  g.fillRect(380, 400, 160, 420)"],
  ["}"],
  [""],
  ["function render(t) {"],
  ["  paint(t)"],
  ["  fm.ascii(\"#0c0c0c\")", "2. every gray, a character"],
  ["  stringLights(t); agent(t)", "3. color where there's light"],
  ["  footer(t)"],
  ["}"],
  ["fm.start(render)"],
]

export default function FmPage() {
  return (
    <>
      {/* What the page is, for search and for assistants: DEVSA's livestream and its YouTube channel, the
          night bus video in the hero (with its music credited), and the open-source repo the scenes live in. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: TITLE,
            url: `${siteUrl}/fm`,
            description: DESCRIPTION,
            isPartOf: { "@type": "WebSite", name: "DEVSA", url: siteUrl },
            about: {
              "@type": "CreativeWork",
              name: "DEVSA FM",
              description:
                "A livestream of downtown San Antonio at night, drawn in ASCII characters, with Tejano lofi, for the city's learners and builders.",
              creator: { "@type": "Organization", name: "DEVSA", url: siteUrl },
              inLanguage: "en-US",
              sameAs: [YOUTUBE, REPO],
            },
            video: {
              "@type": "VideoObject",
              name: "DEVSA FM: the night bus",
              description:
                "A city bus with DEVSA's stickers in its windows rolls past Mission San José at night, drawn in ASCII characters: the first scene of DEVSA FM's night in San Antonio.",
              thumbnailUrl: `${siteUrl}/fm/night-bus.jpg`,
              contentUrl: `${siteUrl}/fm/night-bus.mp4`,
              uploadDate: "2026-11-14",
              duration: "PT2M38S",
              creator: { "@type": "Organization", name: "DEVSA", url: siteUrl },
              musicBy: { "@type": "Person", name: "Patrick Robinson", sameAs: "https://www.linkedin.com/in/patrick-robinson-dev/" },
            },
            mentions: {
              "@type": "SoftwareSourceCode",
              name: "devsa-fm",
              codeRepository: REPO,
              programmingLanguage: "JavaScript",
              license: "https://opensource.org/licenses/MIT",
            },
          }),
        }}
      />
      <main className="min-h-screen bg-neutral-950 text-white">
        <FmHero>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">
            <span className="text-white">DEVSA FM</span> · On YouTube
          </p>
          <h1 className="mt-4 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
            A night in San Antonio,{" "}
            <span className="font-light italic text-white/60">in ASCII.</span>
          </h1>
          <p className="mt-6 border-l-2 border-[#ff8200] pl-5 text-lg leading-relaxed text-white/75">
            DEVSA&apos;s lofi livestream for the city&apos;s learners and builders: the River Walk, Market Square, San
            Fernando and the rest of downtown, drawn in characters, with Tejano lofi under it. It&apos;s open source, and
            anyone can build a scene.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <FmLink
              event="fm_youtube"
              href={LIVE}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
            >
              Watch on YouTube <ArrowUpRight className="h-4 w-4" />
            </FmLink>
            <FmLink
              event="fm_build"
              props={{ from: "hero" }}
              href={REPO}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
            >
              Build a scene on GitHub <ArrowUpRight className="h-4 w-4" />
            </FmLink>
          </div>
        </FmHero>

        {/* The repo: the pitch on the left with the places waiting to be drawn, and on the right the proof that a
            scene is one small HTML file: the starter's own render loop. One light section, one link out, as
            /localhost ends. (It was two paragraphs and a six-step list; the steps live in the repo's guide.) */}
        <section id="build" className="scroll-mt-24 bg-white py-16 text-gray-900 md:py-24" data-bg-type="light">
          <div className="page-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">
                <span className="text-gray-900">Open source</span> · MIT
              </p>
              <h2 className="mt-4 text-balance font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-4xl lg:text-5xl">
                Put your San Antonio{" "}
                <span className="font-light italic text-gray-500">on the stream.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                Every scene is one HTML file that draws on a canvas. Draw a place you know, open a pull request, and it can
                air with your name on it.
              </p>
              <FmLink
                event="fm_build"
                props={{ from: "repo" }}
                href={REPO}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
              >
                Open it on GitHub <ArrowUpRight className="h-4 w-4" />
              </FmLink>

              <p className="mt-12 font-mono text-[11px] uppercase tracking-widest text-gray-500">
                <span className="text-gray-900">Waiting to be drawn</span> · Good first scenes
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PLACES.map(([n, place]) => (
                  <li key={n}>
                    <FmLink
                      event="fm_issue"
                      props={{ issue: n }}
                      href={`${REPO}/issues/${n}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50"
                    >
                      {place}
                    </FmLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] text-white">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-3">
                <a
                  href={`${REPO}/blob/main/scene/starter.html`}
                  className="truncate font-mono text-[12px] text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white"
                >
                  scene/starter.html
                </a>
                <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-white/50">Public · MIT</p>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.75]">
                <code>
                  {CODE.map(([code, note], i) => (
                    <span key={i} className="block whitespace-pre">
                      <span className="text-white/85">{code}</span>
                      {note && <span className="text-white/50">{"  // "}{note}</span>}
                      {!code && "\u00a0"}
                    </span>
                  ))}
                </code>
              </pre>
              <p className="overflow-x-auto whitespace-nowrap border-t border-neutral-800 px-5 py-3.5 font-mono text-[12px] text-white/70">
                <span className="select-none text-[#ff8200]">$ </span>git clone {REPO}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
