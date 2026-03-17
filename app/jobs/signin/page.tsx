"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Loader2, ArrowLeft } from "lucide-react"

export default function JobsSignInPage() {
  const router = useRouter()
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, getIdToken, loading } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Auto-redirect if user already has an active session
  useEffect(() => {
    if (loading) return
    if (!user) {
      setCheckingSession(false)
      return
    }
    // User is already signed in — check if they have a profile
    const checkExisting = async () => {
      try {
        const token = await getIdToken()
        if (!token) {
          setCheckingSession(false)
          return
        }
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        })
        const data = await res.json()
        if (data.hasProfile) {
          router.replace("/jobs/dashboard")
          return
        }
        // No profile yet — auto-create as hiring manager and go to post form
        await autoCreateProfile(token)
      } catch {
        // Fall through to sign-in form
      } finally {
        setCheckingSession(false)
      }
    }
    checkExisting()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])
  const autoCreateProfile = async (token: string) => {
    try {
      const res = await fetch("/api/job-board/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: "hiring",
          displayName: user?.displayName || displayName || "User",
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push("/jobs/post")
      } else {
        router.push("/jobs/dashboard")
      }
    } catch {
      router.push("/jobs/dashboard")
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
      await checkProfile()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError("Display name is required")
          setIsSubmitting(false)
          return
        }
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      await checkProfile()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      if (message.includes("auth/invalid-credential")) {
        setError("Invalid email or password")
      } else if (message.includes("auth/email-already-in-use")) {
        setError("Email already in use. Try signing in instead.")
      } else if (message.includes("auth/weak-password")) {
        setError("Password must be at least 6 characters")
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkProfile = async () => {
    // Small delay to let Firebase Auth state settle
    await new Promise((r) => setTimeout(r, 500))
    try {
      const token = await getIdToken()
      if (!token) {
        return
      }
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })
      const data = await res.json()
      if (data.hasProfile) {
        router.push("/jobs/dashboard")
      } else {
        // Auto-create hiring profile and redirect to post form
        const token = await getIdToken()
        if (token) {
          await autoCreateProfile(token)
        }
      }
    } catch {
      // Fall through
    }
  }

  if (loading || checkingSession) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pt-10">
      {/* Top bar — offset below the root layout navbar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-3.5 sticky top-0 z-10">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <span className="text-sm font-semibold text-slate-900 tracking-wide">The Opportunity Pipeline</span>
        </div>
      </div>

      <main className="mx-auto max-w-sm px-5 py-10 sm:py-16">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-2">
                Post Once. Reach Every Developer.
              </h1>
              <p className="text-base text-slate-500 leading-[1.6] text-balance">
                {isSignUp
                  ? "Create your account to post jobs across our website, Discord, and LinkedIn — free during our Community Launch."
                  : "Sign in to post and manage listings shared across our website, Discord, and LinkedIn."}
              </p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5 sm:space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 leading-normal">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 leading-normal">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                className="text-[#ef426f] hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
      </main>
    </div>
  )
}
