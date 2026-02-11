"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type TechCommunity } from "@/data/communities"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, ArrowLeft, ExternalLink, Globe, Loader2, Check, Link2 } from "lucide-react"
import { useMagen } from "@/lib/hooks/use-magen"

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
  eventType?: 'in-person' | 'hybrid' | 'virtual'
  rsvpEnabled?: boolean
}

interface EventPageClientProps {
  slug: string
}

// DEVSA Discord - all community organizers are in this server
const DEVSA_DISCORD = "https://discord.gg/cvHHzThrEw"

// Simple markdown renderer for event descriptions
function renderMarkdown(text: string) {
  // Process the text line by line for proper markdown rendering
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let inList = false
  
  const processInlineMarkdown = (line: string, key: number): React.ReactNode => {
    // Process inline markdown: bold, italic, links
    const parts: React.ReactNode[] = []
    let remaining = line
    let partKey = 0
    
    // Match patterns: **bold**, *italic*, [text](url)
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g
    let lastIndex = 0
    let match
    
    while ((match = regex.exec(line)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      
      if (match[2]) {
        // Bold **text**
        parts.push(<strong key={`${key}-${partKey++}`} className="font-semibold text-slate-800">{match[2]}</strong>)
      } else if (match[3]) {
        // Italic *text*
        parts.push(<em key={`${key}-${partKey++}`} className="italic">{match[3]}</em>)
      } else if (match[4] && match[5]) {
        // Link [text](url)
        parts.push(
          <a 
            key={`${key}-${partKey++}`} 
            href={match[5]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#ef426f] hover:text-[#d63760] underline underline-offset-2 font-medium"
          >
            {match[4]}
          </a>
        )
      }
      
      lastIndex = match.index + match[0].length
      remaining = line.slice(lastIndex)
    }
    
    // Add remaining text
    if (remaining && lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }
    
    return parts.length > 0 ? parts : line
  }
  
  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="text-[15px] text-slate-600 leading-relaxed">
              {processInlineMarkdown(item, i)}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    // Check for list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      inList = true
      listItems.push(trimmedLine.slice(2))
    } else {
      // Flush any pending list
      if (inList) {
        flushList()
      }
      
      // Handle empty lines
      if (trimmedLine === '') {
        if (elements.length > 0) {
          elements.push(<br key={`br-${index}`} />)
        }
      } else {
        // Regular paragraph
        elements.push(
          <p key={`p-${index}`} className="text-[15px] text-slate-600 leading-[1.75] mb-3 last:mb-0">
            {processInlineMarkdown(trimmedLine, index)}
          </p>
        )
      }
    }
  })
  
  // Flush any remaining list
  flushList()
  
  return <div className="space-y-0">{elements}</div>
}

export function EventPageClient({ slug }: EventPageClientProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasHistory, setHasHistory] = useState(false)

  // Track whether the user navigated here from within the app
  useEffect(() => {
    setHasHistory(window.history.length > 1 && document.referrer.includes(window.location.origin))
  }, [])
  
  // RSVP form state
  const [rsvpForm, setRsvpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    joinNewsletter: false
  })
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(false)
  const [rsvpError, setRsvpError] = useState('')
  const [community, setCommunity] = useState<TechCommunity | null>(null)
  const { verify, verifyOnServer, isVerifying } = useMagen()

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
      
      setEvent(null)
    }
    
    fetchEvent()
  }, [slug])

  // Fetch community data from API (Firestore)
  useEffect(() => {
    if (!event) return
    
    const fetchCommunity = async () => {
      try {
        const response = await fetch('/api/communities')
        if (response.ok) {
          const data = await response.json()
          const communities = data.communities || []
          const foundCommunity = communities.find((c: TechCommunity) => c.id === event.communityId)
          
          if (foundCommunity) {
            setCommunity(foundCommunity)
          }
        }
      } catch (error) {
        console.error("Error fetching community:", error)
      }
    }
    
    fetchCommunity()
  }, [event])

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
            onClick={() => hasHistory ? router.back() : router.push('/events')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {hasHistory ? 'Go Back' : 'All Events'}
          </button>
        </div>
      </main>
    )
  }

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

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRsvpSubmitting(true)
    setRsvpError('')

    try {
      // Client-side MAGEN verification (log-only until SDK sends behavioral signals)
      const clientResult = await verify()
      console.log('[MAGEN] RSVP verification:', clientResult ? { verdict: clientResult.verdict, score: clientResult.score } : 'no session')

      // TODO: Enable blocking once MAGEN client SDK sends behavioral events
      // if (clientResult && clientResult.verdict !== 'verified') { ... }
      // if (!serverVerified) { ... }

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          communityId: event.communityId,
          firstName: rsvpForm.firstName,
          lastName: rsvpForm.lastName,
          email: rsvpForm.email,
          joinNewsletter: rsvpForm.joinNewsletter,
          magenSessionId: clientResult?.session_id || null,
          magenVerdict: clientResult?.verdict || null,
          magenScore: clientResult?.score || null,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setRsvpSuccess(true)
        setRsvpForm({ firstName: '', lastName: '', email: '', joinNewsletter: false })
      } else {
        setRsvpError(data.error || 'Failed to submit RSVP')
      }
    } catch {
      setRsvpError('Failed to submit RSVP. Please try again.')
    } finally {
      setRsvpSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section data-bg-type="light">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
          {/* Back button using router.back() */}
          <button
            onClick={() => hasHistory ? router.back() : router.push('/events')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {hasHistory ? 'Back' : 'All Events'}
          </button>

          {/* Event header */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Community banner with logo */}
            {community && (
              <div 
                className="p-6 sm:p-8 flex items-center gap-5 border-b border-slate-200"
              >
              <div className="relative h-16 w-16 shrink-0 rounded-xl bg-slate-900 p-2.5 shadow-sm">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Hosted by</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1 leading-snug">{community.name}</h2>
              </div>
            </div>
          )}

          {/* Event content */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Title with status badge */}
            <div className="flex flex-wrap items-start gap-3 mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">{event.title}</h1>
              {eventStatus === "happening" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shrink-0 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live Now
                </span>
              )}
              {eventStatus === "ended" && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0 mt-1">
                  Event Ended
                </span>
              )}
              {event.eventType && event.eventType !== 'in-person' && (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shrink-0 mt-1 leading-none ${
                  event.eventType === 'hybrid'
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-[#ef426f]/10 text-[#ef426f] border border-[#ef426f]/20'
                }`}>
                  {event.eventType}
                </span>
              )}
            </div>

            {/* Date and location */}
            <div className="grid grid-cols-1 gap-6 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 bg-white border border-slate-200">
                  <Calendar className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "America/Chicago",
                    })}
                  </p>
                  <p className="text-[15px] font-medium text-slate-600 mt-0.5 leading-relaxed">
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "America/Chicago",
                    })}
                    {event.endTime && (
                      <>
                        {" – "}
                        {new Date(event.endTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "America/Chicago",
                        })}
                      </>
                    )}
                    {" CST"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 bg-white border border-slate-200">
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">About this event</h3>
              <div className="prose prose-slate max-w-none">
                {renderMarkdown(event.description)}
              </div>
            </div>

            {/* RSVP Form */}
            {event.rsvpEnabled && eventStatus === "upcoming" && (
              <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">RSVP for this event</h3>
                {rsvpSuccess ? (
                  <div className="text-center py-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 mb-2">You&apos;re all set!</p>
                    <p className="text-sm text-slate-600">Thanks for RSVPing. We&apos;ll see you there!</p>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          value={rsvpForm.firstName}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ef426f] focus:border-transparent"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          required
                          value={rsvpForm.lastName}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ef426f] focus:border-transparent"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="rsvpEmail" className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="rsvpEmail"
                        required
                        value={rsvpForm.email}
                        onChange={(e) => setRsvpForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ef426f] focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="joinNewsletter"
                        checked={rsvpForm.joinNewsletter}
                        onChange={(e) => setRsvpForm(prev => ({ ...prev, joinNewsletter: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#ef426f] focus:ring-[#ef426f]"
                      />
                      <label htmlFor="joinNewsletter" className="text-sm text-slate-600">
                        Join the DEVSA mailing list for updates on local tech events and community news
                      </label>
                    </div>
                    {rsvpError && (
                      <p className="text-sm text-red-600">{rsvpError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={rsvpSubmitting || isVerifying}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rsvpSubmitting || isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isVerifying ? 'Verifying...' : 'Submitting...'}
                        </>
                      ) : (
                        'Submit RSVP'
                      )}
                    </button>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      Protected by Magen
                    </p>
                  </form>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-8 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#ef426f] hover:shadow-lg"
                  >
                    Register / RSVP
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                
                {/* Save to Calendar - inline buttons */}
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${(event.endTime ? new Date(event.endTime) : new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.description)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                  title="Add to Google Calendar"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                </a>
                <button
                  onClick={() => {
                    const startDate = new Date(event.date)
                    const endDate = event.endTime ? new Date(event.endTime) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
                    const formatForICS = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DEVSA//Community Calendar//EN\nBEGIN:VEVENT\nDTSTART:${formatForICS(startDate)}\nDTEND:${formatForICS(endDate)}\nSUMMARY:${event.title}\nLOCATION:${event.location}\nDESCRIPTION:${event.description.replace(/\n/g, '\\n')}${event.url ? `\\n\\nMore info: ${event.url}` : ''}\nEND:VEVENT\nEND:VCALENDAR`
                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${event.slug}.ics`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                  title="Download .ics file (Apple/Outlook)"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">.ics</span>
                </button>
              </div>
              
              {/* Share buttons */}
              <div className="flex items-center gap-2 sm:ml-auto">
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
            <div className="flex items-center gap-4 mb-5">
              <div className="relative h-12 w-12 shrink-0 rounded-lg bg-slate-900 p-2 shadow-sm">
                <Image
                  src={community.logo}
                  alt={community.name}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">About {community.name}</h3>
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed mb-6">{community.description}</p>
            
            {/* Community Links */}
            <div className="flex flex-wrap gap-2">
              {community.website && (
                <a
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {community.meetup && (
                <a
                  href={community.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.98.555a.518.518 0 00-.105.011.53.53 0 10.222 1.04.533.533 0 00.409-.633.531.531 0 00-.526-.418zm6.455.638a.984.984 0 00-.514.143.99.99 0 101.02 1.699.99.99 0 00.34-1.36.992.992 0 00-.846-.482zm-3.03 2.236a5.029 5.029 0 00-4.668 3.248 3.33 3.33 0 00-1.46.551 3.374 3.374 0 00-.94 4.562 3.634 3.634 0 00-.605 4.649 3.603 3.603 0 002.465 1.597c.018.732.238 1.466.686 2.114a3.9 3.9 0 005.423.992c.068-.047.12-.106.184-.157.987.881 2.47 1.026 3.607.24a2.91 2.91 0 001.162-1.69 4.238 4.238 0 002.584-.739 4.274 4.274 0 001.19-5.789 2.466 2.466 0 00.433-3.308 2.448 2.448 0 00-1.316-.934 4.436 4.436 0 00-.776-2.873 4.467 4.467 0 00-5.195-1.656 5.106 5.106 0 00-2.773-.807zm-5.603.817a.759.759 0 00-.423.135.758.758 0 10.863 1.248.757.757 0 00.193-1.055.758.758 0 00-.633-.328zm15.994 2.37a.842.842 0 00-.47.151.845.845 0 101.175.215.845.845 0 00-.705-.365zm-8.15 1.028c.063 0 .124.005.182.014a.901.901 0 01.45.187c.169.134.273.241.432.393.24.227.414.089.534.02.208-.122.369-.219.984-.208.633.011 1.363.237 1.514 1.317.168 1.199-1.966 4.289-1.817 5.722.106 1.01 1.815.299 1.96 1.22.186 1.198-2.136.753-2.667.493-.832-.408-1.337-1.34-1.12-2.26.16-.688 1.7-3.498 1.757-3.93.059-.44-.177-.476-.324-.484-.19-.01-.34.081-.526.362-.169.255-2.082 4.085-2.248 4.398-.296.56-.67.694-1.044.674-.548-.029-.798-.32-.72-.848.047-.31 1.26-3.049 1.323-3.476.039-.265-.013-.546-.275-.68-.263-.135-.572.07-.664.227-.128.215-1.848 4.706-2.032 5.038-.316.576-.65.76-1.152.784-1.186.056-2.065-.92-1.678-2.116.173-.532 1.316-4.571 1.895-5.599.389-.69 1.468-1.216 2.217-.892.387.167.925.437 1.084.507.366.163.759-.277.913-.412.155-.134.302-.276.49-.357.142-.06.343-.095.532-.094zm10.88 2.057a.468.468 0 00-.093.011.467.467 0 00-.36.555.47.47 0 00.557.36.47.47 0 00.36-.557.47.47 0 00-.464-.37zm-22.518.81a.997.997 0 00-.832.434 1 1 0 101.39-.258 1 1 0 00-.558-.176zm21.294 2.094a.635.635 0 00-.127.013.627.627 0 00-.48.746.628.628 0 00.746.483.628.628 0 00.482-.746.63.63 0 00-.621-.496zm-18.24 6.097a.453.453 0 00-.092.012.464.464 0 10.195.908.464.464 0 00.356-.553.465.465 0 00-.459-.367zm13.675 1.55a1.044 1.044 0 00-.583.187 1.047 1.047 0 101.456.265 1.044 1.044 0 00-.873-.451zM11.4 22.154a.643.643 0 00-.36.115.646.646 0 00-.164.899.646.646 0 00.899.164.646.646 0 00.164-.898.646.646 0 00-.54-.28z" />
                  </svg>
                  Meetup
                </a>
              )}
              {community.luma && (
                <a
                  href={community.luma}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Calendar className="h-4 w-4" />
                  Lu.ma
                </a>
              )}
              {community.linkedin && (
                <a
                  href={community.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {community.twitter && (
                <a
                  href={community.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900 hover:text-white hover:border-slate-900"
                >
                  <XIcon className="h-4 w-4" />
                  X / Twitter
                </a>
              )}
              {community.instagram && (
                <a
                  href={community.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-linear-to-r hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:text-white hover:border-transparent"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                  Instagram
                </a>
              )}
              {community.youtube && (
                <a
                  href={community.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              )}
              {community.twitch && (
                <a
                  href={community.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#9146FF] hover:text-white hover:border-[#9146FF]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                  </svg>
                  Twitch
                </a>
              )}
              {community.facebook && (
                <a
                  href={community.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              )}
              {community.github && (
                <a
                  href={community.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900 hover:text-white hover:border-slate-900"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  GitHub
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
              </a>
            </div>
          </div>
        )}
        </div>
      </section>
    </main>
  )
}
