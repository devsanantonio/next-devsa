"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { CommunityLink } from "@/lib/communities"

/**
 * Routes where the root layout's marketing chrome (Navbar + Footer) is
 * skipped. These sections take ownership of their own chrome — typically
 * because they're auth-aware (workspace vs. marketing) and the root layout
 * can't see the user's session.
 *
 * /admin owns its own chrome: it renders a full-screen sidebar shell, so the
 * marketing Navbar + Footer are skipped there.
 *
 * /bounties used to be the other entry — JobsLayoutShell swapped between
 * marketing chrome and a workspace sidebar depending on the session. It went
 * with the bounty board. The list stays an array rather than collapsing to a
 * single string comparison, because "sections that own their chrome" is a
 * category this site has had more than one of and will again.
 */
const APP_OWNED_CHROME_PREFIXES = ["/admin"]

function isAppOwnedChrome(pathname: string | null) {
  if (!pathname) return false
  return APP_OWNED_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Wraps the global marketing chrome (Navbar + Footer) and steps out of the way
 * for sections that manage their own. Keeps `children` in place either way so
 * the layout tree doesn't change shape.
 */
export function LayoutChrome({
  children,
  communities,
}: {
  children: React.ReactNode
  /**
   * Read in the root layout, which is a server component, and forwarded
   * through here untouched.
   *
   * This chain exists because the footer's community list has to be in the
   * server-rendered HTML. Fetching it in the footer on mount would work and
   * would match how the homepage wall and /buildingtogether do it — but those
   * are page content, and this is the site's internal link graph. Links that
   * only appear after hydration are a weaker crawl path, and giving those
   * pages a crawl path is most of why the footer lists them at all.
   */
  communities: CommunityLink[]
}) {
  const pathname = usePathname()
  const skipChrome = isAppOwnedChrome(pathname)

  return (
    <>
      {!skipChrome && <Navbar />}
      {children}
      {!skipChrome && <Footer communities={communities} />}
    </>
  )
}
