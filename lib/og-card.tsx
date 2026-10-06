// One layout for every Open Graph card.
//
// Before this, each route in app/api/og/ hand-rolled its own structure, and the
// set had drifted the way anything drifts when consistency is maintained by
// copy-paste: badge pills on some and not others, stat rows nobody reads at
// feed size, and dates that go stale the day after an event.
//
// The first attempt at fixing that went too far the other way — white ground,
// 44px logo, three quiet lines — and read as a brochure for a consultancy. A
// share card is the only piece of DEVSA most people ever see, so it has to look
// like the thing it is advertising.
//
// So: the dark ground the site runs on, the mark at 110px as an actual element
// rather than a corner stamp, and one accent. Nothing else. The logo is already
// a terminal window with teal/pink/orange in it — repeating those bars beside
// it, as an earlier draft did, just read as a hamburger menu.
//
// Keep this JSX-only and flexbox-only. Satori applies no CSS defaults, so every
// element needs an explicit `display` — a <div> with children and no
// `display: "flex"` renders nothing at all.

import { DevsaLogoMark, LOGO_COLORS } from "@/lib/og-brand"

export type OgCardTheme = {
  bg: string
  /** First title line, and the logo's window body. */
  ink: string
  /** Second title line — the one piece of color the layout spends. */
  accent: string
  muted: string
  footMuted: string
  /** The logo's window body. Sits just above `bg` so the mark reads as a panel. */
  logoBody: string
}

/** DEVSA's own pages. Geist, pink accent. */
export const DEVSA: OgCardTheme = {
  bg: "#0a0a0a",
  ink: "#ffffff",
  accent: LOGO_COLORS.pink,
  muted: "#a1a1aa",
  footMuted: "#71717a",
  logoBody: "#151515",
}

export function OgCard({
  title,
  hook,
  theme = DEVSA,
  wordmark,
  footer,
  /**
   * Conferences only. Oswald uppercase is the display face the Startup + Tech
   * Week activations use and what Access Granted's wordmark is specified in;
   * DEVSA's own pages stay in Geist so they read as the site, not as an event.
   */
  display = false,
  meta,
}: {
  title: string[]
  hook: string
  theme?: OgCardTheme
  wordmark?: React.ReactNode
  footer: string
  display?: boolean
  /**
   * Events only: when and where, given their own row instead of being folded
   * into the hook. On a card someone shares to get people to turn up, the date
   * and the room are the message — as a clause in a grey sentence they read as
   * incidental.
   */
  meta?: { when?: string; where?: string }
}) {
  // Page titles are written to fit; event titles come out of the admin and run
  // long, so the headline steps down rather than wrapping into the meta row.
  const longest = Math.max(0, ...title.map((t) => t.length))
  const titleSize = longest <= 26 ? 72 : longest <= 44 ? 58 : longest <= 68 ? 46 : 38

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.bg,
        fontFamily: "Geist Sans",
        padding: "56px 64px",
      }}
    >
      <div style={{ display: "flex" }}>
        <DevsaLogoMark size={110} bodyColor={theme.logoBody} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {wordmark ?? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {title.map((line, i) => (
              <span
                key={line}
                style={{
                  fontFamily: display ? "Oswald" : "Geist Sans",
                  fontSize: display ? 92 : titleSize,
                  fontWeight: 700,
                  textTransform: display ? "uppercase" : "none",
                  color: i === 0 ? theme.ink : theme.accent,
                  lineHeight: display ? 1.0 : 1.1,
                  letterSpacing: display ? "0.01em" : "-0.03em",
                }}
              >
                {line}
              </span>
            ))}
          </div>
        )}

        {meta && (meta.when || meta.where) ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 28 }}>
            {meta.when ? (
              <span style={{ fontSize: 32, fontWeight: 700, color: theme.accent, letterSpacing: "-0.01em" }}>
                {meta.when}
              </span>
            ) : null}
            {meta.where ? (
              <span style={{ fontSize: 26, fontWeight: 500, color: theme.ink }}>
                {meta.where}
              </span>
            ) : null}
          </div>
        ) : null}

        <p
          style={{
            fontSize: 26,
            color: theme.muted,
            margin: 0,
            marginTop: meta ? 20 : 26,
            maxWidth: 920,
            lineHeight: 1.45,
            fontWeight: 400,
          }}
        >
          {hook}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span style={{ color: theme.footMuted, fontSize: 17, fontWeight: 500 }}>
          {footer}
        </span>
        <span style={{ color: theme.footMuted, fontSize: 17, fontWeight: 400 }}>
          devsa.community
        </span>
      </div>
    </div>
  )
}
