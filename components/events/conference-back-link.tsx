"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * The way back from a conference page to the calendar.
 *
 * Every other detail page on this site already has one — /buildingtogether's
 * group and partner pages, the shop's product page, checkout — so the three
 * conference pages were the exception rather than the question.
 *
 * ## It is a link that sometimes behaves like Back
 *
 * Two behaviors are wanted and they conflict.
 *
 * Someone who scrolled the calendar, opened a conference, and wants to carry
 * on reading expects to land where they left off. Only `history.back()` does
 * that — the browser restores scroll position on a pop, and no amount of
 * pushing `/events` will, because that is a fresh navigation to the top of a
 * list.
 *
 * Someone who arrived cold — a shared link, a search result, the QR code at
 * the event — has no history to go back to. For them `history.back()` either
 * does nothing or walks them off the site entirely, which is the failure mode
 * of the bare `router.back()` button /buildingtogether uses.
 *
 * So: a real `<a href="/events">` that intercepts its own click only when the
 * reader has actually seen the calendar this session. Cold entries get an
 * ordinary navigation. It stays crawlable and middle-clickable, and it names
 * where it goes before it is pressed, which "Back" never does.
 *
 * ## Why a marker rather than document.referrer
 *
 * `document.referrer` is the obvious test and it does not work here. Moving
 * from /events to a conference page is a client-side navigation — no new
 * document — so the referrer stays whatever loaded the app originally, which
 * is usually a search engine or nothing at all. It reports the session's entry
 * point, not the previous screen.
 */
const FROM_EVENTS_KEY = "devsa:visited-events"

/**
 * Dropped on /events. Records that the calendar has been seen this session, so
 * a conference page knows whether going back has anywhere to land.
 *
 * Every read and write is wrapped: `sessionStorage` throws outright in some
 * privacy modes, and a back link is not worth an error boundary.
 */
export function EventsVisitMarker() {
  useEffect(() => {
    try {
      sessionStorage.setItem(FROM_EVENTS_KEY, "1")
    } catch {
      /* no storage — the link falls back to a plain navigation */
    }
  }, [])
  return null
}

export function ConferenceBackLink({ accent }: { accent: string }) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Leave modified clicks to the browser: new tab, new window, download.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

    try {
      const seenCalendar = sessionStorage.getItem(FROM_EVENTS_KEY) === "1"
      if (seenCalendar && window.history.length > 1) {
        e.preventDefault()
        router.back()
      }
    } catch {
      /* fall through to the href */
    }
  }

  return (
    /* pt clears the fixed navbar. This strip is the first thing on the page
       now, so it cannot borrow the hero's top padding the way the masthead
       used to — at pt-8 the link rendered underneath the nav bar. */
    <div className="page-shell pt-20 md:pt-22">
      <Link
        href="/events"
        onClick={handleClick}
        className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/45 transition-colors hover:text-white/80"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          style={{ color: accent }}
          aria-hidden="true"
        />
        Community Calendar
      </Link>
    </div>
  )
}
