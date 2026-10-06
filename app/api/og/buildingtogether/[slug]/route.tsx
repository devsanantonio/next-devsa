import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { getDb, COLLECTIONS } from "@/lib/firebase-admin"
import { getPartner } from "@/lib/partners"
import { loadBrandFonts } from "@/lib/og-fonts"
import { OgCard } from "@/lib/og-card"

export const runtime = "nodejs"

/**
 * The per-record card for a community group or a partner.
 *
 * It used to be two 340-line hand-rolled layouts on a white ground, each with
 * its own badge pill and header rule — so a shared group link looked nothing
 * like a shared page link from the same site. Both branches now go through the
 * shared card, which is the whole point of having one.
 *
 * A record's own description is the hook when it has one. Those are written by
 * the groups themselves in the admin, so they are trimmed rather than trusted
 * to be short: an unbounded string would push the footer off the card.
 *
 * Both misses fall through to a generic DEVSA card rather than a 500. A broken
 * share image is worse than a plain one, and these slugs come straight off a
 * URL anyone can type.
 */
const trim = (s: string | undefined, max = 155) => {
  const clean = (s || "").replace(/\s+/g, " ").trim()
  if (!clean) return ""
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const fonts = await loadBrandFonts()

  let community: { name: string; description?: string } | null = null
  try {
    const db = getDb()
    const doc = await db.collection(COLLECTIONS.COMMUNITIES).doc(slug).get()
    if (doc.exists) {
      const data = doc.data()
      community = { name: data?.name, description: data?.description }
    }
  } catch {}

  if (community?.name) {
    return new ImageResponse(
      (
        <OgCard
          title={[community.name]}
          hook={
            trim(community.description) ||
            "A San Antonio tech community group, running its own events and publishing them to the city's shared calendar."
          }
          footer="A community group on the DEVSA calendar"
        />
      ),
      { width: 1200, height: 630, fonts }
    )
  }

  const partner = await getPartner(slug)
  if (partner?.name) {
    return new ImageResponse(
      (
        <OgCard
          title={[partner.name]}
          hook={
            trim(partner.description) ||
            "A partner backing San Antonio's tech community — the rooms, the sponsorship and the people that make the events happen."
          }
          footer="A DEVSA partner"
        />
      ),
      { width: 1200, height: 630, fonts }
    )
  }

  return new ImageResponse(
    (
      <OgCard
        title={["Building", "together."]}
        hook="San Antonio's tech groups run themselves. DEVSA brings the room, the audience and the partners."
        footer="Partners & communities"
      />
    ),
    { width: 1200, height: 630, fonts }
  )
}
