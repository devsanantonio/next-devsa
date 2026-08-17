"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Mail, User, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { AdminCombobox, type AdminComboboxOption } from "@/components/admin/admin-combobox"

interface AccessRequestFormProps {
  onSuccess?: () => void
}

/**
 * Sentinel for "we're not on the list yet", which swaps the combobox for a free
 * text field. It is a value no real organization can collide with.
 */
const OTHER = "__other__"

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50"

/**
 * Request organizer access to the DEVSA admin portal.
 *
 * The community field is a combobox rather than free text: almost everyone
 * asking is an organizer for a group that is *already* listed on Building
 * Together, and a typed "PySA" or "alamo py" cannot be matched to the community
 * document an approval has to attach the account to. Picking from the live list
 * means the name arrives exactly as Firestore spells it.
 */
export function AccessRequestForm({ onSuccess }: AccessRequestFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  /** The combobox selection: an organization name, or the OTHER sentinel. */
  const [selectedOrg, setSelectedOrg] = useState("")
  const [otherOrg, setOtherOrg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Both lists come from Firestore. Neither has a checked-in seed any more.
   *
   * Communities used to fall back to COMMUNITY_LOGOS so the field was usable on
   * first paint, and partners used to come from data/partners.ts outright. Both
   * static lists are gone: they drifted from Firestore in exactly the way a
   * second source of truth always does — a deleted partner kept being offered
   * here, and the community list drifted from Firestore the same way.
   *
   * A name that arrives a moment late is better than a name that no longer
   * exists.
   */
  const [liveCommunities, setLiveCommunities] = useState<string[] | null>(null)
  const [livePartners, setLivePartners] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    const names = (list: unknown): string[] =>
      (Array.isArray(list) ? list : [])
        .map((x) => (x as { name?: string })?.name)
        .filter((n: unknown): n is string => typeof n === "string" && n.length > 0)

    fetch("/api/communities")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = names(data?.communities)
        if (!cancelled && list.length > 0) setLiveCommunities(list)
      })
      .catch(() => {
        // Falls back to the static snapshot below.
      })

    fetch("/api/partners")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setLivePartners(names(data?.partners))
      })
      .catch(() => {
        // No seed to fall back to; the group simply does not render.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo<AdminComboboxOption[]>(() => {
    const communityNames = liveCommunities ?? []
    const seen = new Set(communityNames.map((n) => n.toLowerCase()))

    const communityOptions = [...communityNames]
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ value: n, label: n, group: "Community groups" }))

    // A partner that is also a listed community would otherwise appear twice.
    const partnerOptions = livePartners
      .filter((n) => !seen.has(n.toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ value: n, label: n, group: "Partners" }))

    return [
      ...communityOptions,
      ...partnerOptions,
      { value: OTHER, label: "My group isn't listed yet", group: "Something else" },
    ]
  }, [liveCommunities, livePartners])

  const communityOrg = selectedOrg === OTHER ? otherOrg.trim() : selectedOrg

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!communityOrg) {
      setError(
        selectedOrg === OTHER
          ? "Tell us the name of your group."
          : "Choose the group you organize for."
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, communityOrg }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request")
      }

      setIsSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
          Request sent
        </h2>
        <p className="text-sm leading-relaxed text-gray-500">
          We&apos;ll review it and email{" "}
          <span className="font-medium text-gray-900">{email}</span> as soon as
          you&apos;re approved. Most requests are handled within a couple of days.
        </p>
        <Link
          href="/events"
          className="group mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
        >
          Browse the calendar
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Request organizer access
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
          Free for San Antonio tech communities. No account needed to ask.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-[13px] leading-relaxed text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-gray-900">
            Full name <span className="text-[#ef426f]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="communityOrg"
            className="mb-1.5 block text-[13px] font-medium text-gray-900"
          >
            Which group do you organize? <span className="text-[#ef426f]">*</span>
          </label>
          <AdminCombobox
            variant="light"
            options={options}
            value={selectedOrg}
            onChange={(v) => {
              setSelectedOrg(v)
              setError(null)
            }}
            placeholder="Select your community or partner"
          />
          {selectedOrg === OTHER && (
            <input
              type="text"
              id="communityOrg"
              required
              value={otherOrg}
              onChange={(e) => setOtherOrg(e.target.value)}
              placeholder="Name of your group"
              disabled={isLoading}
              aria-label="Name of your group"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50"
            />
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-gray-900">
            Email address <span className="text-[#ef426f]">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            This becomes your sign-in — use one you check.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending request
            </>
          ) : (
            "Request access"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] leading-relaxed text-gray-500">
        Already approved?{" "}
        <Link
          href="/admin"
          className="font-medium text-[#ef426f] transition-colors hover:text-[#d63760]"
        >
          Sign in to the portal
        </Link>
      </p>
    </div>
  )
}
