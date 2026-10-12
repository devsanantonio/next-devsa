/**
 * Who to tell, and whether the code of conduct is in force.
 *
 * Both are deliberately empty until Jesse supplies them and the board adopts
 * the text. While `ADOPTED_ON` is null, /code-of-conduct renders as a draft:
 * a banner saying so, the reporting section showing what is missing, and
 * robots noindex. Nothing on the site links to it yet.
 *
 * The reporting inbox must be one that reliably receives mail.
 * jesse@devsanantonio.com is a Porkbun forwarding address and, on 2026-10-11,
 * did not deliver Firebase's sign-in emails; a report of harassment cannot be
 * allowed to vanish the same way.
 *
 * At least two named people, so someone can report a problem involving any one
 * of them.
 */
// Interim, chosen by Jesse 2026-10-12. Known risk: this is a Porkbun
// forwarding address, and Firebase's sign-in emails to it did not arrive. A
// dedicated inbox on a real mailbox (e.g. conduct@devsa.community on the
// Google Workspace) should replace it before anything depends on it.
export const CONDUCT_REPORT_EMAIL: string | null = "jesse@devsanantonio.com"

// DEVSA board members, names and titles as in data/board.ts.
export const CONDUCT_CONTACTS: { name: string; role: string; phone?: string }[] = [
  { name: "Jesse Hernandez", role: "Founder & Executive Director" },
  { name: "Zaquariah Holland", role: "Community Director" },
]

/**
 * The date the DEVSA board adopted this code, e.g. "November 4, 2026".
 * The real date of the board's vote — never backdated. Until it is set, the
 * page stays a noindexed draft.
 */
export const ADOPTED_ON: string | null = "October 12, 2026"

export const CONDUCT_IS_DRAFT = ADOPTED_ON === null || CONDUCT_REPORT_EMAIL === null || CONDUCT_CONTACTS.length < 2
