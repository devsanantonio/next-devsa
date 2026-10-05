"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Partner } from "@/lib/partners"
import { logoOnLight, logoSrcOnLight } from "@/lib/logo-invert"
import { ArrowLeft, ExternalLink, Globe, MapPin } from "lucide-react"
import { motion } from "motion/react"

interface PartnerPageClientProps {
  /**
   * Resolved on the server and handed down, rather than looked up here.
   *
   * This used to find the partner in a module-scope array, which is why the
   * page kept rendering one that had been deleted in the admin. The server
   * already reads Firestore to build the metadata, so passing the record costs
   * nothing and removes the second source entirely.
   */
  partner: Partner
}

interface PartnerEvent {
  id: string
  title: string
  slug?: string
  date: string
  location?: string
  venue?: string
  url?: string
  communityId?: string
  partners?: { id: string; name: string; logo: string }[]
}

export function PartnerPageClient({ partner }: PartnerPageClientProps) {
  const router = useRouter()
  const [events, setEvents] = useState<PartnerEvent[]>([])
  /* Read once on mount rather than during render. Date.now() in a useMemo is
     an impure call: it makes the split between upcoming and past depend on
     whenever React happens to re-run the memo, and the lint rule that catches
     it is the same one guarding the rest of this app. */
  const [now, setNow] = useState<number | null>(null)

  /* The partner's own record on this calendar.
  
     The page was a logo, a description and a link — nothing a partner could
     point at, on the page this site sends people to when it asks a company to
     back it. The groups' pages have carried their history all along; the
     partners' never have.
  
     Matched two ways, because a partner reaches an event by two routes: tagged
     in `partners`, or standing as the host when no community is on the record
     — which is the same `hostPartner` case the calendar card handles. */
  useEffect(() => {
    let cancelled = false
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => {
        /* Both set from the same async callback. Reading the clock in the
           effect body is a synchronous setState during an effect, which is
           the other half of the same lint rule; here it lands with the data
           it is used to partition, which is also when it is actually
           needed. */
        if (cancelled) return
        setEvents(d.events || [])
        setNow(Date.now())
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const { upcoming, past } = useMemo(() => {
    if (now === null) return { upcoming: [], past: [] }
    const mine = events.filter(
      (e) =>
        (e.partners || []).some((pp) => pp.id === partner.id) ||
        (e.communityId || "")
          .split(",")
          .map((i) => i.trim())
          .includes(partner.id),
    )
    return {
      upcoming: mine
        .filter((e) => new Date(e.date).getTime() >= now)
        .sort((a, b) => +new Date(a.date) - +new Date(b.date)),
      past: mine
        .filter((e) => new Date(e.date).getTime() < now)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    }
  }, [events, partner.id, now])

  const PAST_PREVIEW = 6
  const [showAll, setShowAll] = useState(false)
  const visiblePast = showAll ? past : past.slice(0, PAST_PREVIEW)
  const firstEver = past.length ? new Date(past[past.length - 1].date) : null

  // No not-found branch. The server resolves the partner before rendering
  // this and calls notFound() when there isn't one, so a missing partner
  // never reaches the client — and a 404 shell rendered inside a 200 page
  // was the wrong answer anyway.

  return (
    <main className="min-h-screen bg-slate-50">
      <section data-bg-type="light">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
          {/* Back button using router.back() */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Partner header */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            {/* Partner banner with logo.
                No tinted ground. This carried `bg-[#ef426f]/5`, a pink wash the
                community and event pages have no equivalent of — so the three
                detail pages, which are otherwise the same card on the same
                gray, opened differently depending on which kind of record you
                had landed on. The rose still marks the "Partner" eyebrow and
                the link below, which is enough for it to read as the accent
                without coloring a whole panel. */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100">
              {/* No plate. This sat on a fixed black tile, which assumed every
                  logo was light artwork — so a black wordmark uploaded from the
                  admin landed black-on-black and disappeared.
                  
                  The card is already white and so is the page, so the tile was
                  never doing anything a background needed to do; it was only
                  creating a second surface for the artwork to disagree with.
                  Light marks get the same `invert` the logo walls use, which
                  means one rule covers every light surface on the site. */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0">
                <Image
                  src={logoSrcOnLight(partner, partner.logo)}
                  alt={partner.name}
                  fill
                  className={`object-contain ${logoOnLight(partner)}`}
                  sizes="112px"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-sm font-medium text-[#ef426f] tracking-wide uppercase">Partner</span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">{partner.name}</h1>
              </div>
            </div>

            {/* Partner content */}
            <div className="p-6 sm:p-8">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">About</h2>
                <p className="text-base text-slate-600 whitespace-pre-wrap leading-7">{partner.description}</p>
              </div>

              {/* What they have backed.

                  Rendered only when there is something to render. Partner
                  attribution on events is thin — eight of fifteen partners
                  appear on any event at all, and several on exactly one — so
                  an empty or near-empty section would read as "this partner
                  does nothing" when what it actually means is that the event
                  was created without tagging them. Silence is the honest
                  default until the admin captures it; a count of zero is not.

                  The fix for the thinness is upstream, in the event form, not
                  here. */}
              {(upcoming.length > 0 || past.length > 0) && (
                <div className="mb-8 border-t border-slate-100 pt-8">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    On the Calendar
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {upcoming.length + past.length} event
                    {upcoming.length + past.length !== 1 ? "s" : ""} with{" "}
                    {partner.name}
                    {firstEver
                      ? `, going back to ${firstEver.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                      : ""}
                    .
                  </p>

                  {upcoming.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                        Upcoming
                      </p>
                      {upcoming.map((e) => (
                        <PartnerEventRow key={e.id} event={e} upcoming />
                      ))}
                    </div>
                  )}

                  {past.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {upcoming.length > 0 && (
                        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                          Past
                        </p>
                      )}
                      {visiblePast.map((e) => (
                        <PartnerEventRow key={e.id} event={e} />
                      ))}
                      {past.length > PAST_PREVIEW && (
                        <button
                          onClick={() => setShowAll((v) => !v)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          {showAll ? "Show fewer" : `Show all ${past.length} events`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Partner Link */}
              {partner.website && (
                <div className="pt-6 border-t border-slate-100">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#d63760] hover:shadow-lg"
                  >
                    <Globe className="h-5 w-5" />
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

/** One line of the partner's record. Deliberately plainer than the calendar's
 *  cards: this is a list of what happened, not a list of things to do. */
function PartnerEventRow({
  event,
  upcoming = false,
}: {
  event: PartnerEvent
  upcoming?: boolean
}) {
  const when = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const href = event.slug ? `/events/${event.slug}` : event.url
  const body = (
    <>
      <p
        className={`text-[11px] font-medium uppercase tracking-widest ${
          upcoming ? "text-[#ef426f]" : "text-slate-400"
        }`}
      >
        {when}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{event.title}</p>
      {(event.venue || event.location) && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate">{event.venue || event.location}</span>
        </p>
      )}
    </>
  )
  const shell =
    "block rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-slate-300 hover:bg-white"
  return href ? (
    <Link href={href} className={shell}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  )
}
