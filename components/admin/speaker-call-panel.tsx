"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { SpeakerCallFields } from "@/components/admin/speaker-call-fields"

type Call = { speakersOpen: boolean; speakersNote: string; speakersQuestion: string }

/**
 * A group's call for speakers, at the top of the organizer's Speakers tab.
 *
 * It used to sit inside Edit Community, between the group's description and its
 * links: one more box in the group's profile, and easy to miss. A call is not part
 * of the group's listing; it is something an organizer opens and closes, and its
 * talks arrive in this tab. So it lives here, and saves on its own: PUT
 * /api/communities with only the three call fields, which that route applies as a
 * partial update without touching the rest of the group.
 */
export function SpeakerCallPanel({
  group,
  adminFetch,
  onSaved,
  onError,
}: {
  group: { id: string; name: string; speakersOpen?: boolean; speakersNote?: string | null; speakersQuestion?: string | null }
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  /** The saved call, so the page can update its copy of the group. */
  onSaved: (call: Call) => void
  onError: (message: string) => void
}) {
  const saved: Call = {
    speakersOpen: group.speakersOpen === true,
    speakersNote: group.speakersNote ?? "",
    speakersQuestion: group.speakersQuestion ?? "",
  }
  const [draft, setDraft] = useState<Call>(saved)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const dirty =
    draft.speakersOpen !== saved.speakersOpen ||
    draft.speakersNote !== saved.speakersNote ||
    draft.speakersQuestion !== saved.speakersQuestion

  const save = async () => {
    setSaving(true)
    try {
      const res = await adminFetch("/api/communities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: group.id, ...draft }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        onError(data.error || "Couldn't save the call for speakers")
        return
      }
      onSaved(draft)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } catch {
      onError("Couldn't save the call for speakers")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="speaker-call-panel" className="mb-6 scroll-mt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">
          {group.name}&apos;s call for speakers{" "}
          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${saved.speakersOpen ? "bg-[#00b2a9]/15 text-[#5fd6cf]" : "bg-neutral-800 text-neutral-400"}`}>
            {saved.speakersOpen ? "Open" : "Closed"}
          </span>
        </h3>
      </div>
      <SpeakerCallFields
        communityId={group.id}
        open={draft.speakersOpen}
        note={draft.speakersNote}
        question={draft.speakersQuestion}
        onChange={(next) => setDraft(next)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-40"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
        {dirty && !saving && (
          <button type="button" onClick={() => setDraft(saved)} className="text-sm text-neutral-400 hover:text-white">
            Undo changes
          </button>
        )}
        {justSaved && (
          <span className="inline-flex items-center gap-1 text-sm text-[#5fd6cf]" role="status">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </section>
  )
}
