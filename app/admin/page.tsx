"use client"

import { useState, useEffect } from "react"
import { EVENT_BRANDS, EVENT_BRAND_KEYS } from "@/lib/event-brands"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  GripVertical,
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
  X,
  Bell,
  Menu,
  Home,
  Download,
  Handshake,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import { getAuthInstance, getGoogleProvider } from "@/lib/firebase"
import { RichTextEditor } from "@/components/rich-text-editor"
import { demoDayInterestLabel } from "@/lib/demo-day"
import { getInvolvedPathLabel, partnerWayLabel } from "@/lib/get-involved"
import { isProtectedAdmin } from "@/lib/protected-admins"
import { AdminCombobox } from "@/components/admin/admin-combobox"
import { SlideDrawer } from "@/components/admin/slide-drawer"
import {
  TabHeader,
  DataTable,
  Th,
  Tr,
  Td,
  PrimaryCell,
  MailLink,
  Pill,
  DateCell,
  LongText,
  RowAction,
  RowActions,
  EmptyState,
  ToolbarButton,
} from "@/components/admin/data-table"
import { useDragOrder } from "@/lib/hooks/use-drag-order"

interface NewsletterSubscription {
  id: string
  email: string
  subscribedAt: string
  source?: string
  status: string
}

/**
 * A volunteer signup. Access Granted is the only event using these so far, and
 * it asks no `role` — a signup there means "I'm in" and organizers assign work
 * by reaching out — so most of these fields are absent in practice.
 */
interface VolunteerSignup {
  id: string
  name: string
  email: string
  org?: string | null
  role?: string | null
  notes?: string | null
  eventId: string
  submittedAt: string
  status: string
}

interface SpeakerSubmission {
  id: string
  name: string
  email: string
  company?: string
  sessionTitle: string
  sessionFormat?: string
  track?: string
  abstract: string
  bio?: string
  linkedin?: string
  audienceLevel?: string
  considerFor?: string
  accommodations?: string
  eventId?: string
  submittedAt: string
  status: string
}

type SpeakerStatus = "pending" | "approved" | "rejected"

// Records written before review existed may have no status; they are unreviewed.
const speakerStatus = (s: SpeakerSubmission): SpeakerStatus =>
  s.status === "approved" || s.status === "rejected" ? s.status : "pending"

const SPEAKER_STATUS: Record<SpeakerStatus, { label: string; dot: string; chip: string }> = {
  pending: { label: "To review", dot: "bg-neutral-400", chip: "bg-neutral-700/60 text-neutral-200" },
  approved: { label: "Accepted", dot: "bg-emerald-400", chip: "bg-emerald-500/15 text-emerald-300" },
  rejected: { label: "Declined", dot: "bg-red-400", chip: "bg-red-500/15 text-red-300" },
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
  /**
   * Written by /api/admin/auth on each successful check. `null` means we have
   * not seen them since this started recording — not that they never signed
   * in, which is a distinction worth remembering for the first weeks.
   *
   * Only reaches admins and superadmins: organizers get `admins: []`.
   */
  lastLoginAt?: string | null
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
  partnerId?: string
  partnerNames?: string
  partnerLogos?: string[]
  status: string
  source?: string
  isStatic?: boolean
  eventType?: 'in-person' | 'hybrid' | 'virtual'
  rsvpEnabled?: boolean
  externalRsvpUrl?: string
  rsvpQuestion?: string | null
  rsvpQuestionRequired?: boolean
  isOfficial?: boolean
  unlisted?: boolean
  /** Addresses this event used before; its page redirects from them. */
  slugHistory?: string[]
  brand?: string
  detailsUrl?: string
}

interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  video?: string
  isEasterEgg?: boolean
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
  question?: string
  answer?: string
  submittedAt: string
}

import { defaultSlugPreview, invalidCustomSlug } from "@/lib/event-slug-shared"

/** A host field's ids: a collab stores several as one comma-separated string. */
const hostIds = (stored?: string | null) =>
  (stored || "").split(",").map((id) => id.trim()).filter(Boolean)

type Tab = "newsletter" | "speakers" | "volunteers" | "access" | "admins" | "events" | "communities" | "partners" | "rsvps" | "demoday" | "getinvolved"

/**
 * A Demo Day partner or sponsor inquiry, as /api/admin/demo-day-inquiries
 * returns it. Admin and super admin only — the route refuses everyone else.
 */
/** A /get-involved submission as /api/admin/get-involved returns it. Admin only. */
type GetInvolvedRow = {
  id: string
  path: string
  way: string | null
  name: string
  email: string
  organization: string | null
  title: string | null
  event: string | null
  subject?: string | null
  message: string
  status: "new" | "contacted" | "closed"
  submittedAt: string | null
}

type DemoDayInquiryRow = {
  id: string
  name: string
  email: string
  organization: string
  title: string | null
  interest: string
  industry: string | null
  message: string
  status: "new" | "contacted" | "closed"
  submittedAt: string | null
}

/**
 * Inquiry text is stored through sanitizeInput, which escapes entities ("&amp;").
 * React escapes on render anyway, so decode the handful sanitize-html produces
 * rather than showing a partner's "R&amp;D" back to an admin.
 */
const decodeEntities = (text: string): string =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")

/**
 * Sign-in is Firebase Auth — an emailed sign-in link, or Google — and every
 * request from this page carries the signed-in user's ID token. The server
 * reads who you are from that token (lib/admin-auth.ts), never from an email
 * in the request. Before 2026-10-12 this page signed in by trusting a typed
 * email, and so did every admin API route.
 *
 * getIdToken() refreshes an expired token on its own, so a tab left open for
 * hours keeps working.
 */
async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = getAuthInstance().currentUser
  const headers = new Headers(init.headers)
  if (user) headers.set("Authorization", `Bearer ${await user.getIdToken()}`)
  return fetch(input, { ...init, headers })
}

/** Where the email a sign-in link was sent to waits until the link is opened. */
const LINK_EMAIL_KEY = "devsa-admin-link-email"

// Protected super admins — cannot be removed or modified. See lib/protected-admins.ts.

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
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("events")
  /**
   * Whether the page was opened with an explicit ?tab= deep link. Captured at
   * first render on purpose: an effect below syncs the active tab back into the
   * query string on mount, so by the time the async auth check runs every load
   * would otherwise look deep-linked and the role-based default would never
   * apply.
   */
  const [openedWithTabParam] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("tab")
  )
  
  // Data states
  const [newsletter, setNewsletter] = useState<NewsletterSubscription[]>([])
  const [speakers, setSpeakers] = useState<SpeakerSubmission[]>([])
  const [volunteers, setVolunteers] = useState<VolunteerSignup[]>([])
  const [volunteerEventFilter, setVolunteerEventFilter] = useState<string>("all")
  const [speakerEventFilter, setSpeakerEventFilter] = useState<string>("all")
  const [speakerStatusFilter, setSpeakerStatusFilter] = useState<"all" | SpeakerStatus>("pending")
  const [speakerSearch, setSpeakerSearch] = useState("")
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null)
  // Below lg the list and the detail can't sit side by side, so one replaces
  // the other; this says which.
  const [speakerDetailOpen, setSpeakerDetailOpen] = useState(false)
  const [updatingSpeakerStatus, setUpdatingSpeakerStatus] = useState<string | null>(null)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [communitiesSource, setCommunitiesSource] = useState<string>("static")
  const [rsvps, setRsvps] = useState<EventRSVP[]>([])
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<string>("all")
  const [selectedRsvpCommunity, setSelectedRsvpCommunity] = useState<string>("all")
  const [isExportingRsvps, setIsExportingRsvps] = useState(false)
  // Which link-only event's link was just copied, for the badge's "Copied" state.
  const [copiedEventSlug, setCopiedEventSlug] = useState<string | null>(null)
  
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
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [showArchivedEvents, setShowArchivedEvents] = useState(false)
  const [showEventPartnerDropdown, setShowEventPartnerDropdown] = useState(false)
  const [showEditCommunity, setShowEditCommunity] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDeletingSpeaker, setIsDeletingSpeaker] = useState<string | null>(null)
  const [isDeletingVolunteer, setIsDeletingVolunteer] = useState<string | null>(null)
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

  // Partners
  const [partners, setPartners] = useState<Partner[]>([])
  const [showCreatePartner, setShowCreatePartner] = useState(false)
  const [showEditPartner, setShowEditPartner] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [isSavingPartner, setIsSavingPartner] = useState(false)
  const [isDeletingPartner, setIsDeletingPartner] = useState<string | null>(null)
  const emptyPartner: Partner = { id: "", name: "", logo: "", description: "", website: "", video: "" }
  const [newPartner, setNewPartner] = useState<Partner>(emptyPartner)
  const [isUploadingNewLogo, setIsUploadingNewLogo] = useState(false)
  const [isDeletingCommunity, setIsDeletingCommunity] = useState<string | null>(null)
  const [isDevsaAccordionOpen, setIsDevsaAccordionOpen] = useState(false)
  const [newsletterCommunityFilter, setNewsletterCommunityFilter] = useState<string>("all")
  const [newsletterSearch, setNewsletterSearch] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"all" | "active" | "unsubscribed">("all")
  const [newsletterPage, setNewsletterPage] = useState(0)
  const [showNewsletterCommunityDropdown, setShowNewsletterCommunityDropdown] = useState(false)
  const [demoDayInquiries, setDemoDayInquiries] = useState<DemoDayInquiryRow[]>([])
  const [getInvolved, setGetInvolved] = useState<GetInvolvedRow[]>([])
  const [showEditEventCommunityDropdown, setShowEditEventCommunityDropdown] = useState(false)
  const [editEventUseCustomCommunity, setEditEventUseCustomCommunity] = useState(false)
  const [editEventCustomCommunityName, setEditEventCustomCommunityName] = useState("")

  // Helper to get community name from current communities state
  const getCommunityNameFromState = (communityId: string | undefined): string => {
    if (!communityId) return "All Communities"
    const community = communities.find(c => c.id === communityId)
    return community?.name || communityId
  }

  // Session: Firebase Auth. Finishes an emailed sign-in link if that is how
  // the page was opened, then follows the signed-in user.
  useEffect(() => {
    const auth = getAuthInstance()
    // The old session was just an email in localStorage; retire it.
    localStorage.removeItem("devsa-admin-email")

    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Same browser: we saved the email when the link was sent. Different
      // browser or device: ask, because the link alone is not enough.
      const email =
        localStorage.getItem(LINK_EMAIL_KEY) ||
        window.prompt("Confirm the email address the sign-in link was sent to")
      if (email) {
        signInWithEmailLink(auth, email.trim().toLowerCase(), window.location.href)
          .then(() => localStorage.removeItem(LINK_EMAIL_KEY))
          .catch(() => setError("That sign-in link is invalid or has expired. Request a new one."))
          .finally(() => window.history.replaceState(null, "", "/admin"))
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        checkAdminStatus(user.email.toLowerCase())
      } else {
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize the active section from the URL (?tab=) so sections are deep-linkable
  useEffect(() => {
    const validTabs: Tab[] = [
      "newsletter", "speakers", "volunteers", "access", "admins", "events", "communities", "partners", "rsvps", "demoday", "getinvolved",
    ]
    const t = new URLSearchParams(window.location.search).get("tab") as Tab | null
    if (t && validTabs.includes(t)) setActiveTab(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL in sync as the active section changes (shareable, back-button
  // friendly). Gated on being signed in: the tab state exists from first render,
  // so without this the sign-in screen stamped ?tab=events onto its own URL —
  // a link to a section the visitor cannot see yet. An explicit ?tab= they
  // arrived with is left alone, so a deep link still survives the sign-in.
  useEffect(() => {
    if (!isAuthenticated) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("tab") !== activeTab) {
      params.set("tab", activeTab)
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`)
    }
  }, [activeTab, isAuthenticated])

  // Close the event drawer on Escape
  useEffect(() => {
    if (!showEditEvent) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEditEvent(false)
        setEditingEvent(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showEditEvent])

  const checkAdminStatus = async (email: string) => {
    setIsCheckingAuth(true)
    setError(null)
    
    try {
      const response = await adminFetch("/api/admin/auth")
      const data = await response.json()

      if (data.isAdmin) {
        setAdminEmail(email)
        setAdminRole(data.role)
        setAdminCommunityId(data.communityId || null)
        setAdminFirstName(data.firstName || "")
        setAdminLastName(data.lastName || "")
        setAdminProfileImage(data.profileImage || "")
        setIsAuthenticated(true)
        // Land on the section that matters most for the role — organizers open
        // on their own community, everyone else on Events. Skipped when the URL
        // already deep-links a section, so shared links still win.
        if (!openedWithTabParam) {
          setActiveTab(data.role === "organizer" ? "communities" : "events")
        }
        await fetchData(email, data.role, data.communityId)
      } else {
        setError(`${email} isn't approved for the admin portal. Request access below, or sign in with the email your access was approved under.`)
        await signOut(getAuthInstance())
      }
    } catch {
      setError("Failed to verify admin status")
    } finally {
      setIsCheckingAuth(false)
      setIsLoading(false)
    }
  }

  /**
   * Drag-to-reorder for both directories.
   *
   * The order set here is what the public site renders — the APIs sort on the
   * same `order` field, and every partner and community surface reads those
   * APIs, so a drag here moves the logo walls, the Building Together directory
   * and the dropdowns together.
   *
   * `orderedIds` is the full list rather than a moved id and an index: a
   * partial write would leave every other record holding a stale position, and
   * two admins dragging at once would interleave into an order neither chose.
   */
  const persistOrder = async (
    endpoint: "communities" | "partners",
    orderedIds: string[]
  ) => {
    setError(null)
    try {
      const res = await adminFetch(`/api/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds, adminEmail }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to save order")
        return
      }
      // Re-read so the screen shows what was actually stored. The hook keeps
      // its own arrangement on screen until this lands, so there is no flicker
      // back through the old order in between.
      await fetchData(adminEmail, adminRole ?? undefined, adminCommunityId ?? undefined)
    } catch {
      setError("Failed to save order")
    }
  }

  const communityOrder = useDragOrder(communities, (ids) =>
    persistOrder("communities", ids)
  )
  const partnerOrder = useDragOrder(partners, (ids) => persistOrder("partners", ids))

  const fetchData = async (email: string, role?: string, communityId?: string) => {
    try {
      const [adminDataRes, eventsRes, communitiesRes, partnersRes] = await Promise.all([
        adminFetch("/api/admin/data"),
        adminFetch('/api/events?includeAll=true'),
        adminFetch('/api/communities'),
        adminFetch('/api/partners')
      ])

      const adminData = await adminDataRes.json()
      const eventsData = await eventsRes.json()
      const communitiesData = await communitiesRes.json()
      const partnersData = await partnersRes.json()

      if (adminDataRes.ok) {
        // Only admins/superadmins should see newsletter, access requests, and
        // admins data. The API also enforces this; we double-check here.
        const isAdmin = hasAdminAccess(role) || hasAdminAccess(adminRole)
        setNewsletter(isAdmin ? (adminData.newsletter || []) : [])
        setAccessRequests(isAdmin ? (adminData.accessRequests || []) : [])
        setAdmins(isAdmin ? (adminData.admins || []) : [])
        // Speakers is deliberately NOT gated here. The API returns the full set
        // for admins and, for an organizer, only the PySanAntonio submissions
        // when their community hosts it — so a client-side role check would
        // throw away exactly the data those organizers are meant to see.
        setSpeakers(adminData.speakers || [])
        // Same reasoning as speakers: the API decides what an organizer may see.
        setVolunteers(adminData.volunteers || [])
      }
      
      if (communitiesRes.ok) {
        setCommunities(communitiesData.communities || [])
        setCommunitiesSource(communitiesData.source || 'static')
      }

      if (partnersRes.ok) {
        setPartners(partnersData.partners || [])
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
      const rsvpsRes = await adminFetch(`/api/rsvp?adminEmail=${encodeURIComponent(email)}`)
      if (rsvpsRes.ok) {
        const rsvpsData = await rsvpsRes.json()
        setRsvps(rsvpsData.rsvps || [])
      }

      // Admin-only data
      const isAdmin = hasAdminAccess(role) || hasAdminAccess(adminRole)
      if (isAdmin) {
        try {
          const demoDayRes = await adminFetch(`/api/admin/demo-day-inquiries?adminEmail=${encodeURIComponent(email)}`)
          if (demoDayRes.ok) {
            const demoDayData = await demoDayRes.json()
            setDemoDayInquiries(demoDayData.inquiries || [])
          }
        } catch {
          // Silently fail — the Demo Day tab will show empty
        }
        try {
          const giRes = await adminFetch("/api/admin/get-involved")
          if (giRes.ok) {
            const giData = await giRes.json()
            setGetInvolved(giData.inquiries || [])
          }
        } catch {
          // Silently fail — the Get Involved tab will show empty
        }
      }
    } catch {
      setError("Failed to fetch data")
    }
  }

  /**
   * Volunteer signups export. Same shape as the speaker export so both
   * download and open the same way.
   */
  const handleExportVolunteers = (rows: VolunteerSignup[], scope: string) => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const header = ["Name", "Email", "Org", "Role", "Notes", "Event", "Status", "Submitted"]
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.name, r.email, r.org, r.role, r.notes, r.eventId, r.status, r.submittedAt]
          .map(esc)
          .join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `volunteer-signups-${scope}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  /**
   * Speaker submissions export.
   *
   * Built in the browser from the rows already on screen rather than a
   * server-side CSV endpoint like RSVPs use. The list arrives from
   * /api/admin/data already scoped to what the caller may see — every event for
   * an admin, only PySanAntonio for a host community's organizer — so exporting
   * the loaded rows needs no second permission surface and honors whichever
   * event filter is active.
   */
  const handleExportSpeakers = (rows: SpeakerSubmission[], scope: string) => {
    // Abstracts and bios contain commas and newlines, so every field is quoted
    // and embedded quotes are doubled per RFC 4180.
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const headers = [
      "Name", "Email", "Company", "Talk title", "Format", "Audience level",
      "Considered for", "Abstract", "Bio", "Links", "Accessibility requests",
      "Event", "Status", "Submitted at",
    ]
    const csv = [
      headers.join(","),
      ...rows.map((s) =>
        [
          s.name, s.email, s.company, s.sessionTitle, s.sessionFormat,
          s.audienceLevel, s.considerFor, s.abstract, s.bio, s.linkedin,
          s.accommodations, s.eventId, s.status,
          s.submittedAt ? new Date(s.submittedAt).toISOString() : "",
        ].map(cell).join(",")
      ),
    ].join("\r\n")

    // BOM so Excel opens UTF-8 names and em dashes correctly.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `speaker-submissions-${scope}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleExportRsvps = async (eventId?: string) => {
    setIsExportingRsvps(true)
    try {
      let url = `/api/rsvp?adminEmail=${encodeURIComponent(adminEmail)}&format=csv`
      if (eventId && eventId !== 'all') {
        url += `&eventId=${eventId}`
      }
      
      const response = await adminFetch(url)
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

  // Emails a one-tap sign-in link. Sent whether or not the address is
  // approved, so the form never reveals who has access; the approval check
  // happens after the link proves the person owns the inbox.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = String((e.target as HTMLFormElement).email.value).trim().toLowerCase()
    setIsCheckingAuth(true)
    setError(null)
    try {
      await sendSignInLinkToEmail(getAuthInstance(), email, {
        url: `${window.location.origin}/admin`,
        handleCodeInApp: true,
      })
      localStorage.setItem(LINK_EMAIL_KEY, email)
      setLinkSentTo(email)
    } catch {
      setError("Couldn't send the sign-in link. Try again, or continue with Google.")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    try {
      await signInWithPopup(getAuthInstance(), getGoogleProvider())
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("Google sign-in didn't complete. Try again, or use an email link.")
      }
    }
  }

  const handleLogout = async () => {
    await signOut(getAuthInstance())
    setIsAuthenticated(false)
    setAdminEmail("")
    setAdminRole(null)
    setAdminCommunityId(null)
  }

  const handleApproveAccess = async (request: AccessRequest) => {
    setIsApprovingAccess(request.id)
    try {
      const response = await adminFetch("/api/admin/auth", {
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
      const response = await adminFetch("/api/access-request", {
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
      const response = await adminFetch("/api/admin/auth", {
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
      const response = await adminFetch("/api/admin/auth", {
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

  // Open the drawer in "create" mode — a blank event with sensible defaults.
  // Organizers are locked to their assigned community.
  const handleOpenCreateEvent = () => {
    const start = new Date()
    start.setHours(18, 0, 0, 0)
    const end = new Date()
    end.setHours(20, 0, 0, 0)
    setEditingEvent({
      id: "",
      title: "",
      slug: "",
      date: start.toISOString(),
      endTime: end.toISOString(),
      location: "",
      venue: "",
      address: "",
      description: "",
      communityId: adminRole === "organizer" && adminCommunityId ? adminCommunityId : "",
      partnerId: "",
      status: "published",
      eventType: "in-person",
      rsvpEnabled: false,
      externalRsvpUrl: "",
      rsvpQuestion: "",
      rsvpQuestionRequired: false,
      isOfficial: false,
      unlisted: false,
      brand: "",
      detailsUrl: "",
    })
    setEditEventUseCustomCommunity(false)
    setEditEventCustomCommunityName("")
    setShowEditEventCommunityDropdown(false)
    setShowEventPartnerDropdown(false)
    setShowEditEvent(true)
  }

  // Handles both create (no id → POST) and edit (id → PUT) from the event drawer.
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    const isCreate = !editingEvent.id

    try {
      const response = await adminFetch("/api/events", {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isCreate ? {} : { eventId: editingEvent.id }),
          title: editingEvent.title,
          // The organizer's own address, if they set one; blank means the
          // readable default. On an edit, an unchanged slug is ignored.
          ...(editingEvent.slug?.trim() ? { slug: editingEvent.slug.trim().toLowerCase() } : {}),
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
          rsvpEnabled: editingEvent.rsvpEnabled === true,
          externalRsvpUrl: editingEvent.externalRsvpUrl || null,
          // The API clears both when the DEVSA form is off.
          rsvpQuestion: editingEvent.rsvpQuestion || "",
          rsvpQuestionRequired: editingEvent.rsvpQuestionRequired === true,
          communityId: editingEvent.communityId,
          partnerId: editingEvent.partnerId || "",
          isOfficial: editingEvent.isOfficial || false,
          unlisted: editingEvent.unlisted === true,
          /* Both are meaningless on an event DEVSA did not convene, and their
             inputs only exist while the box is ticked. Deriving them from the
             flag here rather than trusting the field state means the record
             cannot end up branded-but-unofficial by some path the form grows
             later — the checkbox is the single answer to the question. */
          brand: editingEvent.isOfficial ? editingEvent.brand || "" : "",
          detailsUrl: editingEvent.isOfficial ? editingEvent.detailsUrl || "" : "",
          ...(editEventUseCustomCommunity && editEventCustomCommunityName ? { communityName: editEventCustomCommunityName } : {}),
          organizerEmail: adminEmail,
        }),
      })

      if (response.ok) {
        setShowEditEvent(false)
        setEditingEvent(null)
        setSuccessMessage(isCreate ? "Event created successfully" : "Event updated successfully")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || (isCreate ? "Failed to create event" : "Failed to update event"))
      }
    } catch {
      setError(isCreate ? "Failed to create event" : "Failed to update event")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return
    
    setIsDeleting(eventId)
    try {
      const response = await adminFetch("/api/events", {
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

  const handleDemoDayStatus = async (inquiryId: string, status: DemoDayInquiryRow["status"]) => {
    try {
      const response = await adminFetch("/api/admin/demo-day-inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status, adminEmail }),
      })
      if (response.ok) {
        setDemoDayInquiries(prev => prev.map(i => (i.id === inquiryId ? { ...i, status } : i)))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update inquiry")
      }
    } catch {
      setError("Failed to update inquiry")
    }
  }

  const handleGetInvolvedStatus = async (inquiryId: string, status: GetInvolvedRow["status"]) => {
    try {
      const response = await adminFetch("/api/admin/get-involved", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status }),
      })
      if (response.ok) {
        setGetInvolved(prev => prev.map(i => (i.id === inquiryId ? { ...i, status } : i)))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update inquiry")
      }
    } catch {
      setError("Failed to update inquiry")
    }
  }

  const handleDeleteGetInvolved = async (inquiryId: string) => {
    if (!confirm("Delete this inquiry? This action cannot be undone.")) return
    try {
      const response = await adminFetch("/api/admin/get-involved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId }),
      })
      if (response.ok) {
        setGetInvolved(prev => prev.filter(i => i.id !== inquiryId))
        setSuccessMessage("Inquiry deleted")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete inquiry")
      }
    } catch {
      setError("Failed to delete inquiry")
    }
  }

  const handleDeleteDemoDayInquiry = async (inquiryId: string) => {
    if (!confirm("Delete this Confluencia inquiry? This action cannot be undone.")) return
    try {
      const response = await adminFetch("/api/admin/demo-day-inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, adminEmail }),
      })
      if (response.ok) {
        setDemoDayInquiries(prev => prev.filter(i => i.id !== inquiryId))
        setSuccessMessage("Confluencia inquiry deleted")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete inquiry")
      }
    } catch {
      setError("Failed to delete inquiry")
    }
  }

  const handleDeleteNewsletter = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to delete this newsletter subscription?")) return
    
    setIsDeletingNewsletter(subscriptionId)
    try {
      const response = await adminFetch("/api/newsletter", {
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

  const handleDeleteVolunteer = async (signupId: string) => {
    if (!confirm("Delete this volunteer signup? This cannot be undone.")) return

    setIsDeletingVolunteer(signupId)
    try {
      const response = await adminFetch("/api/volunteers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, adminEmail }),
      })

      if (response.ok) {
        setVolunteers((prev) => prev.filter((v) => v.id !== signupId))
        setSuccessMessage("Volunteer signup deleted")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete volunteer signup")
      }
    } catch {
      setError("Failed to delete volunteer signup")
    } finally {
      setIsDeletingVolunteer(null)
    }
  }

  const handleDeleteRsvp = async (rsvpId: string) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return
    
    setIsDeletingRsvp(rsvpId)
    try {
      const response = await adminFetch("/api/rsvp", {
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

  // Optimistic: the row changes at once and reverts if the API refuses.
  // `next` is the submission to land on when this one leaves the current
  // filter, so working through "To review" moves straight to the next talk.
  const handleSpeakerStatus = async (submissionId: string, status: SpeakerStatus, next: string | null) => {
    const previous = speakers.find((s) => s.id === submissionId)?.status
    setUpdatingSpeakerStatus(submissionId)
    setSpeakers((list) => list.map((s) => (s.id === submissionId ? { ...s, status } : s)))
    if (speakerStatusFilter !== "all" && speakerStatusFilter !== status) setSelectedSpeakerId(next)
    try {
      const response = await adminFetch("/api/call-for-speakers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update status")
      }
    } catch (err) {
      setSpeakers((list) =>
        list.map((s) => (s.id === submissionId ? { ...s, status: previous ?? "pending" } : s))
      )
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdatingSpeakerStatus(null)
    }
  }

  const handleDeleteSpeaker = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this speaker submission? This action cannot be undone.")) return
    
    setIsDeletingSpeaker(submissionId)
    try {
      const response = await adminFetch("/api/call-for-speakers", {
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
      const response = await adminFetch("/api/admin/migrate", {
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

      const response = await adminFetch('/api/upload', {
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
      const response = await adminFetch("/api/communities", {
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

      const response = await adminFetch('/api/upload', {
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

  /**
   * Partner logos, uploaded from a local file.
   *
   * The partner forms only ever accepted a URL, so adding a partner meant
   * hosting the logo somewhere else first — while communities right beside
   * them had a file picker. Same endpoint, same 5 MB and image-type limits;
   * `partnerId` is what routes the blob to `partners/` and forces the
   * admin-only permission branch.
   *
   * Takes a setter rather than reading state, because the create form and the
   * edit form hold their partner in different places and this needs to serve
   * both.
   */
  const [isUploadingPartnerLogo, setIsUploadingPartnerLogo] = useState(false)

  const handlePartnerLogoUpload = async (
    file: File,
    partnerId: string,
    apply: (url: string) => void
  ) => {
    setIsUploadingPartnerLogo(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('adminEmail', adminEmail)
      // Empty string is meaningful: the route reads `partnerId !== null`, so an
      // unsaved partner still takes the partner path and lands as `new-<ts>`.
      formData.append('partnerId', partnerId)

      const response = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        apply(data.url)
        setSuccessMessage('Logo uploaded successfully!')
      } else {
        setError(data.error || 'Failed to upload logo')
      }
    } catch {
      setError('Failed to upload logo')
    } finally {
      setIsUploadingPartnerLogo(false)
    }
  }

  const handleSaveCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCommunity) return

    setIsSavingCommunity(true)
    setError(null)
    try {
      const response = await adminFetch("/api/communities", {
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
      const response = await adminFetch("/api/communities", {
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

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPartner(true)
    setError(null)
    try {
      const response = await adminFetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPartner, adminEmail }),
      })
      if (response.ok) {
        setShowCreatePartner(false)
        setNewPartner(emptyPartner)
        setSuccessMessage("Partner created successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create partner")
      }
    } catch {
      setError("Failed to create partner")
    } finally {
      setIsSavingPartner(false)
    }
  }

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPartner) return
    setIsSavingPartner(true)
    setError(null)
    try {
      const response = await adminFetch("/api/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingPartner, adminEmail }),
      })
      if (response.ok) {
        setShowEditPartner(false)
        setEditingPartner(null)
        setSuccessMessage("Partner updated successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update partner")
      }
    } catch {
      setError("Failed to update partner")
    } finally {
      setIsSavingPartner(false)
    }
  }

  const handleDeletePartner = async (partnerId: string, partnerName: string) => {
    if (!confirm(`Are you sure you want to delete "${partnerName}"? This action cannot be undone.`)) return

    setIsDeletingPartner(partnerId)
    setError(null)
    try {
      const response = await adminFetch("/api/partners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: partnerId, adminEmail }),
      })
      if (response.ok) {
        setSuccessMessage("Partner deleted successfully!")
        await fetchData(adminEmail)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete partner")
      }
    } catch {
      setError("Failed to delete partner")
    } finally {
      setIsDeletingPartner(null)
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
      // Matches the rest of the app: #0a0a0a rather than pure black, the shared
      // page-shell gutter, Geist's display scale for the heading, and the
      // site's rounded-lg button shape. /admin skips the marketing chrome (see
      // components/layout-chrome.tsx), so this owns its own way back out.
      <main className="flex min-h-dvh items-center bg-[#0a0a0a] py-16">
        <div className="page-shell">
          <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-6">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to devsa.community
            </Link>

            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80">
              {/* The DEVSA gradient hairline — the same accent the site's OG
                  cards and section rules use. */}
              <div
                aria-hidden
                className="h-1 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, #00b2a9, #ef426f, #ff8200)",
                }}
              />

              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    DEVSA Portal
                  </p>
                  <h1 className="mt-2 font-sans text-3xl font-black leading-[0.95] tracking-[-0.02em] text-white">
                    Sign in
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    Use the email your access was approved under. We&apos;ll email
                    you a one-tap sign-in link, or continue with Google.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3"
                  >
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-[13px] leading-relaxed text-red-300">{error}</p>
                  </div>
                )}

                {linkSentTo ? (
                  <div className="rounded-lg border border-neutral-700 bg-neutral-800/60 p-4">
                    <p className="text-sm font-semibold text-white">Check your inbox</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">
                      We sent a sign-in link to <span className="text-neutral-200">{linkSentTo}</span>.
                      Open it on this device to finish signing in. It expires in an hour.
                    </p>
                    <button
                      type="button"
                      onClick={() => setLinkSentTo(null)}
                      className="mt-3 cursor-pointer text-[13px] font-medium text-[#ef426f] transition-colors hover:text-[#ff7096]"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-[13px] font-medium text-neutral-200"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckingAuth}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingAuth ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      "Email me a sign-in link"
                    )}
                  </button>
                </form>
                )}

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-800" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">or</span>
                  <div className="h-px flex-1 bg-neutral-800" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-neutral-700 bg-neutral-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-600 hover:bg-neutral-700"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Previously a dead end for anyone not yet approved. */}
                <p className="mt-5 text-center text-[13px] leading-relaxed text-neutral-500">
                  Organize a community and need access?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-[#ef426f] transition-colors hover:text-[#ff7096]"
                  >
                    Request it here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Derived nav + notification data for the sidebar shell
  const pendingAccessCount = accessRequests.filter((r) => r.status === "pending").length
  const newDemoDayCount = demoDayInquiries.filter((i) => i.status === "new").length
  const newGetInvolvedCount = getInvolved.filter((i) => i.status === "new").length

  type NavItem = { id: Tab; label: string; icon: typeof Users; count?: number; alert?: number }

  const isOrganizer = adminRole === "organizer"

  const myCommunityNav: NavItem = {
    id: "communities",
    label: isOrganizer ? "My Community" : "Communities",
    icon: Building2,
    count: isOrganizer ? undefined : communities.length,
  }
  const eventsNav: NavItem = { id: "events", label: "Events", icon: CalendarDays, count: events.length }
  const rsvpsNav: NavItem = { id: "rsvps", label: "RSVPs", icon: Users, count: rsvps.length }
  const speakersNav: NavItem = {
    id: "speakers",
    label: "Speakers",
    icon: Mic2,
    count: speakers.filter((s) => speakerStatus(s) === "pending").length,
  }
  const volunteersNav: NavItem = { id: "volunteers", label: "Volunteers", icon: Users, count: volunteers.length }

  // Organizers lead with their own community, then the things they run. Speakers
  // only appears for them when the API actually returned submissions — i.e. when
  // their community hosts the conference — so it is never an empty dead end.
  const mainNav: NavItem[] = isOrganizer
    ? [
        myCommunityNav,
        eventsNav,
        rsvpsNav,
        ...(speakers.length > 0 ? [speakersNav] : []),
        ...(volunteers.length > 0 ? [volunteersNav] : []),
      ]
    : [eventsNav, rsvpsNav, myCommunityNav]

  /**
   * Admins and super admins see everything, so the sidebar groups it by what
   * the work is: the calendar, the directory, the audience, the inbox of
   * things waiting on someone, and the team. Organizers keep their short
   * mainNav list — this replaces only the admin view.
   *
   * DEVSA Subscribers was removed 2026-10-12: its 221 Luma calendar contacts
   * were imported into the newsletter, and its 166 Meetup rows have no email.
   * The devsa_subscribers collection is kept as the import's source record.
   */
  const adminGroups: { label: string; items: NavItem[] }[] = [
    { label: "Calendar", items: [eventsNav, rsvpsNav] },
    {
      label: "Directory",
      items: [myCommunityNav, { id: "partners", label: "Partners", icon: Handshake, count: partners.length }],
    },
    {
      label: "Audience",
      items: [{ id: "newsletter", label: "Newsletter", icon: Mail, count: newsletter.filter((s) => s.status === "active").length }],
    },
    {
      label: "Inbox",
      items: [
        { id: "getinvolved", label: "Get Involved", icon: Handshake, count: getInvolved.length, alert: newGetInvolvedCount },
        { id: "access", label: "Access Requests", icon: Users, count: pendingAccessCount, alert: pendingAccessCount },
        speakersNav,
        volunteersNav,
      ],
    },
    { label: "Team", items: [{ id: "admins", label: "Manage Admins", icon: UserCheck, count: admins.length }] },
  ]

  const tabTitles: Record<Tab, string> = {
    events: "Events",
    rsvps: "RSVPs",
    communities: adminRole === "organizer" ? "My Community" : "Communities",
    partners: "Partners",
    newsletter: "Newsletter",
    speakers: "Speakers",
    volunteers: "Volunteers",
    access: "Access Requests",
    admins: "Manage Admins",
    demoday: "Confluencia Inquiries",
    getinvolved: "Get Involved",
  }

  const notifications: { id: Tab; label: string; icon: typeof Users }[] = [
    ...(pendingAccessCount > 0
      ? [{ id: "access" as Tab, label: `${pendingAccessCount} access request${pendingAccessCount > 1 ? "s" : ""} pending review`, icon: Users }]
      : []),
    ...(hasAdminAccess(adminRole) && newGetInvolvedCount > 0
      ? [{ id: "getinvolved" as Tab, label: `${newGetInvolvedCount} new Get Involved inquir${newGetInvolvedCount > 1 ? "ies" : "y"}`, icon: Handshake }]
      : []),
  ]
  const notificationCount = notifications.length

  const goToTab = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
    setShowNotifications(false)
  }

  const renderNavItem = (item: { id: Tab; label: string; icon: typeof Users; count?: number; alert?: number }) => {
    const Icon = item.icon
    const isActive = activeTab === item.id
    return (
      <button
        key={item.id}
        onClick={() => goToTab(item.id)}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
        }`}
      >
        <span
          className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-[#ef426f] transition-all ${
            isActive ? "w-0.5" : "w-0"
          }`}
        />
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#ef426f]" : "text-neutral-500 group-hover:text-neutral-300"}`} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.alert ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef426f] px-1.5 text-xs font-semibold text-white">
            {item.alert}
          </span>
        ) : typeof item.count === "number" ? (
          <span className="text-xs tabular-nums text-neutral-500">{item.count}</span>
        ) : null}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-800 bg-neutral-950 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-neutral-800 px-5">
          <div className="flex items-center gap-2.5">
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
              alt="DEVSA"
              className="h-8 w-8"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">DEVSA</p>
              <p className="text-[11px] text-neutral-500">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {hasAdminAccess(adminRole) ? (
            adminGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">{group.label}</p>
                {group.items.map(renderNavItem)}
              </div>
            ))
          ) : (
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">General</p>
              {mainNav.map(renderNavItem)}
            </div>
          )}
        </nav>

        {/* Footer: back to site + account */}
        <div className="space-y-1 border-t border-neutral-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/60 hover:text-white"
          >
            <Home className="h-4 w-4 text-neutral-500" />
            Back to site
            <ExternalLink className="ml-auto h-3.5 w-3.5 text-neutral-600" />
          </Link>

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-800/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ef426f]">
                {adminProfileImage ? (
                  <img src={adminProfileImage} alt="" className="h-full w-full object-cover" />
                ) : adminCommunityId && communities.find(c => c.id === adminCommunityId)?.logo ? (
                  <img src={communities.find(c => c.id === adminCommunityId)!.logo} alt="" className="h-full w-full object-contain p-0.5" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{adminFirstName || adminEmail?.split('@')[0]}</p>
                <p className={`truncate text-xs ${
                  adminRole === "superadmin" ? "text-yellow-400" :
                  adminRole === "admin" ? "text-purple-400" : "text-blue-400"
                }`}>
                  {adminRole === "superadmin" ? "Super Admin" : adminRole === "admin" ? "Admin" : "Organizer"}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Account menu — opens upward from the sidebar footer */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl">
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
                                const res = await adminFetch('/api/admin/auth', {
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
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-800 bg-black/80 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-white">{tabTitles[activeTab]}</h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef426f] px-1 text-[10px] font-semibold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-3">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      {notificationCount > 0 && (
                        <span className="rounded-full bg-[#ef426f]/20 px-2 py-0.5 text-xs font-semibold text-[#ef426f]">
                          {notificationCount} new
                        </span>
                      )}
                    </div>
                    {notificationCount === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
                        <p className="text-sm text-neutral-500">You&apos;re all caught up</p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto py-1">
                        {notifications.map((n) => {
                          const Icon = n.icon
                          return (
                            <button
                              key={n.id + n.label}
                              onClick={() => goToTab(n.id)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-700/50"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ef426f]/15 text-[#ef426f]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="flex-1 text-sm text-neutral-200">{n.label}</span>
                              <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-500" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

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
              {/* The audience at a glance, then search and filters. Paged at 25:
                  the list passed 200 with the Luma calendar import and grows
                  with every RSVP opt-in. */}
              <TabHeader
                title="Newsletter"
                summary={
                  <>
                  {newsletter.filter((s) => s.status === "active").length} active subscribers
                  {" · "}
                  {newsletter.filter((s) => s.source === "luma-calendar").length} Luma calendar
                  {" · "}
                  {newsletter.filter((s) => s.source?.startsWith("event-rsvp:")).length} from RSVPs
                  {newsletter.some((s) => s.status !== "active") && (
                    <>
                      {" · "}
                      {newsletter.filter((s) => s.status !== "active").length} unsubscribed
                    </>
                  )}
                  </>
                }
              />
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative flex-1 sm:min-w-56">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="search"
                    value={newsletterSearch}
                    onChange={(e) => { setNewsletterSearch(e.target.value); setNewsletterPage(0) }}
                    placeholder="Search email or source"
                    aria-label="Search subscribers"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                  />
                </div>
                <select
                  value={newsletterStatus}
                  onChange={(e) => { setNewsletterStatus(e.target.value as typeof newsletterStatus); setNewsletterPage(0) }}
                  aria-label="Filter by status"
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 focus:border-neutral-500 focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
                {/* Community Group Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowNewsletterCommunityDropdown(!showNewsletterCommunityDropdown)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    <Users className="h-4 w-4 text-neutral-400" />
                    {newsletterCommunityFilter === "all" ? "All Groups" : newsletterCommunityFilter === "luma-calendar" ? "Luma calendar subscribers" : getCommunityNameFromState(newsletterCommunityFilter)}
                    <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showNewsletterCommunityDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showNewsletterCommunityDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNewsletterCommunityDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl max-h-64 overflow-y-auto">
                        <button
                          onClick={() => { setNewsletterCommunityFilter("all"); setNewsletterPage(0); setShowNewsletterCommunityDropdown(false) }}
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
                            const ev = slug ? events.find(e => e.slug === slug || e.slugHistory?.includes(slug)) : null
                            return ev?.communityId === c.id
                          }).length
                          return (
                            <button
                              key={c.id}
                              onClick={() => { setNewsletterCommunityFilter(c.id); setNewsletterPage(0); setShowNewsletterCommunityDropdown(false) }}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                newsletterCommunityFilter === c.id ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="ml-auto text-xs text-neutral-500 shrink-0">{count}</span>
                            </button>
                          )
                        })}
                        {/* The 221 Luma calendar subscribers imported 2026-10-12: they
                            subscribed to DEVSA's calendar on Luma, not to one event. */}
                        <button
                          onClick={() => { setNewsletterCommunityFilter("luma-calendar"); setNewsletterPage(0); setShowNewsletterCommunityDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                            newsletterCommunityFilter === "luma-calendar" ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          Luma calendar subscribers
                          <span className="ml-auto text-xs text-neutral-500">{newsletter.filter(sub => sub.source === "luma-calendar").length}</span>
                        </button>
                        <button
                          onClick={() => { setNewsletterCommunityFilter("uncategorized"); setNewsletterPage(0); setShowNewsletterCommunityDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                            newsletterCommunityFilter === "uncategorized" ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          Uncategorized
                          <span className="ml-auto text-xs text-neutral-500">{newsletter.filter(sub => {
                            const slug = sub.source?.startsWith('event-rsvp:') ? sub.source.replace('event-rsvp:', '') : null
                            const ev = slug ? events.find(e => e.slug === slug || e.slugHistory?.includes(slug)) : null
                            return !ev && sub.source !== "luma-calendar"
                          }).length}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {(() => {
                const PAGE = 25
                const q = newsletterSearch.trim().toLowerCase()
                const describe = (sub: NewsletterSubscription) => {
                  const slug = sub.source?.startsWith('event-rsvp:') ? sub.source.replace('event-rsvp:', '') : null
                  const event = slug ? events.find(e => e.slug === slug || e.slugHistory?.includes(slug)) : null
                  const community = event ? communities.find(c => c.id === event.communityId) : null
                  const origin = event?.title || (sub.source === "luma-calendar" ? "Luma calendar subscriber" : sub.source || "Direct signup")
                  return { event, community, origin }
                }
                const filteredNewsletter = newsletter.filter(sub => {
                  const { event, community, origin } = describe(sub)
                  if (newsletterStatus !== "all" && (newsletterStatus === "active") !== (sub.status === "active")) return false
                  if (newsletterCommunityFilter === "luma-calendar" && sub.source !== "luma-calendar") return false
                  if (newsletterCommunityFilter === "uncategorized" && (event || sub.source === "luma-calendar")) return false
                  if (!["all", "luma-calendar", "uncategorized"].includes(newsletterCommunityFilter) && event?.communityId !== newsletterCommunityFilter) return false
                  if (q && ![sub.email, origin, community?.name ?? ""].some(v => v.toLowerCase().includes(q))) return false
                  return true
                })
                const pages = Math.max(1, Math.ceil(filteredNewsletter.length / PAGE))
                const page = Math.min(newsletterPage, pages - 1)
                const pageRows = filteredNewsletter.slice(page * PAGE, page * PAGE + PAGE)
                const exportCsv = () => {
                  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
                  const rows = filteredNewsletter.map(sub => {
                    const { community, origin } = describe(sub)
                    return [sub.email, sub.status, origin, community?.name ?? "", new Date(sub.subscribedAt).toISOString().split("T")[0]].map(esc).join(",")
                  })
                  const blob = new Blob(["\ufeff" + ["Email,Status,Source,Community,Subscribed", ...rows].join("\n")], { type: "text/csv;charset=utf-8;" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `newsletter-${new Date().toISOString().split("T")[0]}.csv`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }
                return filteredNewsletter.length === 0 ? (
                  <EmptyState>No subscribers match{q ? ` "${newsletterSearch}"` : ""} with these filters.</EmptyState>
                ) : (
                  <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[13px] tabular-nums text-neutral-400">
                      Showing {page * PAGE + 1}–{Math.min(filteredNewsletter.length, page * PAGE + PAGE)} of {filteredNewsletter.length}
                    </p>
                    <ToolbarButton onClick={exportCsv} icon={<Download className="h-4 w-4" />}>
                      Export CSV ({filteredNewsletter.length})
                    </ToolbarButton>
                  </div>
                  <DataTable>
                    <thead>
                      <tr>
                        <Th>Email</Th>
                        <Th>Community</Th>
                        <Th>Source</Th>
                        <Th>Status</Th>
                        <Th>Subscribed</Th>
                        <Th align="right"><span className="sr-only">Actions</span></Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((sub) => {
                        const { community, origin } = describe(sub)
                        return (
                          <Tr key={sub.id}>
                            <Td><span className="font-medium text-white">{sub.email}</span></Td>
                            <Td>
                              {community ? <Pill tone="pink">{community.name}</Pill> : <span className="text-neutral-400">—</span>}
                            </Td>
                            <Td className="max-w-[16rem] truncate">{origin}</Td>
                            <Td>
                              <Pill tone={sub.status === "active" ? "green" : "neutral"}>
                                {sub.status === "active" ? "Active" : "Unsubscribed"}
                              </Pill>
                            </Td>
                            <Td><DateCell value={sub.subscribedAt} /></Td>
                            <Td align="right">
                              <RowActions>
                                <RowAction
                                  tone="danger"
                                  onClick={() => handleDeleteNewsletter(sub.id)}
                                  disabled={isDeletingNewsletter === sub.id}
                                  icon={isDeletingNewsletter === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                >
                                  Delete
                                </RowAction>
                              </RowActions>
                            </Td>
                          </Tr>
                        )
                      })}
                    </tbody>
                  </DataTable>
                  {pages > 1 && (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <ToolbarButton onClick={() => setNewsletterPage(Math.max(0, page - 1))} disabled={page === 0}>
                        Previous
                      </ToolbarButton>
                      <span className="text-[13px] tabular-nums text-neutral-400">Page {page + 1} of {pages}</span>
                      <ToolbarButton onClick={() => setNewsletterPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1}>
                        Next
                      </ToolbarButton>
                    </div>
                  )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Speakers Tab — admins see every event; a host community's
              organizers see only their conference's submissions, scoped by the
              API rather than here. */}
          {activeTab === "speakers" && (() => {
            const speakerEvents = Array.from(
              new Set(speakers.map((s) => s.eventId || "—"))
            ).sort()
            const inEvent =
              speakerEventFilter === "all"
                ? speakers
                : speakers.filter((s) => (s.eventId || "—") === speakerEventFilter)
            const statusCount = (st: SpeakerStatus) => inEvent.filter((s) => speakerStatus(s) === st).length
            const q = speakerSearch.trim().toLowerCase()
            const filteredSpeakers = inEvent.filter(
              (s) =>
                (speakerStatusFilter === "all" || speakerStatus(s) === speakerStatusFilter) &&
                (!q ||
                  [s.sessionTitle, s.name, s.company, s.email]
                    .some((v) => v?.toLowerCase().includes(q)))
            )
            const selectedIndex = Math.max(
              0,
              filteredSpeakers.findIndex((s) => s.id === selectedSpeakerId)
            )
            const selected = filteredSpeakers[selectedIndex]
            const neighbour = (offset: number) => filteredSpeakers[selectedIndex + offset]?.id ?? null
            const select = (id: string | null) => {
              setSelectedSpeakerId(id)
              setSpeakerDetailOpen(true)
            }
            const statusTabs: { value: "all" | SpeakerStatus; label: string; count: number }[] = [
              { value: "pending", label: SPEAKER_STATUS.pending.label, count: statusCount("pending") },
              { value: "approved", label: SPEAKER_STATUS.approved.label, count: statusCount("approved") },
              { value: "rejected", label: SPEAKER_STATUS.rejected.label, count: statusCount("rejected") },
              { value: "all", label: "All", count: inEvent.length },
            ]
            const fact = (label: string, value?: string) =>
              value ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</dt>
                  <dd className="mt-1 text-sm text-neutral-200">{value}</dd>
                </div>
              ) : null
            return (
            <div>
              <TabHeader
                title="Speaker Submissions"
                summary={`${statusCount("pending")} to review · ${statusCount("approved")} accepted · ${statusCount("rejected")} declined`}
                actions={
                  <>
                    <AdminCombobox
                      className="w-64"
                      value={speakerEventFilter}
                      onChange={setSpeakerEventFilter}
                      options={[
                        { value: "all", label: "All events", count: speakers.length },
                        ...speakerEvents.map((ev) => ({
                          value: ev,
                          label: ev,
                          count: speakers.filter((s) => (s.eventId || "—") === ev).length,
                        })),
                      ]}
                    />
                    <ToolbarButton
                      onClick={() => handleExportSpeakers(filteredSpeakers, speakerEventFilter)}
                      disabled={filteredSpeakers.length === 0}
                      icon={<Download className="h-4 w-4" />}
                    >
                      Export CSV
                    </ToolbarButton>
                  </>
                }
              />

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1">
                  {statusTabs.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setSpeakerStatusFilter(t.value)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        speakerStatusFilter === t.value
                          ? "bg-neutral-700 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t.label} <span className="text-neutral-500">{t.count}</span>
                    </button>
                  ))}
                </div>
                <div className="relative min-w-[14rem] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="search"
                    value={speakerSearch}
                    onChange={(e) => setSpeakerSearch(e.target.value)}
                    placeholder="Search title, speaker, company or email"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              </div>

              {filteredSpeakers.length === 0 ? (
                <p className="rounded-xl border border-neutral-800 py-12 text-center text-neutral-400">
                  {speakers.length === 0
                    ? "No speaker submissions yet."
                    : speakerStatusFilter === "pending" && !q
                      ? "Nothing left to review."
                      : "No submissions match."}
                </p>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                  {/* The queue */}
                  <ul
                    className={`${speakerDetailOpen ? "hidden lg:block" : ""} divide-y divide-neutral-800 overflow-hidden rounded-xl border border-neutral-800 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto`}
                  >
                    {filteredSpeakers.map((s) => {
                      const st = SPEAKER_STATUS[speakerStatus(s)]
                      const active = selected?.id === s.id
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => select(s.id)}
                            aria-current={active ? "true" : undefined}
                            className={`block w-full px-4 py-3 text-left transition-colors ${
                              active ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${st.dot}`} title={st.label} />
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                                  {s.sessionTitle}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-neutral-400">
                                  {s.name}
                                  {s.company && <span className="text-neutral-500"> · {s.company}</span>}
                                </p>
                                <p className="mt-1 truncate text-xs text-neutral-500">
                                  {[speakerEventFilter === "all" ? s.eventId : null, s.sessionFormat]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  {/* The submission under review */}
                  {selected && (
                    <article
                      className={`${speakerDetailOpen ? "" : "hidden lg:block"} min-w-0 rounded-xl border border-neutral-800 bg-neutral-800/30`}
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3">
                        <button
                          onClick={() => setSpeakerDetailOpen(false)}
                          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white lg:invisible"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          All submissions
                        </button>
                        <div className="flex items-center gap-1 text-sm text-neutral-400">
                          <span className="mr-1 tabular-nums">
                            {selectedIndex + 1} of {filteredSpeakers.length}
                          </span>
                          <button
                            onClick={() => select(neighbour(-1))}
                            disabled={!neighbour(-1)}
                            aria-label="Previous submission"
                            className="rounded-lg p-1.5 hover:bg-neutral-700 hover:text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => select(neighbour(1))}
                            disabled={!neighbour(1)}
                            aria-label="Next submission"
                            className="rounded-lg p-1.5 hover:bg-neutral-700 hover:text-white disabled:opacity-30"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SPEAKER_STATUS[speakerStatus(selected)].chip}`}>
                            {SPEAKER_STATUS[speakerStatus(selected)].label}
                          </span>
                          {selected.eventId && (
                            <span className="rounded-full bg-neutral-700/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                              {selected.eventId}
                            </span>
                          )}
                          {selected.track && (
                            <span className="rounded-full bg-[#ec228d]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ec228d]">
                              {selected.track}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold leading-tight tracking-tight text-white">
                          {selected.sessionTitle}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-300">
                          {selected.name}
                          {selected.company && <span className="text-neutral-500"> · {selected.company}</span>}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 text-[#4a90d9] hover:underline">
                            <Mail className="h-3.5 w-3.5" />
                            {selected.email}
                          </a>
                          {selected.linkedin && (
                            <a
                              href={selected.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-w-0 items-center gap-1.5 text-[#4a90d9] hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{selected.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                            </a>
                          )}
                        </div>

                        <dl className="mt-6 grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 sm:grid-cols-3">
                          {fact("Format", selected.sessionFormat)}
                          {fact("Audience", selected.audienceLevel)}
                          {fact("Considered for", selected.considerFor)}
                          {fact("Submitted", new Date(selected.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }))}
                        </dl>

                        {selected.accommodations && (
                          <div className="mt-6 rounded-lg border border-[#ffdd00]/25 bg-[#ffdd00]/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#ffdd00]">Requests / accommodations</p>
                            <p className="mt-1 text-sm leading-relaxed text-neutral-200">{selected.accommodations}</p>
                          </div>
                        )}

                        <section className="mt-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Abstract</h4>
                          <p className="mt-2 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-neutral-200">
                            {selected.abstract}
                          </p>
                        </section>
                        {selected.bio && (
                          <section className="mt-6">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Bio</h4>
                            <p className="mt-2 max-w-prose whitespace-pre-line text-sm leading-relaxed text-neutral-300">
                              {selected.bio}
                            </p>
                          </section>
                        )}
                      </div>

                      {/* Decision bar. Status is internal: changing it emails no one. */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(["approved", "rejected", "pending"] as const)
                            .filter((st) => st !== "pending" || speakerStatus(selected) !== "pending")
                            .map((st) => {
                            const current = speakerStatus(selected) === st
                            const next = neighbour(1) ?? neighbour(-1)
                            const tone =
                              st === "approved"
                                ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                : st === "rejected"
                                  ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                                  : "bg-neutral-700/60 text-neutral-200 hover:bg-neutral-700"
                            return (
                              <button
                                key={st}
                                onClick={() => handleSpeakerStatus(selected.id, st, next)}
                                disabled={current || updatingSpeakerStatus === selected.id}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-default ${
                                  current ? "ring-1 ring-inset ring-white/30 " : ""
                                }${tone}`}
                              >
                                {st === "approved" && <CheckCircle className="h-4 w-4" />}
                                {st === "rejected" && <XCircle className="h-4 w-4" />}
                                {st === "pending" ? "Back to review" : st === "approved" ? (current ? "Accepted" : "Accept") : (current ? "Declined" : "Decline")}
                              </button>
                            )
                          })}
                        </div>
                        {/* Deleting a submission is admin/superadmin only on the
                            API side, so organizers do not get a button that
                            would only ever return 403. */}
                        {hasAdminAccess(adminRole) && (
                          <button
                            onClick={() => handleDeleteSpeaker(selected.id)}
                            disabled={isDeletingSpeaker === selected.id}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          >
                            {isDeletingSpeaker === selected.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  )}
                </div>
              )}
            </div>
            )
          })()}

          {/* Volunteers Tab — the other half of an event's open call. Scoped by
              the API exactly as speakers are: admins see every event, a host
              community's organizers see only their own. Delete is
              admin/superadmin only, matching every other destructive action
              here. */}
          {activeTab === "volunteers" && (() => {
            const volunteerEvents = Array.from(
              new Set(volunteers.map((v) => v.eventId || "—"))
            ).sort()
            const filteredVolunteers =
              volunteerEventFilter === "all"
                ? volunteers
                : volunteers.filter((v) => (v.eventId || "—") === volunteerEventFilter)
            return (
              <div>
                <TabHeader
                  title="Volunteer Signups"
                  summary={`${filteredVolunteers.length} ${filteredVolunteers.length === 1 ? "volunteer" : "volunteers"}${
                    volunteerEventFilter === "all" ? " across all events" : ` for ${volunteerEventFilter}`
                  }`}
                  actions={
                    <>
                      <AdminCombobox
                        className="w-64"
                        value={volunteerEventFilter}
                        onChange={setVolunteerEventFilter}
                        options={[
                          { value: "all", label: "All events", count: volunteers.length },
                          ...volunteerEvents.map((ev) => ({
                            value: ev,
                            label: ev,
                            count: volunteers.filter((v) => (v.eventId || "—") === ev).length,
                          })),
                        ]}
                      />
                      <ToolbarButton
                        onClick={() => handleExportVolunteers(filteredVolunteers, volunteerEventFilter)}
                        disabled={filteredVolunteers.length === 0}
                        icon={<Download className="h-4 w-4" />}
                      >
                        Export CSV
                      </ToolbarButton>
                    </>
                  }
                />
                {filteredVolunteers.length === 0 ? (
                  <EmptyState>No volunteer signups yet.</EmptyState>
                ) : (
                  <DataTable minWidth="min-w-[52rem]">
                    <thead>
                      <tr>
                        <Th>Volunteer</Th>
                        {volunteerEventFilter === "all" && <Th>Event</Th>}
                        {/* Only when some event asked. Access Granted does not. */}
                        {filteredVolunteers.some((v) => v.role) && <Th>Role</Th>}
                        <Th>Notes</Th>
                        <Th>Signed up</Th>
                        {hasAdminAccess(adminRole) && <Th align="right"><span className="sr-only">Actions</span></Th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVolunteers.map((volunteer) => (
                        <Tr key={volunteer.id}>
                          <Td className="w-[16rem]">
                            <PrimaryCell
                              title={volunteer.name}
                              sub={
                                <>
                                  <MailLink email={volunteer.email} />
                                  {volunteer.org && <div>With {volunteer.org}</div>}
                                </>
                              }
                            />
                          </Td>
                          {volunteerEventFilter === "all" && (
                            <Td><Pill>{volunteer.eventId || "—"}</Pill></Td>
                          )}
                          {filteredVolunteers.some((v) => v.role) && (
                            <Td>{volunteer.role ? <Pill tone="amber">{volunteer.role}</Pill> : <span className="text-neutral-400">—</span>}</Td>
                          )}
                          <Td><LongText text={volunteer.notes} /></Td>
                          <Td><DateCell value={volunteer.submittedAt} /></Td>
                          {/* Admin/superadmin only, matching the API. An
                              organizer would only ever get a 403 from it, and
                              this collection is shared across events — one
                              community's organizer must not be able to empty
                              another's crew list. */}
                          {hasAdminAccess(adminRole) && (
                            <Td align="right">
                              <RowActions>
                                <RowAction
                                  tone="danger"
                                  onClick={() => handleDeleteVolunteer(volunteer.id)}
                                  disabled={isDeletingVolunteer === volunteer.id}
                                  icon={isDeletingVolunteer === volunteer.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                >
                                  Delete
                                </RowAction>
                              </RowActions>
                            </Td>
                          )}
                        </Tr>
                      ))}
                    </tbody>
                  </DataTable>
                )}
              </div>
            )
          })()}

          {/* Access Requests Tab - Admin Only */}
          {activeTab === "access" && hasAdminAccess(adminRole) && (
            <div>
              {/* Pending only. Approving adds the person to Manage Admins, so an
                  approved request here was a duplicate; rejecting deletes it. The
                  approved records stay in Firestore. */}
              <TabHeader
                title="Access Requests"
                summary={
                  <>
                    {pendingAccessCount} waiting on a decision. Approved people are in{" "}
                    <button onClick={() => goToTab("admins")} className="font-medium text-neutral-200 underline underline-offset-2 hover:text-white">
                      Manage Admins
                    </button>
                    .
                  </>
                }
              />
              {pendingAccessCount === 0 ? (
                <EmptyState>No pending requests.</EmptyState>
              ) : (
                <DataTable>
                  <thead>
                    <tr>
                      <Th>Person</Th>
                      <Th>Community</Th>
                      <Th>Requested</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessRequests.filter((request) => request.status === "pending").map((request) => {
                      const busy = isApprovingAccess === request.id || isRejectingAccess === request.id
                      return (
                        <Tr key={request.id}>
                          <Td><PrimaryCell title={request.name} sub={<MailLink email={request.email} />} /></Td>
                          <Td>{request.communityOrg || <span className="text-neutral-400">—</span>}</Td>
                          <Td><DateCell value={request.submittedAt} time /></Td>
                          <Td align="right">
                            <RowActions>
                              <RowAction
                                tone="success"
                                onClick={() => handleApproveAccess(request)}
                                disabled={busy}
                                icon={isApprovingAccess === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              >
                                {isApprovingAccess === request.id ? "Approving…" : "Approve"}
                              </RowAction>
                              <RowAction
                                tone="danger"
                                onClick={() => handleRejectAccess(request.id)}
                                disabled={busy}
                                icon={isRejectingAccess === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              >
                                {isRejectingAccess === request.id ? "Rejecting…" : "Reject"}
                              </RowAction>
                            </RowActions>
                          </Td>
                        </Tr>
                      )
                    })}
                  </tbody>
                </DataTable>
              )}
            </div>
          )}

          {/* Admins Tab - Admin Only */}
          {activeTab === "admins" && hasAdminAccess(adminRole) && (
            <div>
              <TabHeader
                title="Manage Admins"
                summary={`${admins.filter((a) => a.role !== "organizer").length} admins · ${admins.filter((a) => a.role === "organizer").length} organizers`}
                actions={
                  <button
                    onClick={() => setShowAddAdmin(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Admin
                  </button>
                }
              />

              {admins.length === 0 ? (
                <EmptyState>No approved admins yet.</EmptyState>
              ) : (
                <DataTable>
                  <thead>
                    <tr>
                      <Th>Person</Th>
                      <Th>Role</Th>
                      <Th>Community</Th>
                      <Th>Approved</Th>
                      <Th>Last sign-in</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <Tr key={admin.id}>
                        <Td>
                          <PrimaryCell
                            title={admin.email}
                            sub={isProtectedAdmin(admin.email) ? "Site owner · can't be removed" : admin.email === adminEmail ? "You" : undefined}
                          />
                        </Td>
                        <Td>
                          <Pill tone={admin.role === "superadmin" ? "amber" : admin.role === "admin" ? "violet" : "blue"}>
                            {admin.role === "superadmin" ? "Super admin" : admin.role === "admin" ? "Admin" : "Organizer"}
                          </Pill>
                        </Td>
                        <Td>{admin.communityId ? getCommunityName(admin.communityId) : <span className="text-neutral-400">All</span>}</Td>
                        <Td><DateCell value={admin.approvedAt} /></Td>
                        {/* Date and time, not just the date: "did they log in
                            today" is the question this column answers. */}
                        <Td><DateCell value={admin.lastLoginAt} time /></Td>
                        <Td align="right">
                          {/* Not for the protected super admins, and you can't remove yourself. */}
                          <RowActions>
                            {!isProtectedAdmin(admin.email) && (
                              <RowAction onClick={() => handleEditAdmin(admin)} icon={<Edit className="h-4 w-4" />}>
                                Edit
                              </RowAction>
                            )}
                            {admin.email !== adminEmail && !isProtectedAdmin(admin.email) && (
                              <RowAction tone="danger" onClick={() => handleRemoveAdmin(admin.email)} icon={<Trash2 className="h-4 w-4" />}>
                                Remove
                              </RowAction>
                            )}
                          </RowActions>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </DataTable>
              )}

              {/* Add/Edit Admin Drawer */}
              <SlideDrawer
                open={showAddAdmin}
                onClose={() => {
                  setShowAddAdmin(false)
                  setEditingAdmin(null)
                  setNewAdminEmail("")
                  setNewAdminRole("organizer")
                  setNewAdminCommunity("")
                }}
                title={editingAdmin ? "Edit Admin" : "Add New Admin"}
              >
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
              </SlideDrawer>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Calendar Events</h2>
                <button
                  onClick={handleOpenCreateEvent}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </button>
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
                          {event.unlisted && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://www.devsa.community/events/${event.slug}`).then(() => {
                                  setCopiedEventSlug(event.slug)
                                  setTimeout(() => setCopiedEventSlug((s) => (s === event.slug ? null : s)), 2000)
                                })
                              }}
                              title={`https://www.devsa.community/events/${event.slug}`}
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 bg-[#00b2a9]/20 text-[#00b2a9] hover:bg-[#00b2a9]/30"
                            >
                              {copiedEventSlug === event.slug ? "Link copied" : "Link only · copy link"}
                            </button>
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
                        {/* Only a co-host row when a community is the headline; partner-only events already show the partner as the headline */}
                        {event.partnerNames && event.communityId && (
                          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                            <span className="font-medium text-neutral-400">With partners:</span>
                            {event.partnerNames.split(', ').filter(Boolean).map((name) => (
                              <span
                                key={name}
                                className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-800/60 px-2 py-0.5 text-[11px] font-medium text-neutral-300"
                              >
                                {name}
                              </span>
                            ))}
                          </p>
                        )}
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

                    {/* Archived Events Section — collapsed by default */}
                    {archivedEvents.length > 0 && (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30">
                        <button
                          onClick={() => setShowArchivedEvents((v) => !v)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-lg font-semibold text-neutral-400 transition-colors hover:text-neutral-200"
                          aria-expanded={showArchivedEvents}
                        >
                          <Archive className="h-5 w-5" />
                          Archived Events ({archivedEvents.length})
                          <ChevronDown
                            className={`ml-auto h-5 w-5 transition-transform ${showArchivedEvents ? "rotate-180" : ""}`}
                          />
                        </button>
                        {showArchivedEvents && (
                          <div className="space-y-4 border-t border-neutral-800 p-4 opacity-75">
                            {archivedEvents.map(renderEventCard)}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Event Drawer — create + edit */}
              {showEditEvent && editingEvent && (
                <div className="fixed inset-0 z-50">
                  <div
                    className="admin-drawer-overlay absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => { setShowEditEvent(false); setEditingEvent(null) }}
                  />
                  <div className="admin-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col overflow-hidden rounded-l-2xl border-l border-neutral-800 bg-neutral-900 shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-5">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight text-white">
                          {editingEvent.id ? "Edit Event" : "Create Event"}
                        </h3>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {editingEvent.id
                            ? "Update the details for this event."
                            : "Add a new event to the DEVSA community calendar."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowEditEvent(false); setEditingEvent(null) }}
                        className="-mr-1 shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleUpdateEvent} className="flex-1 space-y-5 overflow-y-auto px-6 pt-5">
                      {/* Organizer: community is locked to their assignment */}
                      {adminRole === "organizer" && (
                        <div>
                          <label className="block text-sm font-semibold text-neutral-300 mb-2">Community</label>
                          <div className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-white">
                            {communities.find(c => c.id === editingEvent.communityId)?.name || "No community assigned"}
                          </div>
                        </div>
                      )}
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
                      {/* Partners (co-hosts) — available to every role */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Partners <span className="font-normal text-neutral-500">(optional co-hosts)</span>
                        </label>
                        <div className="relative">
                          {editingEvent.partnerId && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(editingEvent.partnerId || '').split(',').filter(Boolean).map((id) => {
                                const partner = partners.find(p => p.id === id)
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#ef426f]/15 border border-[#ef426f]/30 px-3 py-1 text-xs font-semibold text-[#ef426f]"
                                  >
                                    {partner?.name || id}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const ids = (editingEvent.partnerId || '').split(',').filter(i => i !== id)
                                        setEditingEvent({ ...editingEvent, partnerId: ids.join(',') })
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
                            onClick={() => setShowEventPartnerDropdown(!showEventPartnerDropdown)}
                            className="w-full flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-left focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                          >
                            <span className={editingEvent.partnerId ? "text-white" : "text-neutral-500"}>
                              {editingEvent.partnerId
                                ? `${(editingEvent.partnerId || '').split(',').filter(Boolean).length} selected — click to add more`
                                : "Select partners"}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showEventPartnerDropdown ? "rotate-180" : ""}`} />
                          </button>
                          {showEventPartnerDropdown && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowEventPartnerDropdown(false)} />
                              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-xl max-h-56 overflow-y-auto">
                                {partners.length === 0 ? (
                                  <p className="px-4 py-2.5 text-sm text-neutral-500">No partners yet — add them in the Partners section.</p>
                                ) : (
                                  partners.map((partner) => {
                                    const selectedIds = (editingEvent.partnerId || '').split(',').filter(Boolean)
                                    const isSelected = selectedIds.includes(partner.id)
                                    return (
                                      <button
                                        key={partner.id}
                                        type="button"
                                        onClick={() => {
                                          const ids = (editingEvent.partnerId || '').split(',').filter(Boolean)
                                          setEditingEvent({
                                            ...editingEvent,
                                            partnerId: isSelected
                                              ? ids.filter(i => i !== partner.id).join(',')
                                              : [...ids, partner.id].join(','),
                                          })
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                          isSelected ? "bg-[#ef426f]/20 text-[#ef426f]" : "text-neutral-300 hover:bg-neutral-700"
                                        }`}
                                      >
                                        <span className={`flex items-center justify-center h-4 w-4 rounded border text-[10px] ${
                                          isSelected ? "bg-[#ef426f] border-[#ef426f] text-white" : "border-neutral-600"
                                        }`}>
                                          {isSelected && "✓"}
                                        </span>
                                        <span className="truncate">{partner.name}</span>
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">
                          Partners like Tech Bloc or Youth Code Jam co-hosting this event.
                        </p>

                        {/* Sits with the partner picker because it answers the
                            same question — who is this event's? — and because
                            the two are easy to confuse. DEVSA is never one of
                            the partners in the list above: it is not a partner
                            of itself. */}
                        <label className={`mt-4 flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                          editingEvent.isOfficial
                            ? "border-[#ef426f]/50 bg-[#ef426f]/5"
                            : "border-neutral-700 hover:border-neutral-600"
                        }`}>
                          <input
                            type="checkbox"
                            checked={editingEvent.isOfficial || false}
                            onChange={(e) => {
                              const isOfficial = e.target.checked
                              /* Clearing both dependent fields on the way out.
                                 They unmount with the checkbox, so a brand or
                                 an external link set first and unchecked after
                                 would keep saving — branding the card and
                                 redirecting View Details with nothing on screen
                                 to show it, and no way to undo it. */
                              setEditingEvent(
                                isOfficial
                                  ? { ...editingEvent, isOfficial }
                                  : { ...editingEvent, isOfficial, brand: "", detailsUrl: "" }
                              )
                            }}
                            className="mt-0.5 accent-[#ef426f]"
                          />
                          <div>
                            <span className="text-sm font-medium text-white">Official DEVSA event</span>
                            <p className="text-xs text-neutral-500 mt-1">
                              DEVSA convened this one, rather than listing somebody else&rsquo;s.
                              Gives it the spotlight treatment on the community calendar.
                            </p>
                          </div>
                        </label>


                        {/* Both of these only mean anything on an event DEVSA
                            convened, so they stay hidden until the box above is
                            ticked rather than sitting on every form. Listing
                            somebody else's meetup is the common case by a wide
                            margin, and an Activation branding select offering
                            The Model on a Byte Night entry invites a wrong
                            answer to a question that was never asked.

                            Indented against the checkbox's own magenta so the
                            reveal reads as belonging to it. */}
                        {editingEvent.isOfficial && (
                          <div className="mt-3 space-y-3 border-l-2 border-[#ef426f]/30 pl-4">
                            <div>
                              <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                Activation branding
                              </label>
                              <select
                                value={editingEvent.brand || ""}
                                onChange={(e) => setEditingEvent({ ...editingEvent, brand: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#ef426f]"
                              >
                                <option value="">None &mdash; standard card</option>
                                {EVENT_BRAND_KEYS.map((k) => (
                                  <option key={k} value={k}>
                                    {EVENT_BRANDS[k].label}
                                  </option>
                                ))}
                              </select>
                              <p className="mt-2 text-xs text-neutral-500">
                                Only for the activations that have a design system of their
                                own. Gives the card that activation&rsquo;s lockup, color
                                and ground.
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                External details link
                              </label>
                              <input
                                type="url"
                                placeholder="https://example.com/schedule/the-model"
                                value={editingEvent.detailsUrl || ""}
                                onChange={(e) => setEditingEvent({ ...editingEvent, detailsUrl: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#ef426f]"
                              />
                              <p className="mt-2 text-xs text-neutral-500">
                                Sends &ldquo;View Details&rdquo; here instead of to this event&rsquo;s
                                page on devsa.community, in a new tab. Leave empty for the
                                normal behavior.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
                      {/* The event's address. Blank on a new event means the
                          readable default (lib/event-slug.ts), previewed in the
                          placeholder. Changing an existing one keeps the old
                          address redirecting. */}
                      {(() => {
                        const original = editingEvent.id ? events.find((e) => e.id === editingEvent.id)?.slug : undefined
                        const typed = (editingEvent.slug || "").trim().toLowerCase()
                        const preview = editingEvent.unlisted
                          ? `${defaultSlugPreview(editingEvent.title, "")}-random-code`
                          : defaultSlugPreview(editingEvent.title, editingEvent.date)
                        const problem = typed && typed !== original ? invalidCustomSlug(typed) : null
                        return (
                          <div>
                            <label htmlFor="eventSlug" className="block text-sm font-semibold text-neutral-300 mb-2">
                              Event address {!editingEvent.id && <span className="font-normal text-neutral-400">(optional)</span>}
                            </label>
                            <div className="flex items-center rounded-xl border border-neutral-700 bg-neutral-800 focus-within:border-[#ef426f] focus-within:ring-2 focus-within:ring-[#ef426f]/20">
                              <span className="pl-4 text-sm text-neutral-400 whitespace-nowrap">devsa.community/events/</span>
                              <input
                                id="eventSlug"
                                type="text"
                                maxLength={80}
                                value={editingEvent.slug || ""}
                                onChange={(e) => setEditingEvent({ ...editingEvent, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                                placeholder={editingEvent.id ? "" : preview}
                                className="w-full min-w-0 bg-transparent py-3 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                              />
                            </div>
                            {problem ? (
                              <p className="mt-2 text-xs text-red-400">{problem}</p>
                            ) : editingEvent.id && typed && original && typed !== original ? (
                              <p className="mt-2 text-xs text-amber-300">
                                The old address, /events/{original}, will keep working and redirect here.
                              </p>
                            ) : editingEvent.unlisted && typed && typed !== original ? (
                              <p className="mt-2 text-xs text-amber-300">
                                A readable address on a link-only event is easy to guess. Leave it blank to keep a random code.
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-neutral-400">
                                {editingEvent.id
                                  ? "Change it only if you need to; the old address will redirect."
                                  : editingEvent.unlisted
                                    ? "Leave blank: link-only events get a random code, so the address can't be guessed."
                                    : "Leave blank for the address shown, or type your own, like organizer-roundtable."}
                              </p>
                            )}
                          </div>
                        )
                      })()}
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
                              const patch = { ...editingEvent, date: currentDate.toISOString() };
                              // Keep the end time anchored to the same day as the
                              // start so moving the date never leaves the end in
                              // the past. Roll to the next day for overnight events.
                              if (editingEvent.endTime) {
                                const end = new Date(editingEvent.endTime);
                                end.setFullYear(year, month - 1, day);
                                if (end.getTime() <= currentDate.getTime()) {
                                  end.setDate(end.getDate() + 1);
                                }
                                patch.endTime = end.toISOString();
                              }
                              setEditingEvent(patch);
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
                              const start = new Date(editingEvent.date || new Date());
                              const end = new Date(start);
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              end.setHours(hours, minutes, 0, 0);
                              // If the chosen end time is at or before the start,
                              // treat it as an overnight event and roll to the next day.
                              if (end.getTime() <= start.getTime()) {
                                end.setDate(end.getDate() + 1);
                              }
                              setEditingEvent({ ...editingEvent, endTime: end.toISOString() });
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
                        <AdminCombobox
                          value={editingEvent.eventType || 'in-person'}
                          onChange={(v) => setEditingEvent({ ...editingEvent, eventType: v as 'in-person' | 'hybrid' | 'virtual' })}
                          buttonClassName="rounded-xl px-4 py-3"
                          options={[
                            { value: 'in-person', label: 'In-Person' },
                            { value: 'hybrid', label: 'Hybrid' },
                            { value: 'virtual', label: 'Virtual' },
                          ]}
                        />
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
                      {/* Registration */}
                      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-neutral-300">Registration</label>
                          <p className="text-xs text-neutral-500 mt-1">
                            Manage registration through devsa.community or through an external channel.
                          </p>
                        </div>

                        {/* Built-in RSVP option */}
                        <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                          editingEvent.rsvpEnabled
                            ? 'border-[#ef426f]/50 bg-[#ef426f]/5'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}>
                          <input
                            type="radio"
                            name="editRegistrationType"
                            checked={editingEvent.rsvpEnabled || false}
                            onChange={() => setEditingEvent({ ...editingEvent, rsvpEnabled: true, externalRsvpUrl: "" })}
                            className="mt-0.5 accent-[#ef426f]"
                          />
                          <div>
                            <span className="text-sm font-medium text-white">devsa.community RSVP form</span>
                            <p className="text-xs text-neutral-500 mt-1">
                              Collect RSVPs directly on your event page. Attendees register with their name and email.
                            </p>
                          </div>
                        </label>
                        {editingEvent.rsvpEnabled && (
                          <p className="ml-7 text-xs text-green-400 flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            RSVP form will appear on the event page. You can view and export RSVPs from your dashboard.
                          </p>
                        )}
                        {/* One question of the organizer's own, on the DEVSA
                            form only — Luma's custom registration question.
                            Answers show in the RSVPs tab and the CSV. */}
                        {editingEvent.rsvpEnabled && (
                          <div className="ml-7 space-y-2">
                            <label htmlFor="rsvpQuestion" className="block text-sm font-medium text-neutral-300">
                              Your own question <span className="font-normal text-neutral-400">(optional)</span>
                            </label>
                            <input
                              id="rsvpQuestion"
                              type="text"
                              maxLength={200}
                              value={editingEvent.rsvpQuestion || ""}
                              onChange={(e) => setEditingEvent({ ...editingEvent, rsvpQuestion: e.target.value })}
                              placeholder="e.g. Which group or student organization do you lead?"
                              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                            />
                            {(editingEvent.rsvpQuestion || "").trim() && (
                              <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingEvent.rsvpQuestionRequired === true}
                                  onChange={(e) => setEditingEvent({ ...editingEvent, rsvpQuestionRequired: e.target.checked })}
                                  className="accent-[#ef426f]"
                                />
                                Attendees must answer it
                              </label>
                            )}
                            <p className="text-xs text-neutral-400">
                              Asked under name and email on the RSVP form. Answers appear in the RSVPs tab and the CSV export.
                            </p>
                          </div>
                        )}

                        {/* External RSVP option */}
                        <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                          !editingEvent.rsvpEnabled
                            ? 'border-[#ef426f]/50 bg-[#ef426f]/5'
                            : 'border-neutral-700 hover:border-neutral-600'
                        }`}>
                          <input
                            type="radio"
                            name="editRegistrationType"
                            checked={!editingEvent.rsvpEnabled}
                            onChange={() => setEditingEvent({ ...editingEvent, rsvpEnabled: false })}
                            className="mt-0.5 accent-[#ef426f]"
                          />
                          <div>
                            <span className="text-sm font-medium text-white">External registration</span>
                            <p className="text-xs text-neutral-500 mt-1">
                              Link to an external registration page (Eventbrite, Lu.ma, Meetup, etc.). An RSVP button will appear on the event page.
                            </p>
                          </div>
                        </label>
                        {!editingEvent.rsvpEnabled && (
                          <div className="ml-7">
                            <input
                              type="url"
                              value={editingEvent.externalRsvpUrl || ""}
                              onChange={(e) => setEditingEvent({ ...editingEvent, externalRsvpUrl: e.target.value })}
                              placeholder="https://eventbrite.com/e/your-event"
                              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                            />
                            <p className="mt-2 text-xs text-neutral-500">
                              Optional — leave blank if you don&apos;t need a registration button on the event page.
                            </p>
                          </div>
                        )}
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
                      {/* Luma's "private": the page, RSVP and share poster work
                          for anyone with the link, and every list leaves it out.
                          See lib/event-visibility.ts for the surfaces. */}
                      <label className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                        editingEvent.unlisted
                          ? "border-[#00b2a9]/50 bg-[#00b2a9]/5"
                          : "border-neutral-700 hover:border-neutral-600"
                      }`}>
                        <input
                          type="checkbox"
                          checked={editingEvent.unlisted === true}
                          onChange={(e) => setEditingEvent({ ...editingEvent, unlisted: e.target.checked })}
                          className="mt-0.5 accent-[#00b2a9]"
                        />
                        <div>
                          <span className="text-sm font-medium text-white">Link only (private)</span>
                          <p className="text-xs text-neutral-400 mt-1">
                            Only people with the link can find it. Kept off the public calendar,
                            the feeds and calendar subscriptions, the Discord digest, the
                            group pages and search engines. RSVP still works. Not a password:
                            anyone you forward the link to can open it.
                          </p>
                        </div>
                      </label>
                      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-neutral-800 bg-neutral-900/95 px-6 py-4 backdrop-blur">
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
                          {editingEvent.id
                            ? "Save Changes"
                            : editingEvent.status === "draft"
                            ? "Save as Draft"
                            : "Publish Event"}
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
                    communityOrder.items.map((community) => (
                      <div
                        key={community.id}
                        {...communityOrder.getRowProps(community.id)}
                        className={`rounded-xl border bg-neutral-800/30 p-4 transition-colors ${
                          communityOrder.draggingId === community.id
                            ? "border-[#ef426f]/60 opacity-50"
                            : communityOrder.overId === community.id
                              ? "border-[#ef426f] bg-neutral-800/60"
                              : "border-neutral-800 hover:bg-neutral-800/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Grab handle. A real button so it is focusable and
                              takes arrow keys — HTML5 drag events only fire for
                              a pointer, so without this the list is
                              mouse-only. */}
                          <button
                            type="button"
                            {...communityOrder.getHandleProps(community.id)}
                            className="mt-0.5 shrink-0 cursor-grab rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef426f] active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
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

              {/* Edit Community Drawer */}
              <SlideDrawer
                open={showEditCommunity && !!editingCommunity}
                onClose={() => {
                  setShowEditCommunity(false)
                  setEditingCommunity(null)
                }}
                title="Edit Community"
              >
                {editingCommunity && (
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
                )}
              </SlideDrawer>

              {/* Create Community Drawer */}
              <SlideDrawer
                open={showCreateCommunity}
                onClose={() => {
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
                title="Create New Community"
              >
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
              </SlideDrawer>
            </div>
          )}

          {/* Partners Tab - Admin Only */}
          {activeTab === "partners" && hasAdminAccess(adminRole) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Partners</h2>
                <button
                  onClick={() => { setNewPartner(emptyPartner); setShowCreatePartner(true) }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Partner
                </button>
              </div>

              {partners.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 py-12 text-center">
                  <Handshake className="mx-auto mb-3 h-6 w-6 text-neutral-600" />
                  <p className="text-sm text-neutral-400">No partners yet</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Add partner organizations like Tech Bloc or Youth Code Jam. They can then co-host events.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {partnerOrder.items.map((partner) => (
                    <div
                      key={partner.id}
                      {...partnerOrder.getRowProps(partner.id)}
                      className={`flex gap-4 rounded-xl border bg-neutral-800/30 p-4 transition-colors ${
                        partnerOrder.draggingId === partner.id
                          ? "border-[#ef426f]/60 opacity-50"
                          : partnerOrder.overId === partner.id
                            ? "border-[#ef426f] bg-neutral-800/60"
                            : "border-neutral-800"
                      }`}
                    >
                      <button
                        type="button"
                        {...partnerOrder.getHandleProps(partner.id)}
                        className="mt-0.5 shrink-0 cursor-grab rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef426f] active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-white/5">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="h-full w-full object-contain p-1" />
                        ) : (
                          <Handshake className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate font-semibold text-white">{partner.name}</h3>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => { setEditingPartner(partner); setShowEditPartner(true) }}
                              className="rounded-lg bg-blue-500/20 p-2 text-blue-400 hover:bg-blue-500/30 transition-colors"
                              aria-label="Edit partner"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePartner(partner.id, partner.name)}
                              disabled={isDeletingPartner === partner.id}
                              className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              aria-label="Delete partner"
                            >
                              {isDeletingPartner === partner.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{partner.description}</p>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#ef426f] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Partner Drawer */}
              <SlideDrawer
                open={showCreatePartner}
                onClose={() => { setShowCreatePartner(false); setNewPartner(emptyPartner) }}
                title="Create Partner"
                subtitle="Add a partner organization that can co-host events."
              >
                <form onSubmit={handleCreatePartner} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Partner ID *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.id}
                      onChange={(e) => setNewPartner({ ...newPartner, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="tech-bloc"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    />
                    <p className="mt-2 text-xs text-neutral-500">Lowercase and hyphenated — this is the permanent ID and can&apos;t be changed later.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      placeholder="Tech Bloc"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Logo *</label>
                    {/* Upload or paste. The URL field stays — some partner
                        logos are already hosted and re-uploading them would
                        just make a second copy. */}
                    <div className="mb-2 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {{ handlePartnerLogoUpload(file, newPartner.id, (url) => setNewPartner((prev) => ({ ...prev, logo: url }))) }}
                        }}
                        disabled={isUploadingPartnerLogo}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ef426f] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-[#d63760] file:cursor-pointer"
                      />
                      {isUploadingPartnerLogo && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-5 w-5 animate-spin text-[#ef426f]" />
                        </div>
                      )}
                    </div>
                    {newPartner.logo && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-800/40 p-2">
                        <img src={newPartner.logo} alt="" className="h-8 w-8 object-contain" />
                        <span className="truncate text-xs text-neutral-400">{newPartner.logo}</span>
                      </div>
                    )}
                    <input
                      type="url"
                      required
                      value={newPartner.logo}
                      onChange={(e) => setNewPartner({ ...newPartner, logo: e.target.value })}
                      placeholder="https://…/logo.svg"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                      placeholder="What this partner does…"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">Website</label>
                    <input
                      type="url"
                      value={newPartner.website || ""}
                      onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                      placeholder="https://…"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white placeholder:text-neutral-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowCreatePartner(false); setNewPartner(emptyPartner) }}
                      className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPartner}
                      className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                    >
                      {isSavingPartner ? (
                        <><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Creating...</>
                      ) : (
                        "Create Partner"
                      )}
                    </button>
                  </div>
                </form>
              </SlideDrawer>

              {/* Edit Partner Drawer */}
              <SlideDrawer
                open={showEditPartner && !!editingPartner}
                onClose={() => { setShowEditPartner(false); setEditingPartner(null) }}
                title="Edit Partner"
              >
                {editingPartner && (
                  <form onSubmit={handleSavePartner} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">Partner ID</label>
                      <div className="w-full rounded-xl border border-neutral-700 bg-neutral-800/60 py-3 px-4 text-sm text-neutral-400">
                        {editingPartner.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={editingPartner.name}
                        onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">Logo</label>
                    {/* Upload or paste. The URL field stays — some partner
                          logos are already hosted and re-uploading them would
                          just make a second copy. */}
                      <div className="mb-2 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {{ handlePartnerLogoUpload(file, editingPartner.id, (url) => setEditingPartner((prev) => (prev ? { ...prev, logo: url } : prev))) }}
                          }}
                          disabled={isUploadingPartnerLogo}
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#ef426f] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-[#d63760] file:cursor-pointer"
                        />
                        {isUploadingPartnerLogo && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-[#ef426f]" />
                          </div>
                        )}
                      </div>
                      {editingPartner.logo && (
                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-800/40 p-2">
                          <img src={editingPartner.logo} alt="" className="h-8 w-8 object-contain" />
                          <span className="truncate text-xs text-neutral-400">{editingPartner.logo}</span>
                        </div>
                      )}
                      <input
                        type="url"
                        required
                        value={editingPartner.logo}
                        onChange={(e) => setEditingPartner({ ...editingPartner, logo: e.target.value })}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={editingPartner.description}
                        onChange={(e) => setEditingPartner({ ...editingPartner, description: e.target.value })}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">Website</label>
                      <input
                        type="url"
                        value={editingPartner.website || ""}
                        onChange={(e) => setEditingPartner({ ...editingPartner, website: e.target.value })}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 px-4 text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowEditPartner(false); setEditingPartner(null) }}
                        className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingPartner}
                        className="flex-1 rounded-xl bg-[#ef426f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                      >
                        {isSavingPartner ? (
                          <><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Saving...</>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </SlideDrawer>
            </div>
          )}

          {/* RSVPs Tab */}
          {activeTab === "rsvps" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Event RSVPs</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Community filter — admins/superadmins only (organizers own a single group) */}
                  {hasAdminAccess(adminRole) && (
                    <AdminCombobox
                      className="w-52"
                      value={selectedRsvpCommunity}
                      onChange={(v) => {
                        setSelectedRsvpCommunity(v)
                        setSelectedRsvpEvent('all')
                      }}
                      options={[
                        { value: 'all', label: 'All Communities' },
                        ...communities.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  )}

                  {/* Event filter */}
                  <AdminCombobox
                    className="w-60"
                    value={selectedRsvpEvent}
                    onChange={setSelectedRsvpEvent}
                    placeholder="All Events"
                    options={[
                      { value: 'all', label: 'All Events' },
                      // Newest first, and a collab event counts for every group hosting it.
                      ...events
                        .filter((e) => e.rsvpEnabled && (selectedRsvpCommunity === 'all' || hostIds(e.communityId).includes(selectedRsvpCommunity)))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((e) => ({ value: e.id, label: e.title })),
                    ]}
                  />

                  <button
                    onClick={() => handleExportRsvps(selectedRsvpEvent)}
                    disabled={isExportingRsvps || rsvps.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d63760] transition-colors disabled:opacity-50"
                  >
                    {isExportingRsvps ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export CSV
                  </button>
                </div>
              </div>

              {(() => {
                let filteredRsvps = rsvps
                // Filter by community first
                if (selectedRsvpCommunity !== 'all') {
                  filteredRsvps = filteredRsvps.filter(r => hostIds(r.communityId).includes(selectedRsvpCommunity))
                }
                // Then filter by event
                if (selectedRsvpEvent !== 'all') {
                  filteredRsvps = filteredRsvps.filter(r => r.eventId === selectedRsvpEvent)
                }
                
                // Summary metrics for the KPI row (reflect the active filters)
                const totalRsvps = filteredRsvps.length
                const optedIn = filteredRsvps.filter(r => r.joinNewsletter).length
                const optInRate = totalRsvps > 0 ? Math.round((optedIn / totalRsvps) * 100) : 0
                // By id: an event whose address changed keeps one count and one group.
                const eventCount = new Set(filteredRsvps.map(r => r.eventId || r.eventSlug)).size
                // Each group counted once, whether it hosted alone or in a collab.
                const communityCount = new Set(filteredRsvps.flatMap(r => hostIds(r.communityId))).size

                const tiles: { label: string; value: number; sub?: string }[] = [
                  { label: 'Total RSVPs', value: totalRsvps },
                  { label: 'Events', value: eventCount },
                  { label: 'Newsletter opt-ins', value: optedIn, sub: `${optInRate}%` },
                  // Communities only matters when more than one group is in view
                  ...(hasAdminAccess(adminRole) ? [{ label: 'Communities', value: communityCount }] : []),
                ]

                // Group by event
                const groupedByEvent = filteredRsvps.reduce((acc, rsvp) => {
                  const key = rsvp.eventId || rsvp.eventSlug
                  if (!acc[key]) {
                    const event = events.find(e => e.id === rsvp.eventId)
                    /*
                     * Every host, by name. This looked up one community by the
                     * RSVP's communityId, which a collab stores as
                     * "alamo-python,pytexas" and a partner- or DEVSA-hosted
                     * event leaves empty, so all three showed "Unknown". The
                     * event record is the source; the RSVP's copy is the fallback
                     * for an event since deleted.
                     */
                    const groupNames = hostIds(event?.communityId ?? rsvp.communityId)
                      // A partner typed in as a custom host (Tech Bloc on its own events) resolves too.
                      .map(id => communities.find(c => c.id === id)?.name || partners.find(p => p.id === id)?.name || event?.communityName || id)
                    const partnerNames = hostIds(event?.partnerId)
                      .map(id => partners.find(p => p.id === id)?.name || id)
                    const hostNames = [...(event?.isOfficial ? ['DEVSA'] : []), ...groupNames, ...partnerNames]
                    acc[key] = {
                      eventTitle: event?.title || rsvp.eventSlug,
                      communityName: hostNames.length ? hostNames.join(' + ') : 'Unknown',
                      // For ordering: the event's own date (0 if the event is gone).
                      sortAt: event?.date ? new Date(event.date).getTime() : 0,
                      rsvps: []
                    }
                  }
                  acc[key].rsvps.push(rsvp)
                  return acc
                }, {} as Record<string, { eventTitle: string; communityName: string; sortAt: number; rsvps: EventRSVP[] }>)

                // An event that has since been deleted has no date; its latest RSVP stands in.
                const orderAt = (g: { sortAt: number; rsvps: EventRSVP[] }) =>
                  g.sortAt || Math.max(0, ...g.rsvps.map(r => new Date(r.submittedAt).getTime() || 0))

                return (
                  <>
                    {/* Summary tiles */}
                    <div className={`mb-6 grid grid-cols-2 gap-3 ${hasAdminAccess(adminRole) ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                      {tiles.map((t) => (
                        <div key={t.label} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t.label}</p>
                          <p className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold tabular-nums text-white">{t.value}</span>
                            {t.sub && <span className="text-sm font-medium text-neutral-500">{t.sub}</span>}
                          </p>
                        </div>
                      ))}
                    </div>

                    {totalRsvps === 0 ? (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 py-12 text-center">
                        <Users className="mx-auto mb-3 h-6 w-6 text-neutral-600" />
                        <p className="text-sm text-neutral-400">No RSVPs yet</p>
                        <p className="mt-1 text-xs text-neutral-600">
                          Enable RSVP on an event to start collecting registrations.
                        </p>
                      </div>
                    ) : (
                    <div className="space-y-6">
                    {/* Most recent event first. */}
                    {Object.entries(groupedByEvent).sort(([, a], [, b]) => orderAt(b) - orderAt(a)).map(([slug, { eventTitle, communityName, rsvps: eventRsvps }]) => (
                      <div key={slug} className="rounded-xl border border-neutral-800 bg-neutral-800/30 overflow-hidden">
                        <div className="px-4 py-3 bg-neutral-800/50 border-b border-neutral-700 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{eventTitle}</h3>
                            {/* Community badge only helps super admins viewing multiple groups */}
                            {hasAdminAccess(adminRole) && (
                              <span className="inline-flex items-center rounded-full bg-[#ef426f]/20 px-2.5 py-0.5 text-xs font-medium text-[#ef426f]">
                                {communityName}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-neutral-400">
                            {eventRsvps.length} RSVPs
                            <span className="text-neutral-600"> · {eventRsvps.filter(r => r.joinNewsletter).length} opted in</span>
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-175">
                            <thead>
                              <tr className="border-b border-neutral-800">
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                                {eventRsvps.some(r => r.question) && (
                                  <th className="text-left py-2.5 px-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider" title={eventRsvps.find(r => r.question)?.question}>
                                    {eventRsvps.find(r => r.question)?.question}
                                  </th>
                                )}
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
                                  {eventRsvps.some(r => r.question) && (
                                    <td className="py-2 px-4 text-sm text-neutral-300 max-w-xs">{rsvp.answer || <span className="text-neutral-400">—</span>}</td>
                                  )}
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
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Demo Day Inquiries - Admin Only. The tab is hidden from organizers
              and /api/admin/demo-day-inquiries refuses them; this guard keeps a
              ?tab=demoday deep link from rendering for them either. */}
          {activeTab === "demoday" && hasAdminAccess(adminRole) && (
            <div>
              <TabHeader
                title="Confluencia Inquiries"
                summary={`${newDemoDayCount} new · ${demoDayInquiries.filter((i) => i.status === "contacted").length} contacted · ${demoDayInquiries.filter((i) => i.status === "closed").length} closed`}
                actions={
                  <a
                    href="/events/confluencia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> View page
                  </a>
                }
              />

              {demoDayInquiries.length === 0 ? (
                <EmptyState>No inquiries yet.</EmptyState>
              ) : (
                <DataTable minWidth="min-w-[60rem]">
                  <thead>
                    <tr>
                      <Th>From</Th>
                      <Th>Interested in</Th>
                      <Th>Message</Th>
                      <Th>Received</Th>
                      <Th>Status</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoDayInquiries.map((inq) => (
                      <Tr key={inq.id} highlight={inq.status === "new"}>
                        <Td className="w-[15rem]">
                          <PrimaryCell
                            title={decodeEntities(inq.organization)}
                            sub={
                              <>
                                <div>
                                  {decodeEntities(inq.name)}
                                  {inq.title ? `, ${decodeEntities(inq.title)}` : ""}
                                </div>
                                <MailLink email={inq.email} />
                              </>
                            }
                          />
                        </Td>
                        <Td>
                          <div className="flex flex-col items-start gap-1.5">
                            <Pill tone="amber">{demoDayInterestLabel(inq.interest)}</Pill>
                            {inq.industry && <Pill>{decodeEntities(inq.industry)}</Pill>}
                          </div>
                        </Td>
                        <Td><LongText text={decodeEntities(inq.message)} /></Td>
                        <Td><DateCell value={inq.submittedAt} time /></Td>
                        <Td>
                          <select
                            value={inq.status}
                            onChange={(e) => handleDemoDayStatus(inq.id, e.target.value as DemoDayInquiryRow["status"])}
                            className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                            aria-label={`Status for ${decodeEntities(inq.organization)}`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </Td>
                        <Td align="right">
                          <RowActions>
                            <a
                              href={`mailto:${inq.email}?subject=${encodeURIComponent("Confluencia, a DEVSA Demo Day")}`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                            >
                              <Mail className="h-4 w-4" /> Reply
                            </a>
                            <RowAction
                              tone="danger"
                              onClick={() => handleDeleteDemoDayInquiry(inq.id)}
                              aria-label={`Delete inquiry from ${decodeEntities(inq.organization)}`}
                              icon={<Trash2 className="h-4 w-4" />}
                            />
                          </RowActions>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </DataTable>
              )}
            </div>
          )}

          {/* Get Involved - Admin Only. /get-involved submissions: partners,
              sponsors and questions. Organizers never see it; the API refuses
              them too. */}
          {activeTab === "getinvolved" && hasAdminAccess(adminRole) && (
            <div>
              <TabHeader
                title="Get Involved"
                summary={`${newGetInvolvedCount} new · ${getInvolved.filter((i) => i.status === "contacted").length} contacted · ${getInvolved.filter((i) => i.status === "closed").length} closed`}
                actions={
                  <a
                    href="/get-involved"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> View form
                  </a>
                }
              />

              {getInvolved.length === 0 ? (
                <EmptyState>No inquiries yet.</EmptyState>
              ) : (
                <DataTable minWidth="min-w-[60rem]">
                  <thead>
                    <tr>
                      <Th>From</Th>
                      <Th>Wants to</Th>
                      <Th>Message</Th>
                      <Th>Received</Th>
                      <Th>Status</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {getInvolved.map((inq) => {
                      const who = decodeEntities(inq.organization || inq.name)
                      return (
                        <Tr key={inq.id} highlight={inq.status === "new"}>
                          <Td className="w-[15rem]">
                            <PrimaryCell
                              title={who}
                              sub={
                                <>
                                  {inq.organization && (
                                    <div>
                                      {decodeEntities(inq.name)}
                                      {inq.title ? `, ${decodeEntities(inq.title)}` : ""}
                                    </div>
                                  )}
                                  <MailLink email={inq.email} />
                                </>
                              }
                            />
                          </Td>
                          <Td>
                            <div className="flex flex-col items-start gap-1.5">
                              <Pill tone={inq.path === "partner" ? "pink" : inq.path === "sponsor" ? "amber" : "neutral"}>
                                {getInvolvedPathLabel(inq.path)}
                              </Pill>
                              {inq.way && <span className="text-[13px] text-neutral-400">{partnerWayLabel(inq.way)}</span>}
                              {inq.event && <span className="text-[13px] text-neutral-400">{decodeEntities(inq.event)}</span>}
                              {inq.subject && <span className="text-[13px] text-neutral-400">{decodeEntities(inq.subject)}</span>}
                            </div>
                          </Td>
                          <Td><LongText text={decodeEntities(inq.message)} /></Td>
                          <Td><DateCell value={inq.submittedAt} time /></Td>
                          <Td>
                            <select
                              value={inq.status}
                              onChange={(e) => handleGetInvolvedStatus(inq.id, e.target.value as GetInvolvedRow["status"])}
                              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500"
                              aria-label={`Status for ${who}`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </Td>
                          <Td align="right">
                            <RowActions>
                              <a
                                href={`mailto:${inq.email}?subject=${encodeURIComponent("Getting involved with DEVSA")}`}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                              >
                                <Mail className="h-4 w-4" /> Reply
                              </a>
                              <RowAction
                                tone="danger"
                                onClick={() => handleDeleteGetInvolved(inq.id)}
                                aria-label={`Delete inquiry from ${who}`}
                                icon={<Trash2 className="h-4 w-4" />}
                              />
                            </RowActions>
                          </Td>
                        </Tr>
                      )
                    })}
                  </tbody>
                </DataTable>
              )}
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  )
}
