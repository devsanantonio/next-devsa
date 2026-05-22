"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AppSidebar } from "@/components/jobs/app-sidebar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Menu } from "lucide-react"

interface JobBoardProfile {
  uid: string
  role: "hiring" | "open-to-work"
  firstName: string
  lastName: string
  profileImage?: string
  companyName?: string
  isSuperAdmin?: boolean
}

// Full-screen workspace routes — no sidebar, no marketing chrome, just content.
const FULLSCREEN_PATH_PREFIXES = ["/bounties/admin"]

/**
 * Owns chrome decisions for everything under /bounties/*.
 *
 *  - /bounties/admin           → bare children (super-admin workspace)
 *  - signed-in /bounties/*     → sidebar + content (no marketing navbar/footer)
 *  - signed-out /bounties/*    → Navbar + content + Footer (marketing context)
 *
 * Root <LayoutChrome> deliberately steps out of the way under /bounties/* so
 * this shell can make the decision once it knows the auth state.
 */
export function JobsLayoutShell({ children }: { children: React.ReactNode }) {
  const { user, getIdToken } = useAuth()
  const pathname = usePathname()
  const isFullscreen = FULLSCREEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p))
  const [profile, setProfile] = useState<JobBoardProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })
      const data = await res.json()
      if (data.hasProfile) {
        setProfile(data.profile)
      }
    } catch {
      // silently fail
    }
  }

  const isSignedIn = !!user && !!profile

  // 1. Admin fullscreen — bare children, no chrome at all.
  if (isFullscreen) {
    return <>{children}</>
  }

  // 2. Signed-in workspace — sidebar + content, no marketing navbar/footer.
  if (isSignedIn) {
    return (
      <div className="lg:pl-64">
        {profile && (
          <AppSidebar
            profile={profile}
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:hidden w-full px-4 sm:px-6 pt-4 pb-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </div>

        {children}
      </div>
    )
  }

  // 3. Signed-out (or auth still resolving) — marketing chrome.
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
