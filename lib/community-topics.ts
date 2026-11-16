/**
 * San Antonio's tech groups by topic, matched from each group's own name and description in the live directory.
 *
 * One list for every surface that groups them (the directory's "Find a group by topic" on /buildingtogether and
 * the topic index in /llms.txt), so the page and what assistants read can't disagree, and a group added in the
 * admin is filed with no list to keep. This is what lets "linux in san antonio" or "python in san antonio" land
 * on a group's own page.
 *
 * Patterns match whole words where a short word hides inside a longer one: "unity" is inside "community" and
 * "game" inside "engage", and before that was fixed fifteen groups were filed under game development. A group
 * can sit under more than one topic; a topic with no groups is left out. Add a topic here when a group appears
 * that none of these describe.
 */
export const TOPICS: [string, RegExp][] = [
  ["Linux and open source", /linux|red hat|open source|foss/i],
  ["Python", /python|pysa|\bdjango\b/i],
  [".NET and C#", /\.net|dotnet|c#/i],
  ["Ruby", /ruby|rails/i],
  ["JavaScript and the web", /javascript|typescript|react|node\.?js|web dev/i],
  ["AI, models and agents", /\bai\b|artificial intelligence|machine learning|\bllm|agent|genai/i],
  ["Cybersecurity", /cyber|security|owasp|def ?con|locksport|hacking|ctf/i],
  ["Cloud", /\baws\b|amazon web services|google cloud|azure|cloud/i],
  ["Data", /\bdata\b|analytics|datanauts/i],
  ["Game development", /\bgam(e|es|ing)\b|\bunreal\b|\bunity\b/i],
  ["Design and UX", /\bux\b|user experience|design/i],
]

export function groupsByTopic<T extends { name: string; description: string }>(groups: T[]): (readonly [string, T[]])[] {
  return TOPICS.map(([topic, re]) => [topic, groups.filter((g) => re.test(`${g.name} ${g.description}`))] as const).filter(
    ([, gs]) => gs.length > 0
  )
}

/** A short label and a URL slug per topic, for the wall's topic filter and the hero's quick links
 * (#topic-<slug> selects one). Keyed by the topic names above. */
export const TOPIC_SHORT: Record<string, { label: string; slug: string }> = {
  "Linux and open source": { label: "Linux", slug: "linux" },
  Python: { label: "Python", slug: "python" },
  ".NET and C#": { label: ".NET", slug: "dotnet" },
  Ruby: { label: "Ruby", slug: "ruby" },
  "JavaScript and the web": { label: "JavaScript", slug: "javascript" },
  "AI, models and agents": { label: "AI", slug: "ai" },
  Cybersecurity: { label: "Cybersecurity", slug: "cybersecurity" },
  Cloud: { label: "Cloud", slug: "cloud" },
  Data: { label: "Data", slug: "data" },
  "Game development": { label: "Game dev", slug: "games" },
  "Design and UX": { label: "Design", slug: "design" },
}

export type TopicFilter = { name: string; label: string; slug: string; ids: string[] }

/** The topics that have groups, with their group ids, for the wall's filter and the hero. */
export function topicFilters<T extends { id: string; name: string; description: string }>(groups: T[]): TopicFilter[] {
  return groupsByTopic(groups).map(([name, gs]) => {
    const short = TOPIC_SHORT[name] ?? { label: name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
    return { name, ...short, ids: gs.map((g) => g.id) }
  })
}

/** DEVSA's own conferences by topic, for the topic pages: each line is the conference page's own. */
export const TOPIC_CONFERENCES: Record<string, { name: string; href: string; line: string }[]> = {
  python: [{ name: "PySanAntonio", href: "/events/pysanantonio", line: "DEVSA's Python conference, for the people writing Python in San Antonio." }],
  cybersecurity: [{ name: "Access Granted", href: "/events/access-granted", line: "DEVSA's security conference, built with San Antonio's hacker community." }],
  ai: [
    { name: "More Human Than Human", href: "/events/morehumanthanhuman", line: "DEVSA's AI conference for developers and engineers." },
    { name: "The Model", href: "/events/the-model", line: "DEVSA's AI conference for creators, creatives, founders and builders." },
  ],
}

/** A topic by its URL slug, or null. */
export function topicBySlug(slug: string): { name: string; label: string; slug: string; re: RegExp } | null {
  for (const [name, re] of TOPICS) {
    const short = TOPIC_SHORT[name]
    if (short?.slug === slug) return { name, ...short, re }
  }
  return null
}
