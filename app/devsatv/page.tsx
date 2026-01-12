import { Metadata } from "next"
import { DevsaTVPage } from "@/components/devsatv/devsatv-page"

export const metadata: Metadata = {
  title: "DEVSA TV | The Content Engine for San Antonio Tech",
  description: "Transform authentic community stories into premium, sponsor-ready content through documentary-style production. DEVSA TV leverages the living ecosystem that DEVSA created.",
  keywords: [
    "DEVSA TV",
    "San Antonio tech",
    "tech content",
    "documentary production",
    "sponsored workshops",
    "tech conferences",
    "More Human Than Human",
    "AI Conference",
    "PySanAntonio",
    "content sponsorship",
  ],
}

export default function DevsaTVRoute() {
  return <DevsaTVPage />
}
