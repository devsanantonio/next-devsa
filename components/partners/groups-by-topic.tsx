import Image from "next/image"
import Link from "next/link"
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
 * its light italic clause), and each topic is a row with its groups as logo chips. (A card per topic, a group
 * per line, was tried first and ran three screens long; rows keep it to about one line a topic.) The count beside each topic takes the brand's three colors in turn, each
 * darkened to clear 4.5:1 on white (the stock teal and orange measure about 2.5 there).
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

        {/* A row per topic, its groups as chips that wrap: about one line each, where the cards it replaced
            stacked a group per line and ran three screens. */}
        <dl className="mt-10 border-t border-gray-200 md:mt-14">
          {topics.map(([topic, gs], i) => (
            <div key={topic} className="grid gap-2.5 border-b border-gray-200 py-4 md:grid-cols-[16rem_1fr] md:gap-8 md:py-5">
              <dt className="flex items-baseline justify-between gap-4 md:block">
                <span className="block text-lg font-black tracking-[-0.01em] text-gray-900 md:text-xl">{topic}</span>
                <span className="font-mono text-xs uppercase tracking-widest md:mt-1 md:block" style={{ color: BRAND[i % 3] }}>
                  {gs.length} {gs.length === 1 ? "group" : "groups"}
                </span>
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                  {gs.map((g) => {
                    const logo = logoFor.get(g.id)
                    return (
                      <li key={g.id}>
                        <Link
                          href={`/buildingtogether/${g.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-0.5 pl-0.5 pr-2.5 text-[13px] font-medium sm:gap-2 sm:py-1 sm:pl-1 sm:pr-3.5 sm:text-sm text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <span className="relative h-6 w-6 shrink-0 sm:h-7 sm:w-7 overflow-hidden rounded-full border border-gray-100 bg-white">
                            {logo ? (
                              <Image
                                src={logoSrcOnLight(logo, logo.logo)}
                                alt=""
                                fill
                                unoptimized
                                sizes="28px"
                                className={`object-contain p-1 ${logoOnLight(logo)}`}
                              />
                            ) : null}
                          </span>
                          {g.name.trim()}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
