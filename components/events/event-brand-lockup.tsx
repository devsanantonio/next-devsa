import Image from "next/image"
import type { EventBrand } from "@/lib/event-brands"

/**
 * Each activation's title, set the way its own site sets it.
 *
 * Three lockups rather than one themed heading, because what distinguishes
 * these brands is a gesture and not a color — recoloring a shared heading
 * three ways would produce three cards that look like the same card. Ported
 * from next-sasw's ModelBand, AccessGrantedBand and PysaBand.
 *
 * The event's own title is ignored for the two lettering marks. These are
 * fixed identities and the title in Firestore is editable prose; if an
 * organizer renames the record, the lockup should not follow it into
 * something that is no longer the brand.
 */
/**
 * Two sizes.
 *
 * `card` is the original: these marks sit above a blurb, a date and a link on
 * the /events cards and the calendar, so they are a label on a stack of other
 * things.
 *
 * `panel` is for the homepage, where a mark is alone in a tile and the only
 * thing in it. At `card` size that tile was about 85% empty — the lettering set
 * at 24px inside a 208px panel — which is what made four conferences read as
 * four small logos rather than four rooms.
 *
 * A size rather than a CSS `scale()` on the wrapper, which is what this used to
 * do. Transform-scaled text rasterizes at its authored size and is then
 * stretched, so it goes soft exactly where the lettering is the subject.
 */
const LOCKUP_SIZES = {
  card: "text-xl sm:text-2xl",
  panel: "text-3xl sm:text-4xl lg:text-5xl",
} as const

/** PySanAntonio is drawn art, so its size is a box rather than a font size.
    Both keep the asset's own 6.6:1 ratio. */
const PYSA_SIZES = {
  card: "mt-3 mb-1 h-8 w-[210px] sm:h-9 sm:w-[240px]",
  panel: "h-[42px] w-[280px] sm:h-[58px] sm:w-[380px] lg:h-[70px] lg:w-[460px]",
} as const

export type LockupSize = keyof typeof LOCKUP_SIZES

export function EventBrandLockup({
  brand,
  size = "card",
}: {
  brand: EventBrand
  size?: LockupSize
}) {
  if (brand.key === "the-model") {
    /* A half-finished selection: "The" plain, "Model" caught in a block with
       its ink knocked out. The artwork's single gesture, and the reason the
       face is mono — the poster is set in a plain monospace, and a display
       face beside it is a second voice. */
    return (
      <h3
        className={`mt-2.5 font-medium uppercase leading-[1.15] tracking-tight text-white ${LOCKUP_SIZES[size]}`}
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        The{" "}
        {/* box-decoration-clone so a wrap gets a block per line, the way a real
            selection does, rather than one box stretched around the turn. */}
        <span
          className="box-decoration-clone px-1.5"
          style={{ backgroundColor: brand.accent, color: brand.onAccent }}
        >
          Model
        </span>
      </h3>
    )
  }

  if (brand.key === "access-granted") {
    /* Two words, two ranks: the state in terminal green, the subject in white.
       The caret is the whole of the terminal reference — a full prompt string
       would be a costume, and the band it comes from does not wear one. */
    return (
      <h3
        className={`mt-2.5 flex items-center gap-2 font-bold uppercase leading-[1.15] tracking-tight ${LOCKUP_SIZES[size]}`}
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        <span style={{ color: brand.accent }}>Access</span>
        <span className="text-white">Granted</span>
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1.05em] w-[0.5em] motion-safe:animate-pulse"
          style={{ backgroundColor: brand.accent }}
        />
      </h3>
    )
  }

  /* PySA's wordmark is drawn art, not lettering, so it is the asset rather
     than a reconstruction. The light version: this card's ground is black. */
  return (
    <div className={`relative ${PYSA_SIZES[size]}`}>
      <Image
        src="/pysa/wordmark.svg"
        alt="PySanAntonio"
        fill
        unoptimized
        sizes={size === "panel" ? "460px" : "240px"}
        className="object-contain object-left"
      />
    </div>
  )
}
