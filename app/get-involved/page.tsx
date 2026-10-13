import { permanentRedirect } from "next/navigation"

/**
 * The Get Involved form lives in its section on /buildingtogether, beside the
 * five ways it serves. This URL stays so anything already linking or shared
 * still lands on it, with ?path= and ?way= carried through.
 */
export default async function GetInvolvedRedirect({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; way?: string }>
}) {
  const { path, way } = await searchParams
  const q = new URLSearchParams()
  if (path) q.set("path", path)
  if (way) q.set("way", way)
  const query = q.toString()
  permanentRedirect(`/buildingtogether${query ? `?${query}` : ""}#get-involved`)
}
