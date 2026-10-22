"use client"

import { useState, useRef } from "react"
import { Bold, Italic, Heading, List, ListOrdered, Link as LinkIcon, X } from "lucide-react"
import { EventDescription } from "@/components/events/event-description"

interface RichTextEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  className?: string
  darkMode?: boolean
}

type LineFormat = "heading" | "bullet" | "numbered"

const LINE_PREFIX: Record<LineFormat, RegExp> = {
  heading: /^#{1,6}\s+/,
  // "-" and "*" only with a space after, so "*italic*" and "-5°F" keep their first character.
  bullet: /^(?:[-*]\s+|[•●○◦▪▫·‣]\s*)/,
  numbered: /^\d+[.)]\s+/,
}

/**
 * A markdown textarea for event descriptions, with a toolbar and a preview.
 *
 * The toolbar used to float over the textarea and appear only once text was
 * selected, positioned by guessing 8px per character — so it was invisible
 * until you knew to look for it, and landed in the wrong place on long lines.
 * It is fixed now, and every button works with or without a selection. Preview
 * renders through EventDescription, the same component the event page uses,
 * so an organizer sees exactly what attendees will.
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Enter description...",
  rows = 5,
  required = false,
  className = "",
  darkMode = true,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<"write" | "preview">("write")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  // The selection is lost when focus moves to the link input, so hold it.
  const [linkSelection, setLinkSelection] = useState<{ start: number; end: number } | null>(null)

  /** Replace [start, end) and put the caret (or a selection) back where it belongs. */
  const replaceRange = (start: number, end: number, text: string, selectFrom?: number, selectTo?: number) => {
    onChange(value.slice(0, start) + text + value.slice(end))
    setTimeout(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(selectFrom ?? start + text.length, selectTo ?? start + text.length)
    }, 0)
  }

  const wrapInline = (marker: string, placeholderText: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart: start, selectionEnd: end } = textarea
    const selected = value.slice(start, end)
    // Unwrap if the selection is already wrapped.
    if (selected.length > marker.length * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
      replaceRange(start, end, selected.slice(marker.length, -marker.length))
      return
    }
    const inner = selected || placeholderText
    // With nothing selected, select the placeholder so typing replaces it.
    replaceRange(start, end, `${marker}${inner}${marker}`, start + marker.length, start + marker.length + inner.length)
  }

  /** Headings and lists apply to whole lines, so widen the selection to them. */
  const toggleLines = (format: LineFormat) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const lineStart = value.lastIndexOf("\n", textarea.selectionStart - 1) + 1
    const nextBreak = value.indexOf("\n", textarea.selectionEnd)
    const lineEnd = nextBreak === -1 ? value.length : nextBreak
    const lines = value.slice(lineStart, lineEnd).split("\n")
    const content = lines.filter(l => l.trim())

    // Every line already has it: take it off. Otherwise put it on, replacing
    // any other line format (a bullet becomes a number, not "1. - item").
    const allHave = content.length > 0 && content.every(l => LINE_PREFIX[format].test(l.trim()))
    let n = 0
    const next = lines.map(line => {
      const bare = Object.values(LINE_PREFIX).reduce((l, re) => l.replace(re, ""), line.trim())
      if (!line.trim()) return line
      if (allHave) return bare
      if (format === "heading") return `## ${bare}`
      if (format === "bullet") return `- ${bare}`
      return `${++n}. ${bare}`
    })
    const text = next.join("\n") || (format === "heading" ? "## " : format === "bullet" ? "- " : "1. ")
    replaceRange(lineStart, lineEnd, text)
  }

  const openLinkInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    setLinkSelection({ start: textarea.selectionStart, end: textarea.selectionEnd })
    setShowLinkInput(true)
  }

  const handleLinkSubmit = () => {
    const url = linkUrl.trim()
    if (url && linkSelection) {
      const href = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`
      const label = value.slice(linkSelection.start, linkSelection.end) || url.replace(/^https?:\/\//, "")
      replaceRange(linkSelection.start, linkSelection.end, `[${label}](${href})`)
    }
    setShowLinkInput(false)
    setLinkUrl("")
    setLinkSelection(null)
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      handleLinkSubmit()
    }
    if (e.key === "Escape") setShowLinkInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return
    const key = e.key.toLowerCase()
    if (key === "b") {
      e.preventDefault()
      wrapInline("**", "bold text")
    } else if (key === "i") {
      e.preventDefault()
      wrapInline("*", "italic text")
    } else if (key === "k") {
      e.preventDefault()
      openLinkInput()
    }
  }

  /**
   * A list copied from a doc, an email or a web page pastes as "•" or "●"
   * plus a tab. The page renders those either way, but storing them as "- "
   * keeps the textarea readable and the toolbar's toggles working on them.
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text/plain")
    const normalized = pasted.replace(/^[ \t]*[•●○◦▪▫·‣][ \t]*/gm, "- ")
    if (normalized === pasted) return
    e.preventDefault()
    const { selectionStart: start, selectionEnd: end } = e.currentTarget
    replaceRange(start, end, normalized)
  }

  const surface = darkMode
    ? "border-gray-700 bg-gray-800"
    : "border-gray-300 bg-white"
  const textareaClass = darkMode
    ? "w-full bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none resize-y min-h-[200px] leading-relaxed"
    : "w-full bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none resize-y min-h-[200px] leading-relaxed"
  const toolButton = darkMode
    ? "p-1.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
    : "p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
  const tab = (active: boolean) =>
    `px-2.5 py-1 rounded text-xs font-medium transition-colors ${
      active
        ? darkMode ? "bg-neutral-700 text-white" : "bg-gray-200 text-gray-900"
        : darkMode ? "text-neutral-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
    }`
  const writing = mode === "write"

  return (
    <div>
      <div
        className={`rounded-xl border overflow-hidden focus-within:border-[#ef426f] focus-within:ring-2 focus-within:ring-[#ef426f]/20 ${surface} ${className}`}
      >
        <div
          className={`flex items-center gap-1 px-2 py-1.5 border-b ${
            darkMode ? "border-gray-700 bg-neutral-900/60" : "border-gray-200 bg-gray-50"
          }`}
        >
          {showLinkInput ? (
            <div className="flex flex-1 items-center gap-1.5">
              <input
                type="text"
                inputMode="url"
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="Paste a link, then press Enter"
                className={`flex-1 px-2 py-1 text-sm rounded border focus:outline-none focus:border-[#ef426f] ${
                  darkMode
                    ? "bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
              <button type="button" onClick={handleLinkSubmit} className={toolButton} title="Add link">
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false)
                  setLinkUrl("")
                }}
                className={toolButton}
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <button type="button" disabled={!writing} onClick={() => wrapInline("**", "bold text")} className={toolButton} title="Bold (⌘B)">
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" disabled={!writing} onClick={() => wrapInline("*", "italic text")} className={toolButton} title="Italic (⌘I)">
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" disabled={!writing} onClick={() => toggleLines("heading")} className={toolButton} title="Heading (## text)">
                <Heading className="h-4 w-4" />
              </button>
              <button type="button" disabled={!writing} onClick={() => toggleLines("bullet")} className={toolButton} title="Bullet list (- item)">
                <List className="h-4 w-4" />
              </button>
              <button type="button" disabled={!writing} onClick={() => toggleLines("numbered")} className={toolButton} title="Numbered list (1. item)">
                <ListOrdered className="h-4 w-4" />
              </button>
              <button type="button" disabled={!writing} onClick={openLinkInput} className={toolButton} title="Link (⌘K)">
                <LinkIcon className="h-4 w-4" />
              </button>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => setMode("write")} className={tab(writing)}>
                  Write
                </button>
                <button type="button" onClick={() => setMode("preview")} className={tab(!writing)}>
                  Preview
                </button>
              </div>
            </>
          )}
        </div>

        {/* The textarea stays mounted in preview so `required` still validates. */}
        <textarea
          ref={textareaRef}
          id={id}
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          // A required, empty description fails validation while hidden in
          // preview; the browser can't focus it to say why, so bring it back.
          onInvalid={() => setMode("write")}
          placeholder={placeholder}
          className={`${textareaClass} ${writing ? "" : "hidden"}`}
        />
        {!writing && (
          // White, like the event page, whatever the admin's theme.
          <div className="bg-white px-5 py-4 min-h-50">
            {value.trim() ? (
              <EventDescription text={value} />
            ) : (
              <p className="text-sm text-gray-400">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        <span className="font-mono">**bold**</span> · <span className="font-mono">*italic*</span> ·{" "}
        <span className="font-mono">## Heading</span> · <span className="font-mono">- bullet</span> ·{" "}
        <span className="font-mono">1. numbered</span> · <span className="font-mono">[text](https://…)</span>. Links
        pasted on their own work too. Lists pasted from a doc keep their bullets.
      </p>
    </div>
  )
}
