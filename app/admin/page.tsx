"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Mail, 
  Users, 
  Mic2, 
  UserCheck, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Shield,
  Plus,
  Calendar,
  CalendarDays,
  Edit,
  Trash2,
  Archive,
  Building2,
  Database,
  ExternalLink,
  Upload,
  Link as LinkIcon
} from "lucide-react"
import { techCommunities as staticCommunities } from "@/data/communities"

interface NewsletterSubscription {
  id: string
  email: string
  subscribedAt: string
  source?: string
  status: string
}

interface SpeakerSubmission {
  id: string
  name: string
  email: string
  company?: string
  sessionTitle: string
  sessionFormat: string
  abstract: string
  submittedAt: string
  status: string
}

interface AccessRequest {
  id: string
  name: string
  email: string
  communityOrg: string
  submittedAt: string
  status: string
}

interface Admin {
  id: string
  email: string
  role: string
  communityId?: string
  approvedAt: string
}

interface CalendarEvent {
  id: string
  title: string
  slug: string
  date: string
  location: string
  description: string
  url?: string
  communityId: string
  communityName?: string
  status: string
  source?: string
  isStatic?: boolean
}

interface Community {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  discord?: string
  meetup?: string
  luma?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  twitch?: string
  facebook?: string
  github?: string
  isStatic?: boolean
}

type Tab = "newsletter" | "speakers" | "access" | "admins" | "events" | "communities"

// Protected super admin email - cannot be removed or modified
const SUPER_ADMIN_EMAIL = 'jesse@devsanantonio.com'

// Helper to check if a role has admin-level access
const hasAdminAccess = (role: string | null | undefined): boolean => {
  return role === 'superadmin' || role === 'admin'
}

// Helper to get community name from id (fallback to static communities for initial render)
const getCommunityName = (communityId: string | undefined, communityList?: Community[]): string => {
  if (!communityId) return "All Communities"
  const list = communityList && communityList.length > 0 ? communityList : staticCommunities
  const community = list.find(c => c.id === communityId)
  return community?.name || communityId
}

export default function AdminPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState("")
  const [adminRole, setAdminRole] = useState<"superadmin" | "admin" | "organizer" | null>(null)
  const [adminCommunityId, setAdminCommunityId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("events")
  
  // Data states
  const [newsletter, setNewsletter] = useState<NewsletterSubscription[]>([])
  const [speakers, setSpeakers] = useState<SpeakerSubmission[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesSource, setCommunitiesSource] = useState<string>("static")
  
  // Modal state
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [showEditCommunity, setShowEditCommunity] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDeletingSpeaker, setIsDeletingSpeaker] = useState<string | null>(null)
  const [isRejectingAccess, setIsRejectingAccess] = useState<string | null>(null)
  const [isApprovingAccess, setIsApprovingAccess] = useState<string | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isSavingCommunity, setIsSavingCommunity] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [useFileUpload, setUseFileUpload] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "organizer">("organizer")
  const [newAdminCommunity, setNewAdminCommunity] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)

  // Helper to get community name from current communities state
  const getCommunityNameFromState = (communityId: string | undefined): string => {
    if (!communityId) return "All Communities"
    const community = communities.find(c => c.id === communityId)
    return community?.name || communityId
  }

  // Check auth on load
  useEffect(() => {
    const storedEmail = localStorage.getItem("devsa-admin-email")
    if (storedEmail) {
      checkAdminStatus(storedEmail)
    } else {
      setIsLoading(false)
    }
  }, [])

  const checkAdminStatus = async (email: string) => {
    setIsCheckingAuth(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/auth?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (data.isAdmin) {
        setAdminEmail(email)
        setAdminRole(data.role)
        setAdminCommunityId(data.communityId || null)
        setIsAuthenticated(true)
        localStorage.setItem("devsa-admin-email", email)
        // Set default tab based on role - admins/superadmins see newsletter first, organizers see events
        setActiveTab(hasAdminAccess(data.role) ? "newsletter" : "events")
        await fetchData(email, data.role, data.communityId)
      } else {
        setError("You are not authorized to access the admin panel")
        localStorage.removeItem("devsa-admin-email")
      }
    } catch {
      setError("Failed to verify admin status")
    } finally {
      setIsCheckingAuth(false)
      setIsLoading(false)
    }
  }

  const fetchData = async (email: string, role?: string, communityId?: string) => {
    try {
      const [adminDataRes, eventsRes, communitiesRes] = await Promise.all([
        fetch(`/api/admin/data?email=${encodeURIComponent(email)}`),
        fetch('/api/events?includeAll=true'),
        fetch('/api/communities?includeStatic=true')
      ])
      
      const adminData = await adminDataRes.json()
      const eventsData = await eventsRes.json()
      const communitiesData = await communitiesRes.json()

      if (adminDataRes.ok) {
        // Only admins/superadmins should see newsletter, speakers, access requests, and admins data
        // The API should also enforce this, but we double-check on the frontend
        const isAdmin = hasAdminAccess(role) || hasAdminAccess(adminRole)
        setNewsletter(isAdmin ? (adminData.newsletter || []) : [])
        setSpeakers(isAdmin ? (adminData.speakers || []) : [])
        setAccessRequests(isAdmin ? (adminData.accessRequests || []) : [])
        setAdmins(isAdmin ? (adminData.admins || []) : [])
      }
      
      if (communitiesRes.ok) {
        setCommunities(communitiesData.communities || [])
        setCommunitiesSource(communitiesData.source || 'static')
      }
      
      if (eventsRes.ok) {
        // Organizers can only see events for their community
        const userCommunityId = communityId || adminCommunityId
        const userRole = role || adminRole
        const allEvents = eventsData.events || []
        
        if (userRole === "organizer" && userCommunityId) {
          setEvents(allEvents.filter((event: CalendarEvent) => event.communityId === userCommunityId))
        } else {
          setEvents(allEvents)
        }
      }
    } catch {
      setError("Failed to fetch data")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = (e.target as HTMLFormElement).email.value
    await checkAdminStatus(email)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminEmail("")
    setAdminRole(null)
    setAdminCommunityId(null)
    localStorage.removeItem("devsa-admin-email")
  }

  const handleApproveAccess = async (request: AccessRequest) => {
    setIsApprovingAccess(request.id)
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: request.email,
          role: "organizer",
          approverEmail: adminEmail,
        }),
      })

      if (response.ok) {
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to approve access request")
      }
    } catch {
      setError("Failed to approve access request")
    } finally {
      setIsApprovingAccess(null)
    }
  }

  const handleRejectAccess = async (requestId: string) => {
    if (!confirm("Are you sure you want to reject this access request? This action cannot be undone.")) return
    
    setIsRejectingAccess(requestId)
    try {
      const response = await fetch("/api/access-request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          adminEmail,
        }),
      })

      if (response.ok) {
        setAccessRequests(prev => prev.filter(r => r.id !== requestId))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to reject access request")
      }
    } catch {
      setError("Failed to reject access request")
    } finally {
      setIsRejectingAccess(null)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingAdmin ? editingAdmin.email : newAdminEmail,
          role: newAdminRole,
          communityId: newAdminCommunity || undefined,
          approverEmail: adminEmail,
        }),
      })

      if (response.ok) {
        setShowAddAdmin(false)
        setEditingAdmin(null)
        setNewAdminEmail("")
        setNewAdminRole("organizer")
        setNewAdminCommunity("")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save admin")
      }
    } catch {
      setError("Failed to save admin")
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
    setNewAdminEmail(admin.email)
    setNewAdminRole(admin.role === "superadmin" ? "admin" : admin.role as "admin" | "organizer")
    setNewAdminCommunity(admin.communityId || "")
    setShowAddAdmin(true)
  }

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return
    
    try {
      const response = await fetch("/api/admin/auth", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          approverEmail: adminEmail,
        }),
      })

      if (response.ok) {
        await fetchData(adminEmail)
      }
    } catch {
      setError("Failed to remove admin")
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent({ ...event })
    setShowEditEvent(true)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: editingEvent.id,
          title: editingEvent.title,
          date: editingEvent.date,
          location: editingEvent.location,
          description: editingEvent.description,
          url: editingEvent.url,
          status: editingEvent.status,
          organizerEmail: adminEmail,
        }),
      })

      if (response.ok) {
        setShowEditEvent(false)
        setEditingEvent(null)
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update event")
      }
    } catch {
      setError("Failed to update event")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return
    
    setIsDeleting(eventId)
    try {
      const response = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          organizerEmail: adminEmail,
        }),
      })

      if (response.ok) {
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete event")
      }
    } catch {
      setError("Failed to delete event")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDeleteSpeaker = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this speaker submission? This action cannot be undone.")) return
    
    setIsDeletingSpeaker(submissionId)
    try {
      const response = await fetch("/api/call-for-speakers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          adminEmail,
        }),
      })

      if (response.ok) {
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete speaker submission")
      }
    } catch {
      setError("Failed to delete speaker submission")
    } finally {
      setIsDeletingSpeaker(null)
    }
  }

  const handleMigrateToDB = async () => {
    if (!confirm("This will migrate communities and partners from static files to Firestore. Continue?")) return
    
    setIsMigrating(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          migrateType: "all",
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccessMessage(`Migration complete! Communities: ${data.results.communities.migrated} migrated, ${data.results.communities.skipped} skipped. Partners: ${data.results.partners.migrated} migrated, ${data.results.partners.skipped} skipped.`)
        await fetchData(adminEmail)
      } else {
        setError(data.error || "Failed to migrate data")
      }
    } catch {
      setError("Failed to migrate data")
    } finally {
      setIsMigrating(false)
    }
  }

  const handleEditCommunity = (community: Community) => {
    setEditingCommunity({ ...community })
    setShowEditCommunity(true)
    setUseFileUpload(true) // Reset to file upload mode
  }

  const handleLogoUpload = async (file: File) => {
    if (!editingCommunity) return

    setIsUploadingLogo(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('adminEmail', adminEmail)
      formData.append('communityId', editingCommunity.id)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setEditingCommunity({ ...editingCommunity, logo: data.url })
        setSuccessMessage('Logo uploaded successfully!')
      } else {
        setError(data.error || 'Failed to upload logo')
      }
    } catch {
      setError('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSaveCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCommunity) return

    setIsSavingCommunity(true)
    setError(null)
    try {
      const response = await fetch("/api/communities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCommunity.id,
          name: editingCommunity.name,
          logo: editingCommunity.logo,
          description: editingCommunity.description,
          website: editingCommunity.website,
          discord: editingCommunity.discord,
          meetup: editingCommunity.meetup,
          luma: editingCommunity.luma,
          instagram: editingCommunity.instagram,
          twitter: editingCommunity.twitter,
          linkedin: editingCommunity.linkedin,
          youtube: editingCommunity.youtube,
          twitch: editingCommunity.twitch,
          facebook: editingCommunity.facebook,
          github: editingCommunity.github,
          adminEmail,
        }),
      })

      if (response.ok) {
        setShowEditCommunity(false)
        setEditingCommunity(null)
        setSuccessMessage("Community updated successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update community")
      }
    } catch {
      setError("Failed to update community")
    } finally {
      setIsSavingCommunity(false)
    }
  }

  // Clear messages after showing
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ef426f]" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black py-12 sm:py-20">
        <div className="mx-auto max-w-md px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ef426f]/20">
                <Shield className="h-8 w-8 text-[#ef426f]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-gray-400">Enter your email to access the admin panel</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="admin@devsa.community"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCheckingAuth}
                className="w-full rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCheckingAuth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access Admin Panel"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Logged in as <span className="text-gray-300 font-medium">{adminEmail}</span>
              <span className="mx-2">•</span>
              <span className={`font-medium ${
                adminRole === "superadmin" ? "text-yellow-400" : 
                adminRole === "admin" ? "text-purple-400" : "text-blue-400"
              }`}>
                {adminRole === "superadmin" ? "Super Admin" : adminRole}
              </span>
              {adminRole === "organizer" && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-gray-300">
                    {adminCommunityId ? getCommunityName(adminCommunityId) : <span className="text-red-400">No community assigned</span>}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Create Event
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs - Only show admin-only tabs to admins/superadmins */}
        <div className="flex flex-wrap gap-2 mb-8">
          {hasAdminAccess(adminRole) && (
            <>
              <button
                onClick={() => setActiveTab("newsletter")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "newsletter"
                    ? "bg-[#ef426f] text-white"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Mail className="h-4 w-4" />
                Newsletter ({newsletter.length})
              </button>
              <button
                onClick={() => setActiveTab("speakers")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "speakers"
                    ? "bg-[#ef426f] text-white"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Mic2 className="h-4 w-4" />
                Speakers ({speakers.length})
              </button>
              <button
                onClick={() => setActiveTab("access")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "access"
                    ? "bg-[#ef426f] text-white"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Users className="h-4 w-4" />
                Access Requests ({accessRequests.filter(r => r.status === "pending").length})
              </button>
              <button
                onClick={() => setActiveTab("admins")}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "admins"
                    ? "bg-[#ef426f] text-white"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Admins ({admins.length})
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("events")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "events"
                ? "bg-[#ef426f] text-white"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "communities"
                ? "bg-[#ef426f] text-white"
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Building2 className="h-4 w-4" />
            {adminRole === "organizer" ? "My Community" : `Communities (${communities.length})`}
          </button>
        </div>

        {/* Success/Error messages */}
        {successMessage && (
          <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        {/* Content */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
          {/* Newsletter Tab - Admin Only */}
          {activeTab === "newsletter" && hasAdminAccess(adminRole) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Newsletter Subscriptions</h2>
              {newsletter.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No newsletter subscriptions yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <table className="w-full min-w-150">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {newsletter.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium text-white">{sub.email}</td>
                          <td className="py-4 px-4 text-sm text-gray-400">{sub.source || "—"}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              sub.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400">
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Speakers Tab - Admin Only */}
          {activeTab === "speakers" && hasAdminAccess(adminRole) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Speaker Submissions</h2>
              {speakers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No speaker submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="rounded-xl border border-gray-800 bg-gray-800/30 p-6 hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white">{speaker.sessionTitle}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {speaker.name} {speaker.company && <span className="text-gray-500">• {speaker.company}</span>}
                          </p>
                          <p className="text-gray-500 text-sm">{speaker.email}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSpeaker(speaker.id)}
                          disabled={isDeletingSpeaker === speaker.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {isDeletingSpeaker === speaker.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Format</span>
                        <p className="text-gray-300 text-sm mt-1">{speaker.sessionFormat}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Abstract</span>
                        <p className="text-gray-300 text-sm mt-1 leading-relaxed">{speaker.abstract}</p>
                      </div>
                      <p className="mt-4 text-xs text-gray-500">
                        Submitted: {new Date(speaker.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Access Requests Tab - Admin Only */}
          {activeTab === "access" && hasAdminAccess(adminRole) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Access Requests</h2>
              {accessRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No access requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-gray-800 bg-gray-800/30 p-6 hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white">{request.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{request.email}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Community: <span className="text-gray-400">{request.communityOrg}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-3">
                            Requested: {new Date(request.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveAccess(request)}
                                disabled={isApprovingAccess === request.id || isRejectingAccess === request.id}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isApprovingAccess === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                {isApprovingAccess === request.id ? "Approving..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleRejectAccess(request.id)}
                                disabled={isApprovingAccess === request.id || isRejectingAccess === request.id}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isRejectingAccess === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {isRejectingAccess === request.id ? "Rejecting..." : "Reject"}
                              </button>
                            </>
                          ) : (
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              request.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                              {request.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admins Tab - Admin Only */}
          {activeTab === "admins" && hasAdminAccess(adminRole) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Approved Admins</h2>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Admin
                </button>
              </div>
              
              {admins.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No approved admins yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <table className="w-full min-w-150">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Community</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Approved At</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium text-white">
                            {admin.email}
                            {admin.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && (
                              <span className="ml-2 text-xs text-yellow-500">(Site Owner)</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              admin.role === "superadmin"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : admin.role === "admin"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {admin.role === "superadmin" ? "Super Admin" : admin.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400">{getCommunityName(admin.communityId)}</td>
                          <td className="py-4 px-4 text-sm text-gray-400">
                            {new Date(admin.approvedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {/* Edit button - not for super admin */}
                              {admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                                <button
                                  onClick={() => handleEditAdmin(admin)}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                              {/* Prevent removing yourself or the super admin */}
                              {admin.email !== adminEmail && admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && (
                                <button
                                  onClick={() => handleRemoveAdmin(admin.email)}
                                  className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                              {admin.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && (
                                <span className="text-xs text-gray-500 italic">Protected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add/Edit Admin Modal */}
              {showAddAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-8 max-w-md w-full shadow-2xl">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">
                      {editingAdmin ? "Edit Admin" : "Add New Admin"}
                    </h3>
                    <form onSubmit={handleAddAdmin} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="user@example.com"
                          disabled={!!editingAdmin}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {editingAdmin && (
                          <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Role
                        </label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => {
                            setNewAdminRole(e.target.value as "admin" | "organizer")
                            // Clear community when switching to admin role
                            if (e.target.value === "admin") {
                              setNewAdminCommunity("")
                            }
                          }}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        >
                          <option value="organizer">Organizer (can only manage their community&apos;s events)</option>
                          <option value="admin">Admin (full access to all features)</option>
                        </select>
                      </div>
                      {newAdminRole === "organizer" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Assigned Community *
                          </label>
                          <select
                            required={newAdminRole === "organizer"}
                            value={newAdminCommunity}
                            onChange={(e) => setNewAdminCommunity(e.target.value)}
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          >
                            <option value="">Select a community</option>
                            {(communities.length > 0 ? communities : staticCommunities).map((community) => (
                              <option key={community.id} value={community.id}>
                                {community.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">
                            Organizers can only create and manage events for their assigned community
                          </p>
                        </div>
                      )}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddAdmin(false)
                            setEditingAdmin(null)
                            setNewAdminEmail("")
                            setNewAdminRole("organizer")
                            setNewAdminCommunity("")
                          }}
                          className="flex-1 rounded-xl border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                        >
                          {editingAdmin ? "Save Changes" : "Add Admin"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Calendar Events</h2>
                <Link
                  href="/admin/create-event"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Link>
              </div>
              
              {(() => {
                const now = new Date()
                // Separate upcoming and archived events
                const upcomingEvents = events
                  .filter(event => new Date(event.date) >= now)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                
                const archivedEvents = events
                  .filter(event => new Date(event.date) < now)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                
                const renderEventCard = (event: CalendarEvent) => (
                  <div key={event.id} className="rounded-xl border border-gray-800 bg-gray-800/30 p-6 hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold tracking-tight text-white truncate">{event.title}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${
                            event.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {event.status}
                          </span>
                          {event.isStatic && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-500/20 text-gray-400">
                              Static
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{event.communityName || event.communityId}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "America/Chicago",
                            })}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span>{event.location}</span>
                          {event.source && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs text-gray-600">Source: {event.source}</span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-3 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {event.isStatic ? (
                          <span className="text-xs text-gray-500 italic">
                            Edit in data/events.ts
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={isDeleting === event.id}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            >
                              {isDeleting === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )

                return (
                  <>
                    {/* Upcoming Events Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[#ef426f]" />
                        Upcoming Events ({upcomingEvents.length})
                      </h3>
                      {upcomingEvents.length === 0 ? (
                        <p className="text-gray-400 text-center py-8 bg-gray-800/20 rounded-xl border border-gray-800">
                          No upcoming events. Create your first event!
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {upcomingEvents.map(renderEventCard)}
                        </div>
                      )}
                    </div>

                    {/* Archived Events Section */}
                    {archivedEvents.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-4 flex items-center gap-2">
                          <Archive className="h-5 w-5" />
                          Archived Events ({archivedEvents.length})
                        </h3>
                        <div className="space-y-4 opacity-75">
                          {archivedEvents.map(renderEventCard)}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Edit Event Modal */}
              {showEditEvent && editingEvent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">Edit Event</h3>
                    <form onSubmit={handleUpdateEvent} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Event Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingEvent.title}
                          onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Date
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, date: new Date(e.target.value).toISOString() })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          required
                          value={editingEvent.location}
                          onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={editingEvent.description}
                          onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Event URL (optional)
                        </label>
                        <input
                          type="url"
                          value={editingEvent.url || ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, url: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={editingEvent.status}
                          onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          Draft events are only visible in the admin dashboard
                        </p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditEvent(false)
                            setEditingEvent(null)
                          }}
                          className="flex-1 rounded-xl border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {adminRole === "organizer" ? "My Community" : "Communities"}
                  </h2>
                  {hasAdminAccess(adminRole) && (
                    <p className="text-sm text-gray-400 mt-1">
                      Source: <span className={communitiesSource === 'firestore' ? 'text-green-400' : 'text-yellow-400'}>
                        {communitiesSource === 'firestore' ? 'Firestore Database' : 'Static Files (not migrated)'}
                      </span>
                    </p>
                  )}
                </div>
                {adminRole === 'superadmin' && communitiesSource !== 'firestore' && (
                  <button
                    onClick={handleMigrateToDB}
                    disabled={isMigrating}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                  >
                    {isMigrating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        Migrate to Firestore
                      </>
                    )}
                  </button>
                )}
              </div>

              {adminRole === "organizer" ? (
                // Organizer view - show only their community
                (() => {
                  const myCommunity = communities.find(c => c.id === adminCommunityId)
                  if (!myCommunity) {
                    return (
                      <div className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-2">No community assigned to your account.</p>
                        <p className="text-gray-500 text-sm">Contact an admin to assign you to a community.</p>
                      </div>
                    )
                  }
                  return (
                    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-6">
                      <div className="flex items-start gap-4 mb-6">
                        {myCommunity.logo && (
                          <img 
                            src={myCommunity.logo} 
                            alt={myCommunity.name} 
                            className="h-16 w-16 rounded-xl object-contain bg-gray-900 p-2"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold tracking-tight text-white">{myCommunity.name}</h3>
                          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{myCommunity.description}</p>
                        </div>
                        {communitiesSource === 'firestore' && (
                          <button
                            onClick={() => handleEditCommunity(myCommunity)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {myCommunity.website && (
                          <a href={myCommunity.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Website
                          </a>
                        )}
                        {myCommunity.meetup && (
                          <a href={myCommunity.meetup} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Meetup
                          </a>
                        )}
                        {myCommunity.discord && (
                          <a href={myCommunity.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Discord
                          </a>
                        )}
                        {myCommunity.luma && (
                          <a href={myCommunity.luma} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Lu.ma
                          </a>
                        )}
                        {myCommunity.twitter && (
                          <a href={myCommunity.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Twitter
                          </a>
                        )}
                        {myCommunity.instagram && (
                          <a href={myCommunity.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ExternalLink className="h-4 w-4" /> Instagram
                          </a>
                        )}
                      </div>
                      {communitiesSource !== 'firestore' && (
                        <p className="mt-4 text-xs text-yellow-400">
                          Editing is disabled until an admin migrates communities to Firestore.
                        </p>
                      )}
                    </div>
                  )
                })()
              ) : (
                // Admin view - show all communities
                <div className="space-y-4">
                  {communities.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No communities found.</p>
                  ) : (
                    communities.map((community) => (
                      <div key={community.id} className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-4">
                          {community.logo && (
                            <img 
                              src={community.logo} 
                              alt={community.name} 
                              className="h-12 w-12 rounded-lg object-contain bg-gray-900 p-1.5 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white truncate">{community.name}</h3>
                              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-800 rounded-full">{community.id}</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{community.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {community.website && <span>Website</span>}
                              {community.meetup && <span>Meetup</span>}
                              {community.discord && <span>Discord</span>}
                              {community.luma && <span>Lu.ma</span>}
                              {community.twitter && <span>Twitter</span>}
                            </div>
                          </div>
                          {communitiesSource === 'firestore' && (
                            <button
                              onClick={() => handleEditCommunity(community)}
                              className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors shrink-0"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Edit Community Modal */}
              {showEditCommunity && editingCommunity && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">Edit Community</h3>
                    <form onSubmit={handleSaveCommunity} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={editingCommunity.name}
                          onChange={(e) => setEditingCommunity({ ...editingCommunity, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-300">Logo</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(true)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <Upload className="h-3 w-3" />
                              File
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(false)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                !useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <LinkIcon className="h-3 w-3" />
                              URL
                            </button>
                          </div>
                        </div>
                        {useFileUpload ? (
                          <div className="space-y-3">
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleLogoUpload(file)
                                }}
                                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ef426f] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-[#d63760] file:cursor-pointer"
                                disabled={isUploadingLogo}
                              />
                              {isUploadingLogo && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <Loader2 className="h-5 w-5 animate-spin text-[#ef426f]" />
                                </div>
                              )}
                            </div>
                            {editingCommunity.logo && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800 border border-gray-700">
                                <img 
                                  src={editingCommunity.logo} 
                                  alt="Logo preview" 
                                  className="h-10 w-10 rounded object-contain bg-gray-700"
                                />
                                <span className="text-xs text-gray-400 truncate flex-1">{editingCommunity.logo}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="url"
                            required
                            value={editingCommunity.logo}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, logo: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                        <textarea
                          required
                          rows={4}
                          value={editingCommunity.description}
                          onChange={(e) => setEditingCommunity({ ...editingCommunity, description: e.target.value })}
                          className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Website</label>
                          <input
                            type="url"
                            value={editingCommunity.website || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, website: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Meetup</label>
                          <input
                            type="url"
                            value={editingCommunity.meetup || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, meetup: e.target.value })}
                            placeholder="https://meetup.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Discord</label>
                          <input
                            type="url"
                            value={editingCommunity.discord || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, discord: e.target.value })}
                            placeholder="https://discord.gg/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Lu.ma</label>
                          <input
                            type="url"
                            value={editingCommunity.luma || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, luma: e.target.value })}
                            placeholder="https://lu.ma/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Twitter</label>
                          <input
                            type="url"
                            value={editingCommunity.twitter || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, twitter: e.target.value })}
                            placeholder="https://twitter.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Instagram</label>
                          <input
                            type="url"
                            value={editingCommunity.instagram || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, instagram: e.target.value })}
                            placeholder="https://instagram.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={editingCommunity.linkedin || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">YouTube</label>
                          <input
                            type="url"
                            value={editingCommunity.youtube || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, youtube: e.target.value })}
                            placeholder="https://youtube.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Twitch</label>
                          <input
                            type="url"
                            value={editingCommunity.twitch || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, twitch: e.target.value })}
                            placeholder="https://twitch.tv/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Facebook</label>
                          <input
                            type="url"
                            value={editingCommunity.facebook || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, facebook: e.target.value })}
                            placeholder="https://facebook.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">GitHub</label>
                          <input
                            type="url"
                            value={editingCommunity.github || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, github: e.target.value })}
                            placeholder="https://github.com/..."
                            className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditCommunity(false)
                            setEditingCommunity(null)
                          }}
                          className="flex-1 rounded-xl border border-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingCommunity}
                          className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                        >
                          {isSavingCommunity ? (
                            <>
                              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
