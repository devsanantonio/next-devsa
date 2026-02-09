"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  Bell,
  MessageSquare,
  AtSign,
  Briefcase,
  CheckCircle,
  Check,
  ArrowLeft,
} from "lucide-react"

interface Notification {
  id: string
  recipientUid: string
  type: "message" | "comment" | "mention" | "application" | "status-update"
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

const typeIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-5 w-5 text-blue-600" />,
  comment: <MessageSquare className="h-5 w-5 text-green-600" />,
  mention: <AtSign className="h-5 w-5 text-purple-600" />,
  application: <Briefcase className="h-5 w-5 text-orange-600" />,
  "status-update": <CheckCircle className="h-5 w-5 text-[#ef426f]" />,
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/jobs/signin")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) loadNotifications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadNotifications = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/notifications?all=true", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {
      console.error("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      const token = await getIdToken()
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch {
      console.error("Failed to mark as read")
    }
  }

  const markOneRead = async (notificationId: string) => {
    try {
      const token = await getIdToken()
      await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })
      setNotifications(notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch {
      // Ignored
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const d = new Date(date)
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12">
        <Link
          href="/jobs/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 text-sm text-[#ef426f] hover:underline"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
            <p className="text-sm text-slate-500">
              You&apos;ll be notified about messages, comments, and application updates here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  notification.read ? "opacity-60" : "hover:bg-slate-50"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {typeIcons[notification.type] || <Bell className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{notification.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">{timeAgo(notification.createdAt)}</span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) markOneRead(notification.id)
                        }}
                        className="text-xs text-[#ef426f] hover:underline"
                      >
                        View
                      </Link>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markOneRead(notification.id)}
                        className="text-xs text-slate-400 hover:text-slate-900"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <div className="shrink-0 mt-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ef426f]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
