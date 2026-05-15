"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, ChevronLeft, ChevronRight, ChevronDown, CalendarIcon, Plus, CalendarPlus, Rss, Check, Copy, X, MapPin } from "lucide-react"
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

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-widest">
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

const FEED_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://devsa.community'}/api/events/feed`
const ICAL_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://devsa.community'}/api/events/calendar`
const FEED_SCHEMA_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://devsa.community'}/api/events/feed/schema`

function RssFeedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const embedCode = `<iframe src="https://devsa.community/events/embed" width="100%" height="600" style="border:none;border-radius:12px" title="DEVSA Community Events"></iframe>`

  const copyFeedUrl = useCallback(() => {
    navigator.clipboard.writeText(FEED_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const copyEmbedCode = useCallback(() => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopiedEmbed(true)
      setTimeout(() => setCopiedEmbed(false), 2000)
    })
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Rss className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-[13px] font-medium text-gray-500 uppercase tracking-widest leading-[1.3]">
                  RSS Feed
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 leading-[1.3]">
              Bring DEVSA events to your community
            </h3>
            <p className="mt-2 text-sm font-light text-gray-500 leading-[1.6]">
              RSS is a standard format that lets platforms automatically pull in new content. Copy the feed URL below and connect it to your Discord, Slack, website, or any tool that supports RSS — events show up automatically, no manual posting needed.
            </p>
            {/* Feed URL */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <code className="text-[13px] font-normal text-gray-500 truncate flex-1">/api/events/feed</code>
                <button
                  onClick={copyFeedUrl}
                  className="inline-flex items-center justify-center shrink-0 h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Copy feed URL"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <a
                href="/api/events/feed"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 whitespace-nowrap"
              >
                <Rss className="h-3.5 w-3.5" />
                View Feed
              </a>
            </div>

            {/* How to use it (RSS) */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-[13px] font-medium text-gray-900 leading-[1.3] mb-3">
                RSS Feed — connect to Discord, Slack &amp; more
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Discord</p>
                  <p className="mt-1 text-[12px] font-normal text-gray-500 leading-[1.6]">
                    Add the MonitoRSS bot to your server, create a feed with the URL above, and pick a channel. Events post automatically.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Slack</p>
                  <p className="mt-1 text-[12px] font-normal text-gray-500 leading-[1.6]">
                    Install the RSS app from the Slack App Directory, subscribe a channel to the feed URL, and set your check interval.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Website</p>
                  <p className="mt-1 text-[12px] font-normal text-gray-500 leading-[1.6]">
                    Embed our live calendar on your site with the iframe snippet below — no plugins needed. Works with any platform. <strong className="font-medium">Use the RSS feed for custom integrations.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Embed Calendar */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-[13px] font-medium text-gray-900 leading-[1.3] mb-2">
                Embed the calendar
              </p>
              <p className="text-[12px] font-normal text-gray-500 leading-[1.6] mb-3">
                Drop this snippet into your website to show a live calendar of community tech events happening in San Antonio. 
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <code className="text-[12px] font-normal text-gray-500 truncate flex-1">{`<iframe src=".../events/embed" ...>`}</code>
                  <button
                    onClick={copyEmbedCode}
                    className="inline-flex items-center justify-center shrink-0 h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Copy embed code"
                  >
                    {copiedEmbed ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <a
                  href="/events/embed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 whitespace-nowrap"
                >
                  Preview
                </a>
              </div>
            </div>

            {/* Developer reference */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-[11px] font-normal text-gray-400 leading-[1.6]">
                Building a custom integration?{' '}
                <a href={FEED_SCHEMA_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700">View feed field reference</a>
              </p>
            </div>

            {/* Footer */}
            <p className="mt-4 text-[11px] font-normal text-gray-400 leading-[1.6]">
              Powered by the DEVSA Community.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CalendarSubscribeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copiedIcal, setCopiedIcal] = useState(false)

  const copyIcalUrl = useCallback(() => {
    navigator.clipboard.writeText(ICAL_URL).then(() => {
      setCopiedIcal(true)
      setTimeout(() => setCopiedIcal(false), 2000)
    })
  }, [])

  // Direct subscribe URLs for each provider
  const webcalUrl = ICAL_URL.replace(/^https?:\/\//, 'webcal://')
  const googleSubscribeUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`
  const outlookSubscribeUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(ICAL_URL)}&name=${encodeURIComponent('DEVSA Community Events')}`

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <CalendarPlus className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-[13px] font-medium text-gray-500 uppercase tracking-widest leading-[1.3]">
                  Calendar Subscription
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 leading-[1.3]">
              Subscribe to the DEVSA calendar
            </h3>
            <p className="mt-2 text-sm font-light text-gray-500 leading-[1.6]">
              One click to subscribe — new events appear automatically in your calendar app, no manual downloads needed.
            </p>

            {/* One-click subscribe buttons */}
            <div className="mt-5 grid gap-3">
              <a
                href={googleSubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Google Calendar</p>
                  <p className="mt-0.5 text-[12px] font-normal text-gray-500 leading-[1.4]">
                    Opens Google Calendar and adds the subscription
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </a>

              <a
                href={webcalUrl}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="19" rx="3" stroke="#FF3B30" strokeWidth="1.5"/>
                    <path d="M2 8h20" stroke="#FF3B30" strokeWidth="1.5"/>
                    <path d="M7 1v4M17 1v4" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="6" y="11" width="3" height="3" rx="0.5" fill="#FF3B30"/>
                    <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="#FF3B30"/>
                    <rect x="15" y="11" width="3" height="3" rx="0.5" fill="#FF3B30"/>
                    <rect x="6" y="16" width="3" height="3" rx="0.5" fill="#FF3B30"/>
                    <rect x="10.5" y="16" width="3" height="3" rx="0.5" fill="#FF3B30"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Apple Calendar</p>
                  <p className="mt-0.5 text-[12px] font-normal text-gray-500 leading-[1.4]">
                    Opens Calendar app directly on Mac and iPhone
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </a>

              <a
                href={outlookSubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 01-.588.234h-8.592v-8.35L16.135 12l1.58-1.675V7.387h5.11c.23 0 .424.078.588.234.159.152.238.346.238.576zM16.135 12l-1.553 1.675v-3.35L16.135 12z"/>
                    <path fill="#0078D4" d="M17.715 5.062v2.325h-3.133V5.531a.469.469 0 01.14-.344.469.469 0 01.345-.14h2.648v.015zm0 5v7.613h5.11c.23 0 .424-.078.588-.234a.776.776 0 00.238-.576V7.387a.776.776 0 00-.238-.576.806.806 0 00-.588-.234h-5.11v3.485z"/>
                    <path fill="#0078D4" d="M8.97 4.125c1.588 0 2.895.46 3.921 1.382 1.027.921 1.54 2.108 1.54 3.56 0 1.469-.52 2.67-1.558 3.601-1.04.932-2.34 1.398-3.903 1.398-1.573 0-2.877-.462-3.912-1.388C4.022 11.753 3.504 10.555 3.504 9.068c0-1.462.515-2.652 1.544-3.571C6.078 4.578 7.387 4.125 8.97 4.125zm.088 2.058c-.88 0-1.595.303-2.148.91-.552.605-.828 1.378-.828 2.319 0 .956.273 1.737.82 2.342.545.605 1.263.908 2.156.908.9 0 1.623-.3 2.17-.898.546-.598.82-1.383.82-2.352 0-.955-.27-1.734-.812-2.335-.541-.596-1.265-.894-2.178-.894z"/>
                    <path fill="#0078D4" opacity=".5" d="M14.582 5.531v12.938a.469.469 0 01-.14.344.469.469 0 01-.345.14H1.148A.44.44 0 01.82 18.82a.494.494 0 01-.152-.362V5.531c0-.136.05-.252.152-.344a.44.44 0 01.328-.134h12.95a.469.469 0 01.344.14.469.469 0 01.14.344z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 leading-[1.3]">Outlook</p>
                  <p className="mt-0.5 text-[12px] font-normal text-gray-500 leading-[1.4]">
                    Opens Outlook web and adds the subscription
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </a>
            </div>

            {/* Manual URL fallback */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[12px] font-medium text-gray-500 mb-2 uppercase tracking-widest">
                Or copy the URL manually
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <code className="text-[13px] font-normal text-gray-500 truncate flex-1">/api/events/calendar</code>
                <button
                  onClick={copyIcalUrl}
                  className="inline-flex items-center justify-center shrink-0 h-7 w-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Copy calendar URL"
                >
                  {copiedIcal ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="mt-4 text-[11px] font-normal text-gray-400 leading-[1.6]">
              Powered by the DEVSA Community.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function CommunityEventsSection() {
  const [firestoreEvents, setFirestoreEvents] = useState<FirestoreEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [allCommunities, setAllCommunities] = useState<TechCommunity[]>([])
  
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showRssFeed, setShowRssFeed] = useState(false)
  const [showCalendarSubscribe, setShowCalendarSubscribe] = useState(false)
  const [showMobileCalendar, setShowMobileCalendar] = useState(false)
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

  return (
    <section className="relative bg-white py-16 sm:py-24" data-bg-type="light">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header - Left aligned */}
        <div className="mb-12">
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Community Calendar
            </p>

            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Find Your Next Event.{" "}
              <span className="text-gray-600 font-light italic">Build Your</span>{" "}
              Network.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-balance tracking-tight md:tracking-normal text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
              One calendar for every community. Stop hunting for links — DEVSA brings San Antonio&apos;s tech groups together in{" "}
              <strong className="font-semibold text-gray-900">one place</strong>.
            </p>

            <p className="text-base md:text-lg text-gray-500 leading-relaxed">
              Focus on{" "}
              <span className="font-medium text-gray-700">building</span>,{" "}
              <span className="font-medium text-gray-700">learning</span>, and{" "}
              <span className="font-medium text-gray-700">connecting</span>{" "}
              with the people shipping the future. Part of{" "}
              <span className="font-medium text-gray-700">Building Together</span>{" "}
              — DEVSA&apos;s 501(c)(3) platform.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowCalendarSubscribe(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Subscribe
              </button>
              <Link
                href="/coworking-space"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <MapPin className="h-3.5 w-3.5" />
                Coworking Space
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              Building an integration?{" "}
              <button
                onClick={() => setShowRssFeed(true)}
                className="inline-flex items-center gap-1.5 font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <Rss className="h-3 w-3" />
                Use the RSS feed
              </button>
            </p>
          </div>
        </div>

        {/* Mobile Calendar */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setShowMobileCalendar(!showMobileCalendar)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 w-full justify-center"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {showMobileCalendar ? 'Hide Calendar' : 'Show Calendar'}
            <motion.div animate={{ rotate: showMobileCalendar ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showMobileCalendar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <EventCalendar events={allEvents} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all leading-normal"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-normal text-gray-400">
                  {isLoadingEvents ? '...' : `${filteredEvents.length} upcoming event${filteredEvents.length !== 1 ? 's' : ''}`}
                </p>
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
            </div>

            {/* Events list */}
            <div className="min-h-100 max-h-175 overflow-y-auto rounded-xl border border-gray-200 p-4 sm:p-5">
              {isLoadingEvents ? (
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5 sm:p-6">
                      <div className="mb-3 flex items-center gap-2.5">
                        <div className="h-4 w-32 rounded bg-gray-100" />
                        {i === 0 && <div className="h-5 w-16 rounded-full bg-gray-100" />}
                      </div>
                      <div className="flex gap-4">
                        <div className="hidden sm:block h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
                        <div className="flex-1 space-y-2.5">
                          <div className="h-5 w-3/4 rounded bg-gray-100" />
                          <div className="h-4 w-1/2 rounded bg-gray-100" />
                          <div className="h-4 w-full rounded bg-gray-50" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <div className="flex justify-between">
                          <div className="h-4 w-24 rounded bg-gray-50" />
                          <div className="h-8 w-28 rounded-lg bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
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
                        {/* Date, time, and badge row */}
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                          <time className="text-[13px] font-medium text-gray-500 uppercase tracking-widest">
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
                          {eventStatus === "happening" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Happening Now
                            </span>
                          ) : isFirst && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              Next Up
                            </span>
                          )}
                          {event.eventType && event.eventType !== 'in-person' && (
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest leading-none ${
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
                            <p className="mt-1.5 text-[13px] font-normal text-gray-500 leading-normal">
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
                              <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gray-500">
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

      {/* RSS Feed Modal */}
      <RssFeedModal open={showRssFeed} onClose={() => setShowRssFeed(false)} />

      {/* Calendar Subscribe Modal */}
      <CalendarSubscribeModal open={showCalendarSubscribe} onClose={() => setShowCalendarSubscribe(false)} />
    </section>
  )
}
