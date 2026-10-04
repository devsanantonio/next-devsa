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
 * here deliberately: it was DEVSA's flagship, The Model takes that slot going
 * forward, and the site should still say the first one happened. The recap
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
      "Creatives, founders and builders in the same room. An afternoon of showing each other what comes next.",
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
  },
  {
    key: "more-human-than-human",
    name: "More Human Than Human",
    blurb:
      "DEVSA's AI conference, on what changes when the tools stop being tools. The Model carries this slot forward.",
    status: "history",
    lastRun: "February 28, 2026",
    venue: "Geekdom",
    /* No entry in EVENT_BRANDS, and it should not get one. That registry is
       for brands the calendar still renders cards for; this one has run its
       last edition. The amber is its own, carried over from the conference
       site so the card is recognisably it rather than a grey tombstone. */
    accent: "#ff9900",
  },
];

/** The ones DEVSA intends to run again. */
export const returningConferences = conferences.filter(
  (c) => c.status === "returning"
);

/** The ones that have had their last edition. */
export const pastConferences = conferences.filter((c) => c.status === "history");

/** One conference by key, for the pages that render a single brand. */
export function getConference(key: string): Conference | undefined {
  return conferences.find((c) => c.key === key);
}
