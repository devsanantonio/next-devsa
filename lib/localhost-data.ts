/**
 * The weekly data from devsanantonio/localhost: a catalog of every public layer
 * across San Antonio's open-data publishers, what they updated recently, and
 * whether each starter ran against its live source.
 *
 * A GitHub Action in that repo writes data/*.json every Monday
 * (scripts/catalog.py and scripts/check.py). This reads the committed files and
 * caches them for six hours, so the page stays current without a deploy.
 *
 * Fails soft: if GitHub is unreachable the page renders without these pieces.
 */

// LOCALHOST_DATA_URL points at another copy, e.g. a local checkout served over http, to preview changes.
const RAW = process.env.LOCALHOST_DATA_URL || "https://raw.githubusercontent.com/devsanantonio/localhost/main/data"
const SIX_HOURS = 6 * 60 * 60

export type CatalogLayer = {
  title: string
  publisher: string
  url: string
  type: string
  modified: string
  summary?: string | null
  credit: string
}

export type Catalog = {
  generated: string
  count: number
  by_publisher: Record<string, number>
  layers: CatalogLayer[]
}

export type Changes = {
  since: string
  until: string
  changes: (CatalogLayer & { change: "new" | "updated" })[]
}

export type Status = {
  checked_at: string
  ok: boolean
  publishers: { publisher: string; ok: boolean }[]
  starters: { starter: string; ok: boolean }[]
}

async function read<T>(file: string): Promise<T | null> {
  try {
    const res = await fetch(`${RAW}/${file}`, { next: { revalidate: SIX_HOURS } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const getCatalog = () => read<Catalog>("catalog.json")
export const getChanges = () => read<Changes>("changes.json")
export const getStatus = () => read<Status>("status.json")
