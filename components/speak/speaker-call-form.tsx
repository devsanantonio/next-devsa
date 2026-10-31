"use client"

import { useId, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { AdminCombobox } from "@/components/admin/admin-combobox"
import { GROUP_AUDIENCE_LEVELS, GROUP_TALK_FORMATS, SPEAKER_CALL_LIMITS as L } from "@/lib/speaker-calls"

/**
 * A community group's call-for-speakers form, on its /buildingtogether page, and
 * the same form for the open pool on /give-a-talk (pool: no group, consent required).
 *
 * Posts to /api/call-for-speakers with `communityId`, which the route checks is
 * still open. That route is BotID-protected (instrumentation-client.ts), so this
 * must be a fetch from the page, as it is. Built for the group page's light
 * ground, with its input and button shapes.
 */
export function SpeakerCallForm({
  communityId,
  groupName,
  question,
  pool = false,
}: {
  /** The group's id; absent for the open pool. */
  communityId?: string
  groupName?: string
  question?: string | null
  /** The open pool on /give-a-talk: no group, and the speaker must agree to have DEVSA share the talk. */
  pool?: boolean
}) {
  const [form, setForm] = useState({
    name: "", email: "", sessionTitle: "", sessionFormat: "", audienceLevel: "", abstract: "", linkedin: "", answer: "",
  })
  const [consent, setConsent] = useState(false)
  // Unique per form: /give-a-talk and a group page can both render one.
  const uid = useId()
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sessionFormat || !form.audienceLevel) {
      setError("Choose a format and who the talk is for.")
      return
    }
    setState("sending")
    setError(null)
    try {
      const res = await fetch("/api/call-for-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pool ? { ...form, pool: true, shareConsent: consent } : { ...form, communityId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong. Try again in a moment.")
      setState("sent")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again in a moment.")
      setState("idle")
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6" role="status">
        <p className="flex items-center gap-2 font-semibold text-gray-900">
          <Check className="h-5 w-5 text-[#00b2a9]" /> Your talk is in.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
          {pool
            ? "We read every talk that comes in this way. When yours fits a group, we'll share it with that group's organizers and email you which one. A copy of what you sent is on its way to your inbox."
            : `${groupName}'s organizers read every talk that comes in. If yours fits an upcoming meetup, they'll email you to set a date. A copy of what you sent is on its way to your inbox.`}
        </p>
      </div>
    )
  }

  const input =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
  // The combobox trigger, sized and rounded to match the text fields beside it.
  const combo = "rounded-xl px-4 text-[15px]"
  const label = "mb-1 block text-sm font-semibold text-gray-700"
  const optional = <span className="font-normal text-gray-500"> (optional)</span>

  return (
    // Kept to one screen: the description is three lines, and every field is one the organizers need.
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cfs-name" className={label}>Your name</label>
          <input id="cfs-name" required maxLength={L.name} value={form.name} onChange={set("name")} className={input} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="cfs-email" className={label}>Email</label>
          <input id="cfs-email" required type="email" maxLength={L.email} value={form.email} onChange={set("email")} className={input} autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cfs-title" className={label}>Talk title</label>
          <input id="cfs-title" required maxLength={L.sessionTitle} value={form.sessionTitle} onChange={set("sessionTitle")} className={input} />
        </div>
        <div>
          <label htmlFor="cfs-link" className={label}>LinkedIn, GitHub or personal site</label>
          <input id="cfs-link" type="url" required maxLength={L.link} value={form.linkedin} onChange={set("linkedin")} className={input} placeholder="https://" />
        </div>
      </div>
      {/* The app's own combobox (light), as on the access request form, not a native select.
          Its trigger is a button, so the label names it by id, and the form checks both
          are chosen before sending (a button can't be `required`). */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p id={`${uid}-format`} className={label}>Format</p>
          <AdminCombobox
            variant="light"
            ariaLabelledby={`${uid}-format`}
            options={GROUP_TALK_FORMATS.map((f) => ({ value: f, label: f }))}
            value={form.sessionFormat}
            onChange={(v) => { setForm((f) => ({ ...f, sessionFormat: v })); setError(null) }}
            placeholder="Choose one"
            buttonClassName={combo}
          />
        </div>
        <div>
          <p id={`${uid}-level`} className={label}>Who it&apos;s for</p>
          <AdminCombobox
            variant="light"
            ariaLabelledby={`${uid}-level`}
            options={GROUP_AUDIENCE_LEVELS.map((l) => ({ value: l, label: l }))}
            value={form.audienceLevel}
            onChange={(v) => { setForm((f) => ({ ...f, audienceLevel: v })); setError(null) }}
            placeholder="Choose one"
            buttonClassName={combo}
          />
        </div>
      </div>
      <div>
        <label htmlFor="cfs-abstract" className={label}>What&apos;s the talk about?</label>
        <textarea id="cfs-abstract" required rows={3} maxLength={L.abstract} value={form.abstract} onChange={set("abstract")} className={`${input} resize-y`}
          placeholder="A few sentences: what you'll cover, and what people will leave with." />
      </div>
      {question && (
        <div>
          <label htmlFor="cfs-answer" className={label}>{question}{optional}</label>
          <input id="cfs-answer" maxLength={L.answer} value={form.answer} onChange={set("answer")} className={input} />
        </div>
      )}
      {pool && (
        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-gray-700">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#ef426f]"
          />
          <span>
            OK to share my talk, name and email with the organizers of the groups it might fit. DEVSA emails me each
            time it&apos;s shared.
          </span>
        </label>
      )}
      {error && <p className="text-sm font-medium text-[#c2304f]" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
      >
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        Send your talk
      </button>
    </form>
  )
}
