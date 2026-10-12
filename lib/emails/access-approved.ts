import {
  emailShell,
  eyebrow,
  heading,
  paragraph,
  panel,
  list,
  button,
  strong,
  esc,
  firstNameOf,
  SITE,
} from "./layout"

interface AccessApprovedEmailProps {
  name?: string
  email: string
  communityOrg?: string
}

/**
 * Sent when an admin approves an organizer's access request.
 *
 * The steps match how the admin actually signs in since 2026-10-12: Google, or
 * a sign-in link emailed to this address. The old version said to "enter your
 * email" on the admin page, which stopped being enough when sign-in started
 * proving who you are.
 */
export function AccessApprovedEmail({ name, email, communityOrg }: AccessApprovedEmailProps): string {
  return emailShell({
    title: "Your DEVSA organizer access is approved",
    preheader: "Sign in to put your group's events on the community calendar.",
    body: `
      ${eyebrow("Access approved")}
      ${heading(`You&rsquo;re approved, ${firstNameOf(name)}.`)}
      ${paragraph(
        `You can now add ${communityOrg ? `${strong(esc(communityOrg))}&rsquo;s` : "your group&rsquo;s"} events to the DEVSA community calendar and keep its page on Building Together current.`
      )}
      ${panel(
        list([
          `Go to ${strong("devsa.community/admin")}`,
          `Sign in with Google, or ask for a sign-in link, using ${strong(esc(email))}. It has to be this address.`,
          `Open ${strong("Events")} and choose ${strong("Create Event")}`,
        ]),
        { label: "Getting started" }
      )}
      ${panel(
        list([
          "A clear title, and a description that says who it&rsquo;s for",
          "The venue address, or the link if it&rsquo;s online",
          "Your RSVP or registration link, if you use one",
        ]),
        { label: "A good listing has" }
      )}
      ${button(`${SITE}/admin`, "Go to the admin")}
    `,
  })
}
