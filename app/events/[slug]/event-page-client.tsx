"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { techCommunities } from "@/data/communities"
import { initialCommunityEvents } from "@/data/events"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowLeft, ExternalLink, Globe, Loader2, Check, Link2 } from "lucide-react"

// Social icons for share buttons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

interface Event {
  id: string
  title: string
  slug: string
  date: string
  endTime?: string
  location: string
  description: string
  url?: string
  communityId: string
}

interface EventPageClientProps {
  slug: string
}

// DEVSA Discord - all community organizers are in this server
const DEVSA_DISCORD = "https://discord.gg/cvHHzThrEw"

export function EventPageClient({ slug }: EventPageClientProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for live "Happening Now" detection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Event Not Found</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </main>
    )
  }

  const community = techCommunities.find((c) => c.id === event.communityId)
  const eventDate = new Date(event.date)
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = `${event.title} - ${eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" })}`

  // Helper to get event status
  const getEventStatus = (): "upcoming" | "happening" | "ended" => {
    const startTime = new Date(event.date).getTime()
    const endTime = event.endTime 
      ? new Date(event.endTime).getTime()
      : startTime + (2 * 60 * 60 * 1000) // Default 2 hours
    const now = currentTime.getTime()
    
    if (now >= startTime && now < endTime) return "happening"
    if (now >= endTime) return "ended"
    return "upcoming"
  }

  const eventStatus = getEventStatus()

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    )
  }

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section data-bg-type="light">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
          {/* Back button using router.back() */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Event header */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Community banner with logo */}
            {community && (
              <div 
                className="p-6 sm:p-8 flex items-center gap-5 border-b border-slate-100 bg-[#ef426f]/5"
              >
              <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-black p-3 shadow-md">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500 tracking-wide uppercase">Hosted by</span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">{community.name}</h2>
              </div>
            </div>
          )}

          {/* Event content */}
          <div className="p-6 sm:p-8">
            {/* Title with status badge */}
            <div className="flex flex-wrap items-start gap-4 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">{event.title}</h1>
              {eventStatus === "happening" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shrink-0">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Happening Now
                </span>
              )}
              {eventStatus === "ended" && (
                <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 shrink-0">
                  Event Ended
                </span>
              )}
            </div>

            {/* Date and location */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 sm:gap-10 mb-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 bg-[#ef426f]/10">
                  <Calendar className="h-5 w-5 text-[#ef426f]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Date & Time</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "America/Chicago",
                    })}
                  </p>
                  <p className="text-base text-slate-600 mt-0.5">
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "America/Chicago",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 bg-[#ef426f]/10">
                  <MapPin className="h-5 w-5 text-[#ef426f]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Location</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">About this event</h3>
              <p className="text-base text-slate-600 whitespace-pre-wrap leading-7">{event.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-slate-100">
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#d63760] hover:shadow-lg"
                >
                  Register / RSVP
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {/* Share buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-1">Share:</span>
                <button
                  onClick={shareToX}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
                  title="Share on X"
                >
                  <XIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
                  title="Share on LinkedIn"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-all ${
                    copied
                      ? "bg-green-500 text-white border-green-500"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                  title={copied ? "Copied!" : "Copy link"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Community info */}
        {community && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-14 w-14 shrink-0 rounded-xl bg-black p-2 shadow-md">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="56px"
                />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">About {community.name}</h3>
            </div>
            <p className="text-base text-slate-600 leading-7 mb-8">{community.description}</p>
            
            {/* Community Links */}
            <div className="flex flex-wrap gap-3">
              {community.website && (
                <a
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Meetup
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
              {/* Always show Discord - link to DEVSA Discord where all organizers are */}
              <a
                href={community.discord || DEVSA_DISCORD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2]"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        )}
        </div>
      </section>
    </main>
  )
}
