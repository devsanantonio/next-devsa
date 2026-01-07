"use client"

import { useRouter } from "next/navigation"
import { useConvexAuth } from "convex/react"
import { useEffect, useState } from "react"
import { MagicLinkForm } from "@/components/magic-link-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [signInSuccess, setSignInSuccess] = useState(false)

  // Redirect if already authenticated or after successful sign-in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/events")
    }
  }, [isAuthenticated, isLoading, router])

  // Handle successful sign-in from form - force redirect after a short delay
  useEffect(() => {
    if (signInSuccess) {
      // Give Convex a moment to update auth state, then force redirect
      const timeout = setTimeout(() => {
        router.push("/events")
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [signInSuccess, router])

  const handleSignInSuccess = () => {
    setSignInSuccess(true)
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-[#ef426f]" />
          </div>
        ) : isAuthenticated || signInSuccess ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">Signed in!</h2>
            <p className="text-base text-gray-600">Redirecting to events...</p>
          </div>
        ) : (
          <MagicLinkForm onSuccess={handleSignInSuccess} />
        )}
      </div>
    </main>
  )
}
