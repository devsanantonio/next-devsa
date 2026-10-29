"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Lock, Send } from "lucide-react"
import { NewsletterEmail } from "@/lib/emails/newsletter"

/**
 * Write and send the newsletter (the Newsletter tab's drawer). Rules and the
 * unsubscribe mechanics live in lib/newsletter.ts and /api/admin/newsletter.
 *
 * The preview is the real email: the same template the server sends, rendered
 * here in an iframe. Send a test to yourself first; the button to send to
 * everyone names the exact count, and the server refuses if the list changed.
 */

interface Status {
  ready: boolean
  missing: string[]
  postalAddress: string | null
  active: number
  sends: { id: string; at: string | null; by: string; subject: string; sent: number; total: number; failed: number; status: string }[]
}

const field =
  "w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"

export function NewsletterComposer({
  adminFetch,
  onSent,
}: {
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  onSent: (message: string) => void
}) {
  const [status, setStatus] = useState<Status | null>(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [view, setView] = useState<"write" | "preview">("write")
  const [busy, setBusy] = useState<null | "test" | "send">(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await adminFetch("/api/admin/newsletter")
    const data = await res.json().catch(() => null)
    if (res.ok && data) setStatus(data)
    else setError(data?.error || "Couldn't load the newsletter settings")
  }, [adminFetch])

  useEffect(() => {
    load()
  }, [load])

  const preview = useMemo(
    () =>
      NewsletterEmail({
        subject: subject || "Your subject",
        body: body || "Your message.",
        unsubscribeUrl: "#",
        postalAddress: status?.postalAddress || "[mailing address]",
      }),
    [subject, body, status?.postalAddress]
  )

  const send = async (test: boolean) => {
    if (!status) return
    if (!test && !confirm(`Send "${subject}" to ${status.active} subscribers? This can't be undone.`)) return
    setBusy(test ? "test" : "send")
    setError(null)
    setNote(null)
    try {
      const res = await adminFetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, test, expected: status.active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Couldn't send")
        if (typeof data.active === "number") setStatus({ ...status, active: data.active })
        return
      }
      if (test) {
        setNote(`Test sent to ${data.to}. Check it on your phone too before sending to everyone.`)
      } else {
        onSent(`Newsletter sent to ${data.sent} of ${data.total}${data.failed ? ` (${data.failed} failed)` : ""}`)
        setSubject("")
        setBody("")
        await load()
      }
    } catch {
      setError("Couldn't send")
    } finally {
      setBusy(null)
    }
  }

  if (!status) {
    return error ? (
      <p className="text-sm text-red-400">{error}</p>
    ) : (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  const canSend = status.ready && subject.trim() !== "" && body.trim() !== "" && !busy

  return (
    <div className="space-y-5">
      {!status.ready && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            Sending is locked until {status.missing.join(" and ")} {status.missing.length === 1 ? "is" : "are"} set in Vercel.
            Every newsletter has to carry a mailing address and a working unsubscribe link. You can write and preview in the meantime.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="nl-subject" className="mb-2 block text-sm font-semibold text-neutral-300">Subject</label>
        <input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="What's on in November" className={field} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="nl-body" className="text-sm font-semibold text-neutral-300">Message</label>
          <div className="flex rounded-lg bg-neutral-800 p-0.5 text-xs font-semibold" role="group" aria-label="Write or preview">
            {(["write", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`rounded-md px-3 py-1 capitalize transition-colors ${view === v ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {view === "write" ? (
          <>
            <textarea id="nl-body" value={body} onChange={(e) => setBody(e.target.value)} rows={14} className={`${field} resize-y leading-relaxed`} placeholder={"Hi everyone,\n\nHere's what's coming up:\n\n- Python Night, Nov 10: https://www.devsa.community/events/…\n- Community Roundtable, Nov 18\n\nSee you there."} />
            <p className="mt-1.5 text-xs text-neutral-400">A blank line starts a new paragraph. Lines starting &ldquo;- &rdquo; become a list. Web addresses become links.</p>
          </>
        ) : (
          <iframe title="Newsletter preview" srcDoc={preview} sandbox="" className="h-[32rem] w-full rounded-xl border border-neutral-700 bg-[#0a0a0a]" />
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {note && <p className="text-sm text-emerald-300">{note}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => send(true)}
          disabled={!canSend}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-600 px-4 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy === "test" && <Loader2 className="h-4 w-4 animate-spin" />}
          Send me a test
        </button>
        <button
          type="button"
          onClick={() => send(false)}
          disabled={!canSend || status.active === 0}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50"
        >
          {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send to {status.active} subscribers
        </button>
      </div>

      {status.sends.length > 0 && (
        <div className="border-t border-neutral-800 pt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Sent before</p>
          <ul className="space-y-2 text-sm">
            {status.sends.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-x-3 text-neutral-300">
                <span className="min-w-0 truncate text-white">{s.subject}</span>
                <span className="text-neutral-400">
                  {s.at ? new Date(s.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""} · {s.status === "sending" ? "sending…" : `${s.sent} of ${s.total}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
