import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"
import { DevsaLogoMark } from "@/lib/og-brand"
import { getEventBySlug, eventWhen, eventHosts } from "@/lib/og-event"

export const runtime = "nodejs"

/**
 * The share card for one calendar event (1200x630, the link preview). The
 * data comes from lib/og-event, shared with the 1080x1350 social graphic.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [event, fonts] = await Promise.all([getEventBySlug(slug), loadBrandFonts()])

  // Not a published event (see getEventBySlug): the calendar's own card, not
  // one built from whatever words the URL spells.
  if (!event.found) {
    return new ImageResponse(
      (
        <OgCard
          title={["Every group.", "One calendar."]}
          hook="San Antonio's tech community events, in one place."
          url="devsa.community/events"
        />
      ),
      { width: 1200, height: 630, fonts }
    )
  }
  const when = eventWhen(event)

  /*
   * The hosts lead, not DEVSA.
   *
   * Groups sharing their own event from the calendar told us the card read as
   * a DEVSA event: the DEVSA mark sat in the top-left where a brand goes, and
   * the hosts were a grey line under the date. Now the hosts' logos and names
   * take that corner, and DEVSA is only the address in the footer,
   * devsa.community/events: the calendar the event is listed on, which is all
   * DEVSA is to it. DEVSA's own events (isOfficial) and events with no host on
   * record keep the mark.
   */
  const { shown, logos, names } = await eventHosts(event)

  const header = shown.length ? (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {shown.map((h, i) =>
        logos[i] ? (
          <div
            key={h.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 112,
              height: 112,
              borderRadius: 22,
              padding: 14,
              // Always dark: no white boxes on a dark card. See hostLogo.
              backgroundColor: "#1c1c1c",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logos[i]!} alt="" style={{ maxWidth: 84, maxHeight: 84, objectFit: "contain" }} />
          </div>
        ) : null
      )}
      <div style={{ display: "flex", flexDirection: "column", marginLeft: logos.some(Boolean) ? 4 : 0 }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: "#a3a3a3", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Hosted by
        </span>
        <span style={{ fontSize: names.length > 48 ? 26 : 32, fontWeight: 700, color: "#ffffff", maxWidth: 760, lineHeight: 1.2 }}>
          {names}
        </span>
      </div>
    </div>
  ) : undefined

  return new ImageResponse(
    (
      <OgCard
        header={header}
        title={[event.title]}
        // An official event co-hosted with groups still credits them.
        hook={event.official && event.hosts.length ? `With ${event.hosts.map((h) => h.name).join(" + ")}` : undefined}
        meta={{ when: when || "Date to be announced", where: event.location || "San Antonio, TX" }}
        // The alt mark (monochrome) alone, bottom-left, where a credit sits,
        // so it reads as a quiet sign-off rather than competing with the
        // hosts' colour above. The calendar the
        // event is listed on. No wording beside it (the logo rules keep the
        // word DEVSA off any piece with the mark). Cards DEVSA leads already
        // carry the mark at the top, so they do not repeat it here.
        footer={shown.length ? <DevsaLogoMark size={34} alt /> : undefined}
        url="devsa.community/events"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
