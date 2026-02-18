import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or request access to the DEVSA community platform. Join San Antonio's growing tech ecosystem.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
