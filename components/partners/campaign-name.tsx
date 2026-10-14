import { getCampaign, type CampaignKey } from "@/lib/campaigns"

/**
 * A campaign's name as a visitor should see it. Plain text today. A campaign
 * with a wordmark of its own draws it here, so the name looks the same
 * wherever someone meets it; Confluencia did until it left the site.
 */
export function CampaignName({ campaign }: { campaign: CampaignKey }) {
  return <>{getCampaign(campaign).name}</>
}

/**
 * Campaign copy stored as plain text (the funding rule, for one) with every
 * mention of the campaign's name drawn as its mark. Keeps the text in one
 * place in lib/campaigns.ts while it still reads as the name on the page.
 */
export function CampaignText({ campaign, text }: { campaign: CampaignKey; text: string }) {
  const name = getCampaign(campaign).name
  const parts = text.split(name)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <CampaignName campaign={campaign} />}
        </span>
      ))}
    </>
  )
}
