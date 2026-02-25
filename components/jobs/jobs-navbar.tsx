"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  Briefcase,
  Bell,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
      loadNotificationCount()
      const interval = setInterval(loadNotificationCount, 30000) // Poll every 30s
      return () => clearInterval(interval)
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

  const loadNotificationCount = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/notifications?countOnly=true", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Silently fail
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setProfile(null)
    setShowUserMenu(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/jobs" className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#ef426f]" />
              <span className="text-lg font-bold text-white">
                DEVSA <span className="text-[#ef426f]">Jobs</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/jobs"
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Browse Jobs
              </Link>
              {profile && (
                <Link
                  href="/jobs/dashboard"
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {profile?.role === "open-to-work" && (
                <Link
                  href="/jobs/dashboard?tab=applications"
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  My Applications
                </Link>
              )}
              {profile?.role === "hiring" && (
                <Link
                  href="/jobs/post"
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
              href="/jobs?search=true"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>

            {user && profile ? (
              <>
                {/* Messages */}
                <Link
                  href="/jobs/dashboard/messages"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>

                {/* Notifications */}
                <Link
                  href="/jobs/dashboard/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef426f] px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="hidden sm:block text-white font-medium">
                      {profile.firstName}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-neutral-700">
                          <p className="text-sm font-medium text-white">{profile.firstName} {profile.lastName}</p>
                          <span className={`inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            profile.role === "hiring"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {profile.role === "hiring" ? "Hiring" : "Open to Work"}
                          </span>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/jobs/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/jobs/dashboard/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Edit Profile
                          </Link>
                          <Link
                            href="/jobs/dashboard/messages"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Messages
                          </Link>
                          <Link
                            href="/jobs/dashboard/notifications"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                          >
                            <Bell className="h-4 w-4" />
                            Notifications
                          </Link>
                        </div>
                        {/* Role-specific links */}
                        <div className="p-2 border-t border-neutral-700">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            {profile.role === "hiring" ? "Hiring Tools" : "Job Seeker"}
                          </p>
                          {profile.role === "hiring" && (
                            <>
                              <Link
                                href="/jobs/post"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-[#ef426f] hover:bg-neutral-700/50 rounded-lg transition-colors"
                              >
                                <PenSquare className="h-4 w-4" />
                                Post a Job
                              </Link>
                              <Link
                                href="/jobs/dashboard"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                              >
                                <Briefcase className="h-4 w-4" />
                                My Listings
                              </Link>
                            </>
                          )}
                          {profile.role === "open-to-work" && (
                            <>
                              <Link
                                href="/jobs/dashboard?tab=applications"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                              >
                                <FileText className="h-4 w-4" />
                                My Applications
                              </Link>
                              <Link
                                href="/jobs"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                              >
                                <Bookmark className="h-4 w-4" />
                                Saved Jobs
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="p-2 border-t border-neutral-700">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/jobs/signin"
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
              href="/jobs"
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
                  href="/jobs/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/jobs/dashboard/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Edit Profile
                </Link>
                <Link
                  href="/jobs/dashboard/messages"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
                <Link
                  href="/jobs/dashboard/notifications"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef426f] px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                {profile.role === "hiring" && (
                  <>
                    <div className="mx-4 my-2 border-t border-neutral-800" />
                    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      Hiring Tools
                    </p>
                    <Link
                      href="/jobs/post"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#ef426f] hover:text-[#d93a60] hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <PenSquare className="h-4 w-4" />
                      Post a Job
                    </Link>
                    <Link
                      href="/jobs/dashboard"
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
                      href="/jobs/dashboard?tab=applications"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg mx-2 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      My Applications
                    </Link>
                    <Link
                      href="/jobs"
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
