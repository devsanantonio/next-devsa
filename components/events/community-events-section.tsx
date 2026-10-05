"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, ChevronLeft, ChevronRight, ChevronDown, CalendarIcon, Plus, CalendarPlus, Rss, Check, Copy, X, MapPin, ArrowUpRight } from "lucide-react"
import type { TechCommunity } from "@/data/communities"
import Image from "next/image"
import Link from "next/link"
import { logoOnLight, logoOnDark } from "@/lib/logo-invert"
import { getEventBrand } from "@/lib/event-brands"
import { EventBrandLockup } from "@/components/events/event-brand-lockup"
import { StartupWeekBand, isFirstStartupWeekDay } from "@/components/events/startup-week-band"
import {
  buildCalendarLinks,
  dayKeyFromParts,
  downloadIcs,
  effectiveEndMs,
  formatDayHeading,
  formatWeekday,
  formatDayShort,
  formatTime,
  getEventStatus,
  localDayKey,
  relativeDayLabel,
} from "@/lib/event-display"

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
  partnerNames?: string
  partnerLogos?: string[]
  partners?: { id: string; name: string; logo: string }[]
  isOfficial?: boolean
  brand?: string
  detailsUrl?: string
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
  /**
   * Only events that have not ended.
   *
   * This used to receive every event, so days in the past were marked as
   * having events and stayed clickable — but the list below excludes ended
   * events, so clicking one filtered to nothing and reported "No events match
   * your filters". The picker was offering days it could not deliver.
   */
  events: Array<{ date: string }>
  /** A `localDayKey`, not a Date — see the note on `eventDays`. */
  selectedDay: string | null
  onSelectDay: (day: string | null) => void
}

function EventCalendar({
  events,
  selectedDay,
  onSelectDay,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  /**
   * Which days have events, keyed the way the list groups them.
   *
   * `toDateString()` before, which resolves in the reader's own timezone while
   * the list groups in San Antonio's. For anyone outside Central those two
   * disagreed: a 7pm Thursday event is Friday in London, so the dot sat on
   * Friday and clicking it filtered against a list that had filed the event
   * under Thursday. Same bug as the detail page's, one surface further out.
   */
  const eventDays = useMemo(() => {
    const days = new Set<string>()
    events.forEach((event) => days.add(localDayKey(event.date)))
    return days
  }, [events])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const key = dayKeyFromParts(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (selectedDay === key) onSelectDay(null)
    else if (eventDays.has(key)) onSelectDay(key)
  }

  return (
    // Sticky lives on the rail wrapper below, not here — this used to declare
    // it too, which did nothing (the outer element already sticks) and hid
    // where the offset actually comes from.
    <div className="rounded-xl border border-gray-200 bg-white p-5">
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
          const key = dayKeyFromParts(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          )
          const hasEvent = eventDays.has(key)
          const isSelected = selectedDay === key

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
  partnerNames?: string
  partnerLogos?: string[]
  partners?: { id: string; name: string; logo: string }[]
  isOfficial?: boolean
  brand?: string
  detailsUrl?: string
  slug?: string
  eventType?: 'in-person' | 'hybrid' | 'virtual'
  source: "firestore" | "static"
}

// Every date, status and calendar-link helper this list used to define
// itself now lives in lib/event-display.ts, shared with the detail page at
// /events/[slug]. Two copies of these semantics is what let the two
// surfaces disagree about whether an event had ended.

const FEED_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.devsa.community'}/api/events/feed`
const ICAL_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.devsa.community'}/api/events/calendar`
const FEED_SCHEMA_URL = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.devsa.community'}/api/events/feed/schema`

function RssFeedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const embedCode = `<iframe src="https://www.devsa.community/events/embed" width="100%" height="600" style="border:none;border-radius:12px" title="DEVSA Community Events"></iframe>`

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
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl max-h-[calc(100vh-4rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
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

/**
 * What this calendar can do that a list of links cannot.
 *
 * Three capabilities were already built and shipped here, and the site spoke
 * to none of them: an iCal subscription that lands every group's events in a
 * reader's own calendar app, organizer accounts that write to the calendar
 * directly, and an RSS feed plus an iframe embed that let anyone re-publish
 * the whole thing on their own site or pipe it into their own Discord.
 *
 * They were reachable only through a 13px button and a gray footnote, so the
 * two modals behind them — which are good, and cover Google, Apple, Outlook,
 * MonitoRSS, Slack and a field reference — were effectively unlisted.
 *
 * They are also the clearest proof of the thing /buildingtogether claims:
 * DEVSA does not run these events and does not own this calendar. The groups
 * publish it and anybody may take it. A band that says so belongs at the foot
 * of the list, after a reader has seen what is in it.
 *
 * Light, not dark. ConferencePortfolio opens on #0a0a0a immediately below
 * this, and two dark bands back to back is exactly the repeat that got the
 * homepage's conferences section rebuilt.
 *
 * The eyebrow is the page's own marketing idiom, not the mono one the four
 * conference routes use. The header above this already set the sans form on
 * /events, and a second idiom on one page is the drift the design-system
 * skill was written about.
 */
function OpenCalendarBand({
  onSubscribe,
  onFeed,
}: {
  onSubscribe: () => void
  onFeed: () => void
}) {
  const cards = [
    {
      key: "subscribe",
      icon: CalendarPlus,
      title: "In your own calendar",
      body: "Subscribe once and every group's events show up in Google, Apple or Outlook — new ones appear on their own, and change when a group changes them.",
      action: { label: "Subscribe", onClick: onSubscribe },
    },
    {
      key: "publish",
      icon: Plus,
      title: "Organizers publish it",
      body: "If you run a group here, you add your own events and they are live the moment you save. Nobody at DEVSA is in the middle of it, and nobody has to be asked.",
      action: { label: "Add your event", href: "/signin" },
    },
    {
      key: "republish",
      icon: Rss,
      title: "Take it with you",
      body: "An embed snippet puts the live calendar on your own website, and an RSS feed pipes it into your Discord or Slack. The whole city's calendar, on your page.",
      action: { label: "Feed and embed", onClick: onFeed },
    },
  ]

  return (
    <div className="page-shell mt-20 md:mt-28">
      <div className="border-t border-gray-200 pt-12 md:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
            The Calendar Is Open
          </p>
          <h2 className="mt-5 text-balance font-sans text-gray-900 leading-[1.0] text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.02em]">
            Yours to Subscribe,{" "}
            <span className="text-gray-600 font-light italic">Publish</span> and
            Embed.
          </h2>
          <p className="mt-5 text-lg md:text-xl font-light leading-[1.45] text-gray-600">
            These events are not DEVSA&apos;s. Neither is the feed — it is built
            to be taken, which is the whole point of keeping one.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-colors duration-200 hover:border-gray-300"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-600" aria-hidden />
                </div>
                <p className="mt-4 text-base font-semibold text-gray-900">
                  {card.title}
                </p>
                <p className="mt-2 flex-1 text-sm font-light leading-[1.65] text-gray-600">
                  {card.body}
                </p>
                {card.action.href ? (
                  <Link
                    href={card.action.href}
                    className="group/act mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-900"
                  >
                    {card.action.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/act:translate-x-0.5 group-hover/act:-translate-y-0.5" />
                  </Link>
                ) : (
                  <button
                    onClick={card.action.onClick}
                    className="group/act mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-900"
                  >
                    {card.action.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/act:translate-x-0.5 group-hover/act:-translate-y-0.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CommunityEventsSection({
  featured,
  communityCount,
}: {
  /**
   * Rendered on the server by app/events/page.tsx. Previously taken from this
   * component's own /api/communities fetch, which made the headline's
   * paragraph change wording after hydration — see the note on the page.
   */
  communityCount?: number
  /**
   * The featured-event band, rendered between this section's headline and its
   * list rather than above the whole page.
   *
   * A slot rather than an import, because what is featured rotates — it was
   * PySanAntonio, it is Startup + Tech Week — and the calendar should not have
   * to know which. The page decides; this decides where.
   */
  featured?: React.ReactNode
}) {
  const [firestoreEvents, setFirestoreEvents] = useState<FirestoreEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [allCommunities, setAllCommunities] = useState<TechCommunity[]>([])
  
  const [search, setSearch] = useState("")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
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
      partnerNames: event.partnerNames,
      partnerLogos: event.partnerLogos,
      partners: event.partners,
      isOfficial: event.isOfficial,
      brand: event.brand,
      detailsUrl: event.detailsUrl,
      slug: event.slug,
      eventType: event.eventType,
      source: "firestore" as const,
    }))
  }, [firestoreEvents])

  /**
   * Everything that has not ended yet, sorted.
   *
   * The one source both the month picker and the list are built from. They
   * used to derive separately — the picker from every event, the list from
   * upcoming ones — so the picker marked past days as selectable and clicking
   * one produced an empty list. Deriving both from here means the picker can
   * only ever offer a day the list can actually show.
   *
   * Deliberately not narrowed by `search`: the picker's job is "which days
   * have events", and letting a search term erase dots would take away the
   * one control that shows what else is on.
   */
  const upcomingEvents = useMemo(() => {
    // effectiveEndMs ignores a missing, invalid, or inverted end time, so a
    // future event with bad end data is never hidden.
    return allEvents
      .filter((event) => currentTime.getTime() < effectiveEndMs(event))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [allEvents, currentTime])

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return upcomingEvents
      .filter((event) => {
        if (!normalizedSearch) return true
        /* Who is hosting, which is the most likely thing anybody types.
        
           The haystack was title, description and location only — so on a site
           whose whole pitch is "find your group", searching "Alamo Python" or
           "ACM" found nothing unless those words happened to appear in an event
           title, while the placeholder promised to search by name. Thirty-seven
           hosts have run events through this calendar and none of them were
           searchable by name.
        
           Community names are resolved from allCommunities rather than read off
           the event, because event.communityName is only set when the API
           joined one; the ids are always there. Venue joins location for the
           same reason — "Geekdom" is a venue on some records and a location on
           others. */
        const hostNames = (event.communityId || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .map((id) => allCommunities.find((c) => c.id === id)?.name || "")
          .join(" ")
        const partnerNames =
          event.partnerNames ||
          (event.partners || []).map((pp) => pp.name).join(" ")
        const base = [
          event.title,
          event.description,
          event.location,
          event.venue,
          event.communityName,
          event.communityId,
          hostNames,
          partnerNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        /* Both forms, so "alamo python" matches the slug "alamo-python" and
           "defcongroup-sa" still matches itself. */
        const haystack = `${base} ${base.replace(/-/g, " ")}`
        return haystack.includes(normalizedSearch)
      })
      .filter((event) => !selectedDay || localDayKey(event.date) === selectedDay)
  }, [upcomingEvents, search, selectedDay, allCommunities])

  /**
   * The same events, bucketed into the days they fall on.
   *
   * This is what turns the list from a column of near-identical cards into
   * something with rhythm — the date becomes a heading you scan past rather
   * than a 13px label repeated on every card. `filteredEvents` is already
   * sorted, so a single pass keeps the days and the events inside them in
   * order without a second sort.
   */
  const eventsByDay = useMemo(() => {
    const days: Array<{ key: string; events: MergedEvent[] }> = []
    for (const event of filteredEvents) {
      const key = localDayKey(event.date)
      const last = days[days.length - 1]
      if (last && last.key === key) last.events.push(event)
      else days.push({ key, events: [event] })
    }
    return days
  }, [filteredEvents])

  const hasActiveFilters = Boolean(search || selectedDay)

  const clearFilters = useCallback(() => {
    setSearch("")
    setSelectedDay(null)
  }, [])

  return (
    // id + scroll-mt so the featured event above can jump straight here past a
    // full screen of promo, without the fixed navbar covering the heading.
    <section
      id="community-calendar"
      className="relative scroll-mt-20 bg-white pb-16 sm:pb-24"
      data-bg-type="light"
    >
      {/* A band, not a hero, and no photograph in it.

          There was one — a Startup + Tech Week session, scrimmed from the left
          — added to give /events the visual footing the homepage and
          /buildingtogether have. It stopped earning that the moment the
          featured event moved up beside the headline: the band already has a
          picture in it, the partner's, and a second image behind the type was
          two things competing in a space that is meant to get somebody to the
          calendar.

          Losing it also loses the ramp, the blur and the flat mobile tint that
          existed only to hold copy over it, which is three layers and a 128KB
          download for a page whose job is a list. On flat #0a0a0a every ratio
          here is the one measured on the section grounds: body 9.96:1, eyebrow
          6.27:1.

          The asset stays at /photos/events-hero.webp. It is a good frame and
          nothing else uses it; if a photograph is ever wanted back here, that
          is the one, and the scrim it needs is in this file's history. */}
      {/* Takes the viewport from lg.

          A sliver of the list showing under the band read as an accident
          rather than as an invitation to scroll, which is what a partial
          reveal always reads as unless it is unmistakably deliberate.

          This would be the wrong call for a band that was only a statement —
          on a page people open to find out what is on tonight, a screen of
          promo before the first event is a real cost, and that is the argument
          this band was built short to respect. What changed is what is in it:
          the headline, the verticals, Subscribe and the featured event itself.
          That is a screenful of content, so taking the screen is honest.

          A minimum, not a height. Where the content already exceeds the
          viewport — a laptop, a phone, any narrow window — it does nothing,
          and justify-center keeps the pair centered in whatever it gets. */}
      <div
        className="relative flex flex-col justify-center bg-[#0a0a0a] lg:min-h-dvh"
        data-bg-type="dark"
      >
        {/* Two columns from lg: the page's statement, and what is featured.

            These were two stacked full-width bands — a photo band about 480px
            tall and the featured event about 430 — so the page made two
            promotional statements, roughly 900px of them, before showing a
            single event. Each was defensible alone and together they delayed
            the thing people came for.

            Side by side it is one opening band instead of two, the featured
            event reads as part of the masthead rather than as a second
            interruption, and the calendar starts a screen earlier. */}
        <div className="page-shell relative grid items-center gap-10 py-16 md:py-20 lg:grid-cols-[1fr_minmax(0,0.9fr)] lg:gap-12 lg:py-20 xl:gap-16">
          <div>
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/55 uppercase tracking-[0.2em]">
              Community Calendar
            </p>

            {/* The page's h1. This section is the subject of /events, so the
                headline belongs here rather than on the featured-event promo
                above it, which rotates and is deliberately an h2.

                It read "Find Your Next Event. Build Your Network." That is the
                same construction as the home hero's "Find Your People. Build
                Your Future.", so a reader arriving on the home page's primary
                CTA got the same sentence shape twice, carrying less the second
                time. And "Build Your Network" promised a networking outcome —
                the vague-outcome register that came out of the metadata, out
                of /buildingtogether and out of the footer, because DEVSA's
                claim is the calendar and the room, not what happens to your
                career afterwards.

                The home page now says something specific twice: "this site is
                the one that stays current", and "if it is happening in San
                Antonio tech, it is here". This is the page where that is
                either true or false. The headline is the payoff. */}
            {/* Stops at 6xl now that it shares the band with the featured
                event. At 72px in a column this wide it wrapped to three lines;
                at 60px it breaks cleanly after "Every Group." — same reason
                PartnerCta's heading is capped. */}
            <h1 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em]">
              Every Group.{" "}
              <span className="text-white/55 font-light italic">One</span>{" "}
              Calendar.
            </h1>
          </div>

          {/* One paragraph, not two.

              The second used to read "Focus on building, learning, and
              connecting with the people shipping the future. Part of Building
              Together — DEVSA's 501(c)(3) platform." Its first sentence named
              three things the calendar does not do differently from any other
              calendar, and the whole block sat between a reader and the events
              they came for — on a section already below a full-viewport promo.
              The attribution was the only load-bearing part, so it moved into
              the line above it. */}
          {/* The verticals, on the page that has to rank for them.

              The site's title, description and keywords all lead with Python,
              Linux, .NET, AI and the rest, and the home hero names the same
              twelve. /events named none of them — it said "every community",
              which matches nothing anybody types into a search box. These are
              the same twelve, in the same order, and each is backed by a live
              group; the mapping is in components/audience-lanes.tsx.

              The count is read from Firestore rather than written here. A
              hardcoded one is how the footer came to publish nine of
              twenty-three groups and the OG card ten of fifteen partners. It
              renders only once the fetch lands, so the sentence has to read
              correctly without it — hence the fallback clause rather than a
              number that pops in from nowhere. */}
          <div className="space-y-5 max-w-3xl mt-6">
            <p className="text-balance tracking-tight md:tracking-normal text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              Python, Linux, .NET, AI, agents, game dev, UX, design, data,
              security, AWS, Google.{" "}
              <strong className="font-semibold text-white">
                {communityCount
                  ? `All ${communityCount} communities publish here`
                  : "San Antonio's tech communities publish here"}
              </strong>
              , and this is the page that stays current.
            </p>

            {/* Subscribing is the action this page exists to produce.

                It was a 13px button weighted exactly like "Add Event" beside
                it — and "Add Event" serves the twenty-odd people who organize,
                while this serves everybody else. Worse, the home page's claim
                for this site is that it is "the one that stays current", and
                subscribing is the mechanism that keeps that promise without
                the reader ever coming back. It is now the page's primary
                control, at the size the rest of the site gives a primary
                control, and it says what it does rather than naming a verb.

                The RSS footnote that sat under this row went to the band at
                the foot of the section, where the feed, the embed and
                organizer publishing are explained properly instead of as an
                aside nobody read. */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                onClick={() => setShowCalendarSubscribe(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                <CalendarPlus className="h-4 w-4" />
                Subscribe to the calendar
              </button>
              <Link
                href="/signin"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 underline underline-offset-4 decoration-white/30 transition-colors hover:text-white hover:decoration-white/60"
              >
                <Plus className="h-3.5 w-3.5" />
                Organizing something? Add your event
              </Link>
            </div>


          </div>
          </div>

          {/* The featured slot, in the band rather than below it. Still a slot
              — the calendar does not know what is in it, the page decides —
              and still after the headline in the reading order, just beside it
              rather than under. */}
          {featured && <div className="min-w-0">{featured}</div>}
        </div>
      </div>

      <div className="relative page-shell pt-12 sm:pt-16">

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
                  <EventCalendar events={upcomingEvents} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* minmax(0,1fr) rather than 1fr: a bare 1fr grid track floors at its
            content's min-content width, so one long unbroken string in a title
            could push the column wider than the grid and shove the rail off. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left column: Search and Events.
          
              `min-w-0` is what stops this column stretching the page on a
              phone. A grid item defaults to `min-width: auto`, meaning it
              refuses to shrink below its content's min-content width — so a
              single wide row anywhere in the list widens the column, the column
              widens the grid, and every card on the page renders wider than the
              viewport with its right-hand side cut off.
          
              The grid already guards against this above lg, where the track is
              declared `minmax(0,1fr)` rather than `1fr` for exactly this
              reason. Below lg there is no explicit track, so the guard has to
              sit on the item. */}
          <div className="min-w-0 space-y-6">
            {/* Search bar */}
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by event, group, venue or topic..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all leading-normal"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-normal text-gray-400">
                  {isLoadingEvents ? '...' : `${filteredEvents.length} upcoming event${filteredEvents.length !== 1 ? 's' : ''}`}
                </p>
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <CalendarIcon className="h-3 w-3 text-gray-500" />
                    {formatDayShort(selectedDay)}
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

            {/* Events list.

                No longer a scroll container. It used to be
                `min-h-100 max-h-175 overflow-y-auto`, which put a second
                scrollbar inside a scrolling page: trackpad momentum got
                captured and released at the boundary, browser find-in-page
                could only reach the rendered slice, there was no way to link
                to a position, and the visible list was capped at ~700px no
                matter how tall the display was — a 27" monitor showed the same
                three cards a laptop did. The usual reason to accept all that
                is keeping a sidebar in view, and the sticky rail already does
                that. So the list flows into the page and the page scrolls. */}
            {isLoadingEvents ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-4 w-40 rounded bg-gray-100" />
                        <div className="h-5 w-3/4 rounded bg-gray-100" />
                        <div className="h-4 w-1/2 rounded bg-gray-50" />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between">
                        <div className="h-8 w-32 rounded bg-gray-50" />
                        <div className="h-8 w-28 rounded-lg bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              /* An empty state with somewhere to go.

                 It used to say "No events found / Check back later for new
                 events!" and stop there — the one moment a visitor is most
                 likely to leave, offering them nothing. Which of the three
                 ways out leads depends on why the list is empty: if filters
                 are on, the likeliest fix is clearing them; if the calendar
                 is genuinely empty, the useful moves are subscribing so the
                 next event finds them, or adding one. */
              <div className="rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center">
                <p className="text-base font-medium text-gray-700">
                  {hasActiveFilters ? "No events match your filters" : "No upcoming events yet"}
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm font-light leading-[1.6] text-gray-500">
                  {hasActiveFilters
                    ? "Try a different date or search term — there may be events on other days."
                    : "New events are added by the communities themselves. Subscribe and the next one lands in your calendar automatically."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  {hasActiveFilters ? (
                    <>
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear filters
                      </button>
                      <button
                        onClick={() => setShowCalendarSubscribe(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Subscribe
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowCalendarSubscribe(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Subscribe
                      </button>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add your event
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* The spine.

                 One dashed line down the whole list with a dot at each date,
                 borrowed from Luma's calendar. A run of days was rendering as
                 disconnected blocks — heading, cards, gap, heading, cards —
                 and the line is what makes the same content read as one
                 continuous calendar instead. It costs two absolutely
                 positioned elements and no layout.

                 The line lives on this container rather than on each day, so
                 it runs through the gaps between them; the dots live on the
                 days. Its left-[7px] is the center of a 14px dot sitting at
                 each section's left-0. */
              <div className="relative space-y-8">
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px border-l border-dashed border-gray-200"
                />
                {eventsByDay.map((day) => {
                  const relative = relativeDayLabel(day.key, currentTime)
                  /* Introduces the week once, above the first of its days that
                     is actually in the filtered list. See startup-week-band. */
                  const opensStartupWeek = isFirstStartupWeekDay(
                    day.key,
                    eventsByDay.map((d) => d.key),
                  )

                  return (
                    <section
                      key={day.key}
                      aria-labelledby={`day-${day.key}`}
                      className="relative pl-8 sm:pl-10"
                    >
                      {/* The dot, on the spine. */}
                      <span
                        aria-hidden
                        className="absolute left-0 top-[5px] h-3.5 w-3.5 rounded-full border-2 border-white bg-gray-300 ring-1 ring-gray-200"
                      />
                      {opensStartupWeek && <StartupWeekBand />}
                      {/* The date, in two weights on one line.

                          It was "Tuesday, October 6" at 24px black, a pill, a
                          hairline rule and an event count — four elements and
                          roughly 370px of hard floor, which is what used to
                          size the whole calendar and push every card past the
                          right edge of a phone.

                          Luma's form instead: the relative word when there is
                          one and a short date otherwise, bold, with the weekday
                          beside it in a lighter weight. It leads with what
                          somebody scans for — "Tomorrow" before "Tuesday" —
                          and nothing in it can set a minimum width, because
                          both halves wrap.

                          The count and the rule are gone. The spine does the
                          separating the rule was doing, and the count per day
                          was a number nobody asked for; the total is already
                          above the list. */}
                      <h2
                        id={`day-${day.key}`}
                        className="flex flex-wrap items-baseline gap-x-2.5 text-lg font-bold tracking-[-0.01em] text-gray-900 sm:text-xl"
                      >
                        <span>{relative ?? formatDayShort(day.key)}</span>
                        <span className="text-base font-normal text-gray-400 sm:text-lg">
                          {formatWeekday(day.key)}
                        </span>
                        <span className="sr-only">{formatDayHeading(day.key)}</span>
                      </h2>

                      <div className="space-y-5">
                        {day.events.map((event, index) => {
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
                          /* With no community on the record, the lead partner
                             is the host — which is what a Startup Week
                             activation is. Its mark moves to the plate and it
                             drops out of the "with" row, so nothing appears
                             twice. */
                          const allPartners = event.partners || []
                          const brand = getEventBrand(event.brand)

                          /* Who is hosting, as one list of marks.

                             A collaboration is a collaboration whoever the
                             parties are, and this card used to model three
                             different shapes of the same fact. Two community
                             groups put one logo on the plate and named both in
                             the label. Two partners put the first on the plate
                             and the rest down in the "with" row. A group and a
                             partner put the group on the plate and the partner
                             in the row. In none of those did it look like two
                             organizations had done something together, which
                             is the one thing the card needed to show.

                             One list now, communities first because they are
                             the hosts when both are present, and the same
                             overlapping stack /events/[slug] uses for the same
                             fact. The single-mark case is simply this list with
                             one thing in it.

                             Branded activations are excluded on purpose. The
                             three Startup Week events put the week's bolt on
                             the plate and bill everyone — communities included
                             — underneath, which is what puts DEF CON under
                             Access Granted rather than beside it. */
                          const communityMarks = eventCommunities.filter((c) => c.logo)
                          const collabMarks = brand
                            ? []
                            : [...communityMarks, ...allPartners]
                          const isCollab = collabMarks.length > 1

                          /* Kept for the single-mark case only: a lone partner
                             standing in as host still needs a light plate and
                             logoOnLight, because partner artwork is drawn for
                             white grounds where community marks are not. */
                          const hostPartner =
                            !brand && communityMarks.length === 0
                              ? allPartners[0]
                              : undefined

                          const brandCoHosts = brand
                            ? [...communityMarks, ...allPartners].filter(
                                (o) => o.id !== "sastw",
                              )
                            : []
                          /* DEVSA convened it, so DEVSA is credited — but in
                             the row, not the stack. Convening is not co-hosting,
                             and this is the page whose whole argument is that
                             DEVSA does not run the groups. Everyone who *is*
                             co-hosting is in the stack above, so for a plain
                             card the row now holds DEVSA or nothing. */
                          const rowPartners = brand
                            ? event.isOfficial
                              ? [{ id: "devsa", name: "DEVSA", logo: "/branding/devsa-logo.svg" }, ...brandCoHosts]
                              : brandCoHosts
                            : event.isOfficial
                              ? [{ id: "devsa", name: "DEVSA", logo: "/branding/devsa-logo.svg" }]
                              : []
                          /* The bolt rather than the horizontal lockup: the
                             plate is a 56px square, and the lockup is about
                             5:1, so it drew eight pixels tall in it. The bolt
                             is the week's mark at a shape the slot can hold. */
                          const primaryLogo = brand
                            ? "/sastw/bolt.svg"
                            : collabMarks[0]?.logo || event.communityLogo
                          const primaryName = eventCommunities[0]?.name || event.communityId
                          /* The label names everyone the stack shows, in the
                             same order, so the two halves of "whose event is
                             this" agree. It used to name only the communities,
                             which meant a group-and-partner collaboration read
                             as the group's event with a logo it never explained
                             sitting underneath. `truncate` handles the long
                             ones; three names is the practical ceiling anyway. */
                          const hostLabel = brand
                            ? "SA Startup + Tech Week"
                            : collabMarks.length
                              ? collabMarks.map((m) => m.name).join(" + ")
                              : primaryName
                          /* One number for one question: how many
                             organizations are behind this. It used to be
                             assembled from two different branches depending on
                             whether a community was present, because the hosts
                             and the partners lived in different places. They
                             are one list now, so this is its length — and on a
                             branded card the week's own co-hosts, which is what
                             the row below bills. */
                          const collabCount = brand
                            ? brandCoHosts.length + 1
                            : collabMarks.length
                          /* detailsUrl wins outright when set, which is safe
                             precisely because it is never set by accident —
                             unlike `url`, which 20 events carry alongside a
                             slug for their Meetup and Luma listings. */
                          const eventLink = event.detailsUrl || (event.slug ? `/events/${event.slug}` : event.url)
                          const leavesSite = Boolean(event.detailsUrl) || (!event.slug && Boolean(event.url))
                          const eventStatus = getEventStatus(event, currentTime)
                          const isNextUp = day.key === eventsByDay[0]?.key && index === 0

                          /* Defined once, placed twice.

                             Below xl the marks sit beside the text, where they
                             are the card's right-hand anchor. At xl the actions
                             rail already anchors that side, so a second column
                             of marks there takes width from the text for
                             nothing — the `By` line was truncating on a laptop
                             to make room for logos the rail could hold for
                             free. So at xl they move into the rail, above the
                             primary action.

                             One element, two mount points, each hidden at the
                             other's breakpoint. They are aria-hidden in both:
                             the line under the title already names every
                             organization in them, so announcing the marks as
                             well would read the hosts out twice. */
                          /* The host marks, inline on the `By` line, at every
                             width.

                             They have been three things on this card: a 64px
                             plate on the left, a stack on the right where Luma
                             puts artwork, and a stack at the top of the actions
                             rail. All three were a column, and a column of two
                             logo plates runs out — it reached about as far as
                             the venue line and left white space down the rest
                             of the card, while costing the `By` line enough
                             width to truncate the second host's name.

                             Inline, they touch the names they belong to, add no
                             height, cost no width, and read the same on a phone
                             and a monitor. It is also what Luma does, and the
                             reason it works there is the reason it works here:
                             a host mark is an annotation on a name, not a
                             picture of an event.

                             Round rather than square: at 24px a rounded
                             rectangle reads as a clipped logo where a circle
                             reads as a mark, which is why avatar stacks are
                             circles everywhere. */
                          const marksInline = (isCollab
                            ? collabMarks.slice(0, 3)
                            : [{ id: primaryName, name: primaryName, logo: primaryLogo }]
                          ).map((m) => {
                            const isPartner = allPartners.some((pp) => pp.id === m.id)
                            return (
                              <span
                                key={m.id}
                                className={`relative inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full ring-2 ${
                                  isPartner ? "bg-white" : "bg-gray-950"
                                } ${brand ? "ring-[#0a0a0a]" : "ring-white"}`}
                              >
                                <Image
                                  src={m.logo || "/devsa-gradient.svg"}
                                  alt=""
                                  fill
                                  unoptimized
                                  className={`object-contain p-1 ${
                                    isPartner
                                      ? logoOnLight({ id: m.id, name: m.name, type: "partner" })
                                      : ""
                                  }`}
                                  sizes="24px"
                                />
                              </span>
                            )
                          })

                          return (
                            /* A plain article. These cards used to be
                               `motion.article` with `initial={{opacity: 0}}`
                               and `whileInView`, and that made the content's
                               visibility depend on an IntersectionObserver
                               callback firing.

                               When it does not fire, the cards are still in the
                               DOM, still occupying their full height, and
                               drawing nothing. Printing the calendar is the
                               case that reaches real people: correct date
                               headings above blank white gaps, every event
                               missing. It also renders the page unverifiable in
                               a headless browser, which is how this was found —
                               all eight articles sat at
                               `opacity: 0; transform: translateY(10px)` with no
                               flag able to shake them loose.

                               The stagger had already been cut back twice for
                               being animation cost on a list people scan. It is
                               not worth a mechanism that can leave the page
                               blank, so it is gone rather than repaired. The
                               hover lift stays — that one is a real affordance
                               and it degrades to nothing. */
                            <article
                              key={event.id}
                              className={`group relative overflow-hidden rounded-xl border p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${
                                brand
                                  ? "border-transparent"
                                  : eventStatus === "happening"
                                    ? "border-green-300 bg-green-50/30 hover:border-green-400"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                              style={brand ? { backgroundColor: brand.surface } : undefined}
                            >
                              {/* The schematic field, for the one brand whose
                                  artwork expects to sit in a space rather than
                                  on one. Masked to an ellipse — tiled to the
                                  edges a grid stops being a hint and becomes
                                  wallpaper. */}
                              {brand?.grid && (
                                <div
                                  aria-hidden
                                  className="pointer-events-none absolute inset-0"
                                  style={{
                                    backgroundImage: `linear-gradient(${brand.grid.line} 1px, transparent 1px), linear-gradient(90deg, ${brand.grid.line} 1px, transparent 1px)`,
                                    backgroundSize: "22px 22px",
                                    WebkitMaskImage: brand.grid.fade,
                                    maskImage: brand.grid.fade,
                                  }}
                                />
                              )}
                              {brand && (
                                <span
                                  aria-hidden
                                  className="pointer-events-none absolute inset-y-0 left-0 w-1"
                                  style={{ backgroundColor: brand.accent }}
                                />
                              )}
                              {/* Two columns from xl.

                                  The card runs to roughly 900px on a wide
                                  display and every piece of content sat in the
                                  left 60% of it: a short title, a venue, two
                                  clamped lines of description. The actions were
                                  a full-width footer under a rule, which put
                                  "Add to Google · .ics" at the far left and
                                  "View Details" at the far right with half a
                                  card of nothing between them. Tall cards,
                                  empty cards.

                                  The actions become a rail instead, so the
                                  width is spent and the card is shorter.

                                  xl rather than lg deliberately: the calendar
                                  rail appears at lg, which is where this column
                                  is narrowest — around 600px — and taking 224
                                  of those for a second column would squeeze the
                                  description harder than the empty space ever
                                  cost. Below xl the stacked footer is still the
                                  right shape. */}
                              <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-6">
                                {/* Text first, marks second.

                                    Luma anchors the right of every card with
                                    the event's own artwork. We will not have
                                    that — community artwork is inconsistent
                                    enough that curating it per event is the
                                    job of a branded card, the way Startup Week
                                    and Texas Linux Fest are handled — so the
                                    host marks take that position instead. Same
                                    composition, built from the asset we
                                    actually have, and it gives the text the
                                    full width of the card rather than starting
                                    it 80px in. */}
                                <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                                {/* The host mark, on every viewport.

                                    Two changes. It was `hidden sm:block`, so it
                                    vanished on phones — the one width where the
                                    host is hardest to establish, and likely most
                                    of the traffic for "what's on tonight". And
                                    it was padded twice, `p-1.5` on the plate plus
                                    `p-1` on the image inside it, which left a
                                    48px box drawing about 28px of actual
                                    artwork. One layer of padding now, on a
                                    56px plate, so the mark reads at roughly
                                    twice the size without the card growing to
                                    match. `sizes` follows the box — it said 48px
                                    while the box changed, which is how a logo
                                    ends up soft. And it is no longer
                                    conditional. Rendered only when a logo
                                    existed, a community without one produced a
                                    card whose text began 72px left of every
                                    other card, breaking the left rail the
                                    column is read down. The detail page already
                                    falls back to the DEVSA mark for exactly
                                    this; the list does the same, so the rail
                                    holds and the card still reads as belonging
                                    to somebody. */}
                                {/* The plate is dark by default and community
                                    marks are chosen against that. A partner
                                    hosting takes a light plate instead: partner
                                    artwork is drawn for white grounds, and SA
                                    Startup Week's lockup is near-black — on
                                    gray-950 it disappears entirely. */}
                                {/* One plate, or a stack when more than one
                                    community is hosting.

                                    The card showed a single mark however many
                                    groups were behind an event — the names were
                                    joined with " + " in the label but only the
                                    first group's logo ever appeared, so a
                                    three-way collaboration looked like one
                                    group's meetup with a long title.

                                    The stack is the treatment /events/[slug]
                                    already uses for the same fact: overlapping
                                    plates with a ring, which is also why it
                                    fits — three marks take about 90px rather
                                    than the 190 a spread row needs, on a column
                                    that is only about 240px wide on a phone.
                                    Same idea in both places, so a collaboration
                                    looks like one on the card and on its page.

                                    Capped at three. Past that the stack stops
                                    reading and starts overlapping into mush,
                                    and the label already names everyone. */}
                                <div className="min-w-0 flex-1">
                                  {/* Time and host on one line, above the title.

                                      The host used to sit in the footer under a
                                      divider while its logo sat up here, so the
                                      two halves of one fact — whose event is
                                      this — were split across the card with the
                                      description in between. They're a unit now.

                                      `tabular-nums` so a column of times aligns
                                      on the colon instead of shifting with the
                                      width of each digit. */}
                                  {/* Time and status, muted, above the title.

                                      It used to be bold and share a line with
                                      the host, which put two different kinds of
                                      fact at the same weight and left the title
                                      third in the reading order. Nobody scans a
                                      calendar by time — they scan it by what,
                                      having already chosen the day from the
                                      heading above. So the time steps back, the
                                      pills join it, and the title gets the
                                      line to itself. */}
                                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                                    <time
                                      dateTime={event.date}
                                      className={`text-[13px] font-medium tabular-nums ${brand ? "text-white/70" : "text-gray-500"}`}
                                      style={brand ? { color: brand.accent } : undefined}
                                    >
                                      {formatTime(event.date)}
                                    </time>
                                    {/* Hidden on a phone, where the host name
                                        wraps to its own line and leaves the
                                        separator dangling after the time. The
                                        gap and the weight difference carry the
                                        distinction at that width; from sm the
                                        pair fits on one line and the dot is
                                        worth having. */}
                                    {/* The Collab pill is gone.

                                        It existed because the card showed one
                                        mark however many groups were hosting,
                                        so the collaboration had to be stated.
                                        The stack on the right shows all of them
                                        now and the line under the title names
                                        them — a third assertion of the same
                                        fact, competing for the one row that
                                        also carries status, and the first thing
                                        to wrap on a phone. collabCount still
                                        drives the stack. */}
                                    {eventStatus === "happening" ? (
                                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                        Happening Now
                                      </span>
                                    ) : isNextUp && (
                                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                        Next Up
                                      </span>
                                    )}
                                    {event.eventType && event.eventType !== 'in-person' && (
                                      <span className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest leading-none text-gray-600">
                                        {event.eventType}
                                      </span>
                                    )}
                                  </div>

                                  {brand ? (
                                    <EventBrandLockup brand={brand} />
                                  ) : (
                                    <h3 className="mt-1.5 text-lg font-bold leading-[1.25] tracking-[-0.01em] text-gray-900 transition-colors group-hover:text-gray-600 sm:text-xl">
                                      {event.title}
                                    </h3>
                                  )}

                                  {/* MapPin, not 📍. The emoji was the only one
                                      in an otherwise all-Lucide system: it drew
                                      differently on every platform, ignored
                                      `currentColor`, and sat at its own optical
                                      weight beside the icons around it. */}
                                  {/* "By …", under the title, the way Luma
                                      bills a host. Names only: the marks for
                                      the same organizations are the anchor on
                                      the right of this card, and showing both
                                      would be the same fact twice. */}
                                  <p className={`mt-2 flex min-w-0 items-center gap-2 text-[13px] font-medium ${brand ? "text-white/70" : "text-gray-600"}`}>
                                    <span aria-hidden className="flex shrink-0 -space-x-1.5">
                                      {marksInline}
                                    </span>
                                    <span className="truncate">By {hostLabel}</span>
                                  </p>

                                  <p className={`mt-1.5 flex items-center gap-1.5 text-[13px] font-normal leading-normal ${brand ? "text-white/60" : "text-gray-500"}`}>
                                    <MapPin className={`h-3.5 w-3.5 shrink-0 ${brand ? "text-white/40" : "text-gray-400"}`} aria-hidden />
                                    <span className="truncate">{event.venue || event.location}</span>
                                  </p>

                                  {/* Capped measure. The column is free to grow
                                      to ~900px on a wide display, which is a
                                      long run for two clamped lines of 14px
                                      text. */}
                                  <p className={`mt-2.5 max-w-2xl text-sm font-light leading-[1.6] line-clamp-2 ${brand ? "text-white/65" : "text-gray-500"}`}>
                                    {stripMarkdown(event.description)}
                                  </p>

                                  {/* Co-hosting partners.
                                      
                                      The API has resolved `partnerLogos` for
                                      every event since co-hosting was added;
                                      nothing on the public site had ever read
                                      it, so a four-way activation looked
                                      identical to a single group's meetup.

                                      Each mark sits on its own white plate
                                      rather than straight on the card. Partner
                                      artwork is drawn for light backgrounds
                                      but the tints here vary by card state —
                                      white, green, pink — and a logo with a
                                      pale mark reads differently against each.
                                      A fixed plate makes the row look the same
                                      on all three. */}
                                  {rowPartners.length > 0 && (
                                    /* Fixed boxes, packed left.

                                       These were `flex-1` below sm, which is
                                       fine for three marks sharing a line and
                                       wrong for one: a single partner logo
                                       stretched to the full width of the
                                       content column and centered itself in it,
                                       so the same card looked tidy with three
                                       credits and random with one. That is the
                                       "logo floating in space" — it was never
                                       about the logo, it was about the box
                                       around it being elastic.

                                       Fixed width at every size instead, so a
                                       row of one, two or three reads the same
                                       way and wraps predictably when it has
                                       to. The label is inline again for the
                                       same reason: it only needed its own line
                                       when the boxes could not be relied on to
                                       be a known width. */
                                    <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                                      <span className={`shrink-0 text-[11px] font-medium uppercase tracking-widest ${brand ? "text-white/45" : "text-gray-400"}`}>
                                        With
                                      </span>
                                      {rowPartners.map((p) => (
                                        <span
                                          key={p.id}
                                          /* Height is the binding constraint,
                                             not width: a wordmark like Tech
                                             Bloc is comfortable in 80px, but a
                                             squarish mark is limited by the
                                             short side, and SA Startup Week's
                                             lockup is a bordered box with type
                                             inside it — widening would not move
                                             that type at all.

                                             No plate. A white box on an
                                             almost-white card drew an outline
                                             and spent width without separating
                                             anything, and three in a row read
                                             as a toolbar rather than a credit.
                                             The light marks are inverted by
                                             logoOnLight, not rescued by what is
                                             behind them. */
                                          className="relative inline-flex h-10 w-20 shrink-0 items-center justify-center sm:h-12 sm:w-24"
                                        >
                                          <Image
                                            src={p.logo}
                                            alt={p.name}
                                            fill
                                            unoptimized
                                            sizes="96px"
                                            /* DEVSA's mark is a filled black block
                                               where the others are open lettering, so
                                               at equal box size it read as twice their
                                               weight. Inset further to bring it into
                                               line.

                                               Which way a mark has to be flipped
                                               depends on what is behind it, and on a
                                               branded card that is near-black. Same
                                               list either way — logoOnDark is the
                                               mirror of logoOnLight, so a mark cannot
                                               be classified light for one surface and
                                               dark for the other.

                                               DEVSA is exempt from both. Its lockup is
                                               a dark plate with light content inside
                                               it, so it carries its own ground and
                                               reads on white and on black untouched.
                                               Flattened for a dark card it came out as
                                               a solid white rectangle — the plate
                                               inverted along with everything on it. */
                                            className={`object-contain ${
                                              p.id === "devsa" ? "p-2 sm:p-2.5" : "p-0.5 sm:p-1"
                                            } ${
                                              p.id === "devsa"
                                                ? ""
                                                : brand
                                                  ? logoOnDark({ id: p.id, name: p.name })
                                                  : logoOnLight({ id: p.id, name: p.name, type: "partner" })
                                            }`}
                                          />
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                </div>

                              {/* The actions. A footer below xl, a rail at xl
                                  and up.

                                  flex-col-reverse so the rail leads with "View
                                  Details" without moving it in the DOM, where
                                  it belongs after the quieter add-to-calendar
                                  controls — in column-reverse, justify-end
                                  packs toward the top and the children stack
                                  last-first, which is exactly the order wanted
                                  on screen and the wrong one to hard-code into
                                  the markup. */}
                              <div className={`relative flex flex-wrap items-center justify-between gap-x-3 gap-y-4 border-t pt-4 xl:mt-0 xl:w-56 xl:shrink-0 xl:flex-col-reverse xl:items-stretch xl:justify-end xl:gap-4 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6 ${brand ? "border-white/15" : "border-gray-100"}`}>
                                {/* Labeled, and visibly secondary.

                                    These were two unlabelled 36px icon squares
                                    — a Google glyph and a calendar glyph — that
                                    you had to hover to tell apart, sized and
                                    weighted to compete with the actual primary
                                    action beside them. Now they read as what
                                    they are: "Add to · Google · .ics", quiet
                                    text buttons under a shared label, with
                                    "View Details" left as the only filled
                                    control on the card. */}
                                <div className="flex flex-wrap items-center gap-1.5 xl:w-full">
                                  <span className={`mr-0.5 text-[12px] font-normal ${brand ? "text-white/45" : "text-gray-400"}`}>Add to</span>
                                  <a
                                    href={buildCalendarLinks(event).googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${brand ? "border-white/20 bg-white/5 text-white/75 hover:bg-white/10" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                                  >
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden>
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Google
                                  </a>
                                  <button
                                    onClick={() => downloadIcs(event)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${brand ? "border-white/20 bg-white/5 text-white/75 hover:bg-white/10" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                                    title="Download .ics for Apple Calendar or Outlook"
                                  >
                                    <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                                    .ics
                                  </button>
                                </div>
                                {eventLink && (
                                  <Link
                                    href={eventLink}
                                    {...(leavesSite ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-opacity sm:w-auto sm:py-2 xl:w-full xl:py-2.5 ${
                                      brand ? "hover:opacity-90" : "bg-gray-900 text-white hover:bg-gray-800"
                                    }`}
                                    style={brand ? { backgroundColor: brand.accent, color: brand.onAccent } : undefined}
                                  >
                                    View Details
                                    {leavesSite ? (
                                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                                    ) : (
                                      <span aria-hidden>&rarr;</span>
                                    )}
                                  </Link>
                                )}
                              </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right column: Calendar */}
          <div className="hidden lg:block">
            {/* top-20 clears the fixed navbar (~49px) with air to spare. It was
                top-6, which tucked the calendar under the bar as soon as it
                stuck — unnoticed while the list scrolled inside its own box and
                the page barely moved. Now that the list flows into the page,
                this rail actually travels, so the offset has to be right. */}
            <div className="sticky top-20">
              <EventCalendar events={upcomingEvents} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            </div>
          </div>
        </div>
      </div>

      <OpenCalendarBand
        onSubscribe={() => setShowCalendarSubscribe(true)}
        onFeed={() => setShowRssFeed(true)}
      />

      {/* RSS Feed Modal */}
      <RssFeedModal open={showRssFeed} onClose={() => setShowRssFeed(false)} />

      {/* Calendar Subscribe Modal */}
      <CalendarSubscribeModal open={showCalendarSubscribe} onClose={() => setShowCalendarSubscribe(false)} />
    </section>
  )
}
