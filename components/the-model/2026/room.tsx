import Image from "next/image"
import { ModelLabel } from "@/components/brand/the-model"

/**
 * The room, after the schedule: what "a room full of people showing each other
 * what comes next" looked like at the first edition.
 *
 * Captions and alt text say only what is plainly in each frame. They name no
 * one and tie no slide to a session, because a photo's subject is confirmed
 * with the organizers before it is asserted (an earlier caption on this site
 * got that wrong). Name a speaker here only once someone who was there says who
 * it is.
 *
 * Seven tiles, two even rows on desktop: the one landscape frame spans two
 * columns at 3:2, which comes out the height of a 3:4 portrait beside it. It
 * goes first so the phone's two columns fill too (wide, then three pairs);
 * anywhere else it strands a portrait beside an empty cell.
 *
 * On a phone the grid is a swipe row instead: stacked, seven photos ran to two
 * screens after the schedule. Every tile is the same height there, and the
 * next one shows at the edge so the row reads as one that scrolls.
 */
const PHOTOS: { src: string; alt: string; wide?: boolean }[] = [
  { src: "/conferences/the-model/stage-wide.webp", alt: "A speaker on stage at The Model, between two screens", wide: true },
  { src: "/hero/sastw-room-tables.webp", alt: "Attendees seated at tables, some with laptops open, at The Model" },
  { src: "/hero/sastw-stage-wide.webp", alt: "Attendees listening from their seats at The Model" },
  { src: "/hero/sastw-shared-stories.webp", alt: "A speaker with a microphone beside a screen reading “Shared stories” at The Model" },
  { src: "/hero/sastw-the-reading.webp", alt: "A speaker with a microphone on stage at The Model" },
  { src: "/hero/sastw-lounge.webp", alt: "A speaker at the podium, a laptop screen shown on the display beside the stage, at The Model" },
  { src: "/conferences/the-model/speaker-slides.webp", alt: "A speaker at the podium beside the slides on screen at The Model" },
]

export function TheModelRoom() {
  return (
    <section className="page-shell pb-16 md:pb-24">
      <ModelLabel>The room, 2026</ModelLabel>
      <div className="relative -mx-6 mt-5 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
        {PHOTOS.map((p) => (
          <figure
            key={p.src}
            className={`relative h-80 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 md:h-auto ${p.wide ? "w-[75vw] md:col-span-2 md:aspect-[3/2] md:w-auto" : "aspect-[3/4]"}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes={p.wide ? "(max-width: 768px) 75vw, 640px" : "(max-width: 768px) 240px, 320px"}
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
