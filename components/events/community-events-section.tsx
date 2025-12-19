"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { Search, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { initialCommunityEvents, type CommunityEvent } from "@/data/events"
import { techCommunities } from "@/data/communities"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

function isAdminOrOrganizer(role: string | null | undefined) {
  if (!role) return false
  return ["admin", "organizer"].includes(role.toLowerCase())
}

function CommunityLogosBackground() {
  // Create a scattered pattern of community logos
  const logoPositions = useMemo(() => {
    return techCommunities.map((community, index) => {
      // Create a pseudo-random but deterministic pattern
      const row = Math.floor(index / 5)
      const col = index % 5
      const offsetX = (index * 37) % 20 - 10
      const offsetY = (index * 23) % 20 - 10
      const rotation = (index * 17) % 30 - 15
      const scale = 0.7 + (index % 4) * 0.15

      return {
        ...community,
        style: {
          left: `${col * 20 + offsetX + 2}%`,
          top: `${row * 25 + offsetY + 5}%`,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          opacity: 0.08 + (index % 3) * 0.03,
        },
      }
    })
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {logoPositions.map((logo) => (
        <div
          key={logo.id}
          className="absolute h-16 w-16 transition-opacity duration-500 md:h-20 md:w-20"
          style={logo.style}
        >
          <Image
            src={logo.logo}
            alt=""
            fill
            className="object-contain grayscale"
            sizes="80px"
          />
        </div>
      ))}
    </div>
  )
}

function EventCalendar({
  events,
  selectedDate,
  onSelectDate,
}: {
  events: CommunityEvent[]
  selectedDate: Date | null
  onSelectDate: (date: Date | null) => void
}) {
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
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg p-1 hover:bg-gray-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-1 hover:bg-gray-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-1">
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
              className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[#ef426f] text-white"
                  : hasEvent
                    ? "bg-[#ffe3ec] text-[#ef426f] hover:bg-[#ffc0d4]"
                    : "text-gray-600"
              } ${!hasEvent && "cursor-default"}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Scrolling logos strip component
function CommunityLogosStrip() {
  // Double the logos for seamless looping
  const logos = [...techCommunities, ...techCommunities]

  return (
    <div className="relative mb-8 overflow-hidden py-4">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-linear-to-r from-black to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-linear-to-l from-black to-transparent" />
      
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -50 * techCommunities.length] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {logos.map((community, index) => (
          <div
            key={`${community.id}-${index}`}
            className="relative h-12 w-12 shrink-0 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={community.logo}
              alt={community.name}
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function CommunityEventsSection() {
  const { role } = useAuth?.() || { role: null }
  const [events] = useState<CommunityEvent[]>(initialCommunityEvents)
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return events
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
  }, [events, search, selectedDate])

  // Suppress unused variable warning - used for admin features
  void isAdminOrOrganizer(role)

  return (
    <section className="relative bg-black py-12 sm:py-16">
      {/* Background with community logos as stickers */}
      <CommunityLogosBackground />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Header with scrolling logos */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Community Events</h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-gray-400">
            A shared calendar of meetups and gatherings from the tech communities across San Antonio.
          </p>
        </div>

        {/* Scrolling community logos */}
        <CommunityLogosStrip />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left column: Search and Events */}
          <div className="space-y-4">
            {/* Search bar */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>

              {(search || selectedDate) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ffe3ec] px-3 py-1 text-xs font-medium text-[#ef426f]"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span className="text-[#ef426f]">×</span>
                    </button>
                  )}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300"
                    >
                      &quot;{search}&quot;
                      <span className="text-gray-400">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Events list */}
            <div className="min-h-100 max-h-150 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              {filteredEvents.length === 0 ? (
                <div className="flex h-full min-h-75 items-center justify-center">
                  <p className="text-sm text-gray-400">No events found. Check back later for new events!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => {
                    const community = techCommunities.find((c) => c.id === event.communityTag)
                    const isFirst = index === 0

                    return (
                      <motion.article
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-sm transition-shadow hover:shadow-md hover:border-gray-700"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ef426f]" />
                            {isFirst ? "Next Up" : "Community Event"}
                          </div>
                          <span className="text-xs font-medium text-gray-400">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex gap-4">
                          {community && (
                            <div className="relative hidden h-12 w-12 shrink-0 sm:block">
                              <Image
                                src={community.logo}
                                alt={community.name}
                                fill
                                className="object-contain"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold leading-tight text-white">{event.title}</h3>
                            <p className="mt-1 text-sm font-medium text-gray-400">{event.location}</p>
                            <p className="mt-2 text-pretty text-sm leading-relaxed text-gray-500 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          {community && (
                            <span className="rounded-full bg-[#ffe3ec] px-3 py-1 text-xs font-semibold text-[#ef426f]">
                              {community.name}
                            </span>
                          )}
                          {event.url && (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white hover:text-gray-900 hover:border-white"
                            >
                              Learn More
                            </a>
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
            <EventCalendar events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>
      </div>
    </section>
  )
}
