import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { FmLink } from "@/components/fm/fm-link"
import { FmHeroVideo } from "@/components/fm/fm-hero-video"
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
 * The title is the >FM alt mark: one colour, like DEVSA's alt logo, so the bus is the only colour in the hero.
 * The music is credited to Patrick Robinson, from the DEVSA community, on the video beside Sound on.
 * Vercel Analytics: fm_build (from hero or repo), fm_youtube, and fm_sound in the video.
 */

const REPO = "https://github.com/devsanantonio/devsa-fm"
const YOUTUBE = "https://www.youtube.com/@devsatx"
// The channel's live address: always whichever stream is on now. A single broadcast's link turns into a
// recording when that stream ends.
const LIVE = "https://www.youtube.com/@devsatx/live"

/** How a scene gets from an idea to the stream; each step links where it lives in the repo. */
const STEPS: { step: string; what: string; path: string; href: string }[] = [
  { step: "Pick", what: "A place someone from here would recognize; six are waiting as good first scenes", path: "good first scene", href: "labels/good%20first%20scene" },
  { step: "Copy", what: "Start from the starter: it explains how a scene works in its comments", path: "scene/starter.html", href: "blob/main/scene/starter.html" },
  { step: "Draw", what: "The place in greys, one character a pixel; colour only where there's light", path: "fmkit.js", href: "blob/main/CONTRIBUTING.md#make-a-scene" },
  { step: "Check", what: "Runs without the optional assets, same frame for the same second, no seam", path: "npm run check", href: "blob/main/tools/check.cjs" },
  { step: "Share", what: "Open a pull request; the check runs on it and a maintainer reviews it", path: "pull request", href: "pulls" },
  { step: "Air", what: "Maintainers pick what joins the night mix, and your name goes in its footer", path: "the night mix", href: "#on-air" },
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
                  DEVSA&apos;s lofi livestream for the city&apos;s learners and builders: the River Walk, Market Square, San
                  Fernando and the rest of downtown, drawn in characters, with Tejano lofi under it. It plays on
                  YouTube, and it&apos;s open source.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
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
              </div>
            </div>
            <div id="on-air" className="mt-10 scroll-mt-24">
              <FmHeroVideo />
            </div>
          </div>
        </section>

        {/* The repo: what it's for, and the way in. One light section, one link out, as /localhost ends. */}
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
                DEVSA FM is built in the open so the stream can grow the way DEVSA does: from the people in it. Every
                scene is one HTML file that draws on a canvas, with no framework and no build step. Draw a place you know,
                open a pull request, and it can air, with your name on it.
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
                The repo has every scene on the stream, with stills, a starter that explains itself, and a check that
                tells you if your scene is ready. If you can write a little JavaScript, you can make one.
              </p>
              <FmLink
                event="fm_build"
                props={{ from: "repo" }}
                href={REPO}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
              >
                Open it on GitHub <ArrowUpRight className="h-4 w-4" />
              </FmLink>
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
