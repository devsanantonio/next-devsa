"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import { techCommunities } from "@/data/communities"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CreateEventPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const currentUser = useQuery(api.users.getCurrentUser)
  const createEvent = useMutation(api.events.createEvent)

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "18:00",
    location: "",
    description: "",
    url: "",
    communityId: "",
    source: "manual" as const,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreateEvents = currentUser?.role === "organizer" || currentUser?.role === "admin"

  // Show loading state
  if (authLoading || currentUser === undefined) {
    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#ef426f]" />
          </div>
        </div>
      </main>
    )
  }

  // Redirect if not authenticated or not authorized
  if (!isAuthenticated || !canCreateEvents) {
    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">
            You need to be signed in as an organizer to create events.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      await createEvent({
        title: formData.title,
        date: dateTime.toISOString(),
        location: formData.location,
        description: formData.description,
        url: formData.url || undefined,
        communityId: formData.communityId,
        source: formData.source,
      })

      router.push("/events")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter communities based on user's assigned community (or show all for admin)
  const availableCommunities = currentUser?.role === "admin"
    ? techCommunities
    : techCommunities.filter((c) => c.id === currentUser?.communityId)

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Event</h1>
          <p className="text-gray-400 mb-8">
            Add a new event to the DEVSA community calendar.
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community selection */}
            <div>
              <label htmlFor="communityId" className="block text-sm font-medium text-gray-300 mb-2">
                Community *
              </label>
              <select
                id="communityId"
                required
                value={formData.communityId}
                onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Monthly Meetup - January 2026"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Geekdom, 110 E Houston St, San Antonio, TX"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-none"
              />
            </div>

            {/* External URL (optional) */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                Registration URL (optional)
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://meetup.com/..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                Link to Meetup, Lu.ma, Eventbrite, or other registration page
              </p>
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-2">
                Event Source
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as typeof formData.source })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 px-4 text-sm text-white focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
              >
                <option value="manual">Manual Entry</option>
                <option value="meetup">Meetup</option>
                <option value="luma">Lu.ma</option>
                <option value="eventbrite">Eventbrite</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
