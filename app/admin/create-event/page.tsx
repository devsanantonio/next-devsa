"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, ChevronDown, Users, X } from "lucide-react"

import { RichTextEditor } from "@/components/rich-text-editor"

interface Community {
  id: string
  name: string
  logo: string
  description: string
  isStatic?: boolean
}

export default function AdminCreateEventPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [adminCommunityId, setAdminCommunityId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [useCustomCommunity, setUseCustomCommunity] = useState(false)
  const [customCommunityName, setCustomCommunityName] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "18:00",
    endTime: "20:00",
    venue: "",
    address: "",
    description: "",
    communityId: "",
    status: "published" as "published" | "draft",
    eventType: "in-person" as "in-person" | "hybrid" | "virtual",
    rsvpEnabled: false,
  })

  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = localStorage.getItem("devsa-admin-email")
      if (!storedEmail) {
        router.push("/admin")
        return
      }

      try {
        const [authResponse, communitiesResponse] = await Promise.all([
          fetch(`/api/admin/auth?email=${encodeURIComponent(storedEmail)}`),
          fetch('/api/communities')
        ])
        
        const data = await authResponse.json()
        const communitiesData = await communitiesResponse.json()

        if (data.isAdmin) {
          setAdminEmail(storedEmail)
          setAdminRole(data.role)
          setAdminCommunityId(data.communityId || null)
          
          // Set communities from Firestore
          const communityList = communitiesData.communities || []
          setCommunities(communityList)
          
          // Auto-select community for organizers
          if (data.role === "organizer" && data.communityId) {
            setFormData(prev => ({ ...prev, communityId: data.communityId }))
          }
        } else {
          router.push("/admin")
        }
      } catch {
        router.push("/admin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}:00`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          date: dateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          venue: formData.venue,
          address: formData.address,
          location: formData.venue && formData.address 
            ? `${formData.venue}, ${formData.address}` 
            : formData.venue || formData.address,
          description: formData.description,
          communityId: formData.communityId,
          ...(useCustomCommunity && customCommunityName ? { communityName: customCommunityName } : {}),
          status: formData.status,
          eventType: formData.eventType,
          rsvpEnabled: formData.rsvpEnabled,
          organizerEmail: adminEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event")
      }

      router.push("/events")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user can select a community
  const canSelectCommunity = (communityId: string): boolean => {
    if (adminRole === "admin" || adminRole === "superadmin") return true
    return communityId === adminCommunityId
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ef426f]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Create Event</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Add a new event to the DEVSA community calendar.
          </p>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Community * <span className="font-normal text-gray-500">(select one or more for collaborative events)</span>
              </label>
              {adminRole === "organizer" ? (
                // Organizers: locked to their assigned community
                <div className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white">
                  {communities.find(c => c.id === formData.communityId)?.name || "No community assigned"}
                </div>
              ) : (
                // Admin/Superadmin: multiselect dropdown with chips + custom option
                <div className="relative">
                  {useCustomCommunity ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={customCommunityName}
                        onChange={(e) => {
                          setCustomCommunityName(e.target.value)
                          setFormData({ ...formData, communityId: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                        }}
                        placeholder="e.g. Loveable, Microsoft, etc."
                        className="flex-1 rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomCommunity(false)
                          setCustomCommunityName("")
                          setFormData({ ...formData, communityId: "" })
                        }}
                        className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-400 hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Selected communities chips */}
                      {formData.communityId && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.communityId.split(',').filter(Boolean).map((id) => {
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
                                    const ids = formData.communityId.split(',').filter(i => i !== id)
                                    setFormData({ ...formData, communityId: ids.join(',') })
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
                        onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                        className="w-full flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-left focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      >
                        <span className={formData.communityId ? "text-white" : "text-gray-500"}>
                          {formData.communityId
                            ? `${formData.communityId.split(',').length} selected — click to add more`
                            : "Select communities"}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showCommunityDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showCommunityDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowCommunityDropdown(false)} />
                          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-gray-700 bg-gray-800 py-1 shadow-xl max-h-56 overflow-y-auto">
                            {communities.map((community) => {
                              const selectedIds = formData.communityId.split(',').filter(Boolean)
                              const isSelected = selectedIds.includes(community.id)
                              return (
                                <button
                                  key={community.id}
                                  type="button"
                                  onClick={() => {
                                    const selectedIds = formData.communityId.split(',').filter(Boolean)
                                    if (isSelected) {
                                      setFormData({ ...formData, communityId: selectedIds.filter(id => id !== community.id).join(',') })
                                    } else {
                                      setFormData({ ...formData, communityId: [...selectedIds, community.id].join(',') })
                                    }
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                    isSelected
                                      ? "bg-[#ef426f]/20 text-[#ef426f]"
                                      : "text-gray-300 hover:bg-gray-700"
                                  }`}
                                >
                                  <span className={`flex items-center justify-center h-4 w-4 rounded border text-[10px] ${
                                    isSelected
                                      ? "bg-[#ef426f] border-[#ef426f] text-white"
                                      : "border-gray-600"
                                  }`}>
                                    {isSelected && "✓"}
                                  </span>
                                  <span className="truncate">{community.name}</span>
                                </button>
                              )
                            })}
                            <div className="border-t border-gray-700 mt-1 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setUseCustomCommunity(true)
                                  setShowCommunityDropdown(false)
                                  setFormData({ ...formData, communityId: "" })
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:bg-gray-700 transition-colors"
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
                  {/* Hidden required input for form validation */}
                  <input
                    type="text"
                    required
                    value={formData.communityId}
                    onChange={() => {}}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              )}
              {useCustomCommunity && (
                <p className="mt-2 text-xs text-amber-400">
                  This event will be created with a custom community name (e.g. for partners or one-off events)
                </p>
              )}
              {adminRole === "organizer" && (
                <p className="mt-2 text-xs text-gray-500">
                  {adminCommunityId 
                    ? `You can only create events for your assigned community`
                    : "No community assigned. Please contact an admin to assign you to a community."}
                </p>
              )}
            </div>

            {/* Event title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Monthly Meetup - January 2026"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-semibold text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
            </div>

            {/* Venue and Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venue" className="block text-sm font-semibold text-gray-300 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Geekdom"
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="110 E Houston St, San Antonio, TX"
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="eventType" className="block text-sm font-semibold text-gray-300 mb-2">
                Event Format *
              </label>
              <select
                id="eventType"
                required
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as "in-person" | "hybrid" | "virtual" })}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              >
                <option value="in-person">🏢 In-Person</option>
                <option value="hybrid">🔀 Hybrid</option>
                <option value="virtual">💻 Virtual</option>
              </select>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {formData.eventType === "in-person" && "Attendees will meet at the specified location"}
                {formData.eventType === "hybrid" && "Attendees can join in person or online"}
                {formData.eventType === "virtual" && "Attendees will join via an online platform"}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                Description *
              </label>
              <RichTextEditor
                id="description"
                required
                rows={10}
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe your event. Select text to format with bold, bullets, or links."
                darkMode={true}
              />
            </div>

            {/* RSVP Toggle */}
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-300">Enable RSVP</label>
                  <p className="text-xs text-gray-500 mt-1">
                    Collect RSVPs directly on your event page. Attendees can register with their name and email.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.rsvpEnabled}
                  onClick={() => setFormData({ ...formData, rsvpEnabled: !formData.rsvpEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ef426f] focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    formData.rsvpEnabled ? 'bg-[#ef426f]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.rsvpEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {formData.rsvpEnabled && (
                <p className="mt-3 text-xs text-green-400 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  RSVP form will appear on the event page. You can view and export RSVPs from your dashboard.
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "published" | "draft" })}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              >
                <option value="published">Publish Now</option>
                <option value="draft">Save as Draft</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Draft events are only visible in the admin dashboard
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#ef426f] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {formData.status === "draft" ? "Saving..." : "Publishing..."}
                </>
              ) : (
                formData.status === "draft" ? "Save as Draft" : "Publish Event"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
