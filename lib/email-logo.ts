import { SITE } from "@/lib/emails/layout"

/**
 * A community group's logo, as a URL an email client will actually show.
 *
 * Mail clients render PNG, JPEG and GIF. Gmail and Outlook drop SVG, and Outlook
 * drops WebP, so those go through /api/email-logo/<id>, which rasterizes them to
 * PNG. So do the marks drawn in black, which vanish on the emails' near-black
 * card: the route draws them as a white silhouette, as the site's community
 * network does (NODE_LOGO in components/community-network.tsx).
 */
export const EMAIL_WHITE_MARKS = ["alamo-city-unity-user-group", "alamo-agents"]

/** Marks used in place of the uploaded logo, as the network does: AITX's wordmark is dark grey, its orange mark reads. */
export const EMAIL_LOGO_OVERRIDE: Record<string, string> = { aitx: "/community-logos/aitx-mark.png" }

export function emailLogoUrl(group: { id: string; logo?: string | null }): string | null {
  if (!group.logo) return null
  const direct = /^https:\/\/[^\s]+\.(png|jpe?g|gif)(\?.*)?$/i.test(group.logo)
  if (direct && !EMAIL_WHITE_MARKS.includes(group.id) && !EMAIL_LOGO_OVERRIDE[group.id]) return group.logo
  return `${SITE}/api/email-logo/${encodeURIComponent(group.id)}`
}
