"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, ChevronLeft, ChevronRight, CalendarIcon, Plus, CalendarPlus } from "lucide-react"
import type { TechCommunity } from "@/data/communities"
import Image from "next/image"
import Link from "next/link"

interface FirestoreEvent {
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
  communityLogo?: string
  communityLogos?: string[]
  eventType?: 'in-person' | 'hybrid' | 'virtual'
}

// Strip markdown syntax for plain text preview in event cards
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')     // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')          // *italic* → italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
    .replace(/^[-*]\s+/gm, '')            // - bullet → bullet
    .replace(/\n+/g, ' ')                 // newlines → spaces
    .trim()
}

interface EventCalendarProps {
  events: Array<{ date: string }>
  selectedDate: Date | null
  onSelectDate: (date: Date | null) => void
}

function EventCalendar({
  events,
  selectedDate,
  onSelectDate,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const eventDates = useMemo(() => {
    const dates = new Set<string>()
    events.forEach((event) => {
      const date = new Date(event.date)
      dates.add(date.toDateString())
    })
    return dates
  }, [events])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (selectedDate && clickedDate.toDateString() === selectedDate.toDateString()) {
      onSelectDate(null)
    } else if (eventDates.has(clickedDate.toDateString())) {
      onSelectDate(clickedDate)
    }
  }

  return (
    <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 leading-normal">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-0.5">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-[0.1em]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const dateString = date.toDateString()
          const hasEvent = eventDates.has(dateString)
          const isSelected = selectedDate && dateString === selectedDate.toDateString()

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!hasEvent}
              className={`aspect-square rounded-lg text-[13px] font-normal transition-all ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : hasEvent
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "text-gray-300"
              } ${!hasEvent && "cursor-default"}`}
            >
              {day}
            </button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-[11px] font-normal text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            Has events
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-900" />
            Selected
          </span>
        </div>
      </div>
    </div>
  )
}

// Merged event type for combining Firestore and static events
interface MergedEvent {
  id: string
  title: string
  date: string
  endTime?: string
  location: string
  venue?: string
  address?: string
  description: string
  url?: string
  communityId: string
  communityName?: string
  communityLogo?: string
  communityLogos?: string[]
  slug?: string
  eventType?: 'in-person' | 'hybrid' | 'virtual'
  source: "firestore" | "static"
}

// Generate calendar URLs for different providers
function generateCalendarUrls(event: MergedEvent) {
  const startDate = new Date(event.date)
  const endDate = event.endTime 
    ? new Date(event.endTime) 
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours

  // Format for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  // Format for ICS (YYYYMMDDTHHMMSS)
  const formatForICS = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.description + (event.url ? `\n\nMore info: ${event.url}` : ''))}`

  // Generate ICS file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DEVSA//Community Calendar//EN
BEGIN:VEVENT
DTSTART:${formatForICS(startDate)}
DTEND:${formatForICS(endDate)}
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}${event.url ? `\\n\\nMore info: ${event.url}` : ''}
END:VEVENT
END:VCALENDAR`

  const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const icsUrl = URL.createObjectURL(icsBlob)

  return { googleUrl, icsUrl, icsContent }
}

export function CommunityEventsSection() {
  const [firestoreEvents, setFirestoreEvents] = useState<FirestoreEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [allCommunities, setAllCommunities] = useState<TechCommunity[]>([])
  
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for live "Happening Now" detection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Fetch events and communities from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, communitiesResponse] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/communities'),
        ])
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          setFirestoreEvents(data.events || [])
        }
        if (communitiesResponse.ok) {
          const data = await communitiesResponse.json()
          setAllCommunities(data.communities || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoadingEvents(false)
      }
    }
    fetchData()
  }, [])

  // All events come from Firestore API
  const allEvents: MergedEvent[] = useMemo(() => {
    return firestoreEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      endTime: event.endTime,
      location: event.location,
      venue: event.venue,
      address: event.address,
      description: event.description,
      url: event.url,
      communityId: event.communityId,
      communityName: event.communityName,
      communityLogo: event.communityLogo,
      communityLogos: event.communityLogos,
      slug: event.slug,
      eventType: event.eventType,
      source: "firestore" as const,
    }))
  }, [firestoreEvents])

  // Helper function to get event status: "upcoming" | "happening" | "ended"
  const getEventStatus = (event: MergedEvent): "upcoming" | "happening" | "ended" => {
    const startTime = new Date(event.date).getTime()
    // Default to 2 hours if no endTime provided
    const endTime = event.endTime 
      ? new Date(event.endTime).getTime()
      : startTime + (2 * 60 * 60 * 1000)
    const now = currentTime.getTime()
    
    if (now >= startTime && now < endTime) {
      return "happening"
    } else if (now >= endTime) {
      return "ended"
    }
    return "upcoming"
  }

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return allEvents
      .filter((event) => {
        // Filter out ended events (use endTime if available, otherwise 2 hours after start)
        const startTime = new Date(event.date).getTime()
        const endTime = event.endTime 
          ? new Date(event.endTime).getTime()
          : startTime + (2 * 60 * 60 * 1000) // Default 2 hour duration
        return currentTime.getTime() < endTime
      })
      .filter((event) => {
        if (!normalizedSearch) return true
        const haystack = `${event.title} ${event.description} ${event.location}`.toLowerCase()
        return haystack.includes(normalizedSearch)
      })
      .filter((event) => {
        if (!selectedDate) return true
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === selectedDate.toDateString()
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [allEvents, search, selectedDate, currentTime])

  // Get the appropriate link for the add event easter egg
  const getAddEventHref = () => {
    return "/signin"
  }

  return (
    <section className="relative bg-white py-16 sm:py-24" data-bg-type="light">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header - Left aligned */}
        <div className="mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                Community Calendar
              </p>

              {/* Easter egg plus button with inline Add Event */}
              <motion.button
                onClick={() => setShowAddEvent(!showAddEvent)}
                className="relative inline-flex items-center gap-2 group"
                whileTap={{ scale: 0.95 }}
                aria-label="Add event"
              >
                <motion.div
                  animate={{ rotate: showAddEvent ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-gray-300 group-hover:border-[#ef426f] transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-[#ef426f] transition-colors" strokeWidth={2} />
                </motion.div>
                
                {/* Animated "Add Event" text */}
                <AnimatePresence>
                  {showAddEvent && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <Link
                        href={getAddEventHref()}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#ef426f] hover:text-[#d93a60] transition-colors"
                      >
                        Add Event →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <h2 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Find Your Next Event.{" "}
              <span className="text-gray-600 font-light italic">Build Your</span>{" "}
              Network.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
              One calendar for every community. Stop hunting for links — DEVSA brings San Antonio&apos;s tech groups together in{" "}
              <strong className="font-semibold text-gray-900">one place</strong>.
            </p>

            <p className="text-base md:text-lg text-gray-500 leading-relaxed">
              Focus on{" "}
              <span className="font-medium text-gray-700">building</span>,{" "}
              <span className="font-medium text-gray-700">learning</span>, and{" "}
              <span className="font-medium text-gray-700">connecting</span>{" "}
              with the people shipping the future.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column: Search and Events */}
          <div className="space-y-6">
            {/* Search bar */}
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events by name, location, or topic..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all leading-[1.5]"
                />
              </div>

              {(search || selectedDate) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <CalendarIcon className="h-3 w-3 text-gray-500" />
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span className="ml-0.5 text-gray-400">×</span>
                    </button>
                  )}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[13px] font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      &quot;{search}&quot;
                      <span className="ml-0.5 text-gray-400">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Events list */}
            <div className="min-h-100 max-h-175 overflow-y-auto rounded-xl border border-gray-200 p-4 sm:p-5">
              {filteredEvents.length === 0 ? (
                <div className="flex h-full min-h-75 items-center justify-center">
                  <div className="text-center">
                    <p className="text-base font-normal text-gray-500">No events found</p>
                    <p className="mt-1 text-sm font-normal text-gray-400">Check back later for new events!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredEvents.map((event, index) => {
                    // Support comma-separated communityIds for collaborative events
                    const communityIds = (event.communityId || '').split(',').map(id => id.trim()).filter(Boolean)
                    const eventCommunities = communityIds.map(id => {
                      const c = allCommunities.find((c) => c.id === id)
                      return { id, name: c?.name || event.communityName || id, logo: c?.logo || '' }
                    })
                    // Fallback to communityName/Logo from API response if no communities found
                    if (eventCommunities.length === 0 && event.communityName) {
                      eventCommunities.push({ id: event.communityId, name: event.communityName, logo: event.communityLogo || '' })
                    }
                    const primaryLogo = eventCommunities[0]?.logo || event.communityLogo
                    const primaryName = eventCommunities[0]?.name || event.communityId
                    const isFirst = index === 0
                    const eventLink = event.slug 
                      ? `/events/${event.slug}`
                      : event.url
                    const eventStatus = getEventStatus(event)

                    return (
                      <motion.article
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group rounded-xl border p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${
                          eventStatus === "happening"
                            ? "border-green-300 bg-green-50/30 hover:border-green-400"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Date and badge row */}
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                          <time className="text-[13px] font-medium text-gray-500 uppercase tracking-[0.1em]">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              timeZone: "America/Chicago",
                            })}
                          </time>
                          {eventStatus === "happening" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Happening Now
                            </span>
                          ) : isFirst && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Next Up
                            </span>
                          )}
                          {event.eventType && event.eventType !== 'in-person' && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] leading-none ${
                              event.eventType === 'hybrid'
                                ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {event.eventType}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex gap-4">
                          {primaryLogo && (
                            <div className="relative hidden h-12 w-12 shrink-0 sm:block rounded-lg bg-gray-950 p-1.5">
                              <Image
                                src={primaryLogo}
                                alt={primaryName}
                                fill
                                className="object-contain p-1"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold leading-[1.3] text-gray-900 group-hover:text-gray-600 transition-colors">
                              {event.title}
                            </h3>
                            <p className="mt-1.5 text-[13px] font-normal text-gray-500 leading-[1.5]">
                              📍 {event.venue || event.location}
                            </p>
                            <p className="mt-2.5 text-sm font-light leading-[1.6] text-gray-500 line-clamp-2">
                              {stripMarkdown(event.description)}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {eventCommunities.map((ec) => (
                              <span key={ec.id} className="inline-flex items-center gap-1.5 text-[13px] font-normal text-gray-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                {ec.name}
                              </span>
                            ))}
                            {eventCommunities.length > 1 && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500">
                                Collab
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {/* Save to Calendar - inline buttons */}
                            <a
                              href={generateCalendarUrls(event).googleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300"
                              title="Add to Google Calendar"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            </a>
                            <button
                              onClick={() => {
                                const { icsContent } = generateCalendarUrls(event)
                                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `${event.slug || event.id}.ics`
                                a.click()
                                URL.revokeObjectURL(url)
                              }}
                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300"
                              title="Download .ics file (Apple/Outlook)"
                            >
                              <CalendarPlus className="h-4 w-4" />
                            </button>
                            {eventLink && (
                              <Link
                                href={eventLink}
                                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Calendar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <EventCalendar events={allEvents} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
