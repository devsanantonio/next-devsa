"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { AdminCombobox } from "@/components/admin/admin-combobox"
import { PARTNER_WAYS, type GetInvolvedPath } from "@/lib/get-involved"

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
const labelClass = "mb-1 block text-sm font-semibold text-gray-900"

// What the person sees after sending. Says who reads it and what happens
// next, and nothing the team cannot keep.
const CONFIRMATION: Record<GetInvolvedPath, string> = {
  partner:
    "Your note is with the DEVSA team. We'll reply to the address you gave, usually within a few days, to talk through what you have in mind.",
  general: "Your question is with the DEVSA team. We'll reply to the address you gave.",
}

const WAY_OPTIONS = PARTNER_WAYS.map((w) => ({ value: w.key, label: w.label }))

// The two paths as the form presents them: what to do, and a line on what it means.
const PATH_CHOICES: { key: GetInvolvedPath; label: string; blurb: string }[] = [
  { key: "partner", label: "Partner with DEVSA", blurb: "Work with the community" },
  { key: "general", label: "Ask a question", blurb: "Anything else on your mind" },
]

/**
 * The Get Involved form. It owns its own choices. The five ways beside it are
 * the menu to read, not a remote control for the dropdown; tying the two
 * together boxed the section's design in. A link with ?way= still opens it
 * with that way chosen.
 */
export function GetInvolvedForm({
  initialPath = "partner",
  initialWay = "",
}: {
  initialPath?: GetInvolvedPath
  initialWay?: string
}) {
  const [path, setPath] = useState<GetInvolvedPath>(initialPath)
  const [way, setWay] = useState(initialWay)
  const [form, setForm] = useState({ name: "", email: "", organization: "", subject: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<GetInvolvedPath | null>(null)

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      if (error) setError(null)
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (path === "partner" && !way) {
      setError("Choose the way you would like to work with DEVSA.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/get-involved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, way, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.")
      setDone(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h3 className="text-2xl font-bold tracking-[-0.01em] text-gray-900">
          Thanks, {form.name.split(" ")[0] || "friend"}. We have it.
        </h3>
        <p className="max-w-md text-base leading-relaxed text-gray-600">{CONFIRMATION[done]}</p>
      </div>
    )
  }

  const isPartner = path === "partner"

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <fieldset>
        <legend className={labelClass}>What brings you here?</legend>
        <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PATH_CHOICES.map((p) => {
            const on = path === p.key
            return (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setPath(p.key)
                  setError(null)
                }}
                className={`rounded-xl border px-4 py-2.5 text-left transition-colors ${
                  on
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="block text-sm font-semibold">{p.label}</span>
                <span className={`block text-sm ${on ? "text-white/75" : "text-gray-500"}`}>{p.blurb}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-4 space-y-3.5">
        {/* One field in this slot for either path, so switching between them
            keeps the form the same height instead of jumping by a row. */}
        {isPartner ? (
          <div>
            <span id="gi-way-label" className={labelClass}>
              How would you like to work with DEVSA?
            </span>
            <AdminCombobox
              variant="light"
              options={WAY_OPTIONS}
              value={way}
              onChange={(v) => {
                setWay(v)
                setError(null)
              }}
              placeholder="Choose one"
              ariaLabelledby="gi-way-label"
              buttonClassName="rounded-xl px-3.5 py-2.5 text-base"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="gi-subject" className={labelClass}>
              What&apos;s it about? <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="gi-subject"
              value={form.subject}
              onChange={set("subject")}
              className={inputClass}
              placeholder="A sentence is plenty"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="gi-name" className={labelClass}>Name</label>
            <input id="gi-name" required value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="gi-email" className={labelClass}>Email</label>
            <input id="gi-email" type="email" required value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
          </div>
        </div>

        {/* No Role field: nobody needs a job title to start a conversation,
            and the reply can ask. */}
        <div>
          <label htmlFor="gi-org" className={labelClass}>
            Organization{!isPartner && <span className="font-normal text-gray-500"> (optional)</span>}
          </label>
          <input id="gi-org" required={isPartner} value={form.organization} onChange={set("organization")} className={inputClass} autoComplete="organization" />
        </div>

        <div>
          <label htmlFor="gi-message" className={labelClass}>
            {isPartner ? "What do you have in mind?" : "Your question"}
          </label>
          <textarea id="gi-message" required rows={3} value={form.message} onChange={set("message")} className={inputClass} />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#d93a62] disabled:opacity-60 sm:w-auto"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  )
}
