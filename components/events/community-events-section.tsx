"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { Search, ChevronLeft, ChevronRight, CalendarIcon, Plus } from "lucide-react"
import { initialCommunityEvents } from "@/data/events"
import { techCommunities } from "@/data/communities"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useConvexAuth } from "convex/react"
import Image from "next/image"
import Link from "next/link"

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
    <div className="sticky top-6 rounded-2xl border border-gray-800 bg-gray-900/80 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 hover:bg-gray-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-2 hover:bg-gray-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
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
                    ? "bg-[#ef426f]/20 text-[#ef426f] hover:bg-[#ef426f]/30 hover:scale-105"
                    : "text-gray-600"
              } ${!hasEvent && "cursor-default"}`}
            >
              {day}
            </button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
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

// Merged event type for combining Convex and static events
interface MergedEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  url?: string
  communityId: string
  slug?: string
  source: "convex" | "static"
}

export function CommunityEventsSection() {
  const { isAuthenticated } = useConvexAuth()
  const convexEvents = useQuery(api.events.listUpcomingEvents)
  const currentUser = useQuery(api.users.getCurrentUser)
  
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Merge Convex events with static fallback events
  const allEvents: MergedEvent[] = useMemo(() => {
    const events: MergedEvent[] = []

    // Add Convex events
    if (convexEvents) {
      convexEvents.forEach((event) => {
        events.push({
          id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          url: event.url,
          communityId: event.communityId,
          slug: event.slug,
          source: "convex",
        })
      })
    }

    // Add static events if no Convex events exist (fallback)
    if (!convexEvents || convexEvents.length === 0) {
      initialCommunityEvents.forEach((event) => {
        events.push({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          url: event.url,
          communityId: event.communityTag,
          source: "static",
        })
      })
    }

    return events
  }, [convexEvents])

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return allEvents
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

  const canCreateEvents = currentUser?.role === "organizer" || currentUser?.role === "admin"

  // Determine button behavior based on auth state
  const getAddEventButton = () => {
    if (!isAuthenticated) {
      // Not logged in - redirect to sign in
      return (
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Link>
      )
    }

    if (canCreateEvents) {
      // Logged in as organizer/admin - go to create page
      return (
        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ef426f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63760]"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Link>
      )
    }

    // Logged in but not an organizer - show request access
    return (
      <button
        onClick={() => alert("To add events, please contact us at community@devsa.community to become a community organizer.")}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
        Add Event
      </button>
    )
  }

  return (
    <section className="relative bg-black py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header - Left aligned */}
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
            Community Calendar
          </h2>
          <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-gray-400 sm:text-lg sm:leading-8">
            A shared calendar of meetups and gatherings from tech communities across San Antonio. 
            Find your next event, connect with like-minded builders, and grow your network.
          </p>
          <div className="mt-6">
            {getAddEventButton()}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column: Search and Events */}
          <div className="space-y-6">
            {/* Search bar */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events by name, location, or topic..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/80 py-3 pl-12 pr-4 text-base font-medium text-white placeholder:text-gray-500 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 transition-all"
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
                      className="inline-flex items-center gap-2 rounded-full bg-gray-800 border border-gray-700 px-4 py-1.5 text-sm font-semibold text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      &quot;{search}&quot;
                      <span className="ml-1 text-gray-500">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Events list */}
            <div className="min-h-100 max-h-175 overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900/30 p-4 sm:p-6">
              {filteredEvents.length === 0 ? (
                <div className="flex h-full min-h-75 items-center justify-center">
                  <div className="text-center">
                    <p className="text-base font-medium text-gray-400">No events found</p>
                    <p className="mt-1 text-sm text-gray-500">Check back later for new events!</p>
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
                        className="group rounded-2xl border border-gray-800 bg-gray-900/80 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-700 hover:bg-gray-900"
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
                            <div className="relative hidden h-14 w-14 shrink-0 sm:block rounded-xl bg-gray-800/50 p-2 group-hover:bg-gray-800 transition-colors">
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
                            <h3 className="text-xl font-bold leading-tight text-white group-hover:text-[#ef426f] transition-colors">
                              {event.title}
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-gray-400">
                              📍 {event.location}
                            </p>
                            <p className="mt-3 text-sm font-normal leading-6 text-gray-500 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
                          {community && (
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: community.color || '#ef426f' }} />
                              {community.name}
                            </span>
                          )}
                          {eventLink && (
                            <Link
                              href={eventLink}
                              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-all hover:bg-[#ef426f] hover:text-white hover:scale-105"
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
