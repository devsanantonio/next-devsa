/**
 * San Antonio Startup + Tech Week 2026 — Sept 28 – Oct 2, year eleven.
 *
 * DEVSA does not own this week; it programs three afternoons inside it. This
 * file exists so the featured band on /events can name the week accurately
 * without importing one of its own activations' constants files and
 * borrowing that event's framing.
 *
 * ## Relationship to next-sasw
 *
 * The week's canonical site is sasw.co (the sasw-geekdom/next-sasw repo). The
 * values below are copied from it — `lib/locations.ts` for The Rand,
 * `lib/schedule.ts` for the three activation dates, `lib/tracks.ts` for the
 * magenta. There is no shared package between the repos, so a change there has
 * to be repeated here.
 *
 * `SASTW_URL` and `SASTW_LOGO` are also declared in data/pysa/2026.ts and
 * data/access-granted/2026.ts. Those copies are deliberate — each event page
 * reads its own constants file and nothing else — and are left alone here; this
 * is the week's own file, so it holds its own copy rather than importing an
 * activation's.
 */

export const SASTW_URL = "https://www.sasw.co/"

/** Free registration covers the whole week, every activation included. */
export const SASTW_REGISTER_URL = "https://www.sasw.co/register"

/**
 * Recolored from the supplied horizontal lockup: the source SVG ships two
 * full-bleed white background rects that would show as a white box on a dark
 * surface, so the local copies drop them. See public/sastw/.
 *
 * `bolt` is the silhouette from next-sasw's `public/brand/sastw-bolt.svg`,
 * unmodified — it is already the brand magenta on transparent. It does double
 * duty: `.sastw-bolt-mask` in globals.css clips the WebGL current to it, and
 * the same file is the flat fallback that shows when WebGL is unavailable or
 * the visitor has asked for reduced motion.
 */
export const SASTW_LOGO = {
  white: "/sastw/horizontal-white.svg",
  magenta: "/sastw/horizontal-magenta.svg",
  bolt: "/sastw/bolt.svg",
} as const

/**
 * The brand magenta. 6.2:1 on the band's near-black, which is why it can carry
 * type here — on a white ground it drops to 3.4:1 and next-sasw uses a darker
 * ink (#c7277d) instead. This band is dark, so the brand value is the right one.
 */
export const SASTW_MAGENTA = "#ff32a0"

/**
 * The five circuits' accent colours, swept left→right through the bolt as the
 * cursor crosses it — "five circuits, one current."
 *
 * Copied from `CIRCUIT_COLORS` in next-sasw's `lib/tracks.ts`, in TRACK_NAMES
 * order: Founder, Tech & Builders, AI & Applied Innovation, Small Business &
 * Solopreneur, Capital. A UI accent over there, not brand track data, and the
 * same here — nothing on this site names the circuits, so the array is flat
 * rather than keyed. Founder's value is the brand magenta, which is why the
 * bolt rests on it.
 */
export const SASTW_CIRCUIT_SWEEP: string[] = [
  "#ff32a0",
  "#4d7cff",
  "#19c8c8",
  "#b45cff",
  "#ff6b57",
]

export const SASTW_2026 = {
  name: "San Antonio Startup + Tech Week 2026",
  /** How the week is spoken about mid-sentence. */
  shortName: "SA Startup + Tech Week",
  /** The strongest credibility fact the week has, and it leads its own hero. */
  edition: "Year 11",
  start: "2026-09-28",
  end: "2026-10-02",
  dateLabel: "Sept 28 – Oct 2, 2026",
  /**
   * Where the week is, at the altitude a promo band should state it.
   *
   * One field rather than the venue/venueDetail pair the activation constants
   * files use, because this is not a venue — the week runs across five of them
   * (TPR, The Rand, Central Library, 300 Main, Legacy Park) and naming one in
   * the meta rail said DEVSA's floor was the week's address. Listing all five
   * is the schedule's job, not a promo's, so the rail names the district and
   * lets sasw.co place the rooms.
   */
  location: "Downtown San Antonio",
} as const

/**
 * The three activations DEVSA runs inside the week, in the order they happen.
 *
 * All three are on the same floor — The Rand, the building Geekdom is in,
 * which is why their event pages say "Geekdom, 3rd Floor" for the same room.
 * No field for it: the band's meta rail names the district rather than a
 * building (see `location` above) and the copy no longer names one either, so
 * a constant nothing renders would just be a fact waiting to go stale.
 *
 * Each wears its own brand where it is listed rather than a house treatment —
 * `lockup` is what the band switches on. PySanAntonio has an actual wordmark;
 * the other two are typeset, so their "logo" is a font and a colour and the
 * only way to keep them right is to set them the same way their own pages do.
 *
 * Every `href` is that activation's page on sasw.co, including the two that
 * also have a page on this site.
 *
 * That is deliberate and it is the second decision here, not the obvious one.
 * Access Granted and PySanAntonio both have DEVSA pages, and pointing at them
 * would keep a reader on this domain — but those two pages exist to run open
 * calls for speakers and volunteers, not to tell an attendee what the afternoon
 * is. Someone reading a band about Startup + Tech Week is being told what is
 * on, and the week's own schedule pages are what answer that. Sending them to
 * a submission form instead would answer a question they did not ask.
 *
 * The slugs are `page` in next-sasw's lib/schedule.ts. They are stable — the
 * route is /schedule/[slug] and each is spelled out there — but they live in
 * another repo, so a rename there is a 404 here with nothing to catch it.
 *
 * One consequence worth knowing: while PySanAntonio's call for speakers is
 * open, this list no longer routes anyone to it. The countdown line under the
 * band's buttons carries that link instead — see featured-sastw.tsx.
 */
export const SASTW_ACTIVATIONS = [
  {
    lockup: "the-model",
    name: "The Model",
    dateLabel: "Mon, Sept 28",
    href: "https://www.sasw.co/schedule/the-model",
  },
  {
    lockup: "access-granted",
    name: "Access Granted",
    dateLabel: "Wed, Sept 30",
    href: "https://www.sasw.co/schedule/access-granted",
  },
  {
    lockup: "pysanantonio",
    name: "PySanAntonio II",
    dateLabel: "Fri, Oct 2",
    href: "https://www.sasw.co/schedule/pysanantonio",
  },
] as const

export type SastwActivation = (typeof SASTW_ACTIVATIONS)[number]

/**
 * The Model's palette, copied from next-sasw's `lib/the-model.ts`.
 *
 * The whole identity rests on one gesture — a click-drag selection block with
 * its ink knocked out — so the wordmark is "The" in mono beside "Model" sitting
 * in a lavender block. Reproducing it needs exactly these two values.
 */
export const MODEL_LAVENDER = "#C0B4FC"
/** The ink a selection block knocks out. Near-black, never pure. */
export const MODEL_INK = "#09090B"
