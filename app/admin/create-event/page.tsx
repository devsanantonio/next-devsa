"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { techCommunities } from "@/data/communities"

export default function AdminCreateEventPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [adminCommunityId, setAdminCommunityId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "18:00",
    endTime: "20:00",
    location: "",
    description: "",
    url: "",
    communityId: "",
    source: "manual" as const,
    status: "published" as "published" | "draft",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = localStorage.getItem("devsa-admin-email")
      if (!storedEmail) {
        router.push("/admin")
        return
      }

      try {
        const response = await fetch(`/api/admin/auth?email=${encodeURIComponent(storedEmail)}`)
        const data = await response.json()

        if (data.isAdmin) {
          setAdminEmail(storedEmail)
          setAdminRole(data.role)
          setAdminCommunityId(data.communityId || null)
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
          location: formData.location,
          description: formData.description,
          url: formData.url || undefined,
          communityId: formData.communityId,
          source: formData.source,
          status: formData.status,
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

  // Filter communities based on user's role
  const availableCommunities = adminRole === "admin" || adminRole === "superadmin"
    ? techCommunities
    : techCommunities.filter((c) => c.id === adminCommunityId)

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
              <label htmlFor="communityId" className="block text-sm font-semibold text-gray-300 mb-2">
                Community *
              </label>
              <select
                id="communityId"
                required
                value={formData.communityId}
                onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              >
                <option value="">Select a community</option>
                {availableCommunities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
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

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Geekdom, 110 E Houston St, San Antonio, TX"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none leading-relaxed"
              />
            </div>

            {/* External URL (optional) */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-300 mb-2">
                Registration URL (optional)
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://meetup.com/..."
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
              <p className="mt-2 text-xs text-gray-500">
                Link to Meetup, Lu.ma, Eventbrite, or other registration page
              </p>
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-semibold text-gray-300 mb-2">
                Event Source
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as typeof formData.source })}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              >
                <option value="manual">Manual Entry</option>
                <option value="meetup">Meetup</option>
                <option value="luma">Lu.ma</option>
                <option value="eventbrite">Eventbrite</option>
              </select>
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
