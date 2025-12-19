import { Metadata } from "next"
import { CallForSpeakers } from "@/components/aiconference/call-for-speakers"

export const metadata: Metadata = {
  title: "DEVSA AI Conference 2026 | San Antonio's Premier AI Event",
  description: "Join us for the DEVSA AI Conference on February 28th, 2026 at Geekdom. Submit your talk proposal and share your AI expertise with the San Antonio tech community.",
  keywords: [
    "AI conference",
    "artificial intelligence",
    "San Antonio tech",
    "DEVSA",
    "machine learning",
    "call for speakers",
    "tech conference 2026",
    "Geekdom",
  ],
}

export default function AIConference2026Page() {
  return (
    <main className="min-h-screen bg-white">
      <CallForSpeakers />
    </main>
  )
}
