import Link from "next/link"
import { groupsByTopic } from "@/lib/community-topics"

/**
 * "Find a group by topic": the directory's groups under the subjects people search for (Linux, Python, AI,
 * security...), each linking to the group's own page.
 *
 * It sits under the logo wall, in the same white section's colors, as the wall's second way in: the wall is
 * for recognizing a logo, this is for someone who knows what they want to learn and not which group runs it.
 * It's also the plainest text on the site naming the city's groups by subject, which is what a search for
 * "python in san antonio" reads. Rendered on the server from the live directory each request, like the wall;
 * the topics come from lib/community-topics.ts, the same list /llms.txt uses.
 */
export function GroupsByTopic({ groups }: { groups: { id: string; name: string; description: string }[] }) {
  const topics = groupsByTopic(groups)
  if (!topics.length) return null
  return (
    <section id="by-topic" className="w-full scroll-mt-20 bg-white" data-bg-type="light">
      <div className="page-shell border-t border-gray-200 pb-16 pt-12 md:pb-24 md:pt-16">
        <h2 className="text-balance font-sans text-2xl font-black tracking-[-0.02em] text-gray-900 md:text-3xl">
          Find a group by topic
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
          San Antonio&apos;s tech groups by what they cover. Each runs itself; open one for when it meets and how to join.
        </p>
        <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {topics.map(([topic, gs]) => (
            <div key={topic}>
              <dt className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500">{topic}</dt>
              <dd className="mt-3">
                <ul className="space-y-1.5">
                  {gs.map((g) => (
                    <li key={g.id}>
                      <Link
                        href={`/buildingtogether/${g.id}`}
                        className="text-base font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
                      >
                        {g.name.trim()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
