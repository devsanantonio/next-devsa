import { Metadata } from "next"
import { MoreHumanThanHuman } from "@/components/aiconference/more-human-than-human"

export const metadata: Metadata = {
  title: "More Human Than Human | DEVSA AI Conference 2026",
  description: "Join us for the DEVSA AI Conference on February 28th, 2026 at Geekdom. Where builders explore the frontier of artificial intelligence.",
  keywords: [
    "AI conference",
    "artificial intelligence",
    "San Antonio tech",
    "DEVSA",
    "machine learning",
    "call for speakers",
    "tech conference 2026",
    "Geekdom",
    "More Human Than Human",
  ],
}

export default function MoreHumanThanHumanPage() {
  return <MoreHumanThanHuman />
}
