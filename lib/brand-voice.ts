/**
 * DEVSA's voice and messaging, in one place.
 *
 * The branding kit (/branding) renders this, and /branding/voice.md serves it as
 * plain Markdown so anything that writes for DEVSA can read the same rules:
 * people pasting copy into a grant form, and devsanantonio/agent-patterns'
 * "Draft, approve, act" agent, which copies the file in with a sync script.
 * Change the voice here, never in a copy of it.
 *
 * The core messages are the copy other people paste into their own materials,
 * so this is the last place a retired line should survive. The mission once
 * read "DEVSA bridges the gap between passionate builders, local partners, and
 * the growing tech ecosystem", dropped for naming no technology and describing
 * any community organization; the value proposition read "Your direct
 * connection to the tech community" and counted the groups by hand. In
 * November 2026 "civic infrastructure" became "community infrastructure", and
 * the audience became "San Antonio's learners and builders" rather than
 * "San Antonio tech", which names an industry, not the people in it.
 *
 * The short description and problem statement are the same words as the ones
 * that open /about, the site-wide description in app/layout.tsx and llms.txt;
 * change them there too.
 */

export const TAGLINE = "Find Your People. Build Your Future."

export const AUDIENCE =
  "San Antonio's learners and builders: students and career-changers, developers and engineers, designers, founders and creatives. Name the people, not the industry. Not \"San Antonio tech\"."

export const MISSION =
  "DEVSA connects San Antonio's learners and builders: one calendar, one public directory, one channel to follow, and one room a few times a year, governed by a volunteer board."

export const SHORT_DESCRIPTION =
  "DEVSA is community infrastructure for San Antonio's learners and builders: the shared calendar, the public directory, the channel to follow and the rooms where they find each other."

export const PROBLEM_STATEMENT = [
  "San Antonio is one of the largest cities in the country, and it has never lacked people who build things. What it lacks is anything that connects them. Its tech groups run their own meetups, on their own calendars, for their own audiences, and most of them can't see each other. A student finishing a program, a developer new to the city, an engineer deciding whether to stay: none of them has one place to find the people doing the work they want to do. People stay where they've found their people, and a city that can't show its builders to each other has a harder time keeping them.",
  "DEVSA is the community infrastructure for that first part: a shared calendar every group publishes to, a public directory anyone can search, one channel to follow for the groups that have none of their own, and a few rooms a year where all of it meets. A volunteer board runs it as a 501(c)(3), and the groups that use it still run themselves.",
]

export const VALUE_PROPOSITION =
  "The rooms where San Antonio's learners and builders find each other: DEVSA's conferences and the meetups of 25 community groups, from Python and Linux to AI, security, game dev and UX. One calendar makes every room easy to find, and nothing on it is a sales pitch."

export const VOICE_TRAITS: { trait: string; desc: string }[] = [
  { trait: "Plain and honest", desc: "Say the modest fact, and let the real one land. No sales pitch" },
  { trait: "Welcoming", desc: "Inclusive and approachable — everyone belongs" },
  { trait: "Technical", desc: "We speak developer — but keep it accessible" },
  { trait: "Community-first", desc: "People and connections over products" },
  { trait: "Action-oriented", desc: "Build, ship, contribute — not just talk" },
  { trait: "Local pride", desc: "Rooted in San Antonio, Alamo City energy" },
]

export const WRITING_DO = [
  "\"The next Alamo Python meetup is on the calendar\"",
  "\"25 tech groups, one calendar\"",
  "\"Find the room for what you're into\"",
  "\"For San Antonio's learners and builders\"",
]

export const WRITING_DONT = [
  "\"Leverage synergies in the innovation ecosystem\"",
  "\"We are the premier technology organization\"",
  "\"Disrupting the future of tech in Texas\"",
  "\"San Antonio tech\" as a name for the people DEVSA serves",
  "\"Join us at…\" for an event DEVSA lists but doesn't host",
]

/**
 * Word choices that have each been gotten wrong at least once. Each says what
 * to write, what not to, and why, so a writer (or an agent) can apply the
 * reason to a case the rule doesn't name.
 */
export const WORD_RULES: { write: string; notThis: string; why: string }[] = [
  {
    write: "community infrastructure",
    notThis: "civic infrastructure",
    why: "\"Community\" says whose it is. \"Civic\" reads as policy work, which isn't what DEVSA does.",
  },
  {
    write: "San Antonio's learners and builders",
    notThis: "San Antonio tech, the tech community",
    why: "Name the people, not the industry. \"San Antonio tech\" is fine for what happens in the city (\"every meetup in San Antonio tech\"), not for who the people are.",
  },
  {
    write: "started as a Discord server in 2023",
    notThis: "founded as a Discord server",
    why: "Anyone can make a Discord server in a minute. Say the modest fact plainly; \"founded\" and \"incorporated\" belong to the 501(c)(3), in March 2024.",
  },
  {
    write: "DEVSA brought 36 meetups to Geekdom, a partner",
    notThis: "Geekdom hosted the meetups",
    why: "Venues give the room; the groups run the meetups, and DEVSA brings them. Credit each for what it did.",
  },
  {
    write: "on the calendar",
    notThis: "join us at…",
    why: "\"Join us\" only for an event DEVSA itself runs. Most events on the calendar belong to the groups.",
  },
  {
    write: "built on City of San Antonio open data",
    notThis: "with the City, in partnership with",
    why: "Never claim an affiliation that doesn't exist. Using an agency's public data is not working with the agency.",
  },
  {
    write: "a DEVSA project",
    notThis: "data from DEVSA",
    why: "The data belongs to the agencies that publish it. DEVSA made the project, not the data.",
  },
  {
    write: "the room, the event, the people in it",
    notThis: "a description of who or what a photo shows",
    why: "Don't say what a photo shows unless someone who was there confirmed it. A caption that guesses can name the wrong people.",
  },
  {
    write: "organization, color, canceled",
    notThis: "organisation, colour, cancelled",
    why: "American English throughout.",
  },
]

/** The voice and messaging as Markdown, for /branding/voice.md and anything that writes for DEVSA. */
export function voiceMarkdown(): string {
  const lines: string[] = [
    "# DEVSA voice and messaging",
    "",
    "> How DEVSA describes itself and the people it serves. This file is generated from the same source as the branding kit at https://www.devsa.community/branding, so the two never disagree.",
    "",
    "## Core messages",
    "",
    `**Tagline:** ${TAGLINE}`,
    "",
    `**Audience:** ${AUDIENCE}`,
    "",
    `**Mission:** ${MISSION}`,
    "",
    `**Short description** (for grant forms and outreach): ${SHORT_DESCRIPTION}`,
    "",
    "**Problem statement:**",
    "",
    ...PROBLEM_STATEMENT.flatMap((p) => [p, ""]),
    `**Value proposition:** ${VALUE_PROPOSITION}`,
    "",
    "## Brand voice",
    "",
    ...VOICE_TRAITS.map(({ trait, desc }) => `- **${trait}.** ${desc}.`),
    "",
    "## Word choices",
    "",
    "| Write | Not | Why |",
    "| --- | --- | --- |",
    ...WORD_RULES.map(({ write, notThis, why }) => `| ${write} | ${notThis} | ${why} |`),
    "",
    "## Writing style",
    "",
    "Do:",
    "",
    ...WRITING_DO.map((d) => `- ${d}`),
    "",
    "Don't:",
    "",
    ...WRITING_DONT.map((d) => `- ${d}`),
    "",
  ]
  return lines.join("\n")
}
