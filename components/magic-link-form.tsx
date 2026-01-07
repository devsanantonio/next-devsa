"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useState, useEffect } from "react"
import { Loader2, Mail, AlertCircle, KeyRound, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MagicLinkFormProps {
  onSuccess?: () => void
}

type Step = "email" | { email: string }

export function MagicLinkForm({ onSuccess }: MagicLinkFormProps) {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<Step>("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magenSessionId, setMagenSessionId] = useState<string | null>(null)

  // Start Magen session for bot protection
  useEffect(() => {
    const startMagenSession = async () => {
      try {
        const response = await fetch('/api/magen/start-session', {
          method: 'POST',
        })
        if (response.ok) {
          const data = await response.json()
          setMagenSessionId(data?.sessionId || null)
        }
      } catch {
        // Magen not available - continue without it
      }
    }
    startMagenSession()
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Please enter your email")
      return
    }

    setIsLoading(true)

    try {
      // Verify Magen session before proceeding (if available)
      if (magenSessionId) {
        const verifyResponse = await fetch('/api/magen/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: magenSessionId }),
        })
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json()
          if (verifyData.humanScore !== undefined && verifyData.humanScore < 0.3) {
            setError("Verification failed. Please try again.")
            setIsLoading(false)
            return
          }
        }
      }

      await signIn("resend-otp", { email })
      setStep({ email })
    } catch (err) {
      console.error("Send code error:", err)
      setError("Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!code) {
      setError("Please enter the verification code")
      return
    }

    if (step === "email") return

    setIsLoading(true)

    try {
      await signIn("resend-otp", { email: step.email, code })
      onSuccess?.()
    } catch (err) {
      console.error("Verification error:", err)
      setError("Invalid or expired code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Code entry step
  if (step !== "email") {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ef426f]/10">
              <KeyRound className="h-8 w-8 text-[#ef426f]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              Enter your code
            </h2>
            <p className="text-base leading-relaxed text-gray-600">
              We sent an 8-digit code to{" "}
              <span className="font-semibold text-gray-900">{step.email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-red-700">{error}</p>
            </div>
          )}

          {/* Code Form */}
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-2">
                Verification code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="12345678"
                disabled={isLoading}
                autoComplete="one-time-code"
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 px-4 text-center text-2xl font-mono tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 8}
              className="w-full rounded-xl bg-[#ef426f] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Back button */}
          <button
            onClick={() => {
              setStep("email")
              setCode("")
              setError(null)
            }}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Use a different email
          </button>

          {/* Resend option */}
          <p className="mt-4 text-center text-sm text-gray-500">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={async () => {
                setError(null)
                setIsLoading(true)
                try {
                  await signIn("resend-otp", { email: step.email })
                  setCode("")
                } catch {
                  setError("Failed to resend code. Please try again.")
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
              className="text-[#ef426f] hover:text-[#d63760] font-semibold transition-colors disabled:opacity-50"
            >
              Resend
            </button>
          </p>
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
            Sign in to DEVSA
          </h2>
          <p className="text-base leading-relaxed text-gray-600">
            Enter your email and we&apos;ll send you a code to sign in.
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
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#ef426f] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Send Code</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
          No password needed. We&apos;ll email you a secure code to sign in.
        </p>

        {/* Magen protection notice */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Protected by{" "}
          <Link
            href="https://magenminer.io"
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
