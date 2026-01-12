import { Metadata } from "next"
import { GroupsHero } from "@/components/partners/groups-hero"

export const metadata: Metadata = {
  title: "Tech Groups | DEVSA",
  description: "Discover 20+ active tech-focused groups in San Antonio. DEVSA is the bridge connecting passionate builders, local communities, and the growing tech ecosystem.",
  openGraph: {
    title: "Tech Groups | DEVSA",
    description: "Discover 20+ active tech-focused groups in San Antonio. DEVSA is the bridge connecting passionate builders, local communities, and the growing tech ecosystem.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Groups | DEVSA",
    description: "Discover 20+ active tech-focused groups in San Antonio. DEVSA is the bridge connecting passionate builders, local communities, and the growing tech ecosystem.",
  },
}

export default function GroupsPage() {
  return (
    <main className="min-h-screen bg-black">
      <GroupsHero />
    </main>
  )
}
