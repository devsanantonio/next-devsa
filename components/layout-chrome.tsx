"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

/**
 * Routes where the root layout's marketing chrome (Navbar + Footer) is
 * skipped. These sections take ownership of their own chrome — typically
 * because they're auth-aware (workspace vs. marketing) and the root layout
 * can't see the user's session.
 *
 * For /bounties/*, JobsLayoutShell handles chrome:
 *   - signed-out → renders Navbar + Footer (marketing context)
 *   - signed-in  → renders sidebar only (workspace context)
 *   - /admin     → renders bare children (full-screen admin)
 *
 * /admin owns its own chrome too: it renders a full-screen sidebar shell, so
 * the marketing Navbar + Footer are skipped there.
 */
const APP_OWNED_CHROME_PREFIXES = ["/bounties", "/admin"]

function isAppOwnedChrome(pathname: string | null) {
  if (!pathname) return false
  return APP_OWNED_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Wraps the global marketing chrome (Navbar + Footer) and steps out of the way
 * for sections that manage their own. Keeps `children` in place either way so
 * the layout tree doesn't change shape.
 */
export function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const skipChrome = isAppOwnedChrome(pathname)

  return (
    <>
      {!skipChrome && <Navbar />}
      {children}
      {!skipChrome && <Footer />}
    </>
  )
}
