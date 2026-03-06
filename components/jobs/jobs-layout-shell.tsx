"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { AppSidebar } from "@/components/jobs/app-sidebar"
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

export function JobsLayoutShell({ children }: { children: React.ReactNode }) {
  const { user, getIdToken } = useAuth()
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

  return (
    <div className={isSignedIn ? "lg:pl-64" : ""}>
      {isSignedIn && profile && (
        <AppSidebar
          profile={profile}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
      )}

      {isSignedIn && (
        <div className="lg:hidden w-full px-4 sm:px-6 pt-20 pb-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </div>
      )}

      {children}
    </div>
  )
}
