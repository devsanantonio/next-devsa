"use client"

import { useState } from "react"
import Image from "next/image"
import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitButton } from "@/components/pysa/2026/button-styles"
import {
  AUDIENCE_LEVELS,
  CONSIDER_FOR,
  PYSA_ASSETS,
  PYSA_COLORS,
  PYSA_EVENT_ID,
  SESSION_FORMATS,
  type CfsPhase,
} from "@/data/pysa/2026"

const { yellow: YELLOW, blue: BLUE } = PYSA_COLORS

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white transition-all placeholder:text-white/30 focus:border-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-[#4a90d9]/25"

const labelClass = "mb-1.5 block text-xs font-semibold text-white"

const hintClass = "mt-1.5 text-xs text-white/40"

/** Radio rendered as a selectable chip. */
function ChipRadio({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        checked
          ? "border-transparent bg-[#4a90d9] text-[#0a0a0a]"
          : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {children}
    </label>
  )
}

export function PysaSpeakerForm({
  phase,
  /**
   * Fired once on a successful submission. The section uses it to retire its
   * decorative mascot: the success card is far shorter than the form, so the
   * grid row collapses and a sticker anchored to its bottom rides up onto the
   * copy in the left column.
   */
  onSubmitted,
}: {
  phase: CfsPhase
  onSubmitted?: () => void
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    linkedin: "",
    sessionTitle: "",
    sessionFormat: "",
    audienceLevel: "",
    considerFor: "conference",
    abstract: "",
    bio: "",
    accommodations: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (error) setError(null)
  }

  const set = (key: keyof typeof form) => (v: string) => {
    setForm((p) => ({ ...p, [key]: v }))
    if (error) setError(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.sessionFormat) {
      setError("Pick a talk length.")
      return
    }
    if (!form.audienceLevel) {
      setError("Pick an audience level.")
      return
    }
    setIsSubmitting(true)
    try {
      const considerLabel =
        CONSIDER_FOR.find((c) => c.value === form.considerFor)?.label ?? ""
      const res = await fetch("/api/call-for-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          considerFor: considerLabel,
          eventId: PYSA_EVENT_ID,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      setSubmitted(true)
      onSubmitted?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (phase === "closed") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-10 text-center">
        <CalendarClock className="h-10 w-10" style={{ color: BLUE }} />
        <h3 className="text-xl font-bold text-white">The call for speakers has closed</h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/60">
          Submissions closed August 15, and we&apos;re reading every one of them
          before we announce the lineup ahead of October 2. Talks that don&apos;t
          land a conference slot get first look for Alamo Python&apos;s regular
          meetups — the work still finds a room.
        </p>
        <a
          href="https://www.meetup.com/alamo-python/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold underline-offset-4 hover:underline"
          style={{ color: BLUE }}
        >
          Follow Alamo Python for the announcement
        </a>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-10 text-center">
        {/* The mascot moves in here rather than floating in the section, where
            the collapsing grid used to throw him across the copy. */}
        <Image
          src={PYSA_ASSETS.mascotBust}
          alt=""
          aria-hidden
          width={PYSA_ASSETS.mascotBustWidth}
          height={PYSA_ASSETS.mascotBustHeight}
          sizes="160px"
          className="pointer-events-none absolute bottom-3 right-3 w-24 select-none sm:w-28"
        />
        <CheckCircle2 className="h-12 w-12" style={{ color: YELLOW }} />
        <h3 className="text-xl font-bold text-white">Talk submitted</h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/60">
          Thanks, {form.name.split(" ")[0] || "friend"} — your proposal is in.
          The call closes August 15, and you&apos;ll hear from us by email either
          way. Sharing what you know is how this community gets built.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col rounded-2xl border border-white/10 bg-white/3 p-5 sm:p-7"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold tracking-tight text-white">Submit a talk</h3>
        <p className="mt-1 text-sm text-white/50">
          Beginner-friendly talks are as welcome as deep dives. If this would be
          your first time on a stage, it&apos;s a good one to start on.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pysa-name" className={labelClass}>
              Full name <span style={{ color: BLUE }}>*</span>
            </label>
            <input
              id="pysa-name"
              name="name"
              required
              value={form.name}
              onChange={onChange}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="pysa-email" className={labelClass}>
              Email <span style={{ color: BLUE }}>*</span>
            </label>
            <input
              id="pysa-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pysa-company" className={labelClass}>
              Company / Org
            </label>
            <input
              id="pysa-company"
              name="company"
              value={form.company}
              onChange={onChange}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
          <div>
            <label htmlFor="pysa-linkedin" className={labelClass}>
              Slides, repo, or past talks
            </label>
            <input
              id="pysa-linkedin"
              name="linkedin"
              type="url"
              value={form.linkedin}
              onChange={onChange}
              className={inputClass}
              placeholder="https://…"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pysa-title" className={labelClass}>
            Talk title <span style={{ color: BLUE }}>*</span>
          </label>
          <input
            id="pysa-title"
            name="sessionTitle"
            required
            value={form.sessionTitle}
            onChange={onChange}
            className={inputClass}
            placeholder="What are you calling it?"
          />
        </div>

        <fieldset>
          <legend className={labelClass}>
            Preferred format <span style={{ color: BLUE }}>*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SESSION_FORMATS.map((f) => (
              <ChipRadio
                key={f.value}
                name="sessionFormat"
                value={f.value}
                checked={form.sessionFormat === f.value}
                onChange={set("sessionFormat")}
              >
                {f.label}
              </ChipRadio>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>
            Audience level <span style={{ color: BLUE }}>*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_LEVELS.map((l) => (
              <ChipRadio
                key={l.value}
                name="audienceLevel"
                value={l.value}
                checked={form.audienceLevel === l.value}
                onChange={set("audienceLevel")}
              >
                {l.label}
              </ChipRadio>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Where should we consider it?</legend>
          <div className="space-y-2">
            {CONSIDER_FOR.map((c) => (
              <label
                key={c.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  form.considerFor === c.value
                    ? "border-[#4a90d9]/60 bg-[#4a90d9]/10"
                    : "border-white/10 hover:border-white/25"
                )}
              >
                <input
                  type="radio"
                  name="considerFor"
                  value={c.value}
                  checked={form.considerFor === c.value}
                  onChange={() => set("considerFor")(c.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#4a90d9]"
                />
                <span>
                  <span className="block text-sm font-medium text-white">{c.label}</span>
                  <span className="block text-xs text-white/45">{c.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="pysa-abstract" className={labelClass}>
            Abstract <span style={{ color: BLUE }}>*</span>
          </label>
          <textarea
            id="pysa-abstract"
            name="abstract"
            required
            rows={5}
            value={form.abstract}
            onChange={onChange}
            className={cn(inputClass, "resize-y")}
            placeholder="A few sentences on the talk and who it's for."
          />
          <p className={hintClass}>
            What it&apos;s about, why it&apos;s useful, and what attendees will learn.
          </p>
        </div>

        <div>
          <label htmlFor="pysa-bio" className={labelClass}>
            Speaker bio
          </label>
          <textarea
            id="pysa-bio"
            name="bio"
            rows={3}
            value={form.bio}
            onChange={onChange}
            className={cn(inputClass, "resize-y")}
            placeholder="Optional"
          />
          <p className={hintClass}>2–3 sentences for the website and program.</p>
        </div>

        <div>
          <label htmlFor="pysa-accommodations" className={labelClass}>
            Accessibility or scheduling requests
          </label>
          <textarea
            id="pysa-accommodations"
            name="accommodations"
            rows={2}
            value={form.accommodations}
            onChange={onChange}
            className={cn(inputClass, "resize-y")}
            placeholder="Anything we should know to make this work for you."
          />
        </div>

        {error && (
          <p className="flex items-start gap-2 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={submitButton}>
          {isSubmitting ? "Submitting…" : "Submit a talk"}
        </button>

        <p className="text-center text-xs text-white/35">
          Submissions close August 15, 2026.
        </p>
      </div>
    </form>
  )
}
