/**
 * More Human Than Human's copy and partners, shared by the page and its share
 * card so the two say the same thing.
 *
 * The positioning is deliberately the developer half of DEVSA's pair of AI
 * conferences: The Model is AI for creators and creatives; this one is AI for
 * the developers and engineers building with it, down at the level of harnesses
 * and software factories. Someone landing on either page should be able to
 * tell within a line which of the two they came for.
 *
 * The turn borrows from the 2026 lineup ("What's Left When the Code Writes
 * Itself?"), so the hook says what the room was actually about.
 */
export const MH_HOOK = {
  positioning:
    "DEVSA's AI conference for developers and engineers: the people building software factories, agent harnesses and everything that runs on them.",
  turn: "When the code writes itself, the job is building what writes it.",
} as const

/**
 * The partner who powered the first edition (February 2026), beside DEVSA's
 * own mark. Labeled by edition on the page: the conference is DEVSA's, and the
 * next one is open to others. 434 MEDIA's mark is black on transparent; the
 * white copy in public/partners is the same artwork for this dark page.
 */
export const MH_ORGANIZERS = [
  {
    name: "DEVSA",
    href: "https://www.devsa.community/",
    logo: "/access-granted/orgs/devsa.png",
    heightClass: "h-9 sm:h-10",
  },
  {
    name: "434 MEDIA",
    href: "https://www.434media.com/",
    logo: "/partners/434-media-white.png",
    heightClass: "h-8 sm:h-9",
  },
] as const
