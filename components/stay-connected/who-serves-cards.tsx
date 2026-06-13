"use client"

/** The three audience lanes from the home page, condensed for the spotlight. */
const LANES = [
  {
    eyebrow: "For Builders",
    headline: "Find Your Community.",
    body: "Meetups, conferences, and workshops happening every week across San Antonio's tech community.",
    accent: "#4d8eff",
  },
  {
    eyebrow: "For Organizers",
    headline: "Grow Your Group.",
    body: "Get organizer access — list your group on Building Together and add events to the community calendar.",
    accent: "#fbbf24",
  },
  {
    eyebrow: "For Partners",
    headline: "Reach the Ecosystem.",
    body: "One relationship, 20+ communities, every conference, and the citywide job board — one 501(c)(3) bridge.",
    accent: "#ef426f",
  },
]

export function WhoServesCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {LANES.map((l) => (
        <div
          key={l.eyebrow}
          className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: l.accent }}
          >
            {l.eyebrow}
          </p>
          <h3 className="text-base font-bold text-white">{l.headline}</h3>
          <p className="text-xs leading-relaxed text-white/55">{l.body}</p>
        </div>
      ))}
    </div>
  )
}
