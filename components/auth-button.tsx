"use client"

import { useState, useEffect } from "react"
import { LogOut, User, Loader2, Shield } from "lucide-react"
import Link from "next/link"

export function AuthButton() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = localStorage.getItem("devsa-admin-email")
      if (storedEmail) {
        try {
          const response = await fetch(`/api/admin/auth?email=${encodeURIComponent(storedEmail)}`)
          const data = await response.json()
          if (data.isAdmin) {
            setAdminEmail(storedEmail)
            setAdminRole(data.role)
          } else {
            localStorage.removeItem("devsa-admin-email")
          }
        } catch {
          localStorage.removeItem("devsa-admin-email")
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("devsa-admin-email")
    setAdminEmail(null)
    setAdminRole(null)
    setShowMenu(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!adminEmail) {
    return (
      <Link
        href="/admin"
        className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        <Shield className="h-4 w-4" />
        Admin
      </Link>
    )
  }

  const displayName = adminEmail.split("@")[0]

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
              <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
              {adminRole && (
                <span className="mt-1 inline-block rounded-full bg-[#ef426f]/20 px-2 py-0.5 text-xs font-medium text-[#ef426f] capitalize">
                  {adminRole}
                </span>
              )}
            </div>
            
            <Link
              href="/admin"
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Link>

            <Link
              href="/admin/create-event"
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Create Event
            </Link>
            
            <button
              onClick={handleSignOut}
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
