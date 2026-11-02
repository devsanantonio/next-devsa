"use client"

import { ExternalLink } from "lucide-react"
import { SPEAKER_CALL_LIMITS as L } from "@/lib/speaker-calls"

/**
 * The group's call for speakers (lib/speaker-calls.ts), in SpeakerCallPanel at the
 * top of the organizer's Speakers tab.
 * Open, the group page shows a "Speak at …" form and /give-a-talk lists the group;
 * talks land in this organizer's Speakers tab. Saved with the rest of the form.
 */
export function SpeakerCallFields({
  communityId,
  open,
  note,
  question,
  onChange,
}: {
  communityId: string
  open?: boolean
  note?: string | null
  question?: string | null
  onChange: (next: { speakersOpen: boolean; speakersNote: string; speakersQuestion: string }) => void
}) {
  const value = { speakersOpen: open === true, speakersNote: note ?? "", speakersQuestion: question ?? "" }
  const input =
    "w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
  return (
    <fieldset className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.speakersOpen}
          onChange={(e) => onChange({ ...value, speakersOpen: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[#ef426f]"
        />
        <span>
          <span className="block text-sm font-semibold text-white">Looking for speakers</span>
          <span className="mt-0.5 block text-sm text-neutral-400">
            Adds a talk form to your group&apos;s page and lists you on devsa.community/give-a-talk. Talks arrive in your
            Speakers tab, and by email.
          </span>
        </span>
      </label>
      {value.speakersOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">What you&apos;re looking for (optional)</label>
            <textarea
              rows={3}
              maxLength={L.note}
              value={value.speakersNote}
              onChange={(e) => onChange({ ...value, speakersNote: e.target.value })}
              placeholder="E.g. Lightning talks on anything Python, especially first-time speakers."
              className={`${input} resize-none`}
            />
            <p className="mt-1 text-xs text-neutral-400">{value.speakersNote.length}/{L.note}. Left blank, the page uses a general invitation.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-300">One question of your own (optional)</label>
            <input
              maxLength={L.question}
              value={value.speakersQuestion}
              onChange={(e) => onChange({ ...value, speakersQuestion: e.target.value })}
              placeholder="E.g. Which month works best for you?"
              className={input}
            />
          </div>
          <a
            href={`/buildingtogether/${communityId}#speak`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white"
          >
            The link to share: devsa.community/buildingtogether/{communityId}#speak <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </fieldset>
  )
}
