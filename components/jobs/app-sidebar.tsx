"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  User,
  LayoutDashboard,
  MessageSquare,
  Bell,
  PenSquare,
  FileText,
  Bookmark,
  LogOut,
  Briefcase,
  Shield,
  X,
  CheckCheck,
  ArrowLeft,
  Search,
} from "lucide-react"

interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  createdAt: string
}

export interface AppSidebarProfile {
  uid: string
  role: "hiring" | "open-to-work"
  firstName?: string
  lastName?: string
  displayName?: string
  profileImage?: string
  companyName?: string
  email?: string
  isSuperAdmin?: boolean
}

interface AppSidebarProps {
  profile: AppSidebarProfile
  mobileOpen: boolean
  onMobileClose: () => void
}

const typeIcons: Record<string, string> = {
  message: "💬",
  comment: "💬",
  mention: "@",
  application: "📋",
  "status-update": "📊",
}

function timeAgo(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

export function AppSidebar({ profile, mobileOpen, onMobileClose }: AppSidebarProps) {
  const router = useRouter()
  const { signOut, getIdToken } = useAuth()
  const [view, setView] = useState<"menu" | "notifications">("menu")
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoaded, setNotificationsLoaded] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount()
    fetchUnreadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mobileOpen) setView("menu")
  }, [mobileOpen])

  // Lock body scroll on mobile overlay
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const fetchUnreadCount = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/notifications?countOnly=true", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silently fail
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/messages?countOnly=true", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUnreadMessages(data.unreadCount || 0)
    } catch {
      // silently fail
    }
  }

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setNotificationsLoaded(true)
    } catch {
      // silently fail
    }
  }, [getIdToken])

  const markNotificationsRead = async (ids: string[]) => {
    try {
      const token = await getIdToken()
      if (!token) return
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationIds: ids }),
      })
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - ids.length))
    } catch {
      // silently fail
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silently fail
    }
  }

  const handleSignOut = async () => {
    onMobileClose()
    await signOut()
    router.push("/jobs")
  }

  const handleLinkClick = () => {
    onMobileClose()
  }

  const displayName =
    profile.displayName ||
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
    "User"

  const roleLabel = profile.isSuperAdmin
    ? "Super Admin"
    : profile.role === "hiring"
      ? "Hiring"
      : "Open to Work"

  const roleBadgeClass = profile.isSuperAdmin
    ? "bg-purple-100 text-purple-700"
    : profile.role === "hiring"
      ? "bg-rose-100 text-rose-700"
      : "bg-green-100 text-green-700"

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden ring-2 ring-white">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              {profile.companyName && profile.role === "hiring" && (
                <p className="text-xs text-gray-500 truncate">{profile.companyName}</p>
              )}
              <span
                className={`inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
          {/* Close — mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === "notifications" ? (
          <>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
              <button
                onClick={() => setView("menu")}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <p className="text-[13px] font-bold text-gray-900 leading-none flex-1">
                Notifications
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#ef426f] hover:text-[#d93a60] transition-colors leading-none"
                >
                  <CheckCheck className="h-3 w-3" />
                  Read all
                </button>
              )}
            </div>
            <div>
              {notifications.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-[13px] font-medium text-gray-400 leading-tight">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => {
                      if (!notification.read) markNotificationsRead([notification.id])
                      handleLinkClick()
                    }}
                    className={`block px-4 py-3 transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? "bg-pink-50/40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5 leading-none shrink-0">
                        {typeIcons[notification.type] || "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate">
                          {notification.title}
                        </p>
                        <p className="text-[12px] mt-0.5 text-gray-500 leading-snug line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-[11px] mt-1 text-gray-400 leading-none font-medium">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ef426f]" />
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="py-2">
            <div className="px-3 py-1">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Navigation
              </p>
              <Link
                href="/jobs/dashboard"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                Dashboard
              </Link>
              <Link
                href="/jobs/dashboard/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="h-4 w-4 text-gray-400" />
                Edit Profile
              </Link>
              <Link
                href="/jobs/dashboard/messages"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="relative">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef426f] px-1 text-[9px] font-bold text-white leading-none">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </div>
                Messages
              </Link>
              <button
                onClick={() => {
                  setView("notifications")
                  if (!notificationsLoaded) fetchNotifications()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="relative">
                  <Bell className="h-4 w-4 text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef426f] px-1 text-[9px] font-bold text-white leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                Notifications
              </button>
              {profile.isSuperAdmin && (
                <Link
                  href="/jobs/admin"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Jobs Admin
                </Link>
              )}
            </div>

            <div className="px-3 py-1 mt-1 border-t border-gray-100">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {profile.role === "hiring" ? "Hiring Tools" : "Browse"}
              </p>
              {(profile.role === "hiring" || profile.isSuperAdmin) && (
                <>
                  <Link
                    href="/jobs/post"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[#ef426f] hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <PenSquare className="h-4 w-4" />
                    Post a Job
                  </Link>
                  <Link
                    href="/jobs/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    My Listings
                  </Link>
                </>
              )}
              {profile.role === "open-to-work" && (
                <>
                  <Link
                    href="/jobs#open-positions"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-[#ef426f] hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Browse Jobs
                  </Link>
                  <Link
                    href="/jobs/dashboard?tab=applications"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    My Applications
                  </Link>
                  <Link
                    href="/jobs#open-positions"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bookmark className="h-4 w-4 text-gray-400" />
                    Saved Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {view === "menu" && (
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — persistent left column */}
      <aside className="hidden lg:flex fixed left-0 top-16 z-20 h-[calc(100dvh-8rem)] w-64 flex-col border-r border-gray-200 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
