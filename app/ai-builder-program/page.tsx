import { Metadata } from "next"
import { LogoParticles } from "@/components/ai-builder/logo-particles"
import { ProgramOverview } from "@/components/ai-builder/program-overview"

// Inlined, as in every other page here. It used to come from
// data/stay-connected.ts, which was BSides booth content and is gone.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

export const metadata: Metadata = {
  title: "AI Builder Program | DEVSA",
  description:
    "Build something real with AI tools, then pitch real investors. The DEVSA AI Builder Program — in partnership with Digital Canvas, 434 Media, and Alamo Angels — connects San Antonio builders with industry problems and capital.",
  alternates: { canonical: "/ai-builder-program" },
  openGraph: {
    title: "AI Builder Program | DEVSA",
    description:
      "Build something real with AI tools, then pitch real investors. An AI-native cohort for San Antonio builders.",
    url: `${SITE_URL}/ai-builder-program`,
    siteName: "DEVSA",
    type: "website",
  },
}

export default function AiBuilderProgramPage() {
  return (
    <div className="w-full overflow-x-hidden bg-neutral-950">
      <main className="relative w-full">
        <LogoParticles className="h-dvh w-full" />
        <ProgramOverview />
      </main>
    </div>
  )
}
