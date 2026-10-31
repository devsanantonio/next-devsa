"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { GROUP_AUDIENCE_LEVELS, GROUP_TALK_FORMATS, SPEAKER_CALL_LIMITS as L } from "@/lib/speaker-calls"

/**
 * A community group's call-for-speakers form, on its /buildingtogether page.
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
}: {
  communityId: string
  groupName: string
  question?: string | null
}) {
  const [form, setForm] = useState({
    name: "", email: "", sessionTitle: "", sessionFormat: "", audienceLevel: "", abstract: "", bio: "", linkedin: "", answer: "",
  })
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState("sending")
    setError(null)
    try {
      const res = await fetch("/api/call-for-speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, communityId }),
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
          {groupName}&apos;s organizers read every talk that comes in. If yours fits an upcoming meetup, they&apos;ll
          email you to set a date. A copy of what you sent is on its way to your inbox.
        </p>
      </div>
    )
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
  const label = "mb-1.5 block text-sm font-semibold text-gray-700"
  const optional = <span className="font-normal text-gray-500"> (optional)</span>

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cfs-name" className={label}>Your name</label>
          <input id="cfs-name" required maxLength={L.name} value={form.name} onChange={set("name")} className={input} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="cfs-email" className={label}>Email</label>
          <input id="cfs-email" required type="email" maxLength={L.email} value={form.email} onChange={set("email")} className={input} autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="cfs-title" className={label}>Talk title</label>
        <input id="cfs-title" required maxLength={L.sessionTitle} value={form.sessionTitle} onChange={set("sessionTitle")} className={input} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cfs-format" className={label}>Format</label>
          <select id="cfs-format" required value={form.sessionFormat} onChange={set("sessionFormat")} className={input}>
            <option value="" disabled>Choose one</option>
            {GROUP_TALK_FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cfs-level" className={label}>Who it&apos;s for</label>
          <select id="cfs-level" required value={form.audienceLevel} onChange={set("audienceLevel")} className={input}>
            <option value="" disabled>Choose one</option>
            {GROUP_AUDIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cfs-abstract" className={label}>What&apos;s the talk about?</label>
        <textarea id="cfs-abstract" required rows={5} maxLength={L.abstract} value={form.abstract} onChange={set("abstract")} className={`${input} resize-y`}
          placeholder="A few sentences: what you'll cover, and what people will leave with." />
      </div>
      <div>
        <label htmlFor="cfs-bio" className={label}>A little about you{optional}</label>
        <textarea id="cfs-bio" rows={3} maxLength={L.bio} value={form.bio} onChange={set("bio")} className={`${input} resize-y`} />
      </div>
      <div>
        <label htmlFor="cfs-link" className={label}>LinkedIn, GitHub or website{optional}</label>
        <input id="cfs-link" type="url" maxLength={L.link} value={form.linkedin} onChange={set("linkedin")} className={input} placeholder="https://" />
      </div>
      {question && (
        <div>
          <label htmlFor="cfs-answer" className={label}>{question}{optional}</label>
          <textarea id="cfs-answer" rows={2} maxLength={L.answer} value={form.answer} onChange={set("answer")} className={`${input} resize-y`} />
        </div>
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
