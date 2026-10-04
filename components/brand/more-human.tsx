/**
 * More Human Than Human's wordmark.
 *
 * Ported, not drawn. The conference set its own name as a two-line stack —
 * `font-black uppercase tracking-tight leading-[0.9]`, "MORE HUMAN" in a near
 * white and "THAN HUMAN" in the amber — and that treatment is still in the
 * repo, in components/aiconference/more-human-than-human.tsx, which is the page
 * the conference actually ran on. Inventing a mark for a conference that
 * already had one would have replaced its history with my taste.
 *
 * The amber is the same #ff9900 the card record already carried as its accent,
 * so the lettering and the card's link color are one value rather than two
 * that happen to match today.
 *
 * ## Why this is not in EVENT_BRANDS
 *
 * That registry drives the lockups the community calendar renders on event
 * cards, and there is no scheduled edition of this conference for it to render
 * yet. When a date exists, the lockup moves there. Until then the portfolio can
 * show the lettering without the calendar advertising a card it has no event
 * for — see the note where the record is defined in data/conferences.ts.
 *
 * ## Why it is set, not an asset
 *
 * The other direction was open: screenshot the hero and ship a PNG, the way
 * PySanAntonio's wordmark has to be because Amador is Adobe-Fonts-only. There
 * is no such constraint here. The hero is the site's own sans at `font-black`,
 * which is a face this site already loads, so setting it live keeps it sharp at
 * any size, recolourable, and selectable as text.
 */
/**
 * Two sizes, as a named variant rather than a className the caller hopes will
 * win. Tailwind emits utilities in its own order, so a `text-5xl` passed in
 * from a masthead does not reliably beat a `text-xl` baked in here — whichever
 * the stylesheet happens to print last wins, which is not something a caller
 * should have to know.
 */
const SIZES = {
  card: "text-xl sm:text-2xl",
  /** Matches LOCKUP_SIZES.panel in event-brand-lockup — the homepage tiles,
      where a mark is alone in its box rather than labelling a stack. */
  panel: "text-3xl sm:text-4xl lg:text-5xl",
  hero: "text-4xl sm:text-5xl lg:text-6xl",
} as const

export function MoreHumanWordmark({
  size = "card",
  as: Tag = "h3",
  className = "",
}: {
  size?: keyof typeof SIZES
  /** `h1` on the conference's own page, `h3` in the portfolio grid. */
  as?: "h1" | "h2" | "h3"
  className?: string
}) {
  return (
    <Tag
      className={`font-sans font-black uppercase leading-[0.9] tracking-tight ${SIZES[size]} ${className}`}
    >
      {/* Two blocks, not a line break inside one: the stack is the mark. A
          wrap would put "MORE HUMAN THAN" on the first line at some width and
          the lockup would stop being the lockup. */}
      <span className="block text-[#e5e5e5]">More Human</span>
      <span className="mt-0.5 block text-[#ff9900]">Than Human</span>
    </Tag>
  )
}
