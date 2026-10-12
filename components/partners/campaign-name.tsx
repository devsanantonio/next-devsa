import { ConfluenciaName } from "@/components/demo-day/wordmark"
import { getCampaign, type CampaignKey } from "@/lib/campaigns"

/**
 * A campaign's name as a visitor should see it. Confluencia always appears as
 * its wordmark — on its own page, on /about, on Building Together and here in
 * the donation form — so the name looks the same wherever someone meets it.
 * Any future campaign without a mark of its own falls back to plain text.
 */
export function CampaignName({ campaign }: { campaign: CampaignKey }) {
  if (campaign === "demo-day") return <ConfluenciaName />
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
