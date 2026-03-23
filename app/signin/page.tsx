"use client"

import { AccessRequestForm } from "@/components/access-request-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Note: metadata for this page is not possible here because it's a client component
// We'll create a layout.tsx for it instead
export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-black px-4 py-8">
      <div className="mx-auto w-full max-w-sm">
        <Link
          href="/events"
          className="relative z-10 inline-flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to events
        </Link>

        <AccessRequestForm />
      </div>
    </main>
  )
}
