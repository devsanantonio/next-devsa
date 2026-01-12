"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { techCommunities } from "@/data/communities"
import { initialCommunityEvents, type CommunityEvent } from "@/data/events"
import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Calendar, 
  MapPin, 
  Loader2,
  Users
} from "lucide-react"

// DEVSA Discord - all community organizers are in this server
const DEVSA_DISCORD = "https://discord.gg/cvHHzThrEw"

// Social icons
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

function MeetupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.98.555a.518.518 0 00-.105.011.53.53 0 10.222 1.04.533.533 0 00.409-.633.531.531 0 00-.526-.418zm6.455.638a.984.984 0 00-.514.143.99.99 0 101.02 1.699.99.99 0 00.34-1.36.992.992 0 00-.846-.482zm-3.03 2.236a5.029 5.029 0 00-4.668 3.248 3.33 3.33 0 00-1.46.551 3.374 3.374 0 00-.94 4.562 3.634 3.634 0 00-.605 4.649 3.603 3.603 0 002.465 1.597c.018.732.238 1.466.686 2.114a3.9 3.9 0 005.423.992c.068-.047.12-.106.184-.157.987.881 2.47 1.026 3.607.24a2.91 2.91 0 001.162-1.69 4.238 4.238 0 002.584-.739 4.274 4.274 0 001.19-5.789 2.466 2.466 0 00.433-3.308 2.448 2.448 0 00-1.316-.934 4.436 4.436 0 00-.776-2.873 4.467 4.467 0 00-5.195-1.656 5.106 5.106 0 00-2.773-.807zm-5.603.817a.759.759 0 00-.423.135.758.758 0 10.863 1.248.757.757 0 00.193-1.055.758.758 0 00-.633-.328zm15.994 2.37a.842.842 0 00-.47.151.845.845 0 101.175.215.845.845 0 00-.705-.365zm-8.15 1.028c.063 0 .124.005.182.014a.901.901 0 01.45.187c.169.134.273.241.432.393.24.227.414.089.534.02.208-.122.369-.219.984-.208.633.011 1.363.237 1.514 1.317.168 1.199-1.966 4.289-1.817 5.722.106 1.01 1.815.299 1.96 1.22.186 1.198-2.136.753-2.667.493-.832-.408-1.337-1.34-1.12-2.26.16-.688 1.7-3.498 1.757-3.93.059-.44-.177-.476-.324-.484-.19-.01-.34.081-.526.362-.169.255-2.082 4.085-2.248 4.398-.296.56-.67.694-1.044.674-.548-.029-.798-.32-.72-.848.047-.31 1.26-3.049 1.323-3.476.039-.265-.013-.546-.275-.68-.263-.135-.572.07-.664.227-.128.215-1.848 4.706-2.032 5.038-.316.576-.65.76-1.152.784-1.186.056-2.065-.92-1.678-2.116.173-.532 1.316-4.571 1.895-5.599.389-.69 1.468-1.216 2.217-.892.387.167.925.437 1.084.507.366.163.759-.277.913-.412.155-.134.302-.276.49-.357.142-.06.343-.095.532-.094zm10.88 2.057a.468.468 0 00-.093.011.467.467 0 00-.36.555.47.47 0 00.557.36.47.47 0 00.36-.557.47.47 0 00-.464-.37zm-22.518.81a.997.997 0 00-.832.434 1 1 0 101.39-.258 1 1 0 00-.558-.176zm21.294 2.094a.635.635 0 00-.127.013.627.627 0 00-.48.746.628.628 0 00.746.483.628.628 0 00.482-.746.63.63 0 00-.621-.496zm-18.24 6.097a.453.453 0 00-.092.012.464.464 0 10.195.908.464.464 0 00.356-.553.465.465 0 00-.459-.367zm13.675 1.55a1.044 1.044 0 00-.583.187 1.047 1.047 0 101.456.265 1.044 1.044 0 00-.873-.451zM11.4 22.154a.643.643 0 00-.36.115.646.646 0 00-.164.899.646.646 0 00.899.164.646.646 0 00.164-.898.646.646 0 00-.54-.28z" />
    </svg>
  )
}

interface FirestoreEvent {
  id: string
  title: string
  slug: string
  date: string
  location: string
  description: string
  url?: string
  communityId: string
}

interface GroupPageClientProps {
  slug: string
}

export function GroupPageClient({ slug }: GroupPageClientProps) {
  const router = useRouter()
  const [firestoreEvents, setFirestoreEvents] = useState<FirestoreEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  
  const community = techCommunities.find((c) => c.id === slug)

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setFirestoreEvents(data.events || [])
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  // Get events for this community
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Combine Firestore and static events for this community
    const allCommunityEvents: Array<{
      id: string
      title: string
      slug?: string
      date: string
      location: string
      description: string
      url?: string
    }> = []

    // Add Firestore events
    firestoreEvents
      .filter(e => e.communityId === slug)
      .forEach(event => {
        allCommunityEvents.push({
          id: event.id,
          title: event.title,
          slug: event.slug,
          date: event.date,
          location: event.location,
          description: event.description,
          url: event.url,
        })
      })

    // Add static events if no Firestore events
    if (firestoreEvents.length === 0 && !isLoadingEvents) {
      initialCommunityEvents
        .filter(e => e.communityTag === slug)
        .forEach(event => {
          allCommunityEvents.push({
            id: event.id,
            title: event.title,
            slug: event.slug,
            date: event.date,
            location: event.location,
            description: event.description,
            url: event.url,
          })
        })
    }

    const upcoming = allCommunityEvents
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const past = allCommunityEvents
      .filter(e => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5) // Limit past events to 5

    return { upcomingEvents: upcoming, pastEvents: past }
  }, [firestoreEvents, isLoadingEvents, slug])

  if (!community) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Group Not Found</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The community group you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section data-bg-type="light">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
          {/* Back button using router.back() */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {/* Hero section with logo and name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            {/* Header with brand color */}
            <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div 
                className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-slate-900 p-4 shadow-xl">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain p-3"
                  sizes="128px"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-sm font-medium text-[#ef426f] tracking-wide uppercase">Community Group</span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900">
                  {community.name}
                </h1>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 sm:p-8 border-t border-slate-100">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">About</h2>
              <p className="text-base text-slate-600 leading-7 whitespace-pre-wrap">
                {community.description}
              </p>
            </div>

            {/* Links section */}
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {community.website && (
                  <a
                    href={community.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {community.meetup && (
                  <a
                    href={community.meetup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-[#ED1C40] hover:text-white hover:border-[#ED1C40] hover:scale-105"
                  >
                    <MeetupIcon className="h-4 w-4" />
                    Meetup
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {community.luma && (
                  <a
                    href={community.luma}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-[#f59e0b] hover:text-white hover:border-[#f59e0b] hover:scale-105"
                  >
                    <Calendar className="h-4 w-4" />
                    Luma
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {/* Always show Discord - link to community's Discord or DEVSA Discord */}
                <a
                  href={community.discord || DEVSA_DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2] hover:scale-105"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Discord
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                {community.twitter && (
                  <a
                    href={community.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X / Twitter
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {community.instagram && (
                  <a
                    href={community.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-linear-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737] hover:text-white hover:border-transparent hover:scale-105"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8"
          >
            {/* Upcoming Events */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef426f]/10"
                >
                  <Calendar className="h-5 w-5 text-[#ef426f]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Upcoming Events</h2>
              </div>

              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-base font-medium text-slate-500">No upcoming events scheduled</p>
                  <p className="text-sm text-slate-400 mt-1">Check back later or join their Meetup for updates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isUpcoming
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Past Events</h2>
                <div className="space-y-4">
                  {pastEvents.map((event, index) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isUpcoming={false}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* DEVSA CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-center shadow-sm"
          >
            <p className="text-slate-400 text-sm uppercase tracking-widest mb-3">We're the bridge for a reason</p>
            <h3 className="text-xl font-bold text-white mb-4">Find Your Community</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              >
                View All Events
              </Link>
              <a
                href={DEVSA_DISCORD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              >
                <DiscordIcon className="h-4 w-4" />
                Join Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

interface EventCardProps {
  event: {
    id: string
    title: string
    slug?: string
    date: string
    location: string
    description: string
    url?: string
  }
  isUpcoming: boolean
  index: number
}

function EventCard({ event, isUpcoming, index }: EventCardProps) {
  const eventDate = new Date(event.date)
  const eventLink = event.slug ? `/events/community/${event.slug}` : event.url

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group rounded-xl border p-4 sm:p-5 transition-all duration-300 ${
        isUpcoming 
          ? "border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md" 
          : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <time 
              className={`text-sm font-bold uppercase tracking-wide ${
                isUpcoming ? "text-[#ef426f]" : "text-slate-400"
              }`}
            >
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            {isUpcoming && index === 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white bg-[#ef426f]">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Next Up
              </span>
            )}
          </div>
          <h3 className={`text-lg font-bold leading-tight ${isUpcoming ? "text-slate-900" : "text-slate-600"}`}>
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </p>
        </div>
        {eventLink && isUpcoming && (
          <Link
            href={eventLink}
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[#ef426f] px-4 py-2.5 text-sm font-bold text-white transition-all hover:scale-105"
          >
            View Details →
          </Link>
        )}
      </div>
    </motion.div>
  )
}
