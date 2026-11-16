import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { groupsByTopic } from "@/lib/community-topics"
import { logoOnLight, logoSrcOnLight } from "@/lib/logo-invert"

/**
 * "Find a group by topic": the directory's groups under the subjects people search for (Linux, Python, AI,
 * security...), each linking to the group's own page.
 *
 * It sits under the logo wall, in the same white section, as the wall's second way in: the wall is for
 * recognizing a logo, this is for someone who knows what they want to learn and not which group runs it.
 * It's also the plainest text on the site naming the city's groups by subject, which is what a search for
 * "python in san antonio" reads, so every group stays a real link with its name as text. Rendered on the
 * server from the live directory each request, like the wall; the topics come from lib/community-topics.ts,
 * the same list /llms.txt uses.
 *
 * It used to be a heading one step below the site's ramp and columns of underlined links, which read as a
 * sitemap under a branded wall. Now it speaks the marketing idiom (the sans eyebrow, the full h2 ramp with
 * its light italic clause) and each topic is a card in the site's shape, its groups shown with their logos
 * the way the wall shows them. The count in each card's corner takes the brand's three colors in turn, each
 * darkened to clear 4.5:1 on the card's gray-50 (the stock teal and orange measure 2.5 and 2.4 there).
 */

const BRAND = ["#007a73", "#c4214f", "#b45400"]

type Group = { id: string; name: string; description: string }
type Logo = { id: string; name: string; logo: string; type: "community" | "partner" }

export function GroupsByTopic({ groups, logos = [] }: { groups: Group[]; logos?: Logo[] }) {
  const topics = groupsByTopic(groups)
  if (!topics.length) return null
  const logoFor = new Map(logos.map((l) => [l.id, l]))

  return (
    <section id="by-topic" className="w-full scroll-mt-20 bg-white" data-bg-type="light">
      <div className="page-shell border-t border-gray-200 py-16 md:py-24">
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">Find a group by topic</p>
          <h2 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
            What do you want <span className="font-light italic text-gray-600">to learn?</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            San Antonio&apos;s tech groups by what they cover. Each runs itself; open one for when it meets and how to join.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {topics.map(([topic, gs], i) => (
            <div key={topic} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-black tracking-[-0.01em] text-gray-900 md:text-2xl">{topic}</h3>
                <span className="shrink-0 font-mono text-xs uppercase tracking-widest" style={{ color: BRAND[i % 3] }}>
                  {gs.length} {gs.length === 1 ? "group" : "groups"}
                </span>
              </div>
              <ul className="mt-5 space-y-1">
                {gs.map((g) => {
                  const logo = logoFor.get(g.id)
                  return (
                    <li key={g.id}>
                      <Link
                        href={`/buildingtogether/${g.id}`}
                        className="group/row -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white"
                      >
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          {logo ? (
                            <Image
                              src={logoSrcOnLight(logo, logo.logo)}
                              alt=""
                              fill
                              unoptimized
                              sizes="36px"
                              className={`object-contain p-1.5 ${logoOnLight(logo)}`}
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 text-base font-medium leading-snug text-gray-800 group-hover/row:text-gray-900">
                          {g.name.trim()}
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="h-4 w-4 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover/row:opacity-100"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
