/**
 * The three Startup + Tech Week activations DEVSA convenes, each of which
 * arrives with a design system rather than a colour.
 *
 * Values are taken from next-sasw — lib/the-model.ts, lib/access-granted.ts
 * and lib/pysa.ts — so the same activation cannot read one way on sasw.co and
 * another here. Where those files disagree with what looks right on a white
 * calendar the note says so; nothing is changed silently.
 *
 * Keyed by name and set per event. An earlier pass drove this off `isOfficial`
 * plus a colour picker, which meant marking any event official dressed it in
 * The Model's wordmark — an AWS pentesting session included. "DEVSA convened
 * this" and "this is The Model" are different claims and need different fields.
 *
 * A brand is deliberately not a Firestore record. These are three fixed
 * identities with bespoke lockups, not content an organiser edits, and the
 * lockups are markup rather than data.
 */

export type EventBrandKey = "the-model" | "access-granted" | "pysanantonio"

export interface EventBrand {
  key: EventBrandKey
  /** Shown in the admin's brand picker. */
  label: string
  /** The one colour the brand carries. */
  accent: string
  /** Type set *on* the accent — knocked out, so it has to be the dark value. */
  onAccent: string
  /**
   * All three sit on site black in next-sasw rather than on an ink of their
   * own. PySA tried a second near-black there and it read as drift rather than
   * as palette; Access Granted made the same call for the same reason. Kept
   * here so a run of three branded cards reads as one week.
   */
  surface: string
  /**
   * A hairline schematic field, for the one brand whose artwork expects to sit
   * in a space rather than on one. Access Granted only.
   */
  grid?: { line: string; fade: string }
}

export const EVENT_BRANDS: Record<EventBrandKey, EventBrand> = {
  "the-model": {
    key: "the-model",
    label: "The Model",
    // 19.5% of the artwork — its ground note, per lib/the-model.ts.
    accent: "#C0B4FC",
    onAccent: "#09090B",
    surface: "#09090B",
  },
  "access-granted": {
    key: "access-granted",
    label: "Access Granted",
    /* Terminal green, and deliberately not SASTW's magenta. The padlock render
       glows around #98f8b0; this is that hue at full saturation, which is what
       small type and 1px borders need — the glow itself is too pale to sit on
       black as type. */
    accent: "#00ff66",
    onAccent: "#04160B",
    surface: "#0a0a0a",
    grid: {
      line: "rgba(255,255,255,0.055)",
      // An ellipse rather than a tile: to the edges the grid stops being a hint
      // and becomes wallpaper.
      fade: "radial-gradient(ellipse 70% 80% at 78% 50%, black 0%, black 25%, transparent 78%)",
    },
  },
  pysanantonio: {
    key: "pysanantonio",
    label: "PySanAntonio",
    // PySA's blue — again, deliberately not SASTW's magenta.
    accent: "#4a90d9",
    onAccent: "#04101B",
    surface: "#0a0a0a",
  },
}

export const EVENT_BRAND_KEYS = Object.keys(EVENT_BRANDS) as EventBrandKey[]

/** Null for the great majority of events, which have no brand of their own. */
export function getEventBrand(brand?: string | null): EventBrand | null {
  if (!brand) return null
  return EVENT_BRANDS[brand as EventBrandKey] ?? null
}
