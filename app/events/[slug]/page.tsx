import { Metadata } from "next"
import { EventPageClient } from "./event-page-client"
import { getDb, COLLECTIONS, type Event } from "@/lib/firebase-admin"
import { eventDescriptionToPlainText } from "@/lib/event-markdown"
import { notFound, permanentRedirect } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEventBySlug(slug: string) {
  // Query Firestore directly (avoids self-referencing fetch on Vercel)
  try {
    const db = getDb()
    let snapshot = await db
      .collection(COLLECTIONS.EVENTS)
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()
    // An address the event used to have (lib/event-slug.ts). The page then
    // redirects to the current one, so a link shared before the change works.
    // array-contains alone, with status checked here: pairing it with the
    // status filter would need a composite index this project does not have.
    if (snapshot.empty) {
      const old = await db
        .collection(COLLECTIONS.EVENTS)
        .where('slugHistory', 'array-contains', slug)
        .limit(5)
        .get()
      const docs = old.docs.filter((d) => d.data().status === 'published')
      snapshot = { empty: docs.length === 0, docs } as unknown as typeof snapshot
    }

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data() as Event
      
      // Look up community name from Firestore, fall back to stored communityName for custom events
      let communityName = data.communityName || 'DEVSA Community'
      if (data.communityId) {
        try {
          const communityDoc = await db.collection(COLLECTIONS.COMMUNITIES).doc(data.communityId).get()
          if (communityDoc.exists) {
            communityName = communityDoc.data()?.name || communityName
          }
        } catch {}
      }
      
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        date: data.date,
        endTime: data.endTime,
        location: data.location,
        venue: data.venue,
        address: data.address,
        description: data.description,
        url: data.url,
        communityId: data.communityId,
        // For the share metadata, which names every host: partners co-host,
        // and DEVSA's own events say so.
        partnerId: data.partnerId,
        isOfficial: data.isOfficial === true,
        unlisted: data.unlisted === true,
        // The admin's own label, without the "DEVSA Community" default above,
        // so a host-less event is never described as hosted by DEVSA.
        storedCommunityName: data.communityName || null,
        source: data.source,
        status: data.status,
        eventType: data.eventType,
        rsvpEnabled: data.rsvpEnabled,
        externalRsvpUrl: data.externalRsvpUrl || null,
        communityName,
        createdAt: (data.createdAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: (data.updatedAt as unknown as { toDate?: () => Date })?.toDate?.()?.toISOString() || data.updatedAt,
      }
    }
  } catch (error) {
    console.error("Error fetching event from Firestore:", error)
  }
  
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

  const event = await getEventBySlug(slug)
    
  if (event) {
    /*
     * Every host, by name, first. A group sharing its own event from the
     * calendar should see its name lead the preview, not DEVSA's: the title
     * said "<event> | DEVSA" and the description ended on DEVSA's own pitch.
     * Communities then partners, the order the card and the calendar use; the
     * admin's denormalized communityName is the fallback. DEVSA's own events
     * (isOfficial) name DEVSA.
     */
    const ids = (v?: string) => (v || "").split(",").map((x) => x.trim()).filter(Boolean)
    const db = getDb()
    const nameOf = async (collection: string, id: string) => {
      try {
        const doc = await db.collection(collection).doc(id).get()
        return doc.exists ? ((doc.data() as { name?: string }).name ?? null) : null
      } catch {
        return null
      }
    }
    const hostNames = (
      await Promise.all([
        ...ids(event.communityId).map((id) => nameOf(COLLECTIONS.COMMUNITIES, id)),
        ...ids(event.partnerId).map((id) => nameOf(COLLECTIONS.PARTNERS, id)),
      ])
    ).filter((n): n is string => !!n)
    if (!hostNames.length && event.storedCommunityName) hostNames.push(event.storedCommunityName)
    const hosts = event.isOfficial
      ? ["DEVSA", ...hostNames].join(" + ")
      : hostNames.join(" + ") || "a San Antonio tech group"

    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    })

    // A link-only event is not on the calendar, so its preview must not say it is.
    const description = `Hosted by ${hosts}. ${eventDate}${event.location ? ` at ${event.location}` : " in San Antonio"}. ${
      event.unlisted ? "A private event: this link is your invitation." : "Listed on the DEVSA community calendar."
    }`
    // The browser tab and X card carry the host after the title; the root
    // template still appends " | DEVSA" to the page <title>, as the site's name.
    const titleWithHost = `${event.title} · ${hosts}`

    return {
      title: titleWithHost,
      description,
      // Link only: the page works for anyone holding the link, and asks search
      // engines to leave it out. See lib/event-visibility.ts.
      ...(event.unlisted ? { robots: { index: false, follow: false } } : {}),
      openGraph: {
        title: event.title,
        description,
        url: `${siteUrl}/events/${event.slug}`,
        siteName: "DEVSA",
        images: [
          {
            url: `${siteUrl}/api/og/event/${event.slug}`,
            width: 1200,
            height: 630,
            alt: `${event.title}, hosted by ${hosts}`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: titleWithHost,
        description,
        images: [`${siteUrl}/api/og/event/${event.slug}`],
      },
    }
  }

  // Fallback metadata if event not found. noindex for the same reason
  // /buildingtogether/[slug] carries it: the page below calls notFound(), but
  // `notFound()` after streaming has begun cannot take back a 200, so the
  // defense against a soft 404 being indexed is the robots directive.
  const fallbackTitle = "Community Event"
  const fallbackDescription = "Join the San Antonio tech community. DEVSA is the bridge between the city's builders, tech groups and partners."
  
  return {
    title: fallbackTitle,
    description: fallbackDescription,
    robots: { index: false, follow: false },
    openGraph: {
      title: "Community Event",
      description: fallbackDescription,
      url: `${siteUrl}/events/${slug}`,
      siteName: "DEVSA",
      images: [
        {
          url: `${siteUrl}/api/og/event/${slug}`,
          width: 1200,
          height: 630,
          alt: "DEVSA Community Event",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Community Event | DEVSA",
      description: fallbackDescription,
      images: [`${siteUrl}/api/og/event/${slug}`],
    },
  }
}

/**
 * Event rich results — the date, venue and price Google shows inside the search
 * listing itself.
 *
 * These pages had none. /events, PySanAntonio, Access Granted and zero-to-agent
 * all emit structured data; the individual event pages, which are the ones most
 * likely to actually earn a rich result, emitted nothing. Every field here is
 * already fetched for the metadata above, so this costs no extra read.
 *
 * Server-rendered rather than added in the client component, because a crawler
 * that does not execute JavaScript still gets it.
 */
function eventJsonLd(
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>,
  siteUrl: string
) {
  const url = `${siteUrl}/events/${event.slug}`

  // `endDate` is only emitted when the stored end time is real and after the
  // start — the same guard lib/event-display applies to the UI. Publishing an
  // inverted range in structured data would have search engines show an event
  // that ends before it begins.
  const start = new Date(event.date).getTime()
  const rawEnd = event.endTime ? new Date(event.endTime).getTime() : NaN
  const endDate =
    Number.isFinite(rawEnd) && rawEnd > start
      ? new Date(rawEnd).toISOString()
      : undefined

  const attendanceMode =
    event.eventType === "virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : event.eventType === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode"

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: new Date(event.date).toISOString(),
    ...(endDate ? { endDate } : {}),
    eventAttendanceMode: attendanceMode,
    eventStatus: "https://schema.org/EventScheduled",
    // Plain text: the description is authored as markdown, and schema.org
    // expects prose, not syntax.
    description: eventDescriptionToPlainText(event.description, { singleLine: true }).slice(0, 500),
    url,
    // Virtual events take a VirtualLocation; anything with a physical room gets
    // a Place with whatever address parts were actually recorded.
    location:
      event.eventType === "virtual"
        ? {
            "@type": "VirtualLocation",
            url: event.url || url,
          }
        : {
            "@type": "Place",
            name: event.venue || event.location,
            address: event.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: event.address,
                  addressLocality: "San Antonio",
                  addressRegion: "TX",
                  addressCountry: "US",
                }
              : {
                  "@type": "PostalAddress",
                  addressLocality: "San Antonio",
                  addressRegion: "TX",
                  addressCountry: "US",
                },
          },
    organizer: {
      "@type": "Organization",
      name: event.communityName,
      url: event.communityId
        ? `${siteUrl}/buildingtogether/${event.communityId}`
        : siteUrl,
    },
    image: [`${siteUrl}/api/og/event/${event.slug}`],
    // Every event on this calendar is free to attend. Stated explicitly because
    // "Free" is one of the few things Google renders in the listing itself, and
    // an Event without an `offers` block does not get it.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: event.externalRsvpUrl || event.url || url,
      validFrom: new Date(
        (event.createdAt as string) || event.date
      ).toISOString(),
    },
    isAccessibleForFree: true,
  }
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"
  const event = await getEventBySlug(slug)

  // A missing event is a 404, not a 200 with an apology inside it.
  //
  // This page used to render EventPageClient unconditionally and let the
  // client draw its own "Event Not Found" panel after fetching. That looked
  // like a handled case and was not one: the response was a success, the
  // document had no structured data and no signal to a crawler, and a retired
  // event URL stayed indexable forever. The record is already fetched here for
  // the metadata, so the check costs nothing.
  if (!event) notFound()
  // Reached by an old address: send the reader to the current one.
  if (event.slug !== slug) permanentRedirect(`/events/${event.slug}`)

  return (
    <>
      {/* No rich result for a link-only event: it would advertise what the
          noindex above is keeping out of search. */}
      {event && !event.unlisted && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventJsonLd(event, siteUrl)),
          }}
        />
      )}
      <EventPageClient slug={slug} />
    </>
  )
}
