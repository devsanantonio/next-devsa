"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { UserDropdown } from "@/components/jobs/user-dropdown"
import {
  Briefcase,
  Bell,
  MessageSquare,
  User,
  Menu,
  X,
  Search,
  FileText,
  Bookmark,
  LayoutDashboard,
  PenSquare,
} from "lucide-react"

interface JobBoardProfile {
  uid: string
  role: "hiring" | "open-to-work"
  firstName: string
  lastName: string
  profileImage?: string
  companyName?: string
}

export function JobsNavbar() {
  const { user, signOut, getIdToken } = useAuth()
  const [profile, setProfile] = useState<JobBoardProfile | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
      // Silently fail
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/bounties" className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#ef426f]" />
              <span className="text-lg font-bold text-white">
                DEVSA <span className="text-[#ef426f]">Jobs</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/bounties#open-positions"
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Browse Jobs
              </Link>
              {profile && (
                <Link
                  href="/bounties/dashboard"
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {profile?.role === "open-to-work" && (
                <Link
                  href="/bounties/dashboard?tab=applications"
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  My Applications
                </Link>
              )}
              {profile?.role === "hiring" && (
                <Link
                  href="/bounties/post"
                  className="text-sm font-medium text-[#ef426f] hover:text-[#d93a60] transition-colors"
                >
                  Post a Job
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search (desktop only) */}
            <Link
              href="/bounties?search=true"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>

            {user && profile ? (
              <UserDropdown theme="dark" profile={profile} />
            ) : (
              <Link
                href="/bounties/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-neutral-800 py-4 space-y-1">
            <Link
              href="/bounties#open-positions"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse Jobs
            </Link>

            {user && profile && (
              <>
                <div className="mx-4 my-2 border-t border-neutral-800" />
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {profile.role === "hiring" ? "Hiring Tools" : "Job Seeker"}
                </p>
                <Link
                  href="/bounties/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/bounties/dashboard/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </Link>
                <Link
                  href="/bounties/dashboard/messages"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
                <Link
                  href="/bounties/dashboard/notifications"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
                {profile.role === "hiring" && (
                  <>
                    <div className="mx-4 my-2 border-t border-neutral-800" />
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      Hiring Tools
                    </p>
                    <Link
                      href="/bounties/post"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#ef426f] hover:text-[#d93a60] hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <PenSquare className="h-4 w-4" />
                      Post a Job
                    </Link>
                    <Link
                      href="/bounties/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <Briefcase className="h-4 w-4" />
                      My Listings
                    </Link>
                  </>
                )}
                {profile.role === "open-to-work" && (
                  <>
                    <div className="mx-4 my-2 border-t border-neutral-800" />
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      Job Seeker
                    </p>
                    <Link
                      href="/bounties/dashboard?tab=applications"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      My Applications
                    </Link>
                    <Link
                      href="/bounties#open-positions"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                      Saved Jobs
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="mx-4 my-2 border-t border-neutral-800" />
            <Link
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
            >
              ← Back to DEVSA
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
