import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "DEVSA Jobs - San Antonio Tech Job Board",
  description: "Find tech jobs and talent in San Antonio. Connect with local companies, startups, and developers in the DEVSA community.",
  keywords: [
    "San Antonio tech jobs",
    "DEVSA jobs",
    "developer jobs SA",
    "tech hiring San Antonio",
    "software engineer jobs",
    "startup jobs San Antonio",
    "contract work tech",
    "remote tech jobs",
  ],
  openGraph: {
    title: "DEVSA Jobs - San Antonio Tech Job Board",
    description: "Find tech jobs and talent in San Antonio.",
    type: "website",
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
