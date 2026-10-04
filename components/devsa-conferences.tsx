import Link from "next/link"
import { conferences } from "@/data/conferences"
import {
  ConferenceBand,
  accentOf,
} from "@/components/events/conference-band"

/**
 * The four conferences DEVSA runs, as evidence rather than as a catalogue.
 *
 * ## The copy comes from the four conferences, not from the homepage
 *
 * Earlier drafts here were written about the conferences from the outside —
 * "Four We Run Ourselves", then "Four We Lead. Built Together." Both described
 * DEVSA's relationship to them and said nothing about what any of them is.
 *
 * Read the four descriptions together and they turn out to define themselves
 * against the same thing, in their own words:
 *
 *   · The Model      — "the work itself, not a description of it"
 *   · Access Granted — "Every other room is people talking about technology.
 *                       This one is people taking it apart."
 *   · PySanAntonio   — "with the people already doing the work here"
 *   · More Human     — "what changes when the tools stop being tools"
 *
 * Four conferences for four different audiences, all of them defined against
 * rooms where people only talk. That is the actual shared claim, it is earned
 * rather than asserted, and it is what this section says now. "Taking it apart"
 * is Access Granted's own phrase, which is the sharpest of the four.
 *
 * ## "Lead", not "own"
 *
 * The first version of this section was headed "Four We Run Ourselves." over
 * the line "The calendar belongs to everyone. These four are DEVSA's own." Both
 * were wrong in the same direction, and wrong against this site's own pages:
 * every one of these conferences carries a "Powered by" row of partner marks on
 * its own page — The Creative Futures and Tech Bloc on The Model, six
 * organizations on Access Granted, Alamo Python and PyTexas on PySanAntonio.
 * The homepage was claiming sole authorship of four things the detail pages
 * correctly credit to a coalition.
 *
 * What is actually true is narrower and better: these are intentional,
 * DEVSA-branded, DEVSA-led activations, and DEVSA activates them with the
 * community groups and partners around it. "Lead" carries that. "Own" and
 * "ourselves" do not, and they quietly take credit from the groups whose logos
 * are two clicks away.
 *
 * ## Why the homepage needed this
 *
 * The page already claims them. AboutDevsa, directly above, says DEVSA helps
 * communities grow "through a shared community calendar, monthly workshops, and
 * conferences built right here in San Antonio", and the Builders lane says
 * "every meetup, workshop and conference in one calendar". Before this strip,
 * the rendered homepage contained the words "The Model", "Access Granted" and
 * "PySanAntonio" zero times each, and "More Human Than Human" only as the label
 * on a video button. The page asserted a pillar and produced no evidence for
 * it, which is the weakest kind of claim: a noun with nothing behind it.
 *
 * ## Why it is not the /events band
 *
 * That band is a portfolio — the same tiles, plus a blurb, a date, a venue and
 * an "Event page" link under each. This takes the tiles and leaves the prose:
 * four marks on their own grounds, each carrying its brand's own play, and
 * nothing to read. A homepage reader has not asked for the particulars yet.
 *
 * An earlier version went further and had no effects and no links at all —
 * four bare lockups and one "See all four" text link under the row. The
 * argument was that hover belongs to a browsing grid and the homepage wants
 * one forward motion. The effects earn their place here anyway: they are what
 * makes four static logos into four rooms you can look into, which is the
 * whole claim the section is making.
 *
 * They are linked per conference now, which is what the single text link
 * became. Still not buttons: the CTA ranking puts the Community Calendar first
 * and donation second, and these must stay something a reader discovers by
 * pointing at them rather than a third primary action competing with those
 * two. The other reason they link is simpler — a tile that animates under the
 * cursor and then cannot be clicked is a tease.
 *
 * ## Why it sits where it does, and why it is dark
 *
 * After EcosystemShowcase, so the page reads: here is who we are, here is
 * everyone in the ecosystem, here is what we run with them, here is how you
 * plug in. It was one slot earlier to begin with, in front of the logo wall.
 * That was the wrong order on a page whose argument is that DEVSA is a bridge
 * and not a destination — it showed DEVSA's own four before the reader had met
 * any of the groups they are run with, which is the sequence most likely to
 * make them read as self-promotion.
 *
 * The move is also what lets the hook say "these groups". Before, "our
 * community groups" was a forward reference to a wall the reader had not
 * reached; now it points back at one they just scrolled through.
 *
 * Dark for two reasons. Three of the four marks are drawn for a dark ground —
 * More Human's near-white would be invisible on the white section either side,
 * and PySanAntonio's wordmark asset is the light-ink cut. And the page
 * otherwise alternates dark and light section by section, with AboutDevsa and
 * EcosystemShowcase the one place two light sections meet; this restores that
 * rhythm instead of interrupting it.
 */
export function DevsaConferences() {
  return (
    <section
      id="devsa-conferences"
      className="w-full scroll-mt-20 bg-[#0a0a0a]"
      data-bg-type="dark"
    >
      <div className="page-shell py-16 md:py-20">
        <div className="max-w-2xl">
          {/* An eyebrow, because the three sections in this half of the page
              all carry one — "Who's Building Here", "Who DEVSA Serves", "Come
              Full Circle" — and they are what gives the lower page its scroll
              rhythm. Without one this section started cold between two that
              did not.

              It also does the connective work, which frees the h2 to be short.
              The section used to open by explaining the arrangement; now the
              label carries that and the heading can just name the thing. */}
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
            What We Run Together
          </p>
          <h2 className="mt-4 text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
            {/* Two short sentences, because at this size the heading wraps to
                two lines in its column whatever it says — and the only break
                worth having is the one at the full stop. */}
            Four Conferences. Built{" "}
            <span className="font-light italic text-white/50">Here</span>.
          </h2>
          <p className="mt-4 text-lg md:text-xl font-light leading-[1.45] text-white/65">
            DEVSA-led, activated with these groups and our partners. For the
            creatives, founders, builders and engineers already doing the work.
          </p>
        </div>

        {/* Two across, not four, and the marks set at `panel` rather than
            `card` — the two halves of the same fix.

            Four across gave each tile about 305px. PySanAntonio's wordmark is
            drawn art at a fixed 240px, so it was already at its width ceiling
            and could not grow; the lettering marks were set at 24px inside a
            208px tile, which left every panel about 85% empty. Four
            conferences read as four small logos floating in black rather than
            as the activations they are.

            Two across doubles the tile to roughly 632px, which is what lets
            every mark grow: PySA's wordmark to 460px and the lettering to 48px
            at lg. The section gets taller in exchange, which is the right
            trade for the one part of this page that shows what DEVSA makes.

            The tiles still need their height for the effects — the cipher
            field needs area to write ciphertext into, the mascots need floor
            to walk on, and the clips need a box to fill.

            Linked, one per conference, which is what replaced the single "See
            all four" link below the row. The site's CTA ranking still puts the
            Community Calendar first and these must not read as a competing
            primary — so they are tiles a reader discovers by pointing at them,
            not buttons. A tile that animates under the cursor and then cannot
            be clicked is a tease, which is the other reason they link. */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-14">
          {conferences.map((conference) => (
            <li key={conference.key}>
              {conference.href ? (
                <Link href={conference.href} className="block overflow-hidden">
                  <ConferenceBand
                    conference={conference}
                    ground="none"
                    markSize="panel"
                    className="h-48 px-6 sm:h-56 lg:h-60 lg:px-8"
                  />
                </Link>
              ) : (
                /* No page, so no link. A tile that looks clickable and is not
                   is worse than one that plainly is not. */
                <div className="overflow-hidden">
                  <ConferenceBand
                    conference={conference}
                    ground="none"
                    markSize="panel"
                    className="h-48 px-6 sm:h-56 lg:h-60 lg:px-8"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Who runs them with us.
            
            Borrowed from vercel.com/connect, which renders each integration as
            a pill carrying a logo and the one specific thing that connection
            can do — `chat:write`, `issues:create`. The device works because it
            answers "what IS this relationship" in the smallest possible unit,
            which is exactly what a logo wall never does. EcosystemShowcase
            further up this page shows twenty-three marks and says nothing about
            what any of them is to DEVSA.

            Two departures. Vercel's chips carry logos; these carry type,
            because the names here come from `poweredBy` as plain strings and
            three of them — San Antonio Hacker Association, UTSA CyberJedis,
            Digital Canvas — have no record and so no logo. A row where some
            chips have a mark and others do not reads as broken rather than
            mixed. And where Vercel's second half is an API scope, here it is
            the conference, set in that conference's own accent — the colour is
            what links a chip back to the tile above it.

            Every pairing is from data/conferences.ts and was set by the
            organisers. Nothing here is a relationship I characterised. DEVSA is
            filtered out of its own list: it is the subject, not a collaborator
            on its own conference. */}
        <div className="mt-10 md:mt-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">
            Run with
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {conferences.flatMap((conference) =>
              (conference.poweredBy ?? [])
                .filter((org) => org !== "DEVSA")
                .map((org) => (
                  <li
                    key={`${conference.key}-${org}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/75"
                  >
                    {org}
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider"
                      style={{ color: accentOf(conference) }}
                    >
                      {conference.name}
                    </span>
                  </li>
                ))
            )}
          </ul>
        </div>

      </div>
    </section>
  )
}
