"use client"

import { useRouter } from "next/navigation"
import { useConvexAuth } from "convex/react"
import { useEffect } from "react"
import { MagicLinkForm } from "@/components/magic-link-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useConvexAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/events")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-[#ef426f]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black py-12 sm:py-20">
      <div className="mx-auto max-w-sm px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <MagicLinkForm />
      </div>
    </main>
  )
}
