"use client"

import { useState } from "react"

/**
 * The admin portal's table system. Every list tab — Newsletter, Volunteers,
 * Access Requests, Manage Admins, Confluencia — is built from these pieces so
 * they read as one product instead of five.
 *
 * Typography, smallest to largest:
 *   column heading  12px semibold uppercase, neutral-400
 *   meta / dates    13px, neutral-400, tabular figures
 *   cell text       14px, neutral-200 (secondary) or white medium (primary)
 *   tab title       20px bold
 *
 * The floor is neutral-400. Measured on the panel ground (~#0c0c0c),
 * neutral-500 is 4.3:1 and neutral-600 is 2.5:1 — both under WCAG AA's 4.5:1
 * — so neither is used for anything a person has to read. Long text (notes,
 * messages) is clamped to two lines with a "Show more" toggle so one long
 * submission cannot push the rest of the table off screen.
 */

export function TabHeader({
  title,
  summary,
  actions,
}: {
  title: string
  summary?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        {summary && <p className="mt-1 text-sm text-neutral-400">{summary}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

export function DataTable({
  minWidth = "min-w-[44rem]",
  children,
}: {
  minWidth?: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className={`w-full ${minWidth} border-collapse text-left`}>{children}</table>
    </div>
  )
}

export function Th({
  children,
  align = "left",
  className = "",
}: {
  children?: React.ReactNode
  align?: "left" | "right"
  className?: string
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-neutral-800 bg-neutral-900/80 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  )
}

export function Tr({
  children,
  highlight = false,
}: {
  children: React.ReactNode
  /** A row that wants attention: new, pending, unread. */
  highlight?: boolean
}) {
  return (
    <tr
      className={`border-b border-neutral-800/70 align-top transition-colors last:border-b-0 hover:bg-neutral-800/30 ${
        highlight ? "bg-amber-500/[0.04] shadow-[inset_3px_0_0_rgb(245_158_11/0.6)]" : ""
      }`}
    >
      {children}
    </tr>
  )
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children?: React.ReactNode
  align?: "left" | "right"
  className?: string
}) {
  return (
    <td
      className={`px-4 py-3.5 text-sm text-neutral-200 ${align === "right" ? "text-right" : ""} ${className}`}
    >
      {children}
    </td>
  )
}

/** The first column: a name or organization, with an optional line under it. */
export function PrimaryCell({
  title,
  sub,
}: {
  title: React.ReactNode
  sub?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="font-medium leading-snug text-white">{title}</div>
      {sub && <div className="mt-0.5 text-[13px] leading-snug text-neutral-400">{sub}</div>}
    </div>
  )
}

export function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="break-all text-neutral-300 underline-offset-2 hover:text-white hover:underline"
    >
      {email}
    </a>
  )
}

const PILL_TONES = {
  neutral: "bg-neutral-700/60 text-neutral-200",
  pink: "bg-[#ef426f]/15 text-[#ff7a9c]",
  amber: "bg-amber-500/15 text-amber-300",
  green: "bg-emerald-500/15 text-emerald-300",
  red: "bg-red-500/15 text-red-300",
  blue: "bg-sky-500/15 text-sky-300",
  violet: "bg-violet-500/15 text-violet-300",
} as const

export type PillTone = keyof typeof PILL_TONES

/** Sentence case, not uppercase: these are read, not scanned as labels. */
export function Pill({ tone = "neutral", children }: { tone?: PillTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
  )
}

/** "Oct 12, 2026" over "3:41 PM" — one format for every date column. */
export function DateCell({ value, time = false }: { value?: string | null; time?: boolean }) {
  if (!value) return <span className="text-neutral-400">—</span>
  const d = new Date(value)
  return (
    <div className="whitespace-nowrap tabular-nums" title={d.toLocaleString()}>
      <div className="text-neutral-200">
        {d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </div>
      {time && (
        <div className="text-[13px] text-neutral-400">
          {d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </div>
      )}
    </div>
  )
}

/** Long free text, clamped to two lines until asked for. */
export function LongText({ text }: { text?: string | null }) {
  const [open, setOpen] = useState(false)
  if (!text) return <span className="text-neutral-400">—</span>
  const long = text.length > 140 || text.includes("\n")
  return (
    <div className="max-w-prose">
      <p className={`whitespace-pre-wrap leading-relaxed text-neutral-200 ${open ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      {long && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-1 text-[13px] font-medium text-neutral-400 hover:text-white"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

const ACTION_TONES = {
  default: "text-neutral-300 hover:bg-neutral-800 hover:text-white",
  success: "text-emerald-300 hover:bg-emerald-500/15",
  danger: "text-red-300 hover:bg-red-500/15",
} as const

/** Row actions: quiet text buttons, so a column of them doesn't shout. */
export function RowAction({
  tone = "default",
  icon,
  children,
  ...props
}: {
  tone?: keyof typeof ACTION_TONES
  icon?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${ACTION_TONES[tone]}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 px-6 py-12 text-center text-sm text-neutral-400">
      {children}
    </div>
  )
}

/** The secondary toolbar button (Export CSV and the like). */
export function ToolbarButton({
  icon,
  children,
  ...props
}: { icon?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white disabled:opacity-50"
    >
      {icon}
      {children}
    </button>
  )
}
