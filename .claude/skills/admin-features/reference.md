# Admin endpoint reference

Exact payloads and server-side flows. See [SKILL.md](SKILL.md) for the permission model and shared patterns.

## Creating events

### Form — `app/admin/create-event/page.tsx`

Dedicated page, client-side auth check redirects unauthenticated users to `/admin`.

| Field | Type | Required | Notes |
|---|---|---|---|
| Community | Select | ✅ | Organizers locked to their assigned community; admins/superadmins pick any |
| Title | Text | ✅ | Generates the URL slug |
| Date | Date picker | ✅ | Combined with start time into an ISO datetime |
| Start Time | Time picker | ✅ | Default `18:00` |
| End Time | Time picker | ✅ | Default `20:00` — drives the "Happening Now" state |
| Location | Text | ✅ | Free-text address |
| Description | Rich text | ✅ | HTML string from `RichTextEditor` |
| Enable RSVP | Toggle | ❌ | Sets `rsvpEnabled`; public page renders the RSVP form when true |
| Status | Select | ❌ | `published` (default) or `draft` — drafts are admin-only |

### `POST /api/events`

```json
{
  "title": "Monthly Meetup",
  "date": "2026-02-15T00:00:00.000Z",
  "endTime": "2026-02-15T02:00:00.000Z",
  "location": "Geekdom, 110 E Houston St",
  "description": "<p>Join us for...</p>",
  "communityId": "san-antonio-devs",
  "status": "published",
  "rsvpEnabled": true,
  "organizerEmail": "organizer@example.com"
}
```

1. Validate required fields.
2. Verify `organizerEmail` exists in `approved_admins`.
3. If organizer, confirm their `communityId` matches the event's.
4. Generate a URL-safe slug with random suffix.
5. Create the document in `events`.
6. Return `eventId` and `slug`.

### `GET /api/events`

Merges Firestore events (editable) with `data/events.ts` seed events (read-only). Firestore takes precedence on slug collision. Sorted by date.

## Editing communities

### `POST /api/upload`

```
Content-Type: multipart/form-data
file: <binary>
adminEmail: admin@example.com
communityId: san-antonio-devs
```

1. Validate type against the allow-list and size ≤ 5 MB.
2. Verify approved admin, or organizer for that specific community.
3. Upload to Vercel Blob at `communities/{communityId}-{timestamp}.{ext}`.
4. Return the public `url`.

### `PUT /api/communities`

```json
{
  "id": "san-antonio-devs",
  "name": "San Antonio Devs",
  "logo": "https://blob.vercel-storage.com/communities/...",
  "description": "A community for developers...",
  "website": "https://sadevs.com",
  "discord": "https://discord.gg/...",
  "twitter": "https://twitter.com/...",
  "adminEmail": "admin@example.com"
}
```

Editable link fields: website, Discord, Meetup, Luma, Instagram, Twitter/X, LinkedIn, YouTube, Twitch, Facebook, GitHub.

Builds a partial update object from the supplied fields and applies it with `communityRef.update()`, preserving anything omitted.

## RSVPs

### `POST /api/rsvp` (public)

```json
{
  "eventId": "abc123",
  "eventSlug": "monthly-meetup-k5f3a2",
  "communityId": "san-antonio-devs",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "joinNewsletter": true
}
```

1. `checkBotId()` — return 403 if `isBot`. Requires a matching entry in `instrumentation-client.ts`.
2. Validate required fields and email format.
3. Confirm the event exists and has `rsvpEnabled: true`.
4. Reject duplicates (same `eventId` + `email`) with `409`.
5. Create the document in `event_rsvps`.
6. If `joinNewsletter`, add to `newsletter_subscriptions` with source `event-rsvp:{slug}`, skipping if already subscribed.
7. Send the Resend thank-you email with event details. Failures are logged, not fatal.

```typescript
interface EventRSVP {
  eventId: string       // Firestore document ID of the event
  eventSlug: string     // URL slug for linking
  communityId: string   // Community the event belongs to
  firstName: string
  lastName: string
  email: string         // Normalized to lowercase
  joinNewsletter: boolean
  submittedAt: Date
}
```

### `GET /api/rsvp` — list and CSV export

```
GET /api/rsvp?adminEmail=admin@example.com&eventId=abc123&format=csv
```

| Param | Required | Description |
|---|---|---|
| `adminEmail` | ✅ | Permission check |
| `eventId` | ❌ | Filter to one event |
| `communityId` | ❌ | Filter to one community |
| `format` | ❌ | `csv` for download; omit for JSON |

Organizers see only RSVPs for their assigned community, regardless of query params.

CSV columns: `First Name, Last Name, Email, Event, Joined Newsletter, Submitted At`. Returned with `Content-Type: text/csv` and `Content-Disposition: attachment`, filename `rsvps-{eventId|communityId|all}-{date}.csv`.

The dashboard's RSVPs tab has community and event filter dropdowns (event options filtered by selected community) plus an Export CSV button for the current view.

## Deletes

`admin` or `superadmin` only.

### `DELETE /api/newsletter`

```json
{ "subscriptionId": "firestore-doc-id", "adminEmail": "admin@example.com" }
```

Deletes from `newsletter_subscriptions`.

### `DELETE /api/rsvp`

```json
{ "rsvpId": "firestore-doc-id", "adminEmail": "admin@example.com" }
```

Deletes from `event_rsvps`.

Both remove the record from local dashboard state on success rather than refetching.
