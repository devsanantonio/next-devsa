"use client"

import { useState } from "react"
import { Loader2, Mail, Building2, User, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useMagen } from "@/lib/hooks/use-magen"

interface AccessRequestFormProps {
  onSuccess?: () => void
}

export function AccessRequestForm({ onSuccess }: AccessRequestFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    communityOrg: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { verify, verifyOnServer, isVerifying } = useMagen()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Client-side MAGEN verification
      const clientResult = await verify()

      // If SDK is loaded but verdict is not verified, block
      if (clientResult && clientResult.verdict !== 'verified') {
        setError("Verification failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Server-side re-verification if we got a session
      let serverVerified = true
      if (clientResult?.session_id) {
        const serverResult = await verifyOnServer(clientResult.session_id)
        serverVerified = serverResult.verified !== false
      }

      if (!serverVerified) {
        setError("Verification failed. Please try again.")
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          magenSessionId: clientResult?.session_id || null,
          magenVerdict: clientResult?.verdict || null,
          magenScore: clientResult?.score || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
            Request Submitted!
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Your access request has been submitted. The DEVSA admin team will review and notify you when approved.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-2 md:mb-6 relative h-16 w-full scale-320 md:scale-440">
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png"
              alt="DEVSA"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            Request Organizer Access
          </h2>
          <p className="text-base leading-relaxed text-gray-600">
            Apply to add events to the DEVSA community calendar.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="communityOrg" className="block text-sm font-semibold text-gray-900 mb-2">
              Community / Organization <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="communityOrg"
                required
                value={formData.communityOrg}
                onChange={(e) => setFormData({ ...formData, communityOrg: e.target.value })}
                placeholder="SA Tech Bloc, PySA, etc."
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isVerifying}
            className="w-full rounded-xl bg-[#ef426f] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
          >
            {isLoading || isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isVerifying ? 'Verifying...' : 'Submitting...'}</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
          Already have access?{" "}
          <Link
            href="/admin"
            className="text-[#ef426f] hover:text-[#d63760] font-semibold transition-colors"
          >
            Go to Admin
          </Link>
        </p>

        {/* Magen protection notice */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Protected by{" "}
          <Link
            href="https://magentrust.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b45309] hover:text-[#92400e] font-medium transition-colors"
          >
            Magen
          </Link>
          {" "}bot detection
        </p>
      </div>
    </div>
  )
}
