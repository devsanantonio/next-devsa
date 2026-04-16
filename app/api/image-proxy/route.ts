import { NextRequest, NextResponse } from "next/server"

const ALLOWED_HOSTS = [
  "devsa-assets.s3.us-east-2.amazonaws.com",
  "storage.googleapis.com",
]

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

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 })
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream"
    const buffer = await res.arrayBuffer()

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    }

    const downloadName = request.nextUrl.searchParams.get("download")
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
