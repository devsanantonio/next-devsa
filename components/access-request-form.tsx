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
      // Client-side MAGEN verification (log-only until SDK sends behavioral signals)
      const clientResult = await verify()
      console.log('[MAGEN] Access request verification:', clientResult ? { verdict: clientResult.verdict, score: clientResult.score } : 'no session')

      // TODO: Enable blocking once MAGEN client SDK sends behavioral events
      // if (clientResult && clientResult.verdict !== 'verified') { ... }
      // if (!serverVerified) { ... }

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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 leading-[1.3] mb-2">
            Request Submitted!
          </h2>
          <p className="text-sm font-light text-gray-500 leading-[1.6]">
            Your access request has been submitted. The DEVSA admin team will review and notify you when approved.
          </p>
          <Link
            href="/events"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#ef426f] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d63760] transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-2 md:mb-4 relative h-14 w-full scale-320 md:scale-440">
            <Image
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png"
              alt="DEVSA"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 leading-[1.3] mb-1.5">
            Request Organizer Access
          </h2>
          <p className="text-sm font-light leading-[1.6] text-gray-500">
            List your group on Building Together and add events to the DEVSA community calendar.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[13px] font-normal leading-[1.6] text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-gray-900 mb-1.5">
              Full Name <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all leading-normal"
              />
            </div>
          </div>

          <div>
            <label htmlFor="communityOrg" className="block text-[13px] font-medium text-gray-900 mb-1.5">
              Community / Organization <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="communityOrg"
                required
                value={formData.communityOrg}
                onChange={(e) => setFormData({ ...formData, communityOrg: e.target.value })}
                placeholder="SA Tech Bloc, PySA, etc."
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all leading-normal"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-gray-900 mb-1.5">
              Email Address <span className="text-[#ef426f]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all leading-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isVerifying}
            className="w-full rounded-xl bg-[#ef426f] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
        <p className="mt-5 text-center text-[13px] font-normal leading-[1.6] text-gray-500">
          Already have access?{" "}
          <Link
            href="/admin"
            className="text-[#ef426f] hover:text-[#d63760] font-medium transition-colors"
          >
            Go to Admin
          </Link>
        </p>

        {/* Magen protection notice */}
        <p className="mt-3 text-center text-[11px] font-normal text-gray-400 leading-[1.6]">
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
