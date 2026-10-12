import { emailShell, eyebrow, heading, paragraph, panel, rows, list, button, strong, esc, firstNameOf, SITE } from "./layout"

interface AccessRequestReceivedEmailProps {
  name: string
  communityOrg: string
}

/**
 * Confirmation for an organizer access request from /signin. Says what was
 * asked for, what access gives, and what happens next.
 */
export function AccessRequestReceivedEmail({ name, communityOrg }: AccessRequestReceivedEmailProps): string {
  return emailShell({
    title: "Your organizer access request",
    preheader: `We have your request for ${esc(communityOrg)}. An admin will review it.`,
    body: `
      ${eyebrow("Request received")}
      ${heading(`Thanks, ${firstNameOf(name)}. We have your request.`)}
      ${paragraph(
        `Organizer access lets your group use DEVSA directly: ${strong("one calendar, one directory, one audience")} shared by San Antonio&rsquo;s builders, organizers and partners.`
      )}
      ${panel(rows([["Name", esc(name)], ["Group", esc(communityOrg)]]), { label: "Your request" })}
      ${panel(
        list([
          "Publish your events to the community calendar, the shared feed the city reads, embeds and subscribes to",
          "Keep your group&rsquo;s page on Building Together current: logo, description and links",
          "See RSVPs for your events as they come in, and export them",
          "Collect talk submissions when your group hosts a conference",
        ]),
        { label: "What organizer access gets you" }
      )}
      ${panel(
        list([
          "A DEVSA admin reviews the request, usually within a couple of days",
          "You&rsquo;ll get an email at this address either way",
          "Once approved, sign in at devsa.community/admin with this address",
        ]),
        { label: "What happens next" }
      )}
      ${button(`${SITE}/events`, "See what&rsquo;s on the calendar")}
    `,
  })
}

export function getAccessRequestReceivedSubject(communityOrg: string): string {
  return `Organizer access request received for ${communityOrg} | DEVSA`
}
