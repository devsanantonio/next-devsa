import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { conferences } from "@/data/conferences"
import { ConferenceBand } from "@/components/events/conference-band"

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
      <div className="page-shell py-16 md:py-24">
        <div className="max-w-2xl">
          {/* An eyebrow, because the three sections in this half of the page
              all carry one — "Who's Building Here", "Who DEVSA Serves", "Come
              Full Circle" — and they are what gives the lower page its scroll
              rhythm. Without one this section started cold between two that
              did not.

              It also does the connective work, which frees the h2 to be short.
              The section used to open by explaining the arrangement; now the
              label carries that and the heading can just name the thing. */}
          {/* The homepage's eyebrow, not the events page's.
          
              This read `font-mono text-[11px] tracking-widest text-white/45`,
              which is the /events idiom — mono, 11px, borrowed wholesale when
              this section was built out of that one. Every eyebrow on this page
              is sans at `text-sm md:text-base`, `font-medium`, `tracking-[0.2em]`
              (EcosystemShowcase, AudienceLanes, HeroCommunities all agree), so
              this section was announcing itself a size smaller and in a
              different typeface than its neighbours.
          
              white/50 rather than /45 for contrast: see the note in
              docs/design-system.md. */}
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/50">
            What We Run Together
          </p>
          {/* `xl:text-7xl` was missing. Every other h2 on this page carries
              the full ramp 4xl/5xl/6xl/7xl, so above 1280px this heading
              rendered one step smaller than the sections either side of it. */}
          <h2 className="mt-5 text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
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

        {/* The site's own card, not a bespoke one.

            This section spent two passes as something else: four bare marks in
            a row, then two big transparent tiles per row with nothing in them
            but lettering. Both were out of step with every other card on this
            site. AudienceLanes directly below — and the /events portfolio band
            — are built the same way, and it is a shape with rules: a visual
            slot at aspect-16/10, then padded content, inside a rounded-2xl
            neutral-900 card with a neutral-800 border that lifts on hover.
            A section that invents its own geometry reads as pasted in, however
            good the pieces are.

            So the brand mark and its hover effect now live in the slot a photo
            occupies on the other cards, and the copy block underneath carries
            what a reader actually needs: what the conference is, who runs it
            with DEVSA, and a way in.

            The "Run with" pills that sat under this grid are gone. Collecting
            eleven organisations into one list below four cards separated each
            name from the conference it belongs to and made a second thing to
            read. Inside the card, the same fact needs no label and no colour
            coding — it is simply the line under the blurb. */}
        <div className="mt-12 grid gap-4 grid-cols-1 md:mt-14 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {conferences.map((conference) => {
            const runWith = (conference.poweredBy ?? []).filter(
              (org) => org !== "DEVSA"
            )

            const inner = (
              <div className="flex h-full flex-col">
                {/* The slot a photograph fills on the other cards. Here it is
                    the brand's own ground and lettering, and it is where the
                    hover lives — see ConferenceBand. */}
                <ConferenceBand
                  conference={conference}
                  className="aspect-16/10 w-full px-5"
                  markClassName="lg:scale-[0.88]"
                />

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <p className="flex-1 text-[15px] leading-relaxed text-white/60">
                    {conference.blurb}
                  </p>

                  {/* white/55 and /45. At /40 and /30 these measured 3.84:1
                      and 2.72:1 on neutral-900 — both under the 4.5:1 WCAG AA
                      floor for text this size. The minimum that clears it on
                      this ground is 0.46. */}
                  {runWith.length > 0 && (
                    <p className="text-[13px] leading-relaxed text-white/55">
                      <span className="text-white/50">Run with </span>
                      {runWith.join(", ")}
                    </p>
                  )}

                  {conference.href && (
                    <span className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-white">
                      Event page
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  )}
                </div>
              </div>
            )

            const shell =
              "group block h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-200"

            return conference.href ? (
              <Link
                key={conference.key}
                href={conference.href}
                className={`${shell} hover:border-neutral-700 hover:bg-neutral-900/70`}
              >
                {inner}
              </Link>
            ) : (
              /* No page, so no link. A card that looks clickable and is not is
                 worse than one that plainly is not. */
              <div key={conference.key} className={shell}>
                {inner}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
