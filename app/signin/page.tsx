"use client"

import { AccessRequestForm } from "@/components/access-request-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Note: metadata for this page is not possible here because it's a client component
// We'll create a layout.tsx for it instead
export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black py-12 sm:py-20">
      <div className="mx-auto max-w-sm px-4">
        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <AccessRequestForm />
      </div>
    </main>
  )
}
