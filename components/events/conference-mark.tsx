import type { Conference } from "@/data/conferences"
import { getEventBrand } from "@/lib/event-brands"
import {
  EventBrandLockup,
  type LockupSize,
} from "@/components/events/event-brand-lockup"
import { MoreHumanWordmark } from "@/components/brand/more-human"

/**
 * One conference's lettering, whichever registry it comes from.
 *
 * Three of the four are in EVENT_BRANDS, which the community calendar also
 * draws from, so their lockups arrive through EventBrandLockup. More Human Than
 * Human is not in that registry — it has no scheduled edition for the calendar
 * to render a card for — so its wordmark lives in components/brand and is
 * reached directly. See the note on its record in data/conferences.ts.
 *
 * That two-source branch existed inside ConferencePortfolio and is here now
 * because the homepage shows the same four marks. Two copies of "which registry
 * is this brand in" is exactly the kind of thing that drifts: add a fifth
 * conference, register it in one place, and one surface renders its name as
 * plain text while the other renders its lockup.
 *
 * The caller owns the sizing. These marks appear in a tight four-up grid on
 * /events and a looser one on the homepage, and the scale belongs to whichever
 * grid is doing the squeezing rather than to the mark.
 */
export function ConferenceMark({
  conference,
  className = "",
  size = "card",
}: {
  conference: Conference
  className?: string
  /** `card` on /events, where the mark labels a stack of copy; `panel` on the
      homepage, where it is alone in its tile. */
  size?: LockupSize
}) {
  const brand = getEventBrand(conference.brand)

  if (brand) {
    return (
      <div className={className}>
        <EventBrandLockup brand={brand} size={size} />
      </div>
    )
  }

  if (conference.key === "more-human-than-human") {
    return <MoreHumanWordmark size={size} className={className} />
  }

  /* A conference with neither a registered brand nor its own lettering. None
     today — this is what a fifth one renders as until somebody draws it. */
  return (
    <h3
      className={`text-xl font-black tracking-[-0.02em] text-white ${className}`}
    >
      {conference.name}
    </h3>
  )
}
