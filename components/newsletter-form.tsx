"use client"

import { useState } from "react"
import { Loader2, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useMagen } from "@/lib/hooks/use-magen"

interface NewsletterFormProps {
  source?: string
  className?: string
}

export function NewsletterForm({ source = "footer", className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { verify, verifyOnServer, isVerifying } = useMagen()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      // Client-side MAGEN verification (log-only until SDK sends behavioral signals)
      const clientResult = await verify()
      console.log('[MAGEN] Newsletter verification:', clientResult ? { verdict: clientResult.verdict, score: clientResult.score } : 'no session')

      // TODO: Enable blocking once MAGEN client SDK sends behavioral events
      // if (clientResult && clientResult.verdict !== 'verified') { ... }
      // if (!serverVerified) { ... }

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          magenSessionId: clientResult?.session_id || null,
          magenVerdict: clientResult?.verdict || null,
          magenScore: clientResult?.score || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus("success")
      setEmail("")
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Failed to subscribe")
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 text-green-400 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Thanks for subscribing!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === "loading"}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || isVerifying}
          className="rounded-lg bg-[#ef426f] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {status === "loading" || isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isVerifying ? 'Verifying...' : 'Subscribing...'}
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Protected by{" "}
        <Link
          href="https://magentrust.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
        >
          Magen
        </Link>
      </p>
    </form>
  )
}
