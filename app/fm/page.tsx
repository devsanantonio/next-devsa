import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { FmStage } from "@/components/fm/fm-stage"
import { jsonLdScript } from "@/lib/json-ld"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

const TITLE = "DEVSA FM — A Night in San Antonio, in ASCII"
// Under ~155 characters, so search results show all of it.
const DESCRIPTION =
  "DEVSA FM is DEVSA's lofi livestream: downtown San Antonio at night in ASCII, with Tejano lofi. Watch the scenes live, then build one. It's open source."

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
 * DEVSA FM — the livestream, on the site. The title is the >FM alt mark: one colour, like DEVSA's alt logo,
 * so the night bus below it is the only colour in the hero. Built the way /localhost is: the project's mark as the title,
 * one lead paragraph, the thing itself, then a light section that hands off to the repo.
 *
 * The scenes play here but live in devsanantonio/devsa-fm (see components/fm/fm-player.tsx and the
 * /fm rewrites in next.config.ts). The old github.io playground forwards here.
 *
 * The music is credited to Patrick Robinson, from the DEVSA community, on the stage beside Sound on.
 */

const REPO = "https://github.com/devsanantonio/devsa-fm"
const YOUTUBE = "https://www.youtube.com/@devsatx"
// The channel's live address: always whichever stream is on now. A single broadcast's link turns into a
// recording when that stream ends.
const LIVE = "https://www.youtube.com/@devsatx/live"

/** How a scene gets made, from the starter to the stream; each step links where it lives in the repo. */
const STEPS: { step: string; what: string; path: string; href: string }[] = [
  { step: "Copy", what: "Start from the starter: it explains how a scene works in its comments", path: "scene/starter.html", href: "blob/main/scene/starter.html" },
  { step: "Draw", what: "The place in greys, one pixel per character; brighter is a denser character", path: "paint(t)", href: "blob/main/CONTRIBUTING.md#make-a-scene" },
  { step: "Light", what: "Colour only where there's light: lamps, windows, signs, the agents", path: "fmkit.js", href: "blob/main/scene/fmkit.js" },
  { step: "Check", what: "Runs without the optional assets, same frame for the same second, no seam", path: "npm run check", href: "blob/main/tools/check.cjs" },
  { step: "Share", what: "Open a pull request; the check runs on it and a maintainer reviews it", path: "pull request", href: "pulls" },
  { step: "Air", what: "Maintainers pick what joins the night mix; your name goes in its footer", path: "the night mix", href: "#on-air" },
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
        {/* One section: the intro (mark, lead, buttons) at the top, then the stage (the night bus, or whichever
            scene is picked), then the night mix to pick from. The hero and the player used to be two sections. */}
        <section className="pb-16 pt-16 md:pb-20 md:pt-20" data-bg-type="dark">
          <div className="page-shell">
            <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-14">
              <h1>
                {/* eslint-disable-next-line @next/next/no-img-element -- the brand SVG, served as-is */}
                <img src="/branding/devsa-fm/devsa-fm-alt-mark.svg" alt="DEVSA FM" className="h-20 w-auto sm:h-24 lg:h-28" />
              </h1>
              <div>
                <p className="max-w-2xl border-l-2 border-[#ff8200] pl-5 text-lg leading-relaxed text-white/70 md:text-xl">
                  <span className="font-semibold text-white">A night in San Antonio, in ASCII.</span> DEVSA FM is
                  DEVSA&apos;s lofi livestream for the city&apos;s learners and builders, with Tejano lofi under it. It&apos;s
                  open source, and every scene is one HTML file anyone can build.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <a
                    href={REPO}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-100"
                  >
                    Build a scene <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href={LIVE}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    Watch on YouTube <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <FmStage />
            </div>
          </div>
        </section>

        {/* The ending hands off to the repo, as /localhost's does: one light section, one link out. */}
        <section id="build" className="scroll-mt-24 bg-white py-16 text-gray-900 md:py-24" data-bg-type="light">
          <div className="page-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">
                <span className="text-gray-900">Open source</span> · MIT
              </p>
              <h2 className="mt-4 text-balance font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-4xl lg:text-5xl">
                Build a scene.{" "}
                <span className="font-light italic text-gray-500">One HTML file.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                Every scene is a single file that draws on a canvas: no framework, no build step. Copy the starter, draw a
                place someone from here would recognize, and open a pull request. If you can write a little JavaScript, you
                can make a scene that airs.
              </p>
              <a
                href={REPO}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
              >
                Open it on GitHub <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="mt-8 max-w-xl border-l-2 border-[#ff8200] pl-4 text-base leading-relaxed text-gray-600">
                <span className="font-semibold text-gray-900">Not sure where to start?</span> La Villita, Hemisfair, a bus
                stop in the rain and three more places are waiting to be drawn.{" "}
                <a
                  href={`${REPO}/labels/good%20first%20scene`}
                  className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  Pick one
                </a>
                .
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-[#0a0a0a] text-white">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-3">
                <p className="truncate font-mono text-[12px] text-white/80">devsanantonio/devsa-fm</p>
                <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-white/50">Public · MIT</p>
              </div>
              <ol className="divide-y divide-neutral-800">
                {STEPS.map((s, i) => (
                  <li key={s.step}>
                    <a
                      href={s.href.startsWith("#") ? s.href : `${REPO}/${s.href}`}
                      className="group grid gap-1 px-5 py-3.5 sm:grid-cols-[7rem_1fr] sm:gap-x-4"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-[11px] text-white/50">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-[13px] text-[#ff8200] group-hover:underline">{s.step.toLowerCase()}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm text-white/75 group-hover:text-white">{s.what}</span>
                        <span className="mt-1 block font-mono text-[11px] text-white/50">{s.path}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
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
