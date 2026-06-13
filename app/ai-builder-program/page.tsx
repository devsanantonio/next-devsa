import { Metadata } from "next"
import { LogoParticles } from "@/components/ai-builder/logo-particles"
import { ProgramOverview } from "@/components/ai-builder/program-overview"
import { SITE_URL } from "@/data/stay-connected"

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
