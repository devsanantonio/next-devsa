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
