"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth } from "convex/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { LogOut, User, Loader2 } from "lucide-react"
import Link from "next/link"

export function AuthButton() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signOut } = useAuthActions()
  const currentUser = useQuery(api.users.getCurrentUser)
  const [showMenu, setShowMenu] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/signin"
        className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        Sign In
      </Link>
    )
  }

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "Account"

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        <User className="h-4 w-4" />
        {displayName}
      </button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-900 py-2 shadow-lg z-50">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              {currentUser?.role && (
                <span className="mt-1 inline-block rounded-full bg-[#ef426f]/20 px-2 py-0.5 text-xs font-medium text-[#ef426f] capitalize">
                  {currentUser.role}
                </span>
              )}
            </div>
            
            {(currentUser?.role === "organizer" || currentUser?.role === "admin") && (
              <Link
                href="/events/create"
                onClick={() => setShowMenu(false)}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Create Event
              </Link>
            )}
            
            <button
              onClick={() => {
                void signOut()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
