import { listCommunities } from "@/lib/communities"
import { listPartners } from "@/lib/partners"

const SITE = "https://www.devsa.community"

/**
 * /llms.txt and /llms-full.txt: what AI assistants read when someone asks
 * them what DEVSA is. Increasingly that is how a funder, a parent or a city
 * office looks an organization up, so these say what the site says.
 *
 * They were static files in public/, and they drifted the way every hand-kept
 * copy in this repo has: "Founded in 2020" (DEVSA started in 2023 and was
 * incorporated in 2024), a free coworking space (closed September 2026), a
 * merch shop (removed), "20+" groups, a DEVSA TV page that no longer exists,
 * the retired "bridges the gap" line, and a claim to serve the Rio Grande
 * Valley, where DEVSA has no partnership. They are built from the directory
 * now, so the groups and partners are whatever the admin holds.
 *
 * Geography is stated narrowly on purpose: San Antonio, connected across the
 * Austin–San Antonio corridor through partners that really are statewide
 * (PyTexas Foundation, Texas Linux Fest). Assistants repeat what they are
 * told; nothing here should claim a place DEVSA does not work in.
 */
export async function buildLlmsText({ full }: { full: boolean }): Promise<string> {
  const [communities, partners] = await Promise.all([listCommunities(), listPartners()])
  const groupCount = communities.length

  const sections: string[] = []

  sections.push(`# DEVSA

> DEVSA is civic infrastructure for San Antonio's tech community: the shared calendar, the public directory and the rooms where its builders find each other. It is a 501(c)(3) nonprofit (EIN 99-2066455) governed by a volunteer board, based in San Antonio, Texas.`)

  sections.push(`## The problem it addresses

San Antonio is one of the largest cities in the country, and it has never lacked people who build things. What it lacks is anything that connects them. ${groupCount || "Its"} tech groups run their own meetups, on their own calendars, for their own audiences, and most of them can't see each other. A student finishing a program, a developer new to the city, an engineer deciding whether to stay: none of them has one place to find the people doing the work they want to do. People stay where they've found their people, and a city that can't show its builders to each other has a harder time keeping them.`)

  sections.push(`## What DEVSA runs

- **The community calendar** (${SITE}/events): every tech meetup, workshop and conference in San Antonio in one place. Anyone can subscribe in Google, Apple or Outlook Calendar, follow the RSS/JSON feed, or embed it on their own site.
- **The public directory** (${SITE}/buildingtogether): ${groupCount || "the city's"} community groups and ${partners.length || "the"} partners, each with its own page.
- **Conferences built with the groups**: The Model, Access Granted (a security track), PySanAntonio (with Alamo Python and the PyTexas Foundation) and More Human Than Human (AI). In fall 2026 DEVSA ran sessions through ten groups for SA Startup + Tech Week.
- **Partner pop-ups**: SheBuilds with Lovable, and Zero to Agent with Vercel.

The community groups run themselves. DEVSA does not own them; it gives them the calendar, the directory and the room.`)

  sections.push(`## Who it is for

- **Builders and career changers**: find the groups and events in your field.
- **Students and parents**: student groups such as ACM UTSA and UTSA CyberJedis are in the directory, alongside youth and workforce programs among DEVSA's partners.
- **Community organizers**: publish events to the calendar and run a page in the directory (organizer access: ${SITE}/signin).
- **Employers, partners and sponsors**: reach the engineers, analysts, designers and students doing the work, not only the executives.
- **Funders and the public sector**: DEVSA is civic infrastructure for the city's tech talent, shared and public.`)

  sections.push(`## How to get involved

- Partner with DEVSA or ask a question: ${SITE}/buildingtogether#get-involved
- Donate (a 501(c)(3); donors receive an emailed receipt): ${SITE}/buildingtogether#donate
- Subscribe to the calendar: ${SITE}/events
- Join the Discord: https://discord.gg/cvHHzThrEw`)

  sections.push(`## Facts

- Started as a Discord server in September 2023; incorporated as a 501(c)(3) in March 2024.
- Board: Jesse Hernandez (Founder & Executive Director), Zaquariah Holland (Community Director), Ileana Gonzalez (Board Member).
- Based in San Antonio, Texas, and connected across the Austin–San Antonio corridor through statewide partners such as the PyTexas Foundation and Texas Linux Fest.
- Code of conduct, adopted by the board October 12, 2026: ${SITE}/code-of-conduct
- IRS record: verify DEVSA's status in the IRS Tax Exempt Organization Search (EIN 99-2066455). Story and board: ${SITE}/about
- DEVSA no longer runs a coworking space (its room at Geekdom closed September 19, 2026) or a merch shop.`)

  if (full) {
    if (communities.length) {
      sections.push(`## Community groups (${communities.length})

${communities.map((c) => `- [${c.name}](${SITE}/buildingtogether/${c.id})`).join("\n")}`)
    }
    if (partners.length) {
      sections.push(`## Partners (${partners.length})

${partners.map((p) => `- [${p.name}](${SITE}/buildingtogether/${p.id})${p.website ? `: ${p.website}` : ""}`).join("\n")}`)
    }
    sections.push(`## Data anyone can use

- Calendar subscription (iCal): ${SITE}/api/events/calendar
- Event feed: ${SITE}/api/events/feed (field reference: ${SITE}/api/events/feed/schema)
- Embeddable calendar: ${SITE}/events/embed`)
  } else {
    sections.push(`## Key pages

- [Community calendar](${SITE}/events)
- [Groups and partners](${SITE}/buildingtogether)
- [About, the board and the record](${SITE}/about)
- [Code of conduct](${SITE}/code-of-conduct)

The full version, with every group and partner: ${SITE}/llms-full.txt`)
  }

  return sections.join("\n\n") + "\n"
}
