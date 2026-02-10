# Admin Features — Implementation Guide

This document walks through how the DEVSA admin dashboard handles **event creation**, **community editing** (with images and links), **RSVP data capture**, and **CSV export**.

---

## Table of Contents

1. [Creating Events](#creating-events)
2. [Editing Community Descriptions, Images & Links](#editing-community-descriptions-images--links)
3. [Capturing RSVP Data](#capturing-rsvp-data)
4. [Exporting RSVPs to CSV](#exporting-rsvps-to-csv)
5. [Deleting Newsletter & RSVP Records](#deleting-newsletter--rsvp-records)

---

## Creating Events

### Frontend — `app/admin/create-event/page.tsx`

The event creation form is a dedicated page accessible from the admin dashboard. It is protected by a client-side auth check that redirects unauthenticated users back to `/admin`.

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Community | Select dropdown | ✅ | Organizers are locked to their assigned community; admins/superadmins can pick any |
| Title | Text input | ✅ | Used to auto-generate the URL slug |
| Date | Date picker | ✅ | Combined with start time into an ISO datetime |
| Start Time | Time picker | ✅ | Default `18:00` |
| End Time | Time picker | ✅ | Default `20:00` — used by the "Happening Now" feature |
| Location | Text input | ✅ | Free text address |
| Description | Rich text editor | ✅ | Supports **bold**, **bullet lists**, and **hyperlinks** via the `RichTextEditor` component |
| Enable RSVP | Toggle switch | ❌ | When on, an RSVP form appears on the public event page |
| Status | Select | ❌ | `published` (default) or `draft` — drafts are only visible in the admin dashboard |

**Rich text editing** is powered by `components/rich-text-editor.tsx` — a custom textarea component that shows a floating toolbar when text is selected. It wraps selected text in HTML tags (`<strong>`, `<ul><li>`, `<a href="...">`) and stores the result as an HTML string.

### API — `POST /api/events`

```
POST /api/events
Content-Type: application/json

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

**Server-side flow:**

1. Validates all required fields are present.
2. Verifies the `organizerEmail` exists in the `approved_admins` Firestore collection.
3. If the user is an **organizer**, confirms their `communityId` matches the event's community.
4. Generates a URL-safe **slug** from the title (e.g. `monthly-meetup-k5f3a2`).
5. Creates a document in the `events` Firestore collection.
6. Returns the new `eventId` and `slug`.

### Data merging

The `GET /api/events` endpoint merges events from two sources:

- **Firestore** — dynamically created events (editable/deletable)
- **Static data** (`data/events.ts`) — hardcoded seed events (read-only)

Firestore events take precedence when slugs collide. Results are sorted by date.

---

## Editing Community Descriptions, Images & Links

### Frontend — Admin Dashboard (`app/admin/page.tsx`)

From the **Communities** tab, admins can click **Edit** on any community to open an edit modal. The modal contains:

- **Name** — text input
- **Logo** — either upload an image file or paste a URL
  - File uploads go through the `/api/upload` endpoint → Vercel Blob Storage
  - Supported types: JPEG, PNG, WebP, SVG, GIF (max 5 MB)
- **Description** — textarea for the community's bio (plain text)
- **Social / link fields** — inputs for website, Discord, Meetup, Luma, Instagram, Twitter/X, LinkedIn, YouTube, Twitch, Facebook, and GitHub

### Image Upload API — `POST /api/upload`

```
POST /api/upload
Content-Type: multipart/form-data

file: <binary>
adminEmail: admin@example.com
communityId: san-antonio-devs
```

**Server-side flow:**

1. Validates the file type is in the allow-list and size is ≤ 5 MB.
2. Verifies the uploader is an approved admin (or an organizer for that specific community).
3. Uploads the file to **Vercel Blob Storage** under `communities/{communityId}-{timestamp}.{ext}`.
4. Returns the public `url` for the uploaded blob.

### Community Update API — `PUT /api/communities`

```
PUT /api/communities
Content-Type: application/json

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

**Permission model:**

| Role | Can edit |
|------|---------|
| `superadmin` | Any community |
| `admin` | Any community |
| `organizer` | Only their assigned community (`communityId` must match) |

The API builds a partial update object from the provided fields and applies it with `communityRef.update()`, preserving any fields not included in the request.

---

## Capturing RSVP Data

### How RSVP is enabled

When creating or editing an event, toggle the **Enable RSVP** switch. This sets `rsvpEnabled: true` on the event document in Firestore. The public event page (`app/events/[slug]`) checks this flag and renders an RSVP form when enabled.

### RSVP form fields

| Field | Required | Notes |
|-------|----------|-------|
| First Name | ✅ | |
| Last Name | ✅ | |
| Email | ✅ | Validated with regex, normalized to lowercase |
| Join Newsletter | ❌ | Opt-in checkbox — automatically adds the email to the newsletter if checked |

### API — `POST /api/rsvp`

```
POST /api/rsvp
Content-Type: application/json

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

**Server-side flow:**

1. Validates required fields and email format.
2. Runs **MAGEN bot-detection** verification (currently in log-only mode).
3. Confirms the event exists and has `rsvpEnabled: true`.
4. Checks for duplicate RSVPs (same `eventId` + `email`) — returns `409` if already registered.
5. Creates a document in the `event_rsvps` Firestore collection.
6. If `joinNewsletter` is true, adds the email to the `newsletter_subscriptions` collection (with source `event-rsvp:{slug}`), skipping if already subscribed.
7. Sends a **thank-you confirmation email** via Resend with event details (title, date, location, community name, event URL).
8. Returns success. Email send failures are logged but don't block the RSVP.

### RSVP data model

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

---

## Exporting RSVPs to CSV

### Frontend

In the admin dashboard's **RSVPs** tab, there are two filter dropdowns and an **Export CSV** button:

- **Community filter** — narrow RSVPs to a specific community
- **Event filter** — narrow to a specific RSVP-enabled event (dynamically filtered by the selected community)
- **Export CSV** — downloads a `.csv` file for the currently filtered view

### API — `GET /api/rsvp?format=csv`

```
GET /api/rsvp?adminEmail=admin@example.com&eventId=abc123&format=csv
```

**Parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `adminEmail` | ✅ | Used to verify permissions |
| `eventId` | ❌ | Filter RSVPs to a specific event |
| `communityId` | ❌ | Filter RSVPs to a specific community |
| `format` | ❌ | Set to `csv` for file download; omit for JSON |

**Permission model:**

| Role | Sees |
|------|------|
| `superadmin` / `admin` | All RSVPs (or filtered by query params) |
| `organizer` | Only RSVPs for events in their assigned community |

**CSV output columns:**

```
First Name, Last Name, Email, Event, Joined Newsletter, Submitted At
```

The response is returned with `Content-Type: text/csv` and a `Content-Disposition: attachment` header so the browser triggers a download. The filename follows the pattern `rsvps-{eventId|communityId|all}-{date}.csv`.

---

## Deleting Newsletter & RSVP Records

Admins and superadmins can delete individual records directly from the admin dashboard tables.

### Newsletter — `DELETE /api/newsletter`

```
DELETE /api/newsletter
Content-Type: application/json

{
  "subscriptionId": "firestore-doc-id",
  "adminEmail": "admin@example.com"
}
```

Verifies the caller has `admin` or `superadmin` role, then deletes the document from the `newsletter_subscriptions` collection.

### RSVPs — `DELETE /api/rsvp`

```
DELETE /api/rsvp
Content-Type: application/json

{
  "rsvpId": "firestore-doc-id",
  "adminEmail": "admin@example.com"
}
```

Same permission check — only `admin` or `superadmin` roles can delete RSVP records from the `event_rsvps` collection.

Both endpoints update the admin UI immediately by removing the deleted record from local state without requiring a full data refetch.

---

## Tech Stack Summary

| Concern | Technology |
|---------|-----------|
| Framework | Next.js (App Router, Server + Client Components) |
| Database | Firebase / Firestore |
| File storage | Vercel Blob Storage |
| Email | Resend |
| Bot detection | MAGEN (log-only mode) |
| Rich text | Custom `RichTextEditor` component (HTML output) |
| Auth | Email-based admin verification against `approved_admins` collection |
