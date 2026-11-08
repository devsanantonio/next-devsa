"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { SlideDrawer } from "@/components/admin/slide-drawer"
import { SPEAKER_CALL_LIMITS as L } from "@/lib/speaker-calls"

type Call = { speakersOpen: boolean; speakersNote: string; speakersQuestion: string }

/**
 * "Open a call for speakers", from the Overview's quick actions.
 *
 * The action used to switch to the Speakers tab and focus an unticked checkbox at
 * the top of SpeakerCallPanel. Organizers didn't see what they were meant to do
 * there: the tab changed, a box sat unticked, and nothing said "this is the step".
 * Here the action is the thing itself: what opening a call does, the two optional
 * fields, and one button that opens it. Closing or editing a call later stays on
 * the Speakers tab, in SpeakerCallPanel. Same save as that panel: PUT
 * /api/communities with only the three call fields.
 */
export function SpeakerCallDrawer({
  open,
  onClose,
  group,
  adminFetch,
  onSaved,
  onError,
}: {
  open: boolean
  onClose: () => void
  group: { id: string; name: string; speakersNote?: string | null; speakersQuestion?: string | null } | null
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  onSaved: (call: Call) => void
  onError: (message: string) => void
}) {
  const [note, setNote] = useState("")
  const [question, setQuestion] = useState("")
  const [saving, setSaving] = useState(false)

  // Start from whatever the group last said, each time the drawer opens.
  useEffect(() => {
    if (open && group) {
      setNote(group.speakersNote ?? "") // eslint-disable-line react-hooks/set-state-in-effect -- reset the form on open
      setQuestion(group.speakersQuestion ?? "")
    }
  }, [open, group])

  if (!group) return null

  const openCall = async () => {
    setSaving(true)
    const call: Call = { speakersOpen: true, speakersNote: note.trim(), speakersQuestion: question.trim() }
    try {
      const res = await adminFetch("/api/communities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: group.id, ...call }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        onError(data.error || "Couldn't open the call for speakers")
        return
      }
      onSaved(call)
      onClose()
    } catch {
      onError("Couldn't open the call for speakers")
    } finally {
      setSaving(false)
    }
  }

  const input =
    "w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"

  return (
    <SlideDrawer open={open} onClose={onClose} title="Open a call for speakers" subtitle={group.name} widthClass="max-w-xl">
      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-sm font-semibold text-white">What opening a call does</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-300">
            <li>Your group&apos;s page gets a &ldquo;Speak at {group.name}&rdquo; form.</li>
            <li>devsa.community/give-a-talk lists your group as looking for speakers.</li>
            <li>Talk ideas arrive in your Speakers tab, and by email.</li>
          </ul>
          <p className="mt-2 text-xs text-neutral-400">You can close it any time from the Speakers tab.</p>
        </div>

        <div>
          <label htmlFor="call-note" className="mb-2 block text-sm font-semibold text-neutral-300">
            What you&apos;re looking for <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="call-note"
            rows={3}
            maxLength={L.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="E.g. Lightning talks on anything Python, especially first-time speakers."
            className={input}
          />
        </div>
        <div>
          <label htmlFor="call-question" className="mb-2 block text-sm font-semibold text-neutral-300">
            One question of your own <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            id="call-question"
            type="text"
            maxLength={L.question}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="E.g. Which month works best for you?"
            className={input}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={openCall}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Open the call
          </button>
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-neutral-600 px-5 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-700/60">
            Cancel
          </button>
        </div>
      </div>
    </SlideDrawer>
  )
}
