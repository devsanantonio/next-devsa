import {
  emailShell,
  eyebrow,
  heading,
  paragraph,
  panel,
  rows,
  button,
  strong,
  esc,
  firstNameOf,
  EIN,
  SITE,
  C,
} from "./layout"

interface DonationThankYouEmailProps {
  name: string
  /** Dollars, already formatted: "25.00". */
  amount: string
  /** When Stripe completed the payment. */
  date: Date
  /**
   * Set when the gift was designated to a campaign (lib/campaigns.ts). The
   * webhook resolves the key; this template only shows what it is given.
   */
  campaign?: { name: string; href: string; ifUnfunded: string }
}

/**
 * The donor's thank-you, and the written acknowledgment they keep.
 *
 * It carries what the IRS asks of an acknowledgment for a gift of $250 or
 * more: the organization's name, the amount, the date, and a statement that
 * no goods or services were given in return. Every gift gets it, whatever the
 * size, so nobody has to ask for a receipt.
 *
 * A gift designated to a campaign says so, and repeats the board-approved
 * promise about what happens to it if the event is not funded — the donor
 * read that promise on the page, and the email is the copy they keep.
 *
 * The copy follows the site's donation section: a gift keeps the community
 * calendar and the directory open. It does not promise workshops or a group
 * count the site does not state.
 */
export function DonationThankYouEmail({ name, amount, date, campaign }: DonationThankYouEmailProps): string {
  const first = firstNameOf(name)
  const when = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  })

  const intro = campaign
    ? paragraph(
        `Your gift to ${strong(esc(campaign.name))} has arrived. It is set aside for ${esc(campaign.name)} and will be spent on it, not on anything else.`
      )
    : paragraph(
        `Your gift to DEVSA has arrived. It keeps the ${strong("community calendar")} and the ${strong("public directory")} open: the place San Antonio&rsquo;s builders, community groups and partners find each other.`
      )

  const promise = campaign
    ? panel(paragraph(esc(campaign.ifUnfunded), { last: true }), {
        label: "If it doesn't happen",
        accent: C.pink,
      })
    : ""

  const receipt = panel(
    `${rows([
      ["Amount", `$${esc(amount)}`],
      ["Date", when],
      ["Designated to", campaign ? esc(campaign.name) : "General support"],
      ["Received by", `DEVSA, EIN ${EIN}`],
    ])}
    <p style="margin: 16px 0 0 0; font-size: 13px; color: ${C.body}; line-height: 1.6;">
      DEVSA is a 501(c)(3) nonprofit. No goods or services were provided in exchange for this gift. Keep this email as your receipt.
    </p>`,
    { label: "Your receipt" }
  )

  const cta = campaign
    ? button(`${SITE}${campaign.href}`, `Read about ${esc(campaign.name)}`)
    : button(`${SITE}/events`, "See what&rsquo;s on the calendar")

  return emailShell({
    title: "Thank you for your gift to DEVSA",
    preheader: campaign
      ? `Your $${esc(amount)} gift to ${esc(campaign.name)}, and your receipt.`
      : `Your $${esc(amount)} gift to DEVSA, and your receipt.`,
    body: `
      ${eyebrow("Gift received")}
      ${heading(`Thank you, ${first}.`)}
      ${intro}
      ${promise}
      ${receipt}
      ${paragraph("Questions about your gift? Reply to this email.")}
      ${cta}
    `,
  })
}

export function getDonationThankYouSubject(campaignName?: string): string {
  return campaignName
    ? `Thank you for your gift to ${campaignName} | DEVSA`
    : "Thank you for your gift to DEVSA"
}
