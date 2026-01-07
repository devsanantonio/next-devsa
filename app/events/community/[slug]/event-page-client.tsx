"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { techCommunities } from "@/data/communities"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowLeft, Share2, ExternalLink, Users, Globe } from "lucide-react"

interface EventPageClientProps {
  slug: string
}

export function EventPageClient({ slug }: EventPageClientProps) {
  const event = useQuery(api.events.getEventBySlug, { slug })

  if (event === undefined) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-4" />
            <div className="h-64 bg-slate-200 rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (event === null) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Event Not Found</h1>
          <p className="text-slate-600 mb-8">
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event header */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Community banner */}
          {community && (
            <div 
              className="p-6 flex items-center gap-4 border-b border-slate-100"
              style={{ backgroundColor: community.color ? `${community.color}10` : "#ef426f10" }}
            >
              <div className="relative h-16 w-16 shrink-0 rounded-xl bg-white p-2 shadow-sm">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">Hosted by</span>
                <h2 className="text-xl font-bold text-slate-900">{community.name}</h2>
              </div>
            </div>
          )}

          {/* Event content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">{event.title}</h1>

            {/* Date and location */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-3 text-slate-700">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: community?.color ? `${community.color}20` : "#ef426f20" }}
                >
                  <Calendar className="h-5 w-5" style={{ color: community?.color || "#ef426f" }} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date & Time</p>
                  <p className="font-medium text-slate-900">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-500">
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: community?.color ? `${community.color}20` : "#ef426f20" }}
                >
                  <MapPin className="h-5 w-5" style={{ color: community?.color || "#ef426f" }} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-900">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">About this event</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
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
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
              >
                <Share2 className="h-4 w-4" />
                Share Event
              </button>
            </div>
          </div>
        </div>

        {/* Community info */}
        {community && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: community.color ? `${community.color}20` : "#ef426f20" }}
              >
                <Users className="h-5 w-5" style={{ color: community.color || "#ef426f" }} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">About {community.name}</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">{community.description}</p>
            
            {/* Community Links */}
            <div className="flex flex-wrap gap-3">
              {community.website && (
                <a
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
              {community.meetup && (
                <a
                  href={community.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.98 21.54a5.13 5.13 0 0 1-1.12-.12 3.68 3.68 0 0 1-2.4-1.68 3.68 3.68 0 0 1-.27-2.92c.2-.52.52-.98.92-1.35l.2-.16c-.38-.7-.6-1.47-.67-2.25-.11-1.2.17-2.4.8-3.42a5.42 5.42 0 0 1 2.05-1.92 5.45 5.45 0 0 1 2.76-.74c.42 0 .84.04 1.25.13a7.93 7.93 0 0 1 1.8-2.55A7.84 7.84 0 0 1 17.88 2c1.6 0 3.16.49 4.48 1.4.42.3.8.65 1.15 1.04.13.14.1.37-.05.48-.14.12-.36.1-.48-.04a6.86 6.86 0 0 0-5.1-2.22c-1.77 0-3.46.67-4.77 1.89a7.25 7.25 0 0 0-1.63 2.32c.43.22.84.5 1.21.82a5.33 5.33 0 0 1 1.8 3.37 5.35 5.35 0 0 1-.7 3.3l1.66 2.97c.22.39.35.82.39 1.27a2.77 2.77 0 0 1-.65 2.03c-.42.5-1 .84-1.64.98-.28.06-.56.09-.85.09-.6 0-1.18-.15-1.7-.44l-.27-.16c-.34.45-.76.84-1.24 1.14-.7.44-1.51.68-2.34.68zM6.96 9.7c-.8 0-1.58.21-2.26.6a4.77 4.77 0 0 0-1.81 1.69c-.54.87-.78 1.9-.68 2.9.08.77.3 1.52.67 2.2l.07.13-.17.14c-.4.31-.7.7-.86 1.16a3.02 3.02 0 0 0 .22 2.4 3.02 3.02 0 0 0 1.97 1.38c.28.06.56.09.85.09.66 0 1.31-.19 1.87-.55.43-.27.8-.62 1.1-1.02l.1-.15.14.09c.48.32 1.04.5 1.62.5.24 0 .48-.03.72-.08a2.1 2.1 0 0 0 1.3-.77c.34-.42.51-.95.47-1.48a2.17 2.17 0 0 0-.31-1.01l-1.8-3.22-.04-.08.05-.08a4.67 4.67 0 0 0 .64-2.87c-.1-.99-.53-1.9-1.24-2.64a4.42 4.42 0 0 0-1.28-.9 3.93 3.93 0 0 0-1.34-.23z"/>
                  </svg>
                  Meetup
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
              {community.discord && (
                <a
                  href={community.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
              {community.twitter && (
                <a
                  href={community.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X / Twitter
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
              {community.instagram && (
                <a
                  href={community.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  Instagram
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
