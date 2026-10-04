import type { EventBrandKey } from "@/lib/event-brands";

/**
 * The conferences DEVSA owns — the brands, their preview reels and the
 * afternoons they ran.
 *
 * This is a portfolio, not an archive, and the distinction is the whole reason
 * the file exists. `/events` already had a "Watch Past Conferences" band, but
 * that band is a video shelf — a conference only earns a place on it once
 * there is footage of the event itself. The Model and Access Granted became
 * official DEVSA events the week they ran, so there was nowhere on the site
 * that said DEVSA runs them at all.
 *
 * Kept separate from `data/events.ts` on purpose. That file holds dated
 * occurrences — a thing that happened on a day. These are the standing brands,
 * which outlive any one year of them, and the lineups below are the record of
 * the last time each ran.
 *
 * ## Where this content came from
 *
 * The reels, the session lineups and the "powered by" rows are DEVSA's own,
 * carried across from the sasw-geekdom/next-sasw repo and its TV/social cut.
 * Two repos holding the same lineup in different words is how they drift, so
 * this is the copy for devsa.community and next-sasw stays the week's.
 *
 * ## Status
 *
 * `returning` is a commitment, not a schedule. It means DEVSA intends to run
 * the brand again and the page should say so before there is a date, which is
 * what all three Startup + Tech Week activations are waiting on now.
 *
 * `history` is the opposite and is not a soft delete. More Human Than Human is
 * here deliberately: The Model replaces it on the calendar going forward, and
 * the site should still say the first one happened. The recap
 * footage on the homepage is from it, so retiring the name while continuing to
 * run the video would be the worst of both.
 */
export type ConferenceStatus = "returning" | "history";

export interface ConferenceSession {
  /** As printed on the day — "1:10 PM", or a range for anything drop-in. */
  time: string;
  title: string;
  /** Speakers, moderators and anything that qualifies the slot. */
  people?: string;
}

export interface Conference {
  key: string;
  name: string;
  /** One line: what the room is, not what the attendee will get. */
  blurb: string;
  status: ConferenceStatus;
  /** The most recent run, for display. */
  lastRun: string;
  venue: string;
  /** Spelled out, for the event page's meta rail. */
  venueDetail?: string;
  timeLabel?: string;
  /** A page on this site, where one exists. */
  href?: string;
  /**
   * The design system this conference carries, from lib/event-brands.ts. The
   * three Startup + Tech Week activations have one; the card borrows its
   * accent so a row of them reads the way the calendar cards already do.
   */
  brand?: EventBrandKey;
  /** For a conference with no entry in EVENT_BRANDS — see More Human below. */
  accent?: string;
  /** Who put it on. */
  poweredBy?: readonly string[];
  /** The afternoon, as it ran. */
  sessions?: readonly ConferenceSession[];
  /**
   * One wide photograph of the room, in public/conferences.
   *
   * One, deliberately, and an establishing shot rather than a speaker. The
   * obvious use of this shoot was a grid of speaker tiles, and it does not
   * work: the frames are wide room shots where the speaker is a small distant
   * figure, so five of them in a row read as five photographs of the same
   * ceiling. They also only cover five of seven sessions, so a lineup with
   * faces on some rows and not others would look broken.
   *
   * What a single wide frame does well is answer the question the lineup
   * cannot — what the room was actually like, and how many people were in it.
   */
  photo?: string;
  photoAlt?: string;
  /** Intrinsic size of `photo`. Declared so a frame that is not 1600x900 is
      not described as though it were. */
  photoWidth?: number;
  photoHeight?: number;
  /**
   * A clip the portfolio card plays *only* while the pointer is over it, behind
   * a lockup that stays put.
   *
   * There used to be a `cardVideo` beside this that played unconditionally and
   * *was* the card's mark, because More Human Than Human was the one conference
   * with no lettering to put there. It has one now — see MoreHumanWordmark —
   * so every card leads with its name and every clip is something you go
   * looking for. Nothing autoplays in the grid any more, which is also four
   * fewer videos decoding on a page nobody has scrolled to yet.
   */
  hoverVideo?: string;
  hoverPoster?: string;
}

/*
 * The preview reels are not rendered anywhere.
 *
 * All three were on their event pages and all three came off: they were cut to
 * sell afternoons that have now happened, and on a page whose job changed from
 * "come to this" to "here is what it was", a trailer is the wrong register.
 * The room photographs took their place.
 *
 * The fields are removed rather than left set-but-unread, which is the state
 * that rots. The files are still in the Blob store if they are wanted again:
 *   /video/the-model-sastw-2026.mp4
 *   /video/access-granted-sastw-2026.mp4
 *   /video/pysanantonio-sastw-2026.mp4
 * Music on all three: "Sabor a la Antigua" by Cumbia Deli.
 */

export const conferences: Conference[] = [
  {
    key: "the-model",
    name: "The Model",
    blurb:
      "DEVSA's AI conference for creators, creatives, founders and builders. More Human Than Human is its counterpart on the engineering side.",
    status: "returning",
    lastRun: "September 28, 2026",
    venue: "Geekdom",
    venueDetail: "The Rand, 3rd Floor — 110 E Houston St",
    timeLabel: "1:00 – 6:00 PM",
    href: "/events/the-model",
    brand: "the-model",
    poweredBy: ["The Creative Futures", "Tech Bloc", "DEVSA"],
    photo: "/conferences/the-model-room.webp",
    photoAlt:
      "Three panellists on stage at The Model, microphones in hand, in front of the event's lighting rig",
    photoWidth: 1024,
    photoHeight: 576,
    sessions: [
      {
        time: "1:10 PM",
        title: "The Next Era of the Creator Economy",
        people: "Justin Johnson, moderated by Maria Consuelo Gonima",
      },
      {
        time: "1:45 PM",
        title: "Storytelling & AI",
        people:
          "Joshua Collins and Michael Smith, moderated by Katherine Rico",
      },
      {
        time: "2:20 PM",
        title:
          "Beyond the Cloud: Building Offline AI Pipelines for High-Traffic Physical Spaces",
        people: "AJ Rose and Diego Chavez",
      },
      { time: "2:45 PM", title: "Let the Machines Win", people: "Jonathan Perry" },
      {
        time: "3:10 PM",
        title: "Ship the Story, Not Just the Product",
        people: "Maria Consuelo Gonima",
      },
      {
        time: "3:35 PM",
        title: "Beyond the Prompt: Directing in the Age of AI",
        people: "Cynthia Gentry",
      },
      {
        time: "4:00 PM",
        title: "Putting Grok Bot and Agents to Work in a Real Business",
        people: "Leon Hitchens",
      },
      {
        time: "4:25 PM",
        title: "Big Work, Small Teams",
        people:
          "Joe Guerra, Matthew Bell and Derek Alexander, powered by AlamoCityAI",
      },
      {
        time: "5:30 PM",
        title:
          "What Happens When Creative Storytelling Collides With Startup Strategy?",
        people: "Serena Hernandez and Daniel Gallegos",
      },
    ],
  },
  {
    key: "access-granted",
    name: "Access Granted",
    blurb:
      "Every other room that week was people talking about technology. This one was people taking it apart.",
    status: "returning",
    lastRun: "September 30, 2026",
    venue: "Geekdom",
    venueDetail: "The Rand, 3rd Floor — 110 E Houston St",
    timeLabel: "1:00 – 6:00 PM",
    href: "/events/access-granted",
    brand: "access-granted",
    poweredBy: [
      "BSides San Antonio",
      "DEF CON Group San Antonio",
      "San Antonio Hacker Association",
      "UTSA CyberJedis",
      "Alamo City Locksport",
      "DEVSA",
    ],
    sessions: [
      {
        time: "1:10 PM",
        title: "Trust Each Other, Not Technology",
        people: "Richard Davey",
      },
      {
        time: "1:50 PM",
        title: "The Hackers Left. Now What?",
        people: "Jacob Wellnitz",
      },
      {
        time: "2:15 PM",
        title: "Meow-ware: A Look at the Gayfemboy Malware",
        people: "Dante Moreno",
      },
      {
        time: "2:50 PM",
        title: "How to Prepare for Q-Day",
        people: "Keeban Villarreal",
      },
      {
        time: "3:15 PM",
        title: "The New Age of Data Battlefields",
        people: "Gabriel Green",
      },
      {
        time: "3:50 PM",
        title: "Glyph: A Binary Analysis Tool Powered by Machine Learning",
        people: "Corey Hartman, Ph.D.",
      },
      {
        time: "4:50 PM",
        title: "AI-Powered Bug Bounty Hunting",
        people: "Mike Bell",
      },
      {
        time: "1 – 6 PM",
        title: "Lockpicking Village",
        people: "Alamo City Locksport — drop in anytime",
      },
    ],
  },
  {
    key: "pysanantonio",
    name: "PySanAntonio",
    blurb:
      "The city's Python conference, back for a second year — an afternoon of learning, networking and community building.",
    status: "returning",
    lastRun: "October 2, 2026",
    venue: "Geekdom",
    venueDetail: "The Rand, 3rd Floor — 110 E Houston St",
    timeLabel: "1:00 – 6:00 PM",
    href: "/events/pysanantonio",
    brand: "pysanantonio",
    poweredBy: ["Alamo Python", "PyTexas Foundation", "DEVSA"],
    sessions: [
      {
        time: "1:10 PM",
        title: "Adapting to the Evolution of Software Engineering",
        people: "Mason Egger",
      },
      {
        time: "1:45 PM",
        title: "Python, Test-Driven Development, and AI",
        people: "Jay Jahns",
      },
      {
        time: "2:30 PM",
        title: "JOMO in the Age of AI Slop: The Joy of Missing Out",
        people: "Jordana Naftali",
      },
      {
        time: "2:50 PM",
        title: "Experiments in Agentic Coding",
        people: "Edwin Jung",
      },
      {
        time: "3:35 PM",
        title: "Your Agent's requirements.txt Is a Lie",
        people: "Yossi Eliaz",
      },
      {
        time: "4:00 PM",
        title: "AI Steering Wheel: Giving Humans Control of the Black Box",
        people: "Shayan Ali",
      },
      { time: "4:30 PM", title: "Python Jeopardy" },
    ],
    photo: "/conferences/pysanantonio-room.webp",
    photoAlt:
      "The PySanAntonio room at Geekdom — a speaker presenting at the screen with the audience at long tables, laptops open",
    /* The luchador mariachi from the conference hero, reused rather than
       re-cut: the same trimmed loop, which is already local and already
       carries its own poster frame. */
    hoverVideo: "/pysa/mascot-clip.mp4",
    hoverPoster: "/pysa/mascot-video-poster.webp",
  },
  {
    key: "more-human-than-human",
    name: "More Human Than Human",
    blurb:
      "DEVSA's AI conference for engineering, security and the people leading the change. The Model is its counterpart on the creative side.",
    status: "returning",
    lastRun: "February 28, 2026",
    venue: "Geekdom",
    venueDetail: "The Rand, 3rd Floor — 110 E Houston St",
    timeLabel: "1:00 – 5:00 PM",
    href: "/events/morehumanthanhuman",
    poweredBy: ["DEVSA", "Digital Canvas", "Geekdom"],
    /* No entry in EVENT_BRANDS yet. That registry drives the lockups the
       community calendar renders on event cards, and there is no scheduled
       edition for it to render — when a date exists, this gets an entry and
       the lockup moves there.

       Until then the amber lives here. It is the conference's own, carried
       over from its site, so the portfolio card is recognizably it. */
    accent: "#ff9900",
    /* The rotating head from its own title sequence — the thing anyone who
       attended would recognize. It was playing in the on-demand band until that
       band came off the page; this keeps it in use rather than retiring the
       only piece of motion the conference owns.

       It used to be this card's mark, running on a loop with the conference's
       name laid over it, because this was the one conference here with no
       lettering of its own. That was always a workaround: the name sat on the
       footage as a caption rather than as a mark, and the card was the only one
       of four that could not be read at a glance without motion. The wordmark
       its own site used is now set properly, so the head does what the mascot
       does on PySanAntonio's card — it waits behind the lettering until
       somebody looks.

       Re-encoded for a card: the S3 original is 1920x1080 at 5.1 Mbps and
       7.7 MB, which is a poor trade for a tile a few hundred pixels wide.
       1280-wide at CRF 26 is 0.7 MB and indistinguishable at this size. The
       old markup also offered a .webm source that has been returning 403. */
    /* The running order as it ran, recovered from next-canvas — the conference
       was produced on digitalcanvas.community and its schedule component is
       still there, which is why this is a record rather than a reconstruction.

       Times are ranges here where the other three conferences carry a single
       start. That is the source's own format and it is the more useful one for
       an afternoon nobody can attend any more: it says how long a thing ran,
       which is the question left once "when should I arrive" has stopped
       mattering.

       The five community slots are in the list rather than filtered out of it.
       They are five minutes each and they are not talks, but they are what the
       afternoon actually was — a room that gave its stage to ACM UTSA, Geeks &&,
       ACM-SA, Chaincraft and Alamo Python between the sessions. Dropping them
       would tidy the record into something that did not happen. */
    sessions: [
      { time: "1:10 – 1:50", title: "Key AI Skills for Leaders", people: "Wes Etheredge" },
      { time: "1:50 – 1:55", title: "ACM UTSA", people: "Alekzander Brysch" },
      { time: "1:55 – 2:15", title: "How Do Agents Actually Work?", people: "Samad Ahmed" },
      { time: "2:15 – 2:35", title: "GitHub Copilot SDK", people: "Daniel Ward" },
      { time: "2:35 – 2:40", title: "AI-April", people: "Geeks &&" },
      {
        time: "2:40 – 2:55",
        title: "GTM Research in the Age of AI",
        people: "Serena Hernandez",
      },
      { time: "2:55 – 3:15", title: "Godot Audio Stack", people: "Werner Mendizabal" },
      { time: "3:15 – 3:20", title: "VelociCode II", people: "ACM-SA" },
      {
        time: "3:20 – 3:35",
        title: "What\u2019s Left When the Code Writes Itself?",
        people: "Angel Escobedo",
      },
      { time: "3:35 – 3:40", title: "Chaincraft", people: "Ryan Beltr\u00e1n" },
      { time: "3:40 – 3:45", title: "PyTexas Conference", people: "Alamo Python" },
      {
        time: "3:50 – 4:20",
        title: "We Can\u2019t Do This Without YOU",
        people: "Dirce E. Hernandez",
      },
      {
        time: "4:20 – 4:40",
        title: "Proving Humanity in an Agentic Internet",
        people: "Jacqueline Suttin",
      },
      { time: "4:40 – 4:45", title: "Dream It, Ship It", people: "Jesse Hernandez" },
    ],
    hoverVideo:
      "https://cd7xknlpdcor35of.public.blob.vercel-storage.com/video/more-human-head.mp4",
    hoverPoster: "/conferences/more-human-poster.webp",
  },
];

/** The ones DEVSA intends to run again — all of them, as it stands. */
export const returningConferences = conferences.filter(
  (c) => c.status === "returning"
);

/**
 * The ones that have had their last edition. Empty today: More Human Than
 * Human was the only entry and it is coming back, as the second of DEVSA's two
 * AI conferences rather than a slot The Model absorbed.
 *
 * Kept, with `status: "history"` still in the type, because a conference that
 * ends is a thing that happens and the portfolio already knows how to render
 * one — see `isHistory` in ConferencePortfolio.
 */
export const pastConferences = conferences.filter((c) => c.status === "history");

/** One conference by key, for the pages that render a single brand. */
export function getConference(key: string): Conference | undefined {
  return conferences.find((c) => c.key === key);
}
