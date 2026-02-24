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
  Link as LinkIcon,
  ChevronDown,
  Settings,
  LogOut,
  User,
  RocketIcon,
  X
} from "lucide-react"

import { RichTextEditor } from "@/components/rich-text-editor"

interface DevSASubscriber {
  id: string
  name: string
  email: string
  source: "luma" | "meetup"
  subscribedAt: string
  status: "active"
  location?: string
}

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
  firstName?: string
  lastName?: string
  profileImage?: string
}

interface CalendarEvent {
  id: string
  title: string
  slug: string
  date: string
  endTime?: string
  location: string
  venue?: string
  address?: string
  description: string
  url?: string
  communityId: string
  communityName?: string
  status: string
  source?: string
  isStatic?: boolean
  eventType?: 'in-person' | 'hybrid' | 'virtual'
  rsvpEnabled?: boolean
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

interface EventRSVP {
  id: string
  eventId: string
  eventSlug: string
  communityId: string
  firstName: string
  lastName: string
  email: string
  joinNewsletter: boolean
  submittedAt: string
}

type Tab = "newsletter" | "devsa" | "speakers" | "access" | "admins" | "events" | "communities" | "rsvps"

// Protected super admin email - cannot be removed or modified
const SUPER_ADMIN_EMAIL = 'jesse@devsanantonio.com'

// Helper to check if a role has admin-level access
const hasAdminAccess = (role: string | null | undefined): boolean => {
  return role === 'superadmin' || role === 'admin'
}

// Helper to get community name from id
const getCommunityName = (communityId: string | undefined, communityList?: Community[]): string => {
  if (!communityId) return "All Communities"
  if (!communityList || communityList.length === 0) return communityId
  const community = communityList.find(c => c.id === communityId)
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
  const [rsvps, setRsvps] = useState<EventRSVP[]>([])
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<string>("all")
  const [selectedRsvpCommunity, setSelectedRsvpCommunity] = useState<string>("all")
  const [isExportingRsvps, setIsExportingRsvps] = useState(false)
  
  // Profile state
  const [adminFirstName, setAdminFirstName] = useState<string>("")
  const [adminLastName, setAdminLastName] = useState<string>("")
  const [adminProfileImage, setAdminProfileImage] = useState<string>("")
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileFirstName, setProfileFirstName] = useState("")
  const [profileLastName, setProfileLastName] = useState("")
  
  // Modal state
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCommunityFilter, setShowCommunityFilter] = useState(false)
  const [showEventFilter, setShowEventFilter] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [showEditCommunity, setShowEditCommunity] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDeletingSpeaker, setIsDeletingSpeaker] = useState<string | null>(null)
  const [isDeletingNewsletter, setIsDeletingNewsletter] = useState<string | null>(null)
  const [isDeletingRsvp, setIsDeletingRsvp] = useState<string | null>(null)
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
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [newCommunity, setNewCommunity] = useState<Omit<Community, 'isStatic'>>({
    id: "",
    name: "",
    logo: "",
    description: "",
    website: "",
    discord: "",
    meetup: "",
    luma: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    twitch: "",
    facebook: "",
    github: "",
  })
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false)
  const [isUploadingNewLogo, setIsUploadingNewLogo] = useState(false)
  const [isDeletingCommunity, setIsDeletingCommunity] = useState<string | null>(null)
  const [isDevsaAccordionOpen, setIsDevsaAccordionOpen] = useState(false)
  const [devsaSourceFilter, setDevsaSourceFilter] = useState<"luma" | "meetup">("luma")
  const [newsletterCommunityFilter, setNewsletterCommunityFilter] = useState<string>("all")
  const [showNewsletterCommunityDropdown, setShowNewsletterCommunityDropdown] = useState(false)
  const [devsaSubs, setDevsaSubs] = useState<DevSASubscriber[]>([])
  const [editingDevsaSub, setEditingDevsaSub] = useState<DevSASubscriber | null>(null)
  const [showEditEventCommunityDropdown, setShowEditEventCommunityDropdown] = useState(false)
  const [editEventUseCustomCommunity, setEditEventUseCustomCommunity] = useState(false)
  const [editEventCustomCommunityName, setEditEventCustomCommunityName] = useState("")

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
        setAdminFirstName(data.firstName || "")
        setAdminLastName(data.lastName || "")
        setAdminProfileImage(data.profileImage || "")
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
        fetch('/api/communities')
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

      // Fetch RSVPs
      const rsvpsRes = await fetch(`/api/rsvp?adminEmail=${encodeURIComponent(email)}`)
      if (rsvpsRes.ok) {
        const rsvpsData = await rsvpsRes.json()
        setRsvps(rsvpsData.rsvps || [])
      }

      // Fetch DevSA subscribers from Firestore (admin only)
      const isAdmin = hasAdminAccess(role) || hasAdminAccess(adminRole)
      if (isAdmin) {
        try {
          const devsaRes = await fetch(`/api/admin/devsa-subscribers?adminEmail=${encodeURIComponent(email)}`)
          if (devsaRes.ok) {
            const devsaData = await devsaRes.json()
            setDevsaSubs(devsaData.subscribers || [])
          }
        } catch {
          // Silently fail — subscribers tab will show empty
        }
      }
    } catch {
      setError("Failed to fetch data")
    }
  }

  const handleExportRsvps = async (eventId?: string) => {
    setIsExportingRsvps(true)
    try {
      let url = `/api/rsvp?adminEmail=${encodeURIComponent(adminEmail)}&format=csv`
      if (eventId && eventId !== 'all') {
        url += `&eventId=${eventId}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `rsvps-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        setError("Failed to export RSVPs")
      }
    } catch {
      setError("Failed to export RSVPs")
    } finally {
      setIsExportingRsvps(false)
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
    // For backward compatibility: if venue/address are empty but location exists, 
    // try to split the location into venue and address
    const updatedEvent = { ...event }
    if (!updatedEvent.venue && !updatedEvent.address && updatedEvent.location) {
      const parts = updatedEvent.location.split(',')
      if (parts.length >= 2) {
        updatedEvent.venue = parts[0].trim()
        updatedEvent.address = parts.slice(1).join(',').trim()
      } else {
        updatedEvent.venue = updatedEvent.location
        updatedEvent.address = ''
      }
    }
    setEditingEvent(updatedEvent)
    setShowEditEvent(true)
    // Reset custom community state - check if event's community IDs are all known
    const communityIds = (updatedEvent.communityId || '').split(',').filter(Boolean)
    const allKnown = communityIds.length > 0 && communityIds.every(id => communities.some(c => c.id === id))
    if (!allKnown && updatedEvent.communityId && communityIds.length === 1) {
      // Single unknown community (custom/one-off)
      setEditEventUseCustomCommunity(true)
      setEditEventCustomCommunityName(updatedEvent.communityName || updatedEvent.communityId)
    } else {
      setEditEventUseCustomCommunity(false)
      setEditEventCustomCommunityName("")
    }
    setShowEditEventCommunityDropdown(false)
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
          endTime: editingEvent.endTime,
          venue: editingEvent.venue || '',
          address: editingEvent.address || '',
          location: editingEvent.venue && editingEvent.address
            ? `${editingEvent.venue}, ${editingEvent.address}`
            : editingEvent.venue || editingEvent.address || editingEvent.location,
          description: editingEvent.description,
          status: editingEvent.status,
          eventType: editingEvent.eventType,
          rsvpEnabled: editingEvent.rsvpEnabled,
          communityId: editingEvent.communityId,
          ...(editEventUseCustomCommunity && editEventCustomCommunityName ? { communityName: editEventCustomCommunityName } : {}),
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

  const handleDeleteNewsletter = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to delete this newsletter subscription?")) return
    
    setIsDeletingNewsletter(subscriptionId)
    try {
      const response = await fetch("/api/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          adminEmail,
        }),
      })

      if (response.ok) {
        setNewsletter(prev => prev.filter(s => s.id !== subscriptionId))
        setSuccessMessage("Newsletter subscription deleted")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete subscription")
      }
    } catch {
      setError("Failed to delete subscription")
    } finally {
      setIsDeletingNewsletter(null)
    }
  }

  const handleDeleteRsvp = async (rsvpId: string) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return
    
    setIsDeletingRsvp(rsvpId)
    try {
      const response = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpId,
          adminEmail,
        }),
      })

      if (response.ok) {
        setRsvps(prev => prev.filter(r => r.id !== rsvpId))
        setSuccessMessage("RSVP deleted")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete RSVP")
      }
    } catch {
      setError("Failed to delete RSVP")
    } finally {
      setIsDeletingRsvp(null)
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

  const handleNewLogoUpload = async (file: File) => {
    if (!newCommunity.id) {
      setError("Please enter a community ID first")
      return
    }

    setIsUploadingNewLogo(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('adminEmail', adminEmail)
      formData.append('communityId', newCommunity.id)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setNewCommunity({ ...newCommunity, logo: data.url })
        setSuccessMessage('Logo uploaded successfully!')
      } else {
        setError(data.error || 'Failed to upload logo')
      }
    } catch {
      setError('Failed to upload logo')
    } finally {
      setIsUploadingNewLogo(false)
    }
  }

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCommunity.id || !newCommunity.name || !newCommunity.logo || !newCommunity.description) {
      setError("ID, name, logo, and description are required")
      return
    }

    setIsCreatingCommunity(true)
    setError(null)

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCommunity,
          adminEmail,
        }),
      })

      if (response.ok) {
        setShowCreateCommunity(false)
        setNewCommunity({
          id: "",
          name: "",
          logo: "",
          description: "",
          website: "",
          discord: "",
          meetup: "",
          luma: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
          twitch: "",
          facebook: "",
          github: "",
        })
        setSuccessMessage("Community created successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create community")
      }
    } catch {
      setError("Failed to create community")
    } finally {
      setIsCreatingCommunity(false)
    }
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

  const handleDeleteCommunity = async (communityId: string, communityName: string) => {
    if (!confirm(`Are you sure you want to delete "${communityName}"? This action cannot be undone.`)) return

    setIsDeletingCommunity(communityId)
    setError(null)
    try {
      const response = await fetch("/api/communities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: communityId,
          adminEmail,
        }),
      })

      if (response.ok) {
        setSuccessMessage("Community deleted successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete community")
      }
    } catch {
      setError("Failed to delete community")
    } finally {
      setIsDeletingCommunity(null)
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
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ef426f]/20">
                <Shield className="h-8 w-8 text-[#ef426f]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-neutral-400">Enter your email to access the admin panel</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="admin@devsa.community"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pl-10 pr-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
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
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="inline-flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden">
                {adminProfileImage ? (
                  <img src={adminProfileImage} alt="" className="h-full w-full object-cover" />
                ) : adminCommunityId && communities.find(c => c.id === adminCommunityId)?.logo ? (
                  <img src={communities.find(c => c.id === adminCommunityId)!.logo} alt="" className="h-full w-full object-contain p-0.5" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">Hello, {adminFirstName || adminEmail?.split('@')[0]}</p>
                <p className={`text-xs ${
                  adminRole === "superadmin" ? "text-yellow-400" : 
                  adminRole === "admin" ? "text-purple-400" : "text-blue-400"
                }`}>
                  {adminRole === "superadmin" ? "Super Admin" : adminRole === "admin" ? "Admin" : "Organizer"}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-4 border-b border-neutral-700 bg-neutral-800/80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef426f] overflow-hidden">
                        {adminProfileImage ? (
                          <img src={adminProfileImage} alt="" className="h-full w-full object-cover" />
                        ) : adminCommunityId && communities.find(c => c.id === adminCommunityId)?.logo ? (
                          <img src={communities.find(c => c.id === adminCommunityId)!.logo} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {adminFirstName || adminLastName ? (
                          <p className="text-sm font-medium text-white truncate">
                            {adminFirstName} {adminLastName}
                          </p>
                        ) : null}
                        <p className="text-xs text-neutral-400 truncate">{adminEmail}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          adminRole === "superadmin"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : adminRole === "admin"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {adminRole === "superadmin" ? "Super Admin" : adminRole === "admin" ? "Admin" : "Organizer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Community Info (for organizers) */}
                  {adminRole === "organizer" && (
                    <div className="px-4 py-3 border-b border-neutral-700">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Community</p>
                      {adminCommunityId ? (
                        <p className="text-sm text-white font-medium">{getCommunityName(adminCommunityId)}</p>
                      ) : (
                        <p className="text-sm text-red-400">No community assigned</p>
                      )}
                    </div>
                  )}

                  {/* Edit Profile Section */}
                  {showProfileEdit ? (
                    <div className="px-4 py-3 border-b border-neutral-700">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Edit Profile</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">First Name</label>
                          <input
                            type="text"
                            value={profileFirstName}
                            onChange={(e) => setProfileFirstName(e.target.value)}
                            placeholder="Enter first name"
                            className="w-full rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={profileLastName}
                            onChange={(e) => setProfileLastName(e.target.value)}
                            placeholder="Enter last name"
                            className="w-full rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={async () => {
                              setIsSavingProfile(true)
                              try {
                                const res = await fetch('/api/admin/auth', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    email: adminEmail,
                                    firstName: profileFirstName,
                                    lastName: profileLastName,
                                  }),
                                })
                                if (res.ok) {
                                  setAdminFirstName(profileFirstName)
                                  setAdminLastName(profileLastName)
                                  setShowProfileEdit(false)
                                  setSuccessMessage('Profile updated successfully')
                                }
                              } catch {
                                setError('Failed to update profile')
                              } finally {
                                setIsSavingProfile(false)
                              }
                            }}
                            disabled={isSavingProfile}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-3 py-2 text-sm font-medium text-white hover:bg-[#d93a60] disabled:opacity-50"
                          >
                            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileEdit(false)
                              setProfileFirstName(adminFirstName)
                              setProfileLastName(adminLastName)
                            }}
                            className="flex-1 rounded-lg border border-neutral-600 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 border-b border-neutral-700">
                      <button
                        onClick={() => {
                          setProfileFirstName(adminFirstName)
                          setProfileLastName(adminLastName)
                          setShowProfileEdit(true)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-700/50 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </button>
                    </div>
                  )}

                  {/* Logout Button */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs - Reordered: Primary actions first, admin settings in dropdown */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {/* Primary tabs - shown to everyone */}
          <button
            onClick={() => setActiveTab("events")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "events"
                ? "bg-[#ef426f] text-white"
                : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("rsvps")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "rsvps"
                ? "bg-[#ef426f] text-white"
                : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Users className="h-4 w-4" />
            RSVPs ({rsvps.length})
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "communities"
                ? "bg-[#ef426f] text-white"
                : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Building2 className="h-4 w-4" />
            {adminRole === "organizer" ? "My Community" : `Communities (${communities.length})`}
          </button>

          {/* Admin-only dropdown menu */}
          {hasAdminAccess(adminRole) && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  ["newsletter", "speakers", "access", "admins"].includes(activeTab)
                    ? "bg-[#ef426f] text-white"
                    : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin
                {(accessRequests.filter(r => r.status === "pending").length > 0) && (
                  <span className="flex h-2 w-2 rounded-full bg-yellow-400" />
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdminMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown menu */}
              {showAdminMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAdminMenu(false)} 
                  />
                  <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-xl border border-neutral-700 bg-neutral-800 py-2 shadow-xl">
                    <button
                      onClick={() => {
                        setActiveTab("devsa")
                        setShowAdminMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "devsa"
                          ? "bg-[#ef426f]/20 text-[#ef426f]"
                          : "text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <RocketIcon className="h-4 w-4" />
                      DEVSA Subscribers
                      <span className="ml-auto text-xs text-neutral-500">{devsaSubs.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("newsletter")
                        setShowAdminMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "newsletter"
                          ? "bg-[#ef426f]/20 text-[#ef426f]"
                          : "text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Newsletter
                      <span className="ml-auto text-xs text-neutral-500">{newsletter.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("speakers")
                        setShowAdminMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "speakers"
                          ? "bg-[#ef426f]/20 text-[#ef426f]"
                          : "text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <Mic2 className="h-4 w-4" />
                      Speakers
                      <span className="ml-auto text-xs text-neutral-500">{speakers.length}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("access")
                        setShowAdminMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "access"
                          ? "bg-[#ef426f]/20 text-[#ef426f]"
                          : "text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Access Requests
                      {accessRequests.filter(r => r.status === "pending").length > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                          {accessRequests.filter(r => r.status === "pending").length}
                        </span>
                      )}
                    </button>
                    <div className="my-2 border-t border-neutral-700" />
                    <button
                      onClick={() => {
                        setActiveTab("admins")
                        setShowAdminMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "admins"
                          ? "bg-[#ef426f]/20 text-[#ef426f]"
                          : "text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      Manage Admins
                      <span className="ml-auto text-xs text-neutral-500">{admins.length}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8">
          {/* Newsletter Tab - Admin Only */}
          {activeTab === "newsletter" && hasAdminAccess(adminRole) && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Newsletter Subscriptions</h2>
                {/* Community Group Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowNewsletterCommunityDropdown(!showNewsletterCommunityDropdown)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    <Users className="h-4 w-4 text-neutral-400" />
                    {newsletterCommunityFilter === "all" ? "All Groups" : getCommunityNameFromState(newsletterCommunityFilter)}
                    <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showNewsletterCommunityDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showNewsletterCommunityDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNewsletterCommunityDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl max-h-64 overflow-y-auto">
                        <button
                          onClick={() => { setNewsletterCommunityFilter("all"); setShowNewsletterCommunityDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                            newsletterCommunityFilter === "all" ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          All Groups
                          <span className="ml-auto text-xs text-neutral-500">{newsletter.length}</span>
                        </button>
                        {communities.map(c => {
                          const count = newsletter.filter(sub => {
                            const slug = sub.source?.startsWith('event-rsvp:') ? sub.source.replace('event-rsvp:', '') : null
                            const ev = slug ? events.find(e => e.slug === slug) : null
                            return ev?.communityId === c.id
                          }).length
                          return (
                            <button
                              key={c.id}
                              onClick={() => { setNewsletterCommunityFilter(c.id); setShowNewsletterCommunityDropdown(false) }}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                newsletterCommunityFilter === c.id ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="ml-auto text-xs text-neutral-500 shrink-0">{count}</span>
                            </button>
                          )
                        })}
                        <button
                          onClick={() => { setNewsletterCommunityFilter("uncategorized"); setShowNewsletterCommunityDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                            newsletterCommunityFilter === "uncategorized" ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          Uncategorized
                          <span className="ml-auto text-xs text-neutral-500">{newsletter.filter(sub => {
                            const slug = sub.source?.startsWith('event-rsvp:') ? sub.source.replace('event-rsvp:', '') : null
                            const ev = slug ? events.find(e => e.slug === slug) : null
                            return !ev
                          }).length}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {(() => {
                const filteredNewsletter = newsletterCommunityFilter === "all" 
                  ? newsletter 
                  : newsletter.filter(sub => {
                      const slug = sub.source?.startsWith('event-rsvp:') ? sub.source.replace('event-rsvp:', '') : null
                      const ev = slug ? events.find(e => e.slug === slug) : null
                      if (newsletterCommunityFilter === "uncategorized") return !ev
                      return ev?.communityId === newsletterCommunityFilter
                    })
                return filteredNewsletter.length === 0 ? (
                  <p className="text-neutral-400 text-center py-8">No newsletter subscriptions{newsletterCommunityFilter !== "all" ? " for this group" : ""} yet.</p>
                ) : (
                  <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-800">
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Community</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Event</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Subscribed</th>
                          <th className="text-right py-3 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {filteredNewsletter.map((sub) => {
                          const eventSlug = sub.source?.startsWith('event-rsvp:') 
                            ? sub.source.replace('event-rsvp:', '') 
                            : null
                          const event = eventSlug ? events.find(e => e.slug === eventSlug) : null
                          const community = event ? communities.find(c => c.id === event.communityId) : null
                          
                          return (
                            <tr key={sub.id} className="hover:bg-neutral-800/30 transition-colors leading-tight">
                              <td className="py-2.5 px-4 text-sm font-semibold text-white whitespace-nowrap">{sub.email}</td>
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                {community ? (
                                  <span className="inline-flex items-center rounded-full bg-[#ef426f]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#ef426f]">
                                    {community.name}
                                  </span>
                                ) : (
                                  <span className="text-sm text-neutral-500">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-sm font-medium text-neutral-400 whitespace-nowrap max-w-50 truncate">
                                {event?.title || (sub.source || "Direct signup")}
                              </td>
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  sub.status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-neutral-500/20 text-neutral-400"
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-sm font-medium text-neutral-400 whitespace-nowrap">
                                {new Date(sub.subscribedAt).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteNewsletter(sub.id)}
                                  disabled={isDeletingNewsletter === sub.id}
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                  {isDeletingNewsletter === sub.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>
          )}

          {/* DevSA Newsletter Subscribers Tab - Admin & Super Admin Only */}
          {activeTab === "devsa" && hasAdminAccess(adminRole) && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-white">Subscribers from {devsaSourceFilter === "luma" ? "Luma" : "Meetup"}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                      <Shield className="h-3 w-3" /> Admin Only
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(["luma", "meetup"] as const).map((source) => {
                    const count = devsaSubs.filter(s => s.source === source).length
                    return (
                      <button
                        key={source}
                        onClick={() => setDevsaSourceFilter(source)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          devsaSourceFilter === source
                            ? source === "luma" 
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                        }`}
                      >
                        {source === "luma" ? "Luma" : "Meetup"}
                        <span className="text-[10px] opacity-70">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[25%]">Name</th>
                      <th className="text-left py-3 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[30%]">Email</th>
                      <th className="text-left py-3 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[10%]">Source</th>
                      <th className="text-left py-3 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[15%]">Subscribed</th>
                      <th className="text-right py-3 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {devsaSubs
                      .filter(sub => sub.source === devsaSourceFilter)
                      .sort((a, b) => {
                        const parseDate = (d: string) => {
                          if (d.includes('T')) return new Date(d).getTime()
                          const parsed = new Date(d)
                          return isNaN(parsed.getTime()) ? 0 : parsed.getTime()
                        }
                        return parseDate(b.subscribedAt) - parseDate(a.subscribedAt)
                      })
                      .map((sub) => (
                      <tr key={sub.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-2 px-3 text-sm font-semibold text-white truncate">
                          {editingDevsaSub?.id === sub.id ? (
                            <input
                              type="text"
                              value={editingDevsaSub.name}
                              onChange={(e) => setEditingDevsaSub({ ...editingDevsaSub, name: e.target.value })}
                              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-2 py-1 text-sm text-white focus:border-[#ef426f] focus:outline-none"
                            />
                          ) : (
                            sub.name || "—"
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm text-neutral-300 truncate">
                          {editingDevsaSub?.id === sub.id ? (
                            <input
                              type="email"
                              value={editingDevsaSub.email}
                              onChange={(e) => setEditingDevsaSub({ ...editingDevsaSub, email: e.target.value })}
                              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-2 py-1 text-sm text-white focus:border-[#ef426f] focus:outline-none"
                            />
                          ) : (
                            sub.email || "—"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            sub.source === "luma"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {sub.source === "luma" ? "Luma" : "Meetup"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-neutral-400">
                          {sub.subscribedAt.includes('T') 
                            ? new Date(sub.subscribedAt).toLocaleDateString() 
                            : sub.subscribedAt}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {editingDevsaSub?.id === sub.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/admin/devsa-subscribers', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        adminEmail,
                                        subscriberId: editingDevsaSub.id,
                                        name: editingDevsaSub.name,
                                        email: editingDevsaSub.email,
                                      }),
                                    })
                                    if (res.ok) {
                                      setDevsaSubs(prev => prev.map(s => s.id === editingDevsaSub.id ? editingDevsaSub : s))
                                    } else {
                                      setError('Failed to update subscriber')
                                    }
                                  } catch {
                                    setError('Failed to update subscriber')
                                  }
                                  setEditingDevsaSub(null)
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition-colors"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingDevsaSub(null)}
                                className="inline-flex items-center gap-1 rounded-lg bg-neutral-700/50 px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-neutral-700 transition-colors"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingDevsaSub({ ...sub })}
                                className="inline-flex items-center gap-1 rounded-lg bg-neutral-700/50 px-2 py-1 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove ${sub.name || sub.email || 'this subscriber'}?`)) {
                                    try {
                                      const res = await fetch('/api/admin/devsa-subscribers', {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          adminEmail,
                                          subscriberId: sub.id,
                                        }),
                                      })
                                      if (res.ok) {
                                        setDevsaSubs(prev => prev.filter(s => s.id !== sub.id))
                                      } else {
                                        setError('Failed to delete subscriber')
                                      }
                                    } catch {
                                      setError('Failed to delete subscriber')
                                    }
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Speakers Tab - Admin Only */}
          {activeTab === "speakers" && hasAdminAccess(adminRole) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Speaker Submissions</h2>
              {speakers.length === 0 ? (
                <p className="text-neutral-400 text-center py-8">No speaker submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-6 hover:bg-neutral-800/50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white">{speaker.sessionTitle}</h3>
                          <p className="text-neutral-400 text-sm mt-1">
                            {speaker.name} {speaker.company && <span className="text-neutral-500">• {speaker.company}</span>}
                          </p>
                          <p className="text-neutral-500 text-sm">{speaker.email}</p>
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
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Format</span>
                        <p className="text-neutral-300 text-sm mt-1">{speaker.sessionFormat}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Abstract</span>
                        <p className="text-neutral-300 text-sm mt-1 leading-relaxed">{speaker.abstract}</p>
                      </div>
                      <p className="mt-4 text-xs text-neutral-500">
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
                <p className="text-neutral-400 text-center py-8">No access requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-6 hover:bg-neutral-800/50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-white">{request.name}</h3>
                          <p className="text-neutral-400 text-sm mt-1">{request.email}</p>
                          <p className="text-neutral-500 text-sm mt-1">
                            Community: <span className="text-neutral-400">{request.communityOrg}</span>
                          </p>
                          <p className="text-xs text-neutral-500 mt-3">
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
                <p className="text-neutral-400 text-center py-8">No approved admins yet.</p>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <table className="w-full min-w-150">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-4 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Role</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Community</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Approved At</th>
                        <th className="text-left py-4 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-neutral-800/30 transition-colors">
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
                          <td className="py-4 px-4 text-sm text-neutral-400">{getCommunityName(admin.communityId)}</td>
                          <td className="py-4 px-4 text-sm text-neutral-400">
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
                                <span className="text-xs text-neutral-500 italic">Protected</span>
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
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 max-w-md w-full shadow-2xl">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">
                      {editingAdmin ? "Edit Admin" : "Add New Admin"}
                    </h3>
                    <form onSubmit={handleAddAdmin} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="user@example.com"
                          disabled={!!editingAdmin}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {editingAdmin && (
                          <p className="mt-2 text-xs text-neutral-500">Email cannot be changed</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
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
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        >
                          <option value="organizer">Organizer (can only manage their community&apos;s events)</option>
                          <option value="admin">Admin (full access to all features)</option>
                        </select>
                      </div>
                      {newAdminRole === "organizer" && (
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Assigned Community *
                          </label>
                          <select
                            required={newAdminRole === "organizer"}
                            value={newAdminCommunity}
                            onChange={(e) => setNewAdminCommunity(e.target.value)}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          >
                            <option value="">Select a community</option>
                            {communities.map((community) => (
                              <option key={community.id} value={community.id}>
                                {community.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-neutral-500">
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
                          className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
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
                  <div key={event.id} className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-6 hover:bg-neutral-800/50 transition-colors">
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
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-neutral-500/20 text-neutral-400">
                              Static
                            </span>
                          )}
                          {event.eventType && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${
                              event.eventType === 'in-person'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                : event.eventType === 'hybrid'
                                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {event.eventType === 'in-person' && '🏢'}
                              {event.eventType === 'hybrid' && '🔀'}
                              {event.eventType === 'virtual' && '💻'}
                              {' '}{event.eventType}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-400 text-sm mt-1">{event.communityName || event.communityId}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-neutral-500">
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
                          <span className="text-neutral-600">•</span>
                          <span>{event.location}</span>
                          {event.source && (
                            <>
                              <span className="text-neutral-600">•</span>
                              <span className="text-xs text-neutral-600">Source: {event.source}</span>
                            </>
                          )}
                        </div>
                        <p className="text-neutral-400 text-sm mt-3 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {event.isStatic ? (
                          <span className="text-xs text-neutral-500 italic">
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
                        <p className="text-neutral-400 text-center py-8 bg-neutral-800/20 rounded-xl border border-neutral-800">
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
                        <h3 className="text-lg font-semibold text-neutral-400 mb-4 flex items-center gap-2">
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
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">Edit Event</h3>
                    <form onSubmit={handleUpdateEvent} className="space-y-5">
                      {/* Community selector - admin/superadmin only */}
                      {hasAdminAccess(adminRole) && (
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Community <span className="font-normal text-neutral-500">(select one or more)</span>
                          </label>
                          <div className="relative">
                            {editEventUseCustomCommunity ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editEventCustomCommunityName}
                                  onChange={(e) => {
                                    setEditEventCustomCommunityName(e.target.value)
                                    setEditingEvent({ ...editingEvent, communityId: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                                  }}
                                  placeholder="e.g. Loveable, Microsoft, etc."
                                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditEventUseCustomCommunity(false)
                                    setEditEventCustomCommunityName("")
                                  }}
                                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Selected communities chips */}
                                {editingEvent.communityId && (
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {editingEvent.communityId.split(',').filter(Boolean).map((id) => {
                                      const community = communities.find(c => c.id === id)
                                      return (
                                        <span
                                          key={id}
                                          className="inline-flex items-center gap-1.5 rounded-full bg-[#ef426f]/15 border border-[#ef426f]/30 px-3 py-1 text-xs font-semibold text-[#ef426f]"
                                        >
                                          {community?.name || id}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const ids = editingEvent.communityId.split(',').filter(i => i !== id)
                                              setEditingEvent({ ...editingEvent, communityId: ids.join(',') })
                                            }}
                                            className="hover:text-white transition-colors"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowEditEventCommunityDropdown(!showEditEventCommunityDropdown)}
                                  className="w-full flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-left focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                                >
                                  <span className="text-white">
                                    {editingEvent.communityId
                                      ? `${editingEvent.communityId.split(',').length} selected — click to add more`
                                      : "Select communities"}
                                  </span>
                                  <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showEditEventCommunityDropdown ? "rotate-180" : ""}`} />
                                </button>
                                {showEditEventCommunityDropdown && (
                                  <>
                                    <div className="fixed inset-0 z-60" onClick={() => setShowEditEventCommunityDropdown(false)} />
                                    <div className="absolute left-0 right-0 top-full mt-1 z-70 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl max-h-56 overflow-y-auto">
                                      {communities.map((community) => {
                                        const selectedIds = editingEvent.communityId.split(',').filter(Boolean)
                                        const isSelected = selectedIds.includes(community.id)
                                        return (
                                          <button
                                            key={community.id}
                                            type="button"
                                            onClick={() => {
                                              const selectedIds = editingEvent.communityId.split(',').filter(Boolean)
                                              if (isSelected) {
                                                setEditingEvent({ ...editingEvent, communityId: selectedIds.filter(id => id !== community.id).join(',') })
                                              } else {
                                                setEditingEvent({ ...editingEvent, communityId: [...selectedIds, community.id].join(',') })
                                              }
                                            }}
                                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                              isSelected
                                                ? "bg-[#ef426f]/20 text-[#ef426f]"
                                                : "text-neutral-300 hover:bg-neutral-700"
                                            }`}
                                          >
                                            <span className={`flex items-center justify-center h-4 w-4 rounded border text-[10px] ${
                                              isSelected
                                                ? "bg-[#ef426f] border-[#ef426f] text-white"
                                                : "border-neutral-600"
                                            }`}>
                                              {isSelected && "✓"}
                                            </span>
                                            <span className="truncate">{community.name}</span>
                                          </button>
                                        )
                                      })}
                                      <div className="border-t border-neutral-700 mt-1 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditEventUseCustomCommunity(true)
                                            setShowEditEventCommunityDropdown(false)
                                          }}
                                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:bg-neutral-700 transition-colors"
                                        >
                                          <Users className="h-4 w-4" />
                                          Custom / One-off Event
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          {editEventUseCustomCommunity && (
                            <p className="mt-2 text-xs text-amber-400">
                              Custom community name for partners or one-off events
                            </p>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Event Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editingEvent.title}
                          onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      {/* Date and Time - using separate fields for accuracy */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            required
                            value={editingEvent.date ? (() => {
                              const d = new Date(editingEvent.date);
                              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            })() : ""}
                            onChange={(e) => {
                              const currentDate = new Date(editingEvent.date || new Date());
                              const [year, month, day] = e.target.value.split('-').map(Number);
                              currentDate.setFullYear(year, month - 1, day);
                              setEditingEvent({ ...editingEvent, date: currentDate.toISOString() });
                            }}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            required
                            value={editingEvent.date ? (() => {
                              const d = new Date(editingEvent.date);
                              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            })() : "18:00"}
                            onChange={(e) => {
                              const currentDate = new Date(editingEvent.date || new Date());
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              currentDate.setHours(hours, minutes);
                              setEditingEvent({ ...editingEvent, date: currentDate.toISOString() });
                            }}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={editingEvent.endTime ? (() => {
                              const d = new Date(editingEvent.endTime);
                              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                            })() : "20:00"}
                            onChange={(e) => {
                              const baseDate = new Date(editingEvent.date || new Date());
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              baseDate.setHours(hours, minutes);
                              setEditingEvent({ ...editingEvent, endTime: baseDate.toISOString() });
                            }}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Venue
                          </label>
                          <input
                            type="text"
                            required
                            value={editingEvent.venue || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                            placeholder="Geekdom"
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            required
                            value={editingEvent.address || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                            placeholder="110 E Houston St, San Antonio, TX"
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                      </div>
                      {/* Event Format */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Event Format
                        </label>
                        <select
                          value={editingEvent.eventType || 'in-person'}
                          onChange={(e) => setEditingEvent({ ...editingEvent, eventType: e.target.value as 'in-person' | 'hybrid' | 'virtual' })}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        >
                          <option value="in-person">🏢 In-Person</option>
                          <option value="hybrid">🔀 Hybrid</option>
                          <option value="virtual">💻 Virtual</option>
                        </select>
                        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                          {editingEvent.eventType === 'virtual' && 'Attendees will join via an online platform'}
                          {editingEvent.eventType === 'hybrid' && 'Attendees can join in person or online'}
                          {(!editingEvent.eventType || editingEvent.eventType === 'in-person') && 'Attendees will meet at the specified location'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Description
                        </label>
                        <RichTextEditor
                          required
                          rows={10}
                          value={editingEvent.description}
                          onChange={(value) => setEditingEvent({ ...editingEvent, description: value })}
                          placeholder="Describe your event. Select text to format."
                          darkMode={true}
                        />
                      </div>
                      {/* RSVP Toggle */}
                      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-semibold text-neutral-300">Enable RSVP</label>
                            <p className="text-xs text-neutral-500 mt-1">
                              Collect RSVPs on your event page
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={editingEvent.rsvpEnabled || false}
                            onClick={() => setEditingEvent({ ...editingEvent, rsvpEnabled: !editingEvent.rsvpEnabled })}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ef426f] focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                              editingEvent.rsvpEnabled ? 'bg-[#ef426f]' : 'bg-neutral-600'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                editingEvent.rsvpEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Status
                        </label>
                        <select
                          value={editingEvent.status}
                          onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                        <p className="mt-2 text-xs text-neutral-500">
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
                          className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
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
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {adminRole === "organizer" ? "My Community" : "Communities"}
                </h2>
                <div className="flex items-center gap-3">
                  {hasAdminAccess(adminRole) && communitiesSource === 'firestore' && (
                    <button
                      onClick={() => setShowCreateCommunity(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Community
                    </button>
                  )}
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
              </div>

              {adminRole === "organizer" ? (
                // Organizer view - show only their community
                (() => {
                  const myCommunity = communities.find(c => c.id === adminCommunityId)
                  if (!myCommunity) {
                    return (
                      <div className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
                        <p className="text-neutral-400 mb-2">No community assigned to your account.</p>
                        <p className="text-neutral-500 text-sm">Contact an admin to assign you to a community.</p>
                      </div>
                    )
                  }
                  return (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-6">
                      <div className="flex items-start gap-4 mb-6">
                        {myCommunity.logo && (
                          <img 
                            src={myCommunity.logo} 
                            alt={myCommunity.name} 
                            className="h-16 w-16 rounded-xl object-contain bg-neutral-900 p-2"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold tracking-tight text-white">{myCommunity.name}</h3>
                          <p className="text-neutral-400 text-sm mt-1 leading-relaxed">{myCommunity.description}</p>
                        </div>
                        {communitiesSource === 'firestore' && (
                          <button
                            onClick={() => handleEditCommunity(myCommunity)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-700 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-600 transition-colors"
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
                    <p className="text-neutral-400 text-center py-8">No communities found.</p>
                  ) : (
                    communities.map((community) => (
                      <div key={community.id} className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 hover:bg-neutral-800/50 transition-colors">
                        <div className="flex items-start gap-4">
                          {community.logo && (
                            <img 
                              src={community.logo} 
                              alt={community.name} 
                              className="h-12 w-12 rounded-lg object-contain bg-neutral-900 p-1.5 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white truncate">{community.name}</h3>
                              <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-800 rounded-full">{community.id}</span>
                            </div>
                            <p className="text-neutral-400 text-sm mt-1 line-clamp-2">{community.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                              {community.website && <span>Website</span>}
                              {community.meetup && <span>Meetup</span>}
                              {community.discord && <span>Discord</span>}
                              {community.luma && <span>Lu.ma</span>}
                              {community.twitter && <span>Twitter</span>}
                            </div>
                          </div>
                          {communitiesSource === 'firestore' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleEditCommunity(community)}
                                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                              >
                                Edit
                              </button>
                              {hasAdminAccess(adminRole) && (
                                <button
                                  onClick={() => handleDeleteCommunity(community.id, community.name)}
                                  disabled={isDeletingCommunity === community.id}
                                  className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                  {isDeletingCommunity === community.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </button>
                              )}
                            </div>
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
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">Edit Community</h3>
                    <form onSubmit={handleSaveCommunity} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={editingCommunity.name}
                          onChange={(e) => setEditingCommunity({ ...editingCommunity, name: e.target.value })}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-neutral-300">Logo</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(true)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                              }`}
                            >
                              <Upload className="h-3 w-3" />
                              File
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(false)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                !useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
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
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ef426f] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-[#d63760] file:cursor-pointer"
                                disabled={isUploadingLogo}
                              />
                              {isUploadingLogo && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <Loader2 className="h-5 w-5 animate-spin text-[#ef426f]" />
                                </div>
                              )}
                            </div>
                            {editingCommunity.logo && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                                <img 
                                  src={editingCommunity.logo} 
                                  alt="Logo preview" 
                                  className="h-10 w-10 rounded object-contain bg-neutral-700"
                                />
                                <span className="text-xs text-neutral-400 truncate flex-1">{editingCommunity.logo}</span>
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
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">Description</label>
                        <textarea
                          required
                          rows={4}
                          value={editingCommunity.description}
                          onChange={(e) => setEditingCommunity({ ...editingCommunity, description: e.target.value })}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Website</label>
                          <input
                            type="url"
                            value={editingCommunity.website || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, website: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Meetup</label>
                          <input
                            type="url"
                            value={editingCommunity.meetup || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, meetup: e.target.value })}
                            placeholder="https://meetup.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Discord</label>
                          <input
                            type="url"
                            value={editingCommunity.discord || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, discord: e.target.value })}
                            placeholder="https://discord.gg/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Lu.ma</label>
                          <input
                            type="url"
                            value={editingCommunity.luma || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, luma: e.target.value })}
                            placeholder="https://lu.ma/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Twitter</label>
                          <input
                            type="url"
                            value={editingCommunity.twitter || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, twitter: e.target.value })}
                            placeholder="https://twitter.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Instagram</label>
                          <input
                            type="url"
                            value={editingCommunity.instagram || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, instagram: e.target.value })}
                            placeholder="https://instagram.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={editingCommunity.linkedin || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">YouTube</label>
                          <input
                            type="url"
                            value={editingCommunity.youtube || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, youtube: e.target.value })}
                            placeholder="https://youtube.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Twitch</label>
                          <input
                            type="url"
                            value={editingCommunity.twitch || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, twitch: e.target.value })}
                            placeholder="https://twitch.tv/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Facebook</label>
                          <input
                            type="url"
                            value={editingCommunity.facebook || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, facebook: e.target.value })}
                            placeholder="https://facebook.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">GitHub</label>
                          <input
                            type="url"
                            value={editingCommunity.github || ""}
                            onChange={(e) => setEditingCommunity({ ...editingCommunity, github: e.target.value })}
                            placeholder="https://github.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
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
                          className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
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

              {/* Create Community Modal */}
              {showCreateCommunity && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold tracking-tight text-white mb-6">Create New Community</h3>
                    <form onSubmit={handleCreateCommunity} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">Community ID *</label>
                        <input
                          type="text"
                          required
                          value={newCommunity.id}
                          onChange={(e) => setNewCommunity({ ...newCommunity, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          placeholder="e.g., san-antonio-devs"
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                        <p className="mt-1 text-xs text-neutral-500">Lowercase letters, numbers, and hyphens only. Cannot be changed later.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={newCommunity.name}
                          onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                          placeholder="e.g., San Antonio Developers"
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-neutral-300">Logo *</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(true)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                              }`}
                            >
                              <Upload className="h-3 w-3" />
                              File
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseFileUpload(false)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                !useFileUpload ? 'bg-[#ef426f] text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
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
                                  if (file) handleNewLogoUpload(file)
                                }}
                                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ef426f] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-[#d63760] file:cursor-pointer"
                                disabled={isUploadingNewLogo || !newCommunity.id}
                              />
                              {isUploadingNewLogo && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <Loader2 className="h-5 w-5 animate-spin text-[#ef426f]" />
                                </div>
                              )}
                            </div>
                            {!newCommunity.id && (
                              <p className="text-xs text-yellow-400">Enter a community ID first to enable file upload</p>
                            )}
                            {newCommunity.logo && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                                <img 
                                  src={newCommunity.logo} 
                                  alt="Logo preview" 
                                  className="h-10 w-10 rounded object-contain bg-neutral-700"
                                />
                                <span className="text-xs text-neutral-400 truncate flex-1">{newCommunity.logo}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="url"
                            required
                            value={newCommunity.logo}
                            onChange={(e) => setNewCommunity({ ...newCommunity, logo: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">Description *</label>
                        <textarea
                          required
                          rows={4}
                          value={newCommunity.description}
                          onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                          placeholder="Describe your community..."
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Website</label>
                          <input
                            type="url"
                            value={newCommunity.website || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, website: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Meetup</label>
                          <input
                            type="url"
                            value={newCommunity.meetup || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, meetup: e.target.value })}
                            placeholder="https://meetup.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Discord</label>
                          <input
                            type="url"
                            value={newCommunity.discord || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, discord: e.target.value })}
                            placeholder="https://discord.gg/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Lu.ma</label>
                          <input
                            type="url"
                            value={newCommunity.luma || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, luma: e.target.value })}
                            placeholder="https://lu.ma/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Twitter</label>
                          <input
                            type="url"
                            value={newCommunity.twitter || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, twitter: e.target.value })}
                            placeholder="https://twitter.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Instagram</label>
                          <input
                            type="url"
                            value={newCommunity.instagram || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, instagram: e.target.value })}
                            placeholder="https://instagram.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">LinkedIn</label>
                          <input
                            type="url"
                            value={newCommunity.linkedin || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">YouTube</label>
                          <input
                            type="url"
                            value={newCommunity.youtube || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, youtube: e.target.value })}
                            placeholder="https://youtube.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Twitch</label>
                          <input
                            type="url"
                            value={newCommunity.twitch || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, twitch: e.target.value })}
                            placeholder="https://twitch.tv/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Facebook</label>
                          <input
                            type="url"
                            value={newCommunity.facebook || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, facebook: e.target.value })}
                            placeholder="https://facebook.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">GitHub</label>
                          <input
                            type="url"
                            value={newCommunity.github || ""}
                            onChange={(e) => setNewCommunity({ ...newCommunity, github: e.target.value })}
                            placeholder="https://github.com/..."
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateCommunity(false)
                            setNewCommunity({
                              id: "",
                              name: "",
                              logo: "",
                              description: "",
                              website: "",
                              discord: "",
                              meetup: "",
                              luma: "",
                              instagram: "",
                              twitter: "",
                              linkedin: "",
                              youtube: "",
                              twitch: "",
                              facebook: "",
                              github: "",
                            })
                          }}
                          className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingCommunity}
                          className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                        >
                          {isCreatingCommunity ? (
                            <>
                              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            "Create Community"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RSVPs Tab */}
          {activeTab === "rsvps" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Event RSVPs</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Custom Community Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCommunityFilter(!showCommunityFilter)
                        setShowEventFilter(false)
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-2 px-4 text-sm text-white hover:bg-neutral-700 transition-colors min-w-40 justify-between"
                    >
                      <span className="truncate">
                        {selectedRsvpCommunity === 'all' 
                          ? 'All Communities' 
                          : communities.find(c => c.id === selectedRsvpCommunity)?.name || 'Select'}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showCommunityFilter ? "rotate-180" : ""}`} />
                    </button>
                    {showCommunityFilter && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCommunityFilter(false)} />
                        <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-neutral-700 bg-neutral-800 py-2 shadow-xl max-h-64 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedRsvpCommunity('all')
                              setShowCommunityFilter(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              selectedRsvpCommunity === 'all'
                                ? "bg-[#ef426f]/20 text-[#ef426f]"
                                : "text-neutral-300 hover:bg-neutral-700"
                            }`}
                          >
                            All Communities
                          </button>
                          {communities.map(community => (
                            <button
                              key={community.id}
                              onClick={() => {
                                setSelectedRsvpCommunity(community.id)
                                setSelectedRsvpEvent('all') // Reset event filter when community changes
                                setShowCommunityFilter(false)
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                selectedRsvpCommunity === community.id
                                  ? "bg-[#ef426f]/20 text-[#ef426f]"
                                  : "text-neutral-300 hover:bg-neutral-700"
                              }`}
                            >
                              <span className="truncate">{community.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Event Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowEventFilter(!showEventFilter)
                        setShowCommunityFilter(false)
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-2 px-4 text-sm text-white hover:bg-neutral-700 transition-colors min-w-40 justify-between"
                    >
                      <span className="truncate">
                        {selectedRsvpEvent === 'all' 
                          ? 'All Events' 
                          : events.find(e => e.id === selectedRsvpEvent)?.title || 'Select'}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showEventFilter ? "rotate-180" : ""}`} />
                    </button>
                    {showEventFilter && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowEventFilter(false)} />
                        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-neutral-700 bg-neutral-800 py-2 shadow-xl max-h-64 overflow-y-auto">
                          <button
                            onClick={() => {
                              setSelectedRsvpEvent('all')
                              setShowEventFilter(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              selectedRsvpEvent === 'all'
                                ? "bg-[#ef426f]/20 text-[#ef426f]"
                                : "text-neutral-300 hover:bg-neutral-700"
                            }`}
                          >
                            All Events
                          </button>
                          {events
                            .filter(e => e.rsvpEnabled && (selectedRsvpCommunity === 'all' || e.communityId === selectedRsvpCommunity))
                            .map(event => (
                              <button
                                key={event.id}
                                onClick={() => {
                                  setSelectedRsvpEvent(event.id)
                                  setShowEventFilter(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                                  selectedRsvpEvent === event.id
                                    ? "bg-[#ef426f]/20 text-[#ef426f]"
                                    : "text-neutral-300 hover:bg-neutral-700"
                                }`}
                              >
                                <span className="truncate">{event.title}</span>
                              </button>
                            ))}
                          {events.filter(e => e.rsvpEnabled && (selectedRsvpCommunity === 'all' || e.communityId === selectedRsvpCommunity)).length === 0 && (
                            <p className="px-4 py-2.5 text-sm text-neutral-500">No RSVP-enabled events</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleExportRsvps(selectedRsvpEvent)}
                    disabled={isExportingRsvps || rsvps.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                  >
                    {isExportingRsvps ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowLeft className="h-4 w-4 rotate-135" />
                    )}
                    Export CSV
                  </button>
                </div>
              </div>

              {(() => {
                let filteredRsvps = rsvps
                // Filter by community first
                if (selectedRsvpCommunity !== 'all') {
                  filteredRsvps = filteredRsvps.filter(r => r.communityId === selectedRsvpCommunity)
                }
                // Then filter by event
                if (selectedRsvpEvent !== 'all') {
                  filteredRsvps = filteredRsvps.filter(r => r.eventId === selectedRsvpEvent)
                }
                
                if (filteredRsvps.length === 0) {
                  return (
                    <p className="text-neutral-400 text-center py-8">
                      No RSVPs yet. Enable RSVP on an event to start collecting registrations.
                    </p>
                  )
                }

                // Group by event
                const groupedByEvent = filteredRsvps.reduce((acc, rsvp) => {
                  if (!acc[rsvp.eventSlug]) {
                    const event = events.find(e => e.id === rsvp.eventId)
                    const community = communities.find(c => c.id === rsvp.communityId)
                    acc[rsvp.eventSlug] = {
                      eventTitle: event?.title || rsvp.eventSlug,
                      communityName: community?.name || 'Unknown',
                      rsvps: []
                    }
                  }
                  acc[rsvp.eventSlug].rsvps.push(rsvp)
                  return acc
                }, {} as Record<string, { eventTitle: string; communityName: string; rsvps: EventRSVP[] }>)

                return (
                  <div className="space-y-6">
                    {Object.entries(groupedByEvent).map(([slug, { eventTitle, communityName, rsvps: eventRsvps }]) => (
                      <div key={slug} className="rounded-xl border border-neutral-800 bg-neutral-800/30 overflow-hidden">
                        <div className="px-4 py-3 bg-neutral-800/50 border-b border-neutral-700 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{eventTitle}</h3>
                            <span className="inline-flex items-center rounded-full bg-[#ef426f]/20 px-2.5 py-0.5 text-xs font-medium text-[#ef426f]">
                              {communityName}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-400">{eventRsvps.length} RSVPs</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-175">
                            <thead>
                              <tr className="border-b border-neutral-800">
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Newsletter</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Registered</th>
                                {hasAdminAccess(adminRole) && (
                                  <th className="text-right py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                              {eventRsvps.map((rsvp) => (
                                <tr key={rsvp.id} className="hover:bg-neutral-800/30 transition-colors leading-tight">
                                  <td className="py-2 px-4 text-sm font-semibold text-white whitespace-nowrap">{rsvp.firstName} {rsvp.lastName}</td>
                                  <td className="py-2 px-4 text-sm font-medium text-neutral-400 whitespace-nowrap">{rsvp.email}</td>
                                  <td className="py-2 px-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                      rsvp.joinNewsletter
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-neutral-500/20 text-neutral-400"
                                    }`}>
                                      {rsvp.joinNewsletter ? "Opted In" : "No"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 text-sm font-medium text-neutral-500 whitespace-nowrap">
                                    {new Date(rsvp.submittedAt).toLocaleDateString()}
                                  </td>
                                  {hasAdminAccess(adminRole) && (
                                    <td className="py-2 px-4 text-right whitespace-nowrap">
                                      <button
                                        onClick={() => handleDeleteRsvp(rsvp.id)}
                                        disabled={isDeletingRsvp === rsvp.id}
                                        className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                      >
                                        {isDeletingRsvp === rsvp.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-3 w-3" />
                                        )}
                                        Delete
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
