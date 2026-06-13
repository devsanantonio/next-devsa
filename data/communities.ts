export interface TechCommunity {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  discord?: string
  meetup?: string
  luma?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  twitch?: string
  facebook?: string
  github?: string
}

/**
 * Static snapshot of the San Antonio tech communities (name + logo), frozen
 * from the live /api/communities list for use in marketing surfaces like the
 * stay-connected spotlight without a runtime fetch.
 */
export const COMMUNITY_LOGOS: { name: string; logo: string }[] = [
  { name: ".NET User Group", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-net.png" },
  { name: "ACM SA", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-acm-sa.png" },
  { name: "AWS User Group", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-aws+(1).png" },
  { name: "Alamo City Locksport", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-73-aclocksport.png" },
  { name: "Alamo Python", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/flyers-46-alamo-py-white.png" },
  { name: "Alamo Regional Data Alliance", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-arda.png" },
  { name: "Alamo Tech Collective", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/atc-logo.png" },
  { name: "BSides San Antonio", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-bsides+(1).png" },
  { name: "Bitcoin Club", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-bitcoin.png" },
  { name: "DEF CON Group SATX", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-dcg-satx.png" },
  { name: "Datanauts", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-datanauts.png" },
  { name: "Dungo Digital", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/dungologo.webp" },
  { name: "Geeks && {...}", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-geeks.png" },
  { name: "Google Developer Group", logo: "https://cd7xknlpdcor35of.public.blob.vercel-storage.com/communities/gdg-1770700801095.png" },
  { name: "Greater Gaming Society", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/ggs.svg" },
  { name: "OWASP San Antonio", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-owasp.png" },
  { name: "Red Hat User Group", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-77-redhat.png" },
  { name: "San Antonio Hackers Association", logo: "https://cd7xknlpdcor35of.public.blob.vercel-storage.com/communities/saha-1770698059277.png" },
  { name: "UXSA", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-74-uxsa.png" },
  { name: "Unreal Engine SA", logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/unreal-engine-light.svg" },
  { name: "Women in Data", logo: "https://cd7xknlpdcor35of.public.blob.vercel-storage.com/communities/women-in-data-1770687313875.png" },
]

