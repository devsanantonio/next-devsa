"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Search } from "lucide-react"
import { AdminCombobox } from "@/components/admin/admin-combobox"

/**
 * "Browse every layer": the whole localhost catalog, searchable.
 *
 * One place to find them, made literal: every public layer from every publisher,
 * refreshed each Monday by the localhost repo's weekly check. It loads only when
 * it scrolls into view (/api/localhost/catalog, about 300 KB before compression), and searches in
 * the browser, so typing costs nothing.
 *
 * Each row links to the layer's own address, which opens the publisher's service
 * page; `peek <address>` in the repo shows its fields and rows.
 */
type Row = { t: string; p: string; u: string; m: string }

const SHOW = 40

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export function LayerCatalog({ publishers }: { publishers: { name: string; count: number }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [q, setQ] = useState("")
  const [who, setWho] = useState("")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        fetch("/api/localhost/catalog")
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d: { layers: Row[] }) => setRows([...d.layers].sort((a, b) => b.m.localeCompare(a.m))))
          .catch(() => setFailed(true))
      },
      { rootMargin: "400px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const matches = useMemo(() => {
    if (!rows) return []
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    return rows.filter(
      (r) => (!who || r.p === who) && words.every((w) => r.t.toLowerCase().includes(w) || r.p.toLowerCase().includes(w)),
    )
  }, [rows, q, who])

  return (
    // min-w-0: a grid item, which otherwise grows to its longest title and widens a phone page.
    <div ref={ref} className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search every layer</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="flood, parks, bike, schools…"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none"
          />
        </label>
        {/* The app's own combobox, so this reads like every other dropdown on the site. */}
        <AdminCombobox
          variant="light"
          className="sm:w-72"
          ariaLabel="Publisher"
          value={who}
          onChange={setWho}
          options={[
            { value: "", label: "Every publisher", count: publishers.reduce((n, p) => n + p.count, 0) },
            ...publishers.map((p) => ({ value: p.name, label: p.name, count: p.count })),
          ]}
        />
      </div>

      <p className="mt-3 text-xs text-gray-600" aria-live="polite">
        {failed
          ? "The catalog didn't load. It's also in the repo as data/catalog.json."
          : rows
            ? `${matches.length.toLocaleString()} of ${rows.length.toLocaleString()} layers${matches.length > SHOW ? `, the ${SHOW} newest shown` : ""}`
            : "Loading the catalog…"}
      </p>

      {rows && matches.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
          {matches.slice(0, SHOW).map((r) => (
            <li key={r.u}>
              <a href={r.u} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900 group-hover:underline">{r.t.replace(/_/g, " ")}</span>
                  <span className="mt-0.5 block text-xs text-gray-600">
                    {r.p} · updated {day(r.m)}
                  </span>
                </span>
                <ArrowUpRight aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 group-hover:text-gray-900" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {rows && matches.length === 0 && <p className="mt-3 text-sm text-gray-600">Nothing matches. Try one word.</p>}
    </div>
  )
}
