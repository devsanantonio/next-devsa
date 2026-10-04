import Image from "next/image"
import Link from "next/link"
import { MODEL_INK, MODEL_LAVENDER, MODEL_ORGANIZERS } from "@/data/the-model/2026"
import { ModelLabel, ModelWordmark } from "@/components/brand/the-model"

/**
 * What The Model is — not what it is called, or when it ran.
 *
 * The copy here is held to what the activation's own material says. Two
 * inventions came out of it: it was labelled DEVSA's flagship conference,
 * which it is not, and the body described designers and filmmakers "making the
 * culture", a phrase that appears nowhere in the brand's own writing. Both
 * were mine. What is left is the organizers' framing — creators, creatives,
 * founders and builders in one room — and the one true claim of standing,
 * which is that no other DEVSA conference is built that way.
 *
 * This section used to be a masthead: the name set huge, the two-line tagline
 * under it, then the date, the time and the room. Every one of those is on
 * screen in the preview reel directly below, in the brand's own motion and
 * typography, so the page opened by saying the same six things twice and the
 * second telling was the weaker one.
 *
 * So it does the job the reel cannot. A reel announces; it has eighty seconds
 * and it spends them on the name, the hook and the logistics. What it never
 * gets to is the premise — why this room exists when DEVSA already runs three
 * others, and who is in it who would not be at the other three. That is the
 * only thing worth putting above a video that handles the rest.
 *
 * The h1 is the mark and nothing else. The vibe line sat inside it for a while,
 * set at the same weight as the wordmark, which gave the page two display
 * objects of equal force and no first place for the eye to land. It does more
 * work as the lead paragraph.
 *
 * The positioning sentence above it is deliberately parallel to More Human Than
 * Human's. The two are DEVSA's pair of AI conferences — this one for creators,
 * creatives, founders and builders, that one for engineering, security and the
 * people leading the change — and somebody landing on either page should be
 * able to tell within a line which of the two they came for.
 *
 * Date, time and venue are deliberately not restated anywhere on this page.
 * They are in the reel and in data/conferences.ts, and a line that has to be
 * updated in three places when an edition moves is a line that will be wrong
 * in two of them.
 */

export function TheModelHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: MODEL_INK }}
      data-bg-type="dark"
    >
      <div className="page-shell pt-2 pb-10 md:pt-3 md:pb-12">
        <div className="max-w-3xl">
          {/* The mark alone in the heading. The vibe line used to sit inside
              the h1 beside it, set at text-4xl font-black — a second display
              object the same weight as the wordmark, so the two competed and
              the eye had nowhere to land first. It reads better as the lead
              paragraph it always was. */}
          {/* mt-5 because the eyebrow used to hold this off the back link.
              With it gone the selection block's top edge sat about 20px under
              "Community Calendar", which is tighter than the gap the other
              conference mastheads open with. */}
          <h1 className="mt-5">
            <ModelWordmark className="block text-5xl md:text-6xl lg:text-7xl leading-[0.95]" />
          </h1>

          {/* Who the room is for, then what the room is like — the same two
              moves More Human Than Human's masthead makes, because the two are
              now a pair and a reader landing on either should be able to tell
              which one they want. That one names engineering, security and the
              people leading the change; this one names the other half.

              The second sentence is the organizers' own, near enough verbatim.
              It is the thing they say about this conference when nobody is
              writing marketing copy, which is why it survives every pass over
              this page. */}
          <p
            className="mt-7 max-w-2xl border-l-2 pl-5 text-pretty text-lg leading-relaxed text-white/80 md:text-xl"
            style={{ borderColor: MODEL_LAVENDER }}
          >
            DEVSA&apos;s AI conference for creators, creatives, founders and
            builders. Cool vibes, great company, and a room full of people
            showing each other what comes next — the work itself, not a
            description of it.
          </p>

          {/* The coalition, as marks. Access Granted and PySanAntonio have both
              carried their organizers as logos all along; this page was the one
              rendering names, on a mistaken claim that the artwork was not
              available. All three are live partner records. */}
          <div className="mt-10">
            <ModelLabel>Powered by</ModelLabel>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-5">
              {MODEL_ORGANIZERS.map((org) => (
                <Link
                  key={org.name}
                  href={org.href}
                  className="opacity-80 transition-opacity duration-200 hover:opacity-100"
                >
                  <Image
                    src={org.logo}
                    alt={org.name}
                    width={240}
                    height={80}
                    unoptimized
                    className={`${org.heightClass} w-auto object-contain`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
