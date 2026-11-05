import { readFile } from "node:fs/promises"
import path from "node:path"
import { DECKS } from "@/lib/slides"

/**
 * Serves a deck at /slides/<slug>: its public/slides/<slug>/index.html with a
 * <base> added, so the deck's relative paths (assets/...) resolve inside its
 * folder. The page has no trailing slash, and without the base, assets/x.png
 * would be fetched from /slides/assets/x.png. Set in the HTML rather than by
 * script, because the browser starts fetching images before any script runs.
 *
 * Built once per deck at build time from the list in lib/slides.ts; a slug not
 * on that list is a real 404. Decks live in the repo, so a new one ships with a
 * deploy anyway; nothing here is managed from the admin.
 */
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return DECKS.map((d) => ({ slug: d.slug }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!DECKS.some((d) => d.slug === slug)) return new Response("Not found", { status: 404 })
  const file = path.join(process.cwd(), "public", "slides", slug, "index.html")
  const html = await readFile(file, "utf8")
  const withBase = html.replace(/<head>/i, `<head>\n<base href="/slides/${slug}/">`)
  return new Response(withBase, {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  })
}
