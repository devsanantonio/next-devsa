"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DD } from "@/components/demo-day/theme"
import { ConfluenciaName } from "@/components/demo-day/wordmark"
import {
  DEMO_DAY_DEADLINE,
  DEMO_DAY_INDUSTRIES,
  DEMO_DAY_INTERESTS,
  type DemoDayInterest,
} from "@/lib/demo-day"

/**
 * The Demo Day inquiry form — the page's ask, answered in place.
 *
 * Built after the PySanAntonio call for speakers (components/pysa/2026/
 * speaker-form.tsx): the same field styling, chip radios and success card, in
 * Demo Day's marigold. It replaces the mailto links the ask used to have,
 * which opened nothing for anyone without a mail client — common on the work
 * laptop a lead partner would be reading this on.
 *
 * Every button on the page that asks for a commitment links to one of the
 * anchors below (#inquire-lead, #inquire-build…). The form reads the hash on
 * load and on every change, so it opens with that option already chosen.
 *
 * Submissions go to /api/demo-day/inquiries and are readable only by admins
 * and super admins, in the admin portal's Demo Day tab.
 */
const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white transition-all placeholder:text-white/30 focus:border-[#ffb81c] focus:outline-none focus:ring-2 focus:ring-[#ffb81c]/25"
const labelClass = "mb-1.5 block text-xs font-semibold text-white"

const interestFromHash = (): DemoDayInterest | null => {
  const hash = window.location.hash.slice(1)
  return DEMO_DAY_INTERESTS.find((i) => i.anchor === hash)?.value ?? null
}

export function DemoDayInquiryForm() {
  const [form, setForm] = useState({
    interest: "lead" as DemoDayInterest,
    name: "",
    email: "",
    organization: "",
    title: "",
    industry: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const apply = () => {
      const interest = interestFromHash()
      if (interest) setForm((f) => ({ ...f, interest }))
    }
    apply()
    window.addEventListener("hashchange", apply)
    return () => window.removeEventListener("hashchange", apply)
  }, [])

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      if (error) setError(null)
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/demo-day/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="inquire" className="page-shell scroll-mt-24 pb-16 md:pb-24">
      {/* Scroll targets for the buttons elsewhere on the page. */}
      {DEMO_DAY_INTERESTS.map((i) => (
        <span key={i.anchor} id={i.anchor} className="block scroll-mt-24" aria-hidden />
      ))}

      <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-sm sm:p-8">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12" style={{ color: DD.marigold }} />
            <h3 className="text-xl font-bold text-white">We have it</h3>
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              Thanks, {form.name.split(" ")[0] || "friend"}. Your note is with the
              DEVSA team, and we&apos;ll be in touch directly. <ConfluenciaName /> is decided by{" "}
              {DEMO_DAY_DEADLINE}, so you won&apos;t be waiting long.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <h3 className="font-sans text-2xl font-black tracking-[-0.02em] text-white md:text-3xl">
                Start the conversation
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Tell us how you&apos;d like to be involved. It comes straight to the
                DEVSA team.
              </p>
            </div>

            <fieldset>
              <legend className={labelClass}>
                I&apos;m interested in <span style={{ color: DD.marigold }}>*</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {DEMO_DAY_INTERESTS.map((i) => {
                  const checked = form.interest === i.value
                  return (
                    <label
                      key={i.value}
                      className={cn(
                        "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        checked
                          ? "border-transparent text-[#0a0a0a]"
                          : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
                      )}
                      style={checked ? { backgroundColor: DD.marigold } : undefined}
                    >
                      <input
                        type="radio"
                        name="interest"
                        value={i.value}
                        checked={checked}
                        onChange={set("interest")}
                        className="sr-only"
                      />
                      {i.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dd-name" className={labelClass}>
                  Full name <span style={{ color: DD.marigold }}>*</span>
                </label>
                <input id="dd-name" required value={form.name} onChange={set("name")} className={inputClass} placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="dd-email" className={labelClass}>
                  Work email <span style={{ color: DD.marigold }}>*</span>
                </label>
                <input id="dd-email" type="email" required value={form.email} onChange={set("email")} className={inputClass} placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dd-org" className={labelClass}>
                  Organization <span style={{ color: DD.marigold }}>*</span>
                </label>
                <input id="dd-org" required value={form.organization} onChange={set("organization")} className={inputClass} placeholder="Company or organization" autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="dd-title" className={labelClass}>
                  Your title
                </label>
                <input id="dd-title" value={form.title} onChange={set("title")} className={inputClass} placeholder="Optional" autoComplete="organization-title" />
              </div>
            </div>

            <div>
              <label htmlFor="dd-industry" className={labelClass}>
                Industry
              </label>
              <select id="dd-industry" value={form.industry} onChange={set("industry")} className={cn(inputClass, "appearance-none")}>
                <option value="" className="bg-neutral-900">Select one (optional)</option>
                {DEMO_DAY_INDUSTRIES.map((i) => (
                  <option key={i.name} value={i.name} className="bg-neutral-900">
                    {i.name}
                  </option>
                ))}
                <option value="Other" className="bg-neutral-900">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="dd-message" className={labelClass}>
                What should we know? <span style={{ color: DD.marigold }}>*</span>
              </label>
              <textarea
                id="dd-message"
                required
                rows={5}
                value={form.message}
                onChange={set("message")}
                className={cn(inputClass, "resize-y")}
                placeholder="What you'd want from Confluencia, the problems your industry is working on, or any questions."
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <p className="text-xs leading-relaxed text-white/55">
              Partners, sponsors and builders at Confluencia follow DEVSA&apos;s{" "}
              <a href="/code-of-conduct" className="text-white/80 underline underline-offset-4 hover:text-white">
                code of conduct
              </a>
              .
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              style={{ backgroundColor: DD.marigold, color: DD.ink }}
            >
              {submitting ? "Sending…" : "Send to the DEVSA team"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
