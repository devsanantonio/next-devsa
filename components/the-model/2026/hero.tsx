import Image from "next/image"
import Link from "next/link"
import { MODEL_INK, MODEL_ORGANIZERS } from "@/data/the-model/2026"
import { ModelLabel, ModelWordmark } from "@/components/brand/the-model"

/**
 * What The Model is — not what it is called, or when it ran.
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
 * The name survives in the h1, inside the sentence rather than as a display
 * word, which keeps the brand in the page's one heading without reprinting the
 * wordmark the reel just showed. The selection block carries the identity at
 * that size on its own.
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
      <div className="page-shell pt-16 pb-10 sm:pt-20 md:pt-24 md:pb-12">
        <div className="max-w-3xl">
          <ModelLabel>DEVSA&apos;s Flagship Conference</ModelLabel>

          {/* The lockup and the statement are two typographic objects, not one
              sentence.

              They were one: the wordmark ran inline and the rest of the line
              continued in Geist Sans, so the face changed in the middle of a
              sentence. That is a logotype pasted into running text — the mono
              is the mark's face, not a face for prose, and switching mid-clause
              reads as an accident rather than an emphasis.

              Split, each object gets one face and keeps its own job: the mark
              identifies, the line underneath says what the room is. The h1
              still carries both, so the page's one heading names the brand. */}
          <h1 className="mt-6">
            <ModelWordmark className="block text-5xl md:text-6xl lg:text-7xl leading-[0.95]" />
            <span className="mt-5 block text-balance font-sans text-white leading-[1.1] text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.02em]">
              Where builders aren&apos;t talking to other builders.
            </span>
          </h1>

          <div className="mt-7 max-w-2xl space-y-4">
            <p className="text-lg md:text-xl font-light leading-normal text-white/70">
              San Antonio&apos;s creative economy — the designers, filmmakers,
              musicians and storytellers making the culture — spends the
              afternoon with the people building the tools underneath it. Both
              sides show the work rather than describe it.
            </p>
            <p className="text-base leading-relaxed text-white/45">
              It carries the slot More Human Than Human held.
            </p>
          </div>

          {/* The coalition, as marks. Access Granted and PySanAntonio have both
              carried their organisers as logos all along; this page was the one
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
