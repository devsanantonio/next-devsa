/**
 * San Antonio Startup Week speaker tracks — names and audience descriptions
 * from the event's track legend, recolored to the DEVSA brand palette (no
 * purple). Shared by the hero (hover context) and the speaker form combobox.
 */
export type Track = {
  name: string
  description: string
  /** Legend dot color — drawn from the DEVSA brand palette. */
  color: string
}

export const TRACKS: Track[] = [
  {
    name: "Founder",
    description: "Early-stage startup founders, pre-seed to Series A.",
    color: "#ef426f", // DEVSA pink
  },
  {
    name: "Tech & Builders",
    description: "Engineers, devs, technical talent, CS students.",
    color: "#4d8eff", // DEVSA blue
  },
  {
    name: "AI & Applied Innovation",
    description: "Anyone integrating AI into work or product.",
    color: "#00b2a9", // DEVSA teal
  },
  {
    name: "Small Business & Solopreneur",
    description: "Owners, CPG, food, services, freelancers.",
    color: "#fbbf24", // DEVSA amber
  },
  {
    name: "Capital & Community",
    description: "Investors, ecosystem builders, corporates, philanthropy.",
    color: "#ff6b35", // DEVSA orange
  },
]
