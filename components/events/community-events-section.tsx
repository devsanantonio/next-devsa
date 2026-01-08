"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, ChevronLeft, ChevronRight, CalendarIcon, Plus } from "lucide-react"
import { initialCommunityEvents } from "@/data/events"
import { techCommunities } from "@/data/communities"
import Image from "next/image"
import Link from "next/link"

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
    <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">
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
              className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-[#ef426f] text-white shadow-lg shadow-[#ef426f]/30"
                  : hasEvent
                    ? "bg-[#ef426f]/10 text-[#ef426f] hover:bg-[#ef426f]/20 hover:scale-105"
                    : "text-slate-300"
              } ${!hasEvent && "cursor-default"}`}
            >
              {day}
            </button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef426f]/20" />
            Has events
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef426f]" />
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
  location: string
  description: string
  url?: string
  communityId: string
  slug?: string
  source: "firestore" | "static"
}

export function CommunityEventsSection() {
  const [firestoreEvents, setFirestoreEvents] = useState<FirestoreEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)

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

  // Merge Firestore events with static fallback events
  const allEvents: MergedEvent[] = useMemo(() => {
    const events: MergedEvent[] = []

    // Add Firestore events
    if (firestoreEvents.length > 0) {
      firestoreEvents.forEach((event) => {
        events.push({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          url: event.url,
          communityId: event.communityId,
          slug: event.slug,
          source: "firestore",
        })
      })
    }

    // Add static events if no Firestore events exist (fallback)
    if (firestoreEvents.length === 0 && !isLoadingEvents) {
      initialCommunityEvents.forEach((event) => {
        events.push({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          url: event.url,
          communityId: event.communityTag,
          slug: event.slug,
          source: "static",
        })
      })
    }

    return events
  }, [firestoreEvents, isLoadingEvents])

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    
    // Get current date in CST (America/Chicago handles CST/CDT automatically)
    const now = new Date()
    const cstFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const cstParts = cstFormatter.formatToParts(now)
    const cstYear = parseInt(cstParts.find(p => p.type === 'year')?.value || '0')
    const cstMonth = parseInt(cstParts.find(p => p.type === 'month')?.value || '0') - 1
    const cstDay = parseInt(cstParts.find(p => p.type === 'day')?.value || '0')
    const todayCST = new Date(cstYear, cstMonth, cstDay)
    todayCST.setHours(0, 0, 0, 0)

    return allEvents
      .filter((event) => {
        // Filter out past events (events before today in CST)
        const eventDate = new Date(event.date)
        const eventDateCST = new Date(
          eventDate.toLocaleString('en-US', { timeZone: 'America/Chicago' })
        )
        eventDateCST.setHours(0, 0, 0, 0)
        return eventDateCST >= todayCST
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
  }, [allEvents, search, selectedDate])

  // Get the appropriate link for the add event easter egg
  const getAddEventHref = () => {
    return "/signin"
  }

  return (
    <section className="relative bg-white py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header - Left aligned */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold tracking-tight text-slate-900 text-4xl lg:text-5xl leading-[1.1]">
              Community Calendar
            </h2>
            
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
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-slate-300 group-hover:border-[#ef426f] transition-colors"
              >
                <Plus className="h-5 w-5 text-slate-400 group-hover:text-[#ef426f] transition-colors" strokeWidth={2} />
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
                      className="inline-flex items-center gap-1 whitespace-nowrap text-base font-semibold text-[#ef426f] hover:text-[#fbbf24] transition-colors"
                    >
                      Add Event
                      <span className="">→</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <p className="mt-4 max-w-3xl font-normal text-slate-600 text-lg leading-8">
            Discover communities that align with your interests. DEVSA is the central hub where local groups collaborate, exchange resources, and build a more connected tech ecosystem.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column: Search and Events */}
          <div className="space-y-6">
            {/* Search bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events by name, location, or topic..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 transition-all"
                />
              </div>

              {(search || selectedDate) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ef426f]/10 border border-[#ef426f]/20 px-4 py-1.5 text-sm font-semibold text-[#ef426f] hover:bg-[#ef426f]/20 transition-colors"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span className="ml-1">×</span>
                    </button>
                  )}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      &quot;{search}&quot;
                      <span className="ml-1 text-slate-400">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Events list */}
            <div className="min-h-100 max-h-175 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
              {filteredEvents.length === 0 ? (
                <div className="flex h-full min-h-75 items-center justify-center">
                  <div className="text-center">
                    <p className="text-base font-medium text-slate-500">No events found</p>
                    <p className="mt-1 text-sm text-slate-400">Check back later for new events!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredEvents.map((event, index) => {
                    const community = techCommunities.find((c) => c.id === event.communityId)
                    const isFirst = index === 0
                    const eventLink = event.slug 
                      ? `/events/community/${event.slug}`
                      : event.url

                    return (
                      <motion.article
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300"
                      >
                        {/* Date and badge row */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <time className="text-sm font-bold text-[#ef426f] uppercase tracking-wide">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                          {isFirst && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ef426f] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Next Up
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex gap-4">
                          {community && (
                            <div className="relative hidden h-14 w-14 shrink-0 sm:block rounded-xl bg-slate-900 p-2 group-hover:bg-slate-950 transition-colors">
                              <Image
                                src={community.logo}
                                alt={community.name}
                                fill
                                className="object-contain p-1"
                                sizes="56px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-[#ef426f] transition-colors">
                              {event.title}
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              📍 {event.location}
                            </p>
                            <p className="mt-3 text-sm font-normal leading-6 text-slate-500 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                          {community && (
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: community.color || '#ef426f' }} />
                              {community.name}
                            </span>
                          )}
                          {eventLink && (
                            <Link
                              href={eventLink}
                              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#ef426f] hover:scale-105"
                            >
                              View Details →
                            </Link>
                          )}
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
