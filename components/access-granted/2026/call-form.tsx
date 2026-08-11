"use client"

import { useState } from "react"
import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitButton } from "@/components/access-granted/2026/button-styles"
import {
  ACCESS_GREEN,
  AG_AUDIENCE_LEVELS,
  AG_CFS_CLOSES_LABEL,
  AG_EVENT_ID,
  AG_FIRST_TIME_SPEAKER,
  AG_INTENTS,
  AG_SESSION_FORMATS,
  AG_VOLUNTEER,
  type AgCfsPhase,
  type AgIntent,
} from "@/data/access-granted/2026"

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white transition-all placeholder:text-white/30 focus:border-[#00ff66] focus:outline-none focus:ring-2 focus:ring-[#00ff66]/25"

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
          ? "border-transparent bg-[#00ff66] text-[#0a0a0a]"
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

/**
 * One form for both open calls.
 *
 * There used to be two, in two sections, and they asked the same person the
 * same underlying question — "do you want to be part of running this". Someone
 * who would happily do either had to decide which page they were on before
 * they could answer, and someone who wanted both had to fill in two forms.
 *
 * So: an intent picker at the top, and the rest of the form follows from it.
 * The talk fields only exist for `talk` and `both`; the volunteer path is name,
 * email and a free-text note, because there is nothing else worth asking (see
 * AG_VOLUNTEER for why the role picker went).
 *
 * ## Submission
 *
 * Two endpoints, because the two records are genuinely different shapes and
 * live in different collections:
 *
 *   · a talk POSTs /api/call-for-speakers with AG_EVENT_ID, the same endpoint
 *     PySanAntonio uses, which switches its confirmation email on the event id
 *   · a volunteer POSTs /api/volunteers
 *
 * `both` posts to both, talk first. If the talk write succeeds and the
 * volunteer write fails, the submission is still reported as a success and the
 * failure is logged — losing a conference talk because a secondary signup
 * 500'd would be the worse outcome, and the organisers can see from the
 * speaker record that someone offered.
 */
export function AccessGrantedCallForm({ phase }: { phase: AgCfsPhase }) {
  const [intent, setIntent] = useState<AgIntent>("talk")
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    linkedin: "",
    sessionTitle: "",
    sessionFormat: "",
    audienceLevel: "",
    abstract: "",
    bio: "",
    notes: "",
  })
  const [firstTimer, setFirstTimer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const wantsTalk = intent === "talk" || intent === "both"
  const wantsVolunteer = intent === "volunteer" || intent === "both"

  // Once the call for talks closes the picker is pointless — volunteering is
  // the only thing still open, so the form becomes that and says so.
  const talkClosed = phase === "closed"

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

    if (wantsTalk && !talkClosed) {
      if (!form.sessionTitle.trim()) {
        setError("Give your talk a title.")
        return
      }
      if (!form.sessionFormat) {
        setError("Pick a format.")
        return
      }
      if (!form.audienceLevel) {
        setError("Tell us who the talk is for.")
        return
      }
      if (!form.abstract.trim()) {
        setError("Tell us what the talk is.")
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (wantsTalk && !talkClosed) {
        const res = await fetch("/api/call-for-speakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            company: form.company,
            linkedin: form.linkedin,
            sessionTitle: form.sessionTitle,
            sessionFormat: form.sessionFormat,
            audienceLevel: form.audienceLevel,
            abstract: form.abstract,
            bio: form.bio,
            accommodations: form.notes,
            considerFor: firstTimer ? AG_FIRST_TIME_SPEAKER : "",
            // Tells the confirmation and the organiser notification that the
            // same person is also signing up to help.
            alsoVolunteering: intent === "both",
            eventId: AG_EVENT_ID,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to submit")
      }

      if (wantsVolunteer || talkClosed) {
        try {
          const res = await fetch("/api/volunteers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              notes: form.notes,
              eventId: AG_EVENT_ID,
              // Suppressed on "Both" — the speaker confirmation already says
              // they offered to help, and two emails for one submit reads as
              // a bug. The organiser notification still fires either way.
              sendConfirmation: intent !== "both",
            }),
          })
          if (!res.ok) {
            const data = await res.json()
            // Only fatal when volunteering is the whole submission. Alongside a
            // talk that already saved, this must not lose the talk.
            if (!wantsTalk || talkClosed) throw new Error(data.error || "Failed to submit")
            console.error("Volunteer signup failed alongside a talk:", data.error)
          }
        } catch (volunteerError) {
          if (!wantsTalk || talkClosed) throw volunteerError
          console.error("Volunteer signup failed alongside a talk:", volunteerError)
        }
      }

      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const spoke = wantsTalk && !talkClosed
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-10 text-center">
        <CheckCircle2 className="h-12 w-12" style={{ color: ACCESS_GREEN }} />
        <h3 className="text-xl font-bold text-white">
          {spoke ? "Got it — you're in the pile" : "You're on the crew"}
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/60">
          Thanks, {form.name.split(" ")[0] || "friend"}.{" "}
          {spoke
            ? `The call closes ${AG_CFS_CLOSES_LABEL} and you'll hear back by email either way.`
            : "One of the organisers will be in touch with what we need covered."}
          {spoke && firstTimer
            ? " We'll also be in touch about pairing you with someone for a practice run."
            : ""}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-8"
    >
      {/* Intent first — everything below follows from it. */}
      {talkClosed ? (
        <div className="flex items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-4">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ACCESS_GREEN }} />
          <p className="text-sm leading-relaxed text-white/70">
            <strong className="font-semibold text-white">
              The call for talks closed {AG_CFS_CLOSES_LABEL}.
            </strong>{" "}
            We&apos;re reading everything before the lineup goes out. The room
            still needs hands, though — that part stays open.
          </p>
        </div>
      ) : (
        <fieldset>
          <legend className={labelClass}>What are you here for? *</legend>
          <div className="flex flex-wrap gap-2">
            {AG_INTENTS.map((i) => (
              <ChipRadio
                key={i.value}
                name="intent"
                value={i.value}
                checked={intent === i.value}
                onChange={(v) => {
                  setIntent(v as AgIntent)
                  if (error) setError(null)
                }}
              >
                {i.label}
              </ChipRadio>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ag-name">
            Name *
          </label>
          <input
            id="ag-name"
            name="name"
            required
            value={form.name}
            onChange={onChange}
            className={inputClass}
            placeholder="Your name or handle"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ag-email">
            Email *
          </label>
          <input
            id="ag-email"
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

      {wantsTalk && !talkClosed && (
        <>
          <div>
            <label className={labelClass} htmlFor="ag-title">
              Talk title *
            </label>
            <input
              id="ag-title"
              name="sessionTitle"
              value={form.sessionTitle}
              onChange={onChange}
              className={inputClass}
              placeholder="What are you calling it?"
            />
          </div>

          <fieldset>
            <legend className={labelClass}>How long? *</legend>
            <div className="flex flex-wrap gap-2">
              {AG_SESSION_FORMATS.map((f) => (
                <ChipRadio
                  key={f}
                  name="sessionFormat"
                  value={f}
                  checked={form.sessionFormat === f}
                  onChange={set("sessionFormat")}
                >
                  {f}
                </ChipRadio>
              ))}
            </div>
            <p className={hintClass}>
              The main slots are 40 minutes. The shorter two are there if you
              have one good finding and don&apos;t want the stage that long.
            </p>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Who is it for? *</legend>
            <div className="flex flex-wrap gap-2">
              {AG_AUDIENCE_LEVELS.map((a) => (
                <ChipRadio
                  key={a}
                  name="audienceLevel"
                  value={a}
                  checked={form.audienceLevel === a}
                  onChange={set("audienceLevel")}
                >
                  {a}
                </ChipRadio>
              ))}
            </div>
          </fieldset>

          <div>
            <label className={labelClass} htmlFor="ag-abstract">
              What&apos;s the talk? *
            </label>
            <textarea
              id="ag-abstract"
              name="abstract"
              rows={5}
              value={form.abstract}
              onChange={onChange}
              className={inputClass}
              placeholder="What did you take apart, and what did you find? A live demo or a screenshot of something breaking counts for a lot here."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="ag-company">
                Company or crew
              </label>
              <input
                id="ag-company"
                name="company"
                value={form.company}
                onChange={onChange}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ag-linkedin">
                Somewhere we can see your work
              </label>
              <input
                id="ag-linkedin"
                name="linkedin"
                value={form.linkedin}
                onChange={onChange}
                className={inputClass}
                placeholder="github.com/you, your site, LinkedIn…"
              />
              <p className={hintClass}>
                Optional. Used to credit you on the schedule, and it helps if
                we&apos;re deciding between two talks on the same thing.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="ag-bio">
              Short bio
            </label>
            <textarea
              id="ag-bio"
              name="bio"
              rows={2}
              value={form.bio}
              onChange={onChange}
              className={inputClass}
              placeholder="A couple of sentences for the schedule — optional"
            />
          </div>

          {/* The reserved slot, asked directly rather than left in the copy.
              Someone who has never done this needs to be invited. */}
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
              firstTimer
                ? "border-[#00ff66]/50 bg-[#00ff66]/5"
                : "border-white/15 hover:border-white/25"
            )}
          >
            <input
              type="checkbox"
              checked={firstTimer}
              onChange={(e) => setFirstTimer(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#00ff66]"
            />
            <span className="text-sm text-white/70">
              <strong className="font-semibold text-white">
                This would be my first conference talk.
              </strong>{" "}
              One slot is held for exactly that, and we&apos;ll pair you with an
              experienced speaker for a practice run.
            </span>
          </label>
        </>
      )}

      <div>
        <label className={labelClass} htmlFor="ag-notes">
          {wantsTalk && !talkClosed
            ? "Anything else we should know?"
            : "Anything we should know?"}
        </label>
        <textarea
          id="ag-notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={onChange}
          className={inputClass}
          placeholder={
            wantsTalk && !talkClosed
              ? "A/V needs, access needs, timing constraints — optional"
              : "Hours you can cover, anything you'd rather not do, kit you can bring — optional"
          }
        />
        {(wantsVolunteer || talkClosed) && (
          <p className={hintClass}>{AG_VOLUNTEER.followUp}</p>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-400" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className={submitButton}>
        {isSubmitting
          ? "Sending…"
          : wantsTalk && !talkClosed
            ? "Send it in"
            : "Count me in"}
      </button>
    </form>
  )
}
