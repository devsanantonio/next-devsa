/**
 * Fundraising campaigns a gift can be designated to.
 *
 * A campaign page that sends people to the general donation form takes money
 * the donor believes is for the campaign and records it as unrestricted. The
 * board could then spend it on anything, which is not what the donor was told.
 * So a gift made from a campaign carries the campaign's key all the way to
 * Stripe — in the Checkout session's metadata, and in the product name the
 * donor sees on the payment page and the receipt.
 *
 * The key arrives from the client (a `?campaign=` link), so the server only
 * honors keys listed here. Anything else is a general gift.
 *
 * A designated gift is restricted money: it has to be spent on the campaign.
 * Retiring a campaign means removing it here so new gifts stop being tagged —
 * it does not release what was already given to it.
 */
interface Campaign {
  name: string
  /** Shown beside the donation form in place of the general pitch. */
  summary: string
  /** Where the campaign is explained. */
  href: string
  /**
   * What happens to a designated gift if the campaign does not go ahead.
   * Required: a campaign that may not happen cannot take restricted money
   * without saying where it goes if it does not.
   */
  ifUnfunded: string
  /**
   * Optional, and shown wherever it is set. Left unset until the number can
   * be defended — a published goal that later has to move is worse than none.
   */
  goal?: { amount: string; covers: string }
}

/*
 * Empty for now. Confluencia was the first campaign, until 434 MEDIA took on
 * activating it with DEVSA as a partner (2026-10-13). DEVSA still plans an
 * event on its own stage; when it has a name, it goes here, with an
 * ifUnfunded rule approved by the board, and gifts can be designated to it.
 *
 * With nothing listed, every `?campaign=` link resolves to a general gift.
 */
// Typed as a record rather than `satisfies` a literal: an empty literal makes
// every key `never`. toCampaignKey still admits only keys present here.
export const CAMPAIGNS: Record<string, Campaign> = {}

export type CampaignKey = keyof typeof CAMPAIGNS

export function getCampaign(key: CampaignKey): Campaign {
  return CAMPAIGNS[key]
}

export function toCampaignKey(value: unknown): CampaignKey | undefined {
  return typeof value === "string" && Object.hasOwn(CAMPAIGNS, value)
    ? (value as CampaignKey)
    : undefined
}
