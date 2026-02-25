"use client"

import { Bell } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  link: string
  read: boolean
  createdAt: string
}

interface NotificationBellProps {
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: (ids: string[]) => void
}

export function NotificationBell({ notifications, unreadCount, onMarkRead }: NotificationBellProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const typeIcons: Record<string, string> = {
    message: "💬",
    comment: "💬",
    mention: "@",
    application: "📋",
    "status-update": "📊",
  }

  const timeAgo = (date: string) => {
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef426f] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-32px)] sm:w-80 max-w-80 rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
                    onMarkRead(unreadIds)
                  }}
                  className="text-xs text-[#ef426f] hover:text-[#d93a60]"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-neutral-500">
                  No notifications yet
                </p>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => {
                      if (!notification.read) {
                        onMarkRead([notification.id])
                      }
                      setShowDropdown(false)
                    }}
                    className={`block px-4 py-3 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 ${
                      !notification.read ? "bg-neutral-700/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {typeIcons[notification.type] || "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ef426f]" />
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <Link
                href="/jobs/dashboard/notifications"
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-3 text-center text-sm text-[#ef426f] hover:bg-neutral-700/50 border-t border-neutral-700"
              >
                View all notifications
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
