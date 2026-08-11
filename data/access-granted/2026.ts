/**
 * Access Granted — Wednesday, September 30, 2026 at Geekdom (3rd floor), part
 * of San Antonio Startup + Tech Week (Sept 28 – Oct 2).
 *
 * The security and hacker activation of the week: five hours of drop-in tables
 * plus a ticketed-by-nothing workshop and speaker track, run jointly by the San
 * Antonio area's cybersecurity groups.
 *
 * Single source of truth for the event's dates, palette, art and the
 * call-for-speakers option lists, on the same pattern as data/pysa/2026.ts. The
 * page, both forms, the JSON-LD in the route layout and the OG card all read
 * from here so a date only ever changes in one place.
 *
 * ## Relationship to next-sasw
 *
 * The official Access Granted page lives in the sasw-geekdom/next-sasw repo,
 * which already owns this brand (`lib/access-granted.ts` there). THIS file is
 * the DEVSA side, and it exists for one job: to run the open calls for speakers
 * and volunteers while they are open. When the call closes, the accepted
 * speakers and sessions move to next-sasw and that page becomes the canonical
 * one.
 *
 * The brand constants below are deliberately copied rather than invented, so
 * the two sites read as the same event. If the green, the padlock or the
 * organiser wall changes there, it has to change here too — there is no shared
 * package between the repos.
 */

/** Firestore/admin key. The admin Speakers tab groups submissions by this. */
export const AG_EVENT_ID = "access-granted-2026"

/**
 * The community whose organizers can see this event's submissions in the admin
 * portal — DEF CON Group San Antonio.
 *
 * Both a name and an id, and the admin route accepts either. The existing
 * PySanAntonio check matches on the community's *name*, which is brittle: the
 * name is editable in the admin UI and a rename would silently cut organizers
 * off from their own submissions. Matching the document id as well means a
 * rename cannot break it. `defcongroup-sa` is the id; "DEF CON Group SATX" is
 * how data/communities.ts spells the name today.
 *
 * See app/api/admin/data/route.ts.
 */
export const AG_HOST_COMMUNITY = "DEF CON Group SATX"
export const AG_HOST_COMMUNITY_ID = "defcongroup-sa"

/**
 * Who gets told when someone answers either half of the call.
 *
 * An array so more organisers can be added without touching either route —
 * every address here receives the same internal notification. Keep it to
 * people who will actually action a submission; this fires on every send.
 */
export const AG_NOTIFY_EMAILS = ["jesseovr@gmail.com"] as const

export const ACCESS_GRANTED = {
  name: "Access Granted",
  /** Doors 1:00 PM — September 30 is CDT, so the offset is -05:00. */
  start: "2026-09-30T13:00:00-05:00",
  end: "2026-09-30T18:00:00-05:00",
  dateLabel: "Wednesday, September 30, 2026",
  timeLabel: "1:00 – 6:00 PM",
  venue: "Geekdom",
  venueDetail: "3rd Floor",
  // No `track` field. Access Granted is programmed under Startup + Tech
  // Week's "Tech & Builders" track, but naming it is the SASTW site's job —
  // this page's header is not where someone places the room inside the week's
  // programme. Re-add here if that changes.
  address: {
    street: "131 Soledad St",
    city: "San Antonio",
    region: "TX",
    postalCode: "78205",
    country: "US",
  },
  /** The containing week — Access Granted is one afternoon inside it. */
  superEvent: {
    name: "San Antonio Startup + Tech Week 2026",
    start: "2026-09-28",
    end: "2026-10-02",
    label: "Sept 28 – Oct 2, 2026",
  },
} as const

/**
 * The line the whole activation hangs on, in two halves.
 *
 * Split rather than stored whole so the turn can start its own line from lg up
 * — the sentence is a setup and a punch, and running them together buries the
 * punch mid-line. Below lg the break is suppressed and the space between them
 * survives, so it reads as one flowing sentence on a narrow column.
 *
 * Carried verbatim from next-sasw. It is also the event's one-line description
 * for the schedule and for marketing, so it should not be reworded on one site
 * without the other.
 */
export const AG_ONE_LINER = {
  setup: "Every other room this week is people talking about technology.",
  turn: "This one is people taking it apart.",
} as const

/**
 * Terminal green — the accent, deliberately not SASTW's magenta and not
 * PySanAntonio's blue.
 *
 * From the brand spec, and it agrees with the artwork: the padlock render glows
 * around #98f8b0, which is the same hue (~137°) read back through an emissive
 * surface. This is that hue at full saturation, which is what small text and
 * 1px borders need — the glow itself is too pale to sit on black as type.
 */
export const ACCESS_GREEN = "#00ff66"

/** Hardware amber, for the second rank of callouts. From the same spec. */
export const ACCESS_AMBER = "#ffb800"

/**
 * The schematic field the padlock sits in — a hairline grid for its glow to
 * fall on, so the render reads as being in a space rather than pasted onto one.
 */
export const GRID_LINE = "rgba(255,255,255,0.055)"

/**
 * And the mask that stops it. Tiled to the section edges the grid stops being a
 * hint and becomes wallpaper, so it is an ellipse centred on the artwork rather
 * than on its (much wider) box.
 */
export const GRID_FADE =
  "radial-gradient(ellipse 58% 62% at 68% 52%, black 0%, black 20%, transparent 74%)"

/**
 * The padlock render.
 *
 * Copied from next-sasw rather than hotlinked — a cross-repo hotlink would make
 * this page's art depend on that site's deploy. Same filename-is-the-cache-key
 * rule applies here as there: Next's optimizer caches by URL, so replacing this
 * art means a NEW filename, not just a new file, or every cache keeps serving
 * the old render.
 */
export const AG_LOCK = {
  src: "/access-granted/padlock.png",
  width: 907,
  height: 1400,
} as const

/**
 * The pill tags, which answer the three questions a security room gets asked
 * before anyone commits an afternoon to it.
 *
 * **Not currently rendered on this site.** They were in the hero and came out:
 * next-sasw shows them because that page is the front door for attendees,
 * whereas this page exists to run the open calls, and its readers are deciding
 * whether to submit rather than whether to turn up.
 *
 * Kept rather than deleted for the same reason next-sasw keeps its unrendered
 * ACCESS_TRACKS — these are the activation's own brand copy, this file mirrors
 * that brand, and they are still true. If a section here ever needs to sell
 * the room to an attendee, this is the copy for it.
 */
export const AG_BADGES = ["Free · drop-in", "All skill levels", "No sales pitches"] as const

/**
 * Call for speakers and volunteers closes end of day Aug 28, 2026.
 *
 * ⚠️ PLACEHOLDER — no close date was specified. The brief asked for a
 * "quick-turn CFP", and this gives roughly three weeks open and about four to
 * program the room before September 30. Change this one constant and the status
 * pill, the countdown, both forms and the hero CTA all follow.
 */
export const AG_CFS_CLOSES = "2026-08-28T23:59:59-05:00"

/**
 * The same date, written out for display.
 *
 * Kept beside the ISO value rather than formatted from it at render time: the
 * ISO string is timestamped -05:00, so a naive toLocaleDateString on a server
 * in UTC renders the day after. Two constants that must be edited together are
 * a smaller trap than a date that is silently wrong by one.
 */
export const AG_CFS_CLOSES_LABEL = "August 28, 2026"

export type AgCfsPhase = "open" | "closed"

export function getAgCfsPhase(now: Date = new Date()): AgCfsPhase {
  return now.getTime() <= new Date(AG_CFS_CLOSES).getTime() ? "open" : "closed"
}

/**
 * Whole days remaining until the call closes; 0 on the final day and after.
 * Floored, not rounded up, so the count never overstates how long is left.
 */
export function agDaysUntilClose(now: Date = new Date()): number {
  const ms = new Date(AG_CFS_CLOSES).getTime() - now.getTime()
  return ms <= 0 ? 0 : Math.floor(ms / 86_400_000)
}

/**
 * The exact string a first-time speaker's submission carries.
 *
 * Stored in SpeakerSubmission's `considerFor` field rather than adding a
 * boolean column for one event. That field already exists to answer "what else
 * should we do with this talk" — PySanAntonio uses it to offer a meetup slot
 * instead of a conference one — and this is the same kind of routing question.
 *
 * It is a shared constant because three places have to agree on it: the form
 * that sets it, the API route that decides whether to send the first-timer
 * paragraph, and whoever reads the admin table. A typo in any one of them
 * silently drops the practice-run offer.
 */
export const AG_FIRST_TIME_SPEAKER = "First-time speaker — I'd like the practice run"

/**
 * Talk formats, mirroring PySanAntonio's list.
 *
 * The brief plans three 40-minute slots, so that is the default and it leads.
 * The shorter two are offered anyway: a lightning slot is how someone with one
 * good finding — and no appetite for forty minutes of stage time — gets into
 * the room, and it is the cheapest way to fill a gap in the running order.
 */
export const AG_SESSION_FORMATS = [
  "40-minute talk",
  "20-minute talk",
  "5-minute lightning talk",
] as const

/** Who the talk is pitched at. The brief asks every submitter to answer this. */
export const AG_AUDIENCE_LEVELS = [
  "Anyone in the room",
  "Developers and builders",
  "Security practitioners",
  "Students and career changers",
  "Founders and executives",
] as const

/**
 * The two things this form can be: a talk, or a pair of hands.
 *
 * One form rather than two, because they are the same question asked of the
 * same person — "do you want to be part of running this" — and a visitor who
 * is unsure which they are should not have to pick a page before they can
 * answer.
 *
 * There used to be a third option, "Both". It came out: a radio group whose
 * third choice is the union of the first two is a checkbox group wearing a
 * disguise, and it made someone parse three identities to answer what are
 * really two independent yes/no questions. Doing both is now an opt-in
 * checkbox on the presenter path, which is also the honest asymmetry —
 * adding "I can also help" to a talk is a small extra, whereas adding a whole
 * talk to a volunteer signup is a different commitment.
 */
export const AG_INTENTS = [
  { value: "talk", label: "Present something" },
  { value: "volunteer", label: "Help run the room" },
] as const

export type AgIntent = (typeof AG_INTENTS)[number]["value"]

/**
 * The call for talks.
 *
 * The copy is written off the four groups actually running the room, so it
 * sounds like them rather than like a generic CFP:
 *
 *  · DCG-SATX runs "talks, workshops, lockpicking, hacking, and community"
 *    monthly, and its recent titles are the register we want — pentesting
 *    AI-integrated systems, extracting secrets from neuromorphic hardware,
 *    a malware breakdown titled "It's Kinda Like Dune". Technical, specific,
 *    and not po-faced about it. Its FAQ says "Beginners Welcome!!" and "No
 *    prior experience is required".
 *  · SAHA asks for "your hackers yearning to build and break things".
 *  · Alamo City Locksport tells experienced pickers to bring a challenge lock
 *    they re-pinned themselves — the artifact IS the contribution.
 *  · BSides SATX exists because good speakers were turned away from a
 *    mainstream conference for "lack of space and time". That is the reason
 *    the first-timer slot is reserved, and it is worth saying out loud in a
 *    room these four are hosting together.
 *
 * The exclusions stay a visible list, per the event brief: a security CFP that
 * does not print "no vendor pitches" receives vendor pitches, and stating the
 * sponsor carve-out in public is how it stops being an awkward private
 * conversation five times over.
 */
export const AG_CFP = {
  /**
   * Split so the section can set the last phrase in the accent colour. Stored
   * as two fields rather than sliced from one string at render time — a
   * regex over display copy breaks silently the first time the copy is
   * reworded.
   */
  headingLead: "Bring the thing you",
  headingAccent: "took apart.",
  body: "The groups behind this room spend the rest of the year pentesting AI-integrated systems, pulling secrets out of hardware, taking malware apart, and re-pinning locks just to beat them again. That is the register. Original research, war stories, side projects — the thing you built or broke and have been waiting to show someone who would get it.",
  audience:
    "The room is mixed: founders, developers, students, executives and security people, all at once. Nothing needs dumbing down \u2014 just tell us who you are aiming at, and do not assume everyone knows what a C2 is.",
  /**
   * Concrete enough to be useful, drawn from what these groups actually
   * present. An abstract "we want technical talks" gets abstracts back;
   * naming real subjects gets real submissions.
   */
  examples: [
    "An AI-integrated system you got into",
    "Secrets you pulled out of hardware",
    "Malware you took apart, and what it was really doing",
    "A supply-chain compromise you traced",
    "Wireless or RF research",
    "A lock you re-pinned yourself and then beat",
  ],
  avoid: {
    heading: "What we will turn down",
    items: [
      "Product pitches and sales decks",
      "Compliance overviews and general awareness content",
      "Anything that would work as a vendor's marketing webinar",
    ],
    sponsorNote: "This goes for sponsors too. Sponsorship does not buy a speaking slot.",
  },
  // No `firstTimer` copy and no slot count. The reserved slot is still real —
  // the form asks about it directly with a checkbox, which is where it is
  // actionable — but restating it as a callout was redundant, and publishing
  // "three slots" mostly told anyone deciding whether to write an abstract
  // that the odds were long.
} as const

/**
 * The call for volunteers.
 *
 * Deliberately has no role picker. An earlier version listed six jobs to choose
 * from, and most of them were not ours to offer — Alamo City Locksport runs the
 * lockpicking table, Geekdom staffs the door, and the community tables belong
 * to the orgs bringing them. What is actually left is small and changes week to
 * week, so the honest ask is "are you in", with examples for texture. We sort
 * out who does what by reaching out directly.
 */
export const AG_VOLUNTEER = {
  heading: "Or help us run it.",
  body: "Five hours of drop-in tables only works because people turn up early and stay late. You do not need to be an expert at anything \u2014 most of it is being a friendly human who knows where things are.",
  examples:
    "Things that need hands: the resume and career corner, setup and teardown, keeping the workshop room on time, and being the person a first-time visitor can ask what any of this is.",
  followUp: "Tell us you are in and we will reach out with what is left to cover.",
} as const

/**
 * The orgs running it, in the order asked for.
 *
 * Marks are held locally, copied from next-sasw's public/access-granted/orgs.
 * Two of them needed work there before they could sit on black — Alamo City
 * Locksport arrived as black line art on a white card and had its ink redrawn
 * white, and Cyber Jedis was a JPEG whose near-black field was keyed out — so
 * these files are the corrected versions, not the originals from the orgs.
 *
 * `heightClass` normalises them optically rather than mechanically: a square
 * mark needs more height than a wide wordmark to carry the same weight, which
 * is why these are not all the same number. Values carried over from next-sasw,
 * where they were tuned against this exact set of six.
 */
export const AG_ORGANIZERS = [
  {
    name: "BSides San Antonio",
    href: "https://www.bsidessatx.com/",
    logo: "/access-granted/orgs/bsides.png",
    heightClass: "h-12 sm:h-14",
  },
  {
    name: "DEF CON Group San Antonio",
    href: "https://dcgsatx.com/",
    logo: "/access-granted/orgs/defcon.png",
    heightClass: "h-12 sm:h-14",
  },
  {
    name: "San Antonio Hackers Association",
    href: "https://www.devsa.community/buildingtogether/saha",
    logo: "/access-granted/orgs/saha.png",
    heightClass: "h-10 sm:h-11",
  },
  {
    name: "UTSA CyberJedis",
    href: "https://www.instagram.com/utsacyberjedis/",
    logo: "/access-granted/orgs/cyberjedis.png",
    heightClass: "h-16 sm:h-18",
  },
  {
    name: "Alamo City Locksport",
    href: "https://www.devsa.community/buildingtogether/alamo-city-locksport",
    logo: "/access-granted/orgs/locksport.png",
    heightClass: "h-16 sm:h-20",
  },
  {
    name: "DEVSA",
    href: "https://www.devsa.community/",
    logo: "/access-granted/orgs/devsa.png",
    heightClass: "h-9 sm:h-10",
  },
] as const

/** The week's own site, for the "part of" link. */
export const SASTW_URL = "https://sasw.co"

/**
 * The week's mark, shared with PySanAntonio — same files in public/sastw,
 * pointed at from here rather than imported from data/pysa/2026.ts.
 *
 * Two events in the same week should show the identical logo, but Access
 * Granted should not have to import PySanAntonio's constants to do it: that
 * would make this page's header depend on a file about a different event, and
 * whichever of the two is edited first would quietly move the other.
 */
export const SASTW_LOGO = {
  white: "/sastw/horizontal-white.svg",
  magenta: "/sastw/horizontal-magenta.svg",
} as const
