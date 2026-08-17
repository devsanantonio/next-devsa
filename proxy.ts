import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OLD_DOMAINS = ["devsanantonio.com", "www.devsanantonio.com"];

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]; // strip port if present

  if (host && OLD_DOMAINS.includes(host)) {
    const url = new URL(request.url);
    url.hostname = "www.devsa.community";
    url.protocol = "https:";
    url.port = "";

    return NextResponse.redirect(url.toString(), 301); // permanent redirect
  }

  /**
   * Pass the requested path through as a header.
   *
   * `not-found.tsx` has no other way to know what was asked for: there is no
   * server API for the current pathname, and reaching for `usePathname` makes
   * the whole 404 a client component — which meant the page server-rendered as
   * "Loading..." and only painted the actual 404 after hydration. Echoing the
   * failed path is worth keeping; a 404 that needs JavaScript to say anything
   * is not.
   */
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
