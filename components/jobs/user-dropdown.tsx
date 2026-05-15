"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  User,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Bell,
  PenSquare,
  FileText,
  Bookmark,
  LogOut,
  Briefcase,
  Shield,
  ArrowLeft,
  CheckCheck,
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

export interface UserDropdownProfile {
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

interface UserDropdownProps {
  theme?: "light" | "dark"
  profile: UserDropdownProfile
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

export function UserDropdown({ theme = "light", profile }: UserDropdownProps) {
  const router = useRouter()
  const { signOut, getIdToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoaded, setNotificationsLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const dark = theme === "dark"

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setOpen(false)
    setShowNotifications(false)
    await signOut()
    router.push("/bounties")
  }

  const close = () => {
    setOpen(false)
    setShowNotifications(false)
  }

  const displayName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User"
  const shortName = profile.firstName || profile.displayName || "User"

  // Theme-aware classes
  const trigger = dark
    ? "flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors"
    : "flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors shadow-sm"

  const avatarRing = dark ? "" : "ring-2 ring-white"
  const nameClass = dark ? "text-white font-medium" : "text-sm font-semibold text-gray-900 leading-none"
  const chevronClass = dark ? "h-3 w-3 text-neutral-400" : "h-3.5 w-3.5 text-gray-400"

  const panel = dark
    ? "absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-neutral-700 bg-neutral-800 shadow-2xl overflow-hidden"
    : "absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"

  const headerBg = dark ? "border-b border-neutral-700 bg-neutral-900/50" : "border-b border-gray-100 bg-gray-50/60"
  const itemClass = dark
    ? "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors leading-none"
    : "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors leading-none"
  const iconClass = dark ? "h-4 w-4 text-neutral-500" : "h-4 w-4 text-gray-400"
  const divider = dark ? "border-t border-neutral-700" : "border-t border-gray-100"
  const signOutClass = dark
    ? "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors leading-none"
    : "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors leading-none"
  const postJobClass = dark
    ? "flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-[#ef426f] hover:bg-neutral-700/50 rounded-lg transition-colors leading-none"
    : "flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-[#ef426f] hover:bg-pink-50 rounded-lg transition-colors leading-none"

  const roleBadge = profile.isSuperAdmin
    ? dark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"
    : profile.role === "hiring"
    ? dark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700"
    : dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"

  const roleLabel = profile.isSuperAdmin ? "Super Admin" : profile.role === "hiring" ? "Hiring" : "Open to Work"

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button onClick={() => setOpen(!open)} className={trigger}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden shrink-0 ${avatarRing}`}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-3.5 w-3.5 text-white" />
          )}
        </div>
        <span className={`hidden sm:block ${nameClass}`}>{shortName}</span>
        <ChevronDown className={`${chevronClass} transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className={panel}>
            {showNotifications ? (
              <>
                {/* Notifications header */}
                <div className={`flex items-center gap-2 px-3 py-2.5 ${headerBg}`}>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      dark ? "text-neutral-400 hover:bg-neutral-700" : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <p className={`text-[13px] font-bold leading-none flex-1 ${dark ? "text-white" : "text-gray-900"}`}>
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

                {/* Notifications list */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell className={`h-8 w-8 mx-auto mb-2 ${dark ? "text-neutral-600" : "text-gray-300"}`} />
                      <p className={`text-[13px] font-medium leading-tight ${dark ? "text-neutral-500" : "text-gray-400"}`}>
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) markNotificationsRead([notification.id])
                          close()
                        }}
                        className={`block px-3 py-2.5 transition-colors last:border-0 ${
                          dark
                            ? `hover:bg-neutral-700/50 border-b border-neutral-700/50 ${!notification.read ? "bg-neutral-700/20" : ""}`
                            : `hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? "bg-pink-50/40" : ""}`
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-sm mt-0.5 leading-none shrink-0">
                            {typeIcons[notification.type] || "🔔"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-semibold leading-snug truncate ${dark ? "text-white" : "text-gray-900"}`}>
                              {notification.title}
                            </p>
                            <p className={`text-[11px] mt-0.5 leading-snug line-clamp-2 font-normal ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                              {notification.body}
                            </p>
                            <p className={`text-[10px] mt-1 leading-none font-medium ${dark ? "text-neutral-500" : "text-gray-400"}`}>
                              {timeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef426f]" />
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* User header */}
                <div className={`px-4 py-3.5 ${headerBg}`}>
                  <p className={`text-[13px] font-bold leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
                    {displayName}
                  </p>
                  {profile.companyName && profile.role === "hiring" && (
                    <p className={`text-[12px] leading-snug mt-0.5 font-normal ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                      {profile.companyName}
                    </p>
                  )}
                  <span className={`inline-flex items-center mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none ${roleBadge}`}>
                    {roleLabel}
                  </span>
                </div>

                {/* Navigation */}
                <div className="p-1">
                  <Link href="/bounties/dashboard" onClick={close} className={itemClass}>
                    <LayoutDashboard className={iconClass} />
                    Dashboard
                  </Link>
                  <Link href="/bounties/dashboard/profile" onClick={close} className={itemClass}>
                    <User className={iconClass} />
                    Edit Profile
                  </Link>
                  <Link href="/bounties/dashboard/messages" onClick={close} className={itemClass}>
                    <MessageSquare className={iconClass} />
                    Messages
                  </Link>
                  <button
                    onClick={() => {
                      setShowNotifications(true)
                      if (!notificationsLoaded) fetchNotifications()
                    }}
                    className={`w-full ${itemClass}`}
                  >
                    <div className="relative">
                      <Bell className={iconClass} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ef426f] px-0.5 text-[8px] font-bold text-white leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    Notifications
                  </button>
                  {profile.isSuperAdmin && (
                    <Link href="/bounties/admin" onClick={close} className={`${itemClass} text-purple-500!`}>
                      <Shield className="h-4 w-4" />
                      Jobs Admin
                    </Link>
                  )}
                </div>

                {/* Role-specific actions */}
                <div className={`p-1 ${divider}`}>
                  {(profile.role === "hiring" || profile.isSuperAdmin) && (
                    <>
                      <Link href="/bounties/post" onClick={close} className={postJobClass}>
                        <PenSquare className="h-4 w-4" />
                        Post a Job
                      </Link>
                      <Link href="/bounties/dashboard" onClick={close} className={itemClass}>
                        <Briefcase className={iconClass} />
                        My Listings
                      </Link>
                    </>
                  )}
                  {profile.role === "open-to-work" && (
                    <>
                      <Link href="/bounties/dashboard?tab=applications" onClick={close} className={itemClass}>
                        <FileText className={iconClass} />
                        My Applications
                      </Link>
                      <Link href="/bounties#open-positions" onClick={close} className={itemClass}>
                        <Bookmark className={iconClass} />
                        Saved Jobs
                      </Link>
                    </>
                  )}
                </div>

                {/* Sign out */}
                <div className={`p-1 ${divider}`}>
                  <button onClick={handleSignOut} className={signOutClass}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
