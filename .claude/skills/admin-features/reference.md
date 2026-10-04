# Admin endpoint reference

Exact payloads and server-side flows. See [SKILL.md](SKILL.md) for the permission model and shared patterns.

## Events

### Form — the drawer in `app/admin/page.tsx`

There is no dedicated create-event route. One `SlideDrawer` on the Events tab handles both create and edit, titled from `editingEvent.id`, and submits to `POST /api/events` when there is no id and `PUT` when there is.

| Field | Type | Required | Notes |
|---|---|---|---|
| Community | Multi-select | one host required | Comma-joined into `communityId`. Organizers locked to their own |
| Partners | Multi-select | one host required | Comma-joined into `partnerId`. Optional co-hosts |
| Official DEVSA event | Checkbox | ❌ | `isOfficial`. Spotlight treatment on the calendar, and gates the next two |
| Activation branding | Select | ❌ | `brand`, keyed to `lib/event-brands.ts`. **Only visible when `isOfficial`** |
| External details link | URL | ❌ | `detailsUrl`. Sends "View Details" off-site. **Only visible when `isOfficial`** |
| Event Title | Text | ✅ | Generates the slug |
| Date | Date | ✅ | Combined with start time into an ISO datetime |
| Start Time | Time | ✅ | |
| End Time | Time | ❌ | Drives the "Happening Now" state |
| Venue | Text | ❌ | |
| Address | Text | ❌ | Joined with Venue into `location` when both are present |
| Event Format | Select | ❌ | `eventType`, default `in-person` |
| Description | Rich text | ✅ | HTML string from `RichTextEditor` |
| Registration | Radio + URL | ❌ | `rsvpEnabled`, or `externalRsvpUrl` for off-site registration |
| Status | Select | ❌ | `published` (default) or `draft` |

An event needs a title, a date, a description, an `organizerEmail`, and at least one of `communityId` / `partnerId`. **Location is not validated** despite the form's prominence.

### `POST /api/events`

```json
{
  "title": "Monthly Meetup",
  "date": "2026-02-15T00:00:00.000Z",
  "endTime": "2026-02-15T02:00:00.000Z",
  "venue": "Geekdom",
  "address": "110 E Houston St",
  "location": "Geekdom, 110 E Houston St",
  "description": "<p>Join us for...</p>",
  "communityId": "san-antonio-devs",
  "partnerId": "",
  "isOfficial": false,
  "brand": "",
  "detailsUrl": "",
  "externalRsvpUrl": null,
  "status": "published",
  "eventType": "in-person",
  "rsvpEnabled": true,
  "organizerEmail": "organizer@example.com"
}
```

1. Validate: title, date, description, organizerEmail, and at least one host.
2. Compute `location` from venue + address when not supplied.
3. Verify `organizerEmail` exists in `approved_admins`.
4. If organizer, confirm their `communityId` matches the event's.
5. Slug = lowercased title, non-alphanumerics to hyphens, `+ '-' + Date.now().toString(36)`.
6. Write to `events`, coercing `brand`, `detailsUrl` and `externalRsvpUrl` to `null` when empty, and seeding `sharedToDiscord: false`, `sharedToLinkedIn: false`, `createdAt`.
7. Return `eventId` and `slug`.

### `GET /api/events`

Returns `{ events }` from Firestore only — **no merge with `data/`**. `?includeAll=true` includes drafts for the dashboard; without it, only `status: 'published'`.

Each event is enriched from lookups built off the `communities` and `partners` collections: `communityId` and `partnerId` are comma-separated lists, resolved into `communityNames`, `communityLogos` and the partner equivalents. Both lookups swallow Firestore errors and fall back to an empty map, so a lookup failure degrades names rather than failing the request.

### `PUT /api/events`

Same body as POST plus `eventId`. Organizers restricted to their own community.

### `DELETE /api/events`

`{ eventId, organizerEmail }`. **Organizers may delete within their own community** — the check is `adminData.role === 'organizer' && adminData.communityId !== eventData.communityId`, not a blanket admin requirement.

### `PATCH /api/events`

Maintenance, not content. `{ action: 'audit' | 'fix', organizerEmail, eventId?, newCommunityId? }`, admin only.

## Dashboard reads

### `GET /api/admin/data`

The aggregate fetch behind most tabs: newsletter, speakers, volunteers, access requests, admins and communities in one permission-filtered response.

Speaker and volunteer submissions are scoped **per event**, not per community. The route holds a table mapping a host community to the `eventId` whose submissions its organizers may see (currently PySanAntonio and Access Granted, imported from `data/pysa/2026.ts` and `data/access-granted/2026.ts`). Adding an event to that table is the whole job.

### `GET /api/admin/devsa-subscribers`

Separate route over `devsa_subscribers`. Also supports `PUT` and `DELETE`.

### `GET /api/shop/merch-submissions`

Backs the Merch tab, over `merch_submissions`. The public `POST` side is rate-limited to 5 per hour per IP and uploads its file to Vercel Blob.

## Communities and partners

### `POST /api/upload`

```
Content-Type: multipart/form-data
file: <binary>
adminEmail: admin@example.com
communityId: san-antonio-devs      # or partnerId for the partner path
```

1. Branch on `partnerId !== null` — presence, not truthiness.
2. Validate type against the allow-list and size ≤ 5 MB.
3. Verify approved admin, or organizer for that specific community.
4. Upload to `communities/{id}-{timestamp}.{ext}` or `partners/{id}-{timestamp}.{ext}`, with `new` standing in for an unsaved record's id.
5. Return the public `url`.

### `PUT /api/communities`

```json
{
  "id": "san-antonio-devs",
  "name": "San Antonio Devs",
  "logo": "https://blob.vercel-storage.com/communities/...",
  "description": "A community for developers...",
  "website": "https://sadevs.com",
  "discord": "https://discord.gg/...",
  "adminEmail": "admin@example.com"
}
```

Editable link fields: website, Discord, Meetup, Luma, Instagram, Twitter/X, LinkedIn, YouTube, Twitch, Facebook, GitHub.

Builds a partial update object from the supplied fields and applies it with `communityRef.update()`, preserving anything omitted.

> **Known bug.** The link fields are assigned as `updates.website = website || undefined`. The admin form always sends all eleven, so clearing one sends `""`, which becomes `undefined`, and `update()` throws before any RPC — a 500 and "Failed to update community". Adding or editing a link is fine; only clearing fails. Fix is `|| null` on those lines. See the `?? null` rule in SKILL.md.

### `PATCH /api/communities` and `PATCH /api/partners`

`{ orderedIds: string[], adminEmail }` — rewrites display order for drag-to-reorder. Admin only; both validate that every id is a string before touching Firestore.

## RSVPs

### `POST /api/rsvp` (public)

```json
{
  "eventId": "abc123",
  "eventSlug": "monthly-meetup-mfq2x8k1",
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
7. Send the Resend thank-you email. Failures are caught and logged, never fatal.

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

CSV columns: `First Name, Last Name, Email, Event, Joined Newsletter, Submitted At`. Returned as `text/csv` with `Content-Disposition: attachment`, filename `rsvps-{eventId|communityId|all}-{date}.csv`.

The RSVPs tab has community and event filter dropdowns (event options filtered by the selected community) plus an Export CSV button for the current view.

## Deletes

### `DELETE /api/newsletter`

```json
{ "subscriptionId": "firestore-doc-id", "adminEmail": "admin@example.com" }
```

`admin` or `superadmin` only.

### `DELETE /api/rsvp`

```json
{ "rsvpId": "firestore-doc-id", "adminEmail": "admin@example.com" }
```

`admin` or `superadmin` only.

Both remove the record from local dashboard state on success rather than refetching. Event and community deletes are *not* admin-only — see `DELETE /api/events` above.
