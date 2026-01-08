"use client"

import { useState, useEffect } from "react"
import { techCommunities } from "@/data/communities"
import { initialCommunityEvents } from "@/data/events"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowLeft, Share2, ExternalLink, Users, Globe, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  slug: string
  date: string
  location: string
  description: string
  url?: string
  communityId: string
}

interface EventPageClientProps {
  slug: string
}

export function EventPageClient({ slug }: EventPageClientProps) {
  const [event, setEvent] = useState<Event | null | undefined>(undefined)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          const foundEvent = data.events?.find((e: Event) => e.slug === slug)
          if (foundEvent) {
            setEvent(foundEvent)
            return
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error)
      }
      
      // Fallback to static events
      const staticEvent = initialCommunityEvents.find(e => e.slug === slug)
      if (staticEvent) {
        setEvent({
          id: staticEvent.id,
          title: staticEvent.title,
          slug: staticEvent.slug || slug,
          date: staticEvent.date,
          location: staticEvent.location,
          description: staticEvent.description,
          url: staticEvent.url,
          communityId: staticEvent.communityTag,
        })
      } else {
        setEvent(null)
      }
    }
    
    fetchEvent()
  }, [slug])

  if (event === undefined) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ef426f]" />
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
                  Discord
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
