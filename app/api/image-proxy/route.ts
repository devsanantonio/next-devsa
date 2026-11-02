import { NextRequest, NextResponse } from "next/server"

/**
 * Same-origin copies of DEVSA's own images, for the branding kit's and the logo
 * menu's downloads and for /social's export, which can't read cross-origin
 * pixels.
 *
 * It answers from devsa.community, so anything it returns is served as this
 * site. It used to allow all of storage.googleapis.com, which hosts anyone's
 * public files, and passed the upstream content type through: an HTML file
 * there became a page on www.devsa.community. Now it takes one bucket, returns
 * images only, and next.config.ts sends each with a policy that runs no script,
 * since an SVG opened directly is a document.
 */
const ALLOWED_HOSTS = ["devsa-assets.s3.us-east-2.amazonaws.com"]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 })
  }

  try {
    // No redirects: a redirect could lead off the allowed host.
    const res = await fetch(parsed, { redirect: "error" })
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 })
    }

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase()
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 })
    }
    const buffer = await res.arrayBuffer()

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      // The no-script policy for these responses is set in next.config.ts.
    }

    // A filename for the download, reduced to characters that can't break the header.
    const downloadName = request.nextUrl.searchParams.get("download")?.replace(/[^\w.-]+/g, "-").slice(0, 100)
    if (downloadName) {
      headers["Content-Disposition"] = `attachment; filename="${downloadName}"`
    }

    return new NextResponse(buffer, {
      status: 200,
      headers,
    })
  } catch {
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 500 })
  }
}
