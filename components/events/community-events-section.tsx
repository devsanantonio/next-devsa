"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { initialCommunityEvents, type CommunityEvent, type CommunityTag } from "@/data/events"
import { techCommunities } from "@/data/communities"
import { useAuth } from "@/lib/auth-context"

const communityTagOptions: { value: CommunityTag; label: string }[] = techCommunities.map((community) => ({
  value: community.id,
  label: community.name,
}))

function isAdminOrOrganizer(role: string | null | undefined) {
  if (!role) return false
  return ["admin", "organizer"].includes(role.toLowerCase())
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
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
                    : "text-gray-400"
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

export function CommunityEventsSection() {
  const { role } = useAuth?.() || { role: null }
  const [events, setEvents] = useState<CommunityEvent[]>(initialCommunityEvents)
  const [filter, setFilter] = useState<CommunityTag | "all">("all")
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return events
      .filter((event) => (filter === "all" ? true : event.communityTag === filter))
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
  }, [events, filter, search, selectedDate])

  const canEdit = isAdminOrOrganizer(role)

  function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canEdit) return

    const formData = new FormData(e.currentTarget)
    const title = String(formData.get("title") || "").trim()
    const date = String(formData.get("date") || "").trim()
    const location = String(formData.get("location") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const communityTag = (formData.get("communityTag") as CommunityTag) || "other"
    const url = String(formData.get("url") || "").trim()

    if (!title || !date) return

    const newEvent: CommunityEvent = {
      id: `manual-${Date.now()}`,
      type: "community",
      title,
      date: new Date(date).toISOString(),
      location: location || "San Antonio, TX",
      description,
      communityTag,
      source: "manual",
      url: url || undefined,
    }

    setEvents((prev) => [newEvent, ...prev])
    e.currentTarget.reset()
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Admin Event Editor</h3>
              <p className="text-sm text-gray-500">Only admins & organizers can update this calendar</p>
            </div>
            <form onSubmit={handleAddEvent} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">Event Title</label>
                <input
                  name="title"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
                <input
                  name="location"
                  placeholder="Geekdom, San Antonio, TX"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Community</label>
                <select
                  name="communityTag"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                >
                  {communityTagOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Event URL</label>
                <input
                  name="url"
                  placeholder="https://meetup.com/..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>
              <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
                >
                  Add Event
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
          {/* Left column: Search and filters */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Community Events</h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-gray-600">
                A shared calendar of meetups and gatherings from DEVSA partner communities across San Antonio.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#ef426f]" />
                    {filter === "all"
                      ? "All Communities"
                      : communityTagOptions.find((opt) => opt.value === filter)?.label}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform ${isTagDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isTagDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <button
                      onClick={() => {
                        setFilter("all")
                        setIsTagDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        filter === "all" ? "bg-[#ffe3ec] font-semibold text-[#ef426f]" : "text-gray-700"
                      }`}
                    >
                      All Communities
                    </button>
                    {communityTagOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value)
                          setIsTagDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          filter === option.value ? "bg-[#ffe3ec] font-semibold text-[#ef426f]" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(filter !== "all" || search || selectedDate) && (
                <div className="flex flex-wrap gap-2">
                  {filter !== "all" && (
                    <button
                      onClick={() => setFilter("all")}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ffe3ec] px-3 py-1 text-xs font-medium text-[#ef426f]"
                    >
                      {communityTagOptions.find((opt) => opt.value === filter)?.label}
                      <span className="text-[#ef426f]">×</span>
                    </button>
                  )}
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ffe3ec] px-3 py-1 text-xs font-medium text-[#ef426f]"
                    >
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span className="text-[#ef426f]">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center column: Events list */}
          <div className="min-h-[600px] max-h-[800px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
            {filteredEvents.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">No events found for this filter.</p>
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
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ef426f]" />
                          {isFirst ? "Next Up" : "Community Event"}
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold leading-tight text-gray-900">{event.title}</h3>
                      <p className="mt-1 text-sm font-medium text-gray-500">{event.location}</p>
                      <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-600 line-clamp-3">
                        {event.description}
                      </p>

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
                            className="inline-flex items-center justify-center rounded-lg border border-gray-900 px-4 py-2 text-xs font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
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

          <div className="hidden lg:block">
            <EventCalendar events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>
      </div>
    </section>
  )
}
