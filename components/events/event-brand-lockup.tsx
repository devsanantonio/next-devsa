import Image from "next/image"
import type { EventBrand } from "@/lib/event-brands"

/**
 * Each activation's title, set the way its own site sets it.
 *
 * Three lockups rather than one themed heading, because what distinguishes
 * these brands is a gesture and not a colour — recolouring a shared heading
 * three ways would produce three cards that look like the same card. Ported
 * from next-sasw's ModelBand, AccessGrantedBand and PysaBand.
 *
 * The event's own title is ignored for the two lettering marks. These are
 * fixed identities and the title in Firestore is editable prose; if an
 * organiser renames the record, the lockup should not follow it into
 * something that is no longer the brand.
 */
export function EventBrandLockup({ brand }: { brand: EventBrand }) {
  if (brand.key === "the-model") {
    /* A half-finished selection: "The" plain, "Model" caught in a block with
       its ink knocked out. The artwork's single gesture, and the reason the
       face is mono — the poster is set in a plain monospace, and a display
       face beside it is a second voice. */
    return (
      <h3
        className="mt-2.5 text-xl font-medium uppercase leading-[1.15] tracking-tight text-white sm:text-2xl"
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
        className="mt-2.5 flex items-center gap-2 text-xl font-bold uppercase leading-[1.15] tracking-tight sm:text-2xl"
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
    <div className="mt-3 mb-1 relative h-8 w-[210px] sm:h-9 sm:w-[240px]">
      <Image
        src="/pysa/wordmark.svg"
        alt="PySanAntonio"
        fill
        unoptimized
        sizes="240px"
        className="object-contain object-left"
      />
    </div>
  )
}
