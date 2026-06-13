"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { AlertCircle, CheckCircle2, Send } from "lucide-react"
import { useMagen } from "@/lib/hooks/use-magen"
import { TrackCombobox } from "@/components/startup-week/track-combobox"

const ACCENT = "#ec228d"

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 transition-all focus:border-[#ec228d] focus:outline-none focus:ring-2 focus:ring-[#ec228d]/20"

const labelClass = "mb-1.5 block text-xs font-semibold text-neutral-900"

export function SpeakerForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    linkedin: "",
    track: "",
    sessionTitle: "",
    abstract: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const { verify } = useMagen()

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (error) setError(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.track) {
      setError("Please choose a track.")
      return
    }
    setIsSubmitting(true)
    try {
      const clientResult = await verify()
      const res = await fetch("/api/call-for-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: "startup-week-2026",
          magenSessionId: clientResult?.session_id || null,
          magenVerdict: clientResult?.verdict || null,
          magenScore: clientResult?.score || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm lg:min-h-full">
        <CheckCircle2 className="h-12 w-12" style={{ color: ACCENT }} />
        <h3 className="text-xl font-bold text-neutral-900">Talk submitted</h3>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-600">
          Thanks, {formData.name.split(" ")[0] || "friend"} — your proposal is in.
          We&apos;ll follow up by email about next steps for San&nbsp;Antonio Startup Week.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:min-h-full lg:justify-center"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">
          Submit a talk
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Open call for speakers — five tracks.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name <span style={{ color: ACCENT }}>*</span>
            </label>
            <input id="name" name="name" required value={formData.name} onChange={onChange} className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span style={{ color: ACCENT }}>*</span>
            </label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={onChange} className={inputClass} placeholder="you@example.com" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className={labelClass}>
              Company / Org
            </label>
            <input id="company" name="company" value={formData.company} onChange={onChange} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label htmlFor="linkedin" className={labelClass}>
              LinkedIn / Website
            </label>
            <input id="linkedin" name="linkedin" type="url" value={formData.linkedin} onChange={onChange} className={inputClass} placeholder="https://linkedin.com/in/you" />
          </div>
        </div>

        <div>
          <span id="track-label" className={labelClass}>
            Track <span style={{ color: ACCENT }}>*</span>
          </span>
          <TrackCombobox
            value={formData.track}
            accent={ACCENT}
            labelId="track-label"
            onChange={(name) => {
              setFormData((p) => ({ ...p, track: name }))
              if (error) setError(null)
            }}
          />
        </div>

        <div>
          <label htmlFor="sessionTitle" className={labelClass}>
            Talk title <span style={{ color: ACCENT }}>*</span>
          </label>
          <input id="sessionTitle" name="sessionTitle" required value={formData.sessionTitle} onChange={onChange} className={inputClass} placeholder="Give your talk a title" />
        </div>

        <div>
          <label htmlFor="abstract" className={labelClass}>
            Abstract <span style={{ color: ACCENT }}>*</span>
          </label>
          <textarea id="abstract" name="abstract" required rows={3} value={formData.abstract} onChange={onChange} className={`${inputClass} resize-none`} placeholder="What will attendees learn? Aim for 150–300 words." />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              Submitting…
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 18], y: [0, -18], opacity: [1, 1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "easeIn" }}
              >
                <Send className="h-4 w-4" />
              </motion.span>
            </>
          ) : (
            <>
              Submit talk
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
