"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface EmbedEvent {
  id: string
  title: string
  slug: string
  date: string
  endTime?: string
  venue?: string
  location: string
  communityName?: string
  eventType?: string
}

export default function EmbedCalendarPage() {
  const [events, setEvents] = useState<EmbedEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((e) => {
        const startTime = new Date(e.date).getTime()
        const endTime = e.endTime ? new Date(e.endTime).getTime() : startTime + 2 * 60 * 60 * 1000
        return now.getTime() < endTime
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  const eventDates = useMemo(() => {
    const dates = new Set<string>()
    upcomingEvents.forEach((e) => dates.add(new Date(e.date).toDateString()))
    return dates
  }, [upcomingEvents])

  const eventsForDate = useMemo(() => {
    if (!selectedDate) return upcomingEvents.slice(0, 5)
    return upcomingEvents.filter(
      (e) => new Date(e.date).toDateString() === selectedDate.toDateString()
    )
  }, [upcomingEvents, selectedDate])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="mx-auto max-w-3xl p-4">
        {/* Branded header */}
        <div className="mb-5 flex items-center justify-between">
          <a
            href="/events"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5"
          >
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
              alt="DEVSA"
              className="h-7 w-7"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-[1.3]">
                Find Your People.
              </span>
              <span className="text-[11px] font-medium text-gray-400 leading-[1.3]">
                Build Your Future.
              </span>
            </div>
          </a>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#00b2a9]" />
            <div className="h-2 w-2 rounded-full bg-[#ef426f]" />
            <div className="h-2 w-2 rounded-full bg-[#ff8200]" />
          </div>
        </div>

        {/* Collapsible calendar */}
        <div className="mb-4">
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>
              {selectedDate
                ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Chicago" })
                : "Filter by date"}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showCalendar ? "rotate-180" : ""}`} />
          </button>

          {showCalendar && (
            <div className="mt-2 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 leading-[1.3]">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-widest">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="py-0.5">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const hasEvent = eventDates.has(date.toDateString())
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (!hasEvent) return
                        if (isSelected) {
                          setSelectedDate(null)
                        } else {
                          setSelectedDate(date)
                        }
                      }}
                      disabled={!hasEvent}
                      className={`aspect-square rounded-md text-[12px] font-medium transition-all ${
                        isSelected
                          ? "bg-[#ef426f] text-white"
                          : hasEvent
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "text-gray-300 cursor-default"
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Event list */}
        <div className="space-y-2.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5">
                <div className="h-3 w-24 rounded bg-gray-100 mb-2.5" />
                <div className="h-4 w-3/4 rounded bg-gray-100 mb-2" />
                <div className="h-3 w-1/2 rounded bg-gray-50" />
              </div>
            ))
          ) : eventsForDate.length === 0 ? (
            <p className="text-sm font-light text-gray-400 text-center py-6 leading-[1.6]">
              {selectedDate ? "No events on this date" : "No upcoming events"}
            </p>
          ) : (
            eventsForDate.map((event) => (
              <a
                key={event.id}
                href={`/events/${event.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300 hover:shadow-md"
              >
                <time className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-[1.3]">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "America/Chicago",
                  })}
                  {" · "}
                  {new Date(event.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/Chicago",
                  })}
                </time>
                <h4 className="mt-1.5 text-sm font-semibold text-gray-900 leading-[1.3] group-hover:text-[#ef426f] transition-colors">
                  {event.title}
                </h4>
                {(event.venue || event.location) && (
                  <p className="mt-1 text-[13px] font-light text-gray-500 leading-[1.6]">
                    {event.venue || event.location}
                  </p>
                )}
                {event.communityName && (
                  <p className="mt-0.5 text-[11px] font-medium text-gray-400 leading-[1.6]">
                    {event.communityName}
                  </p>
                )}
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <a
            href="/events"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] font-medium text-gray-400 hover:text-[#ef426f] transition-colors leading-[1.6]"
          >
            <img
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
              alt=""
              className="h-4 w-4 opacity-40"
            />
            Building Together
          </a>
          <a
            href="/events"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-gray-500 hover:text-[#ef426f] transition-colors leading-[1.3]"
          >
            View all events →
          </a>
        </div>
      </div>
    </div>
  )
}
