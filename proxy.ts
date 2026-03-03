import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OLD_DOMAINS = ["devsanantonio.com", "www.devsanantonio.com"];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]; // strip port if present

  if (host && OLD_DOMAINS.includes(host)) {
    const url = new URL(request.url);
    url.hostname = "devsa.community";
    url.protocol = "https:";
    url.port = "";

    return NextResponse.redirect(url.toString(), 301); // permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
