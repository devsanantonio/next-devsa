import { NextResponse } from "next/server"
import { getCatalog } from "@/lib/localhost-data"

/**
 * GET: the localhost catalog, trimmed for the page's search box.
 *
 * The full catalog is about 600 KB, most of it summaries and credit lines the
 * list doesn't show. This sends title, publisher, address and date only, so the
 * browser downloads a third of it, and only when the catalog scrolls into view.
 * Read-only and public, so no auth or bot check.
 */
export const revalidate = 21600

export async function GET() {
  const catalog = await getCatalog()
  if (!catalog) return NextResponse.json({ error: "The catalog is unavailable right now." }, { status: 503 })
  return NextResponse.json(
    {
      generated: catalog.generated,
      count: catalog.count,
      layers: catalog.layers.map((l) => ({ t: l.title, p: l.publisher, u: l.url, m: l.modified })),
    },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  )
}
