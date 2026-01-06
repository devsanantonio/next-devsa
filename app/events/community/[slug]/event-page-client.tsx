"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { techCommunities } from "@/data/communities"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowLeft, Share2, ExternalLink } from "lucide-react"

interface EventPageClientProps {
  slug: string
}

export function EventPageClient({ slug }: EventPageClientProps) {
  const event = useQuery(api.events.getEventBySlug, { slug })

  if (event === undefined) {
    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-800 rounded mb-4" />
            <div className="h-64 bg-gray-800 rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (event === null) {
    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-400 mb-8">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
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

  const community = techCommunities.find((c) => c.id === event.communityId)
  const eventDate = new Date(event.date)
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event header */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          {/* Community banner */}
          {community && (
            <div 
              className="p-6 flex items-center gap-4"
              style={{ backgroundColor: community.color ? `${community.color}20` : "#ef426f20" }}
            >
              <div className="relative h-16 w-16 shrink-0">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-400">Hosted by</span>
                <h2 className="text-xl font-bold text-white">{community.name}</h2>
              </div>
            </div>
          )}

          {/* Event content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">{event.title}</h1>

            {/* Date and location */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef426f]/20">
                  <Calendar className="h-5 w-5 text-[#ef426f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date & Time</p>
                  <p className="font-medium">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef426f]/20">
                  <MapPin className="h-5 w-5 text-[#ef426f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">About this event</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
                >
                  Register / RSVP
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-gray-900 hover:border-white"
              >
                <Share2 className="h-4 w-4" />
                Share Event
              </button>
            </div>
          </div>
        </div>

        {/* Community info */}
        {community && (
          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">About {community.name}</h3>
            <p className="text-gray-400 mb-4">{community.description}</p>
            <div className="flex flex-wrap gap-3">
              {community.website && (
                <a
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline"
                >
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {community.meetup && (
                <a
                  href={community.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline"
                >
                  Meetup
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {community.discord && (
                <a
                  href={community.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline"
                >
                  Discord
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
