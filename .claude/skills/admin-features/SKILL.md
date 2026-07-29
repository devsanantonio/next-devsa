---
name: admin-features
description: How the DEVSA admin dashboard works — creating events, editing communities (logos, descriptions, social links), capturing and exporting RSVPs, and deleting newsletter/RSVP records. Use when working on app/admin/, the admin API routes (/api/events, /api/communities, /api/rsvp, /api/newsletter, /api/upload), the organizer permission model, or the RichTextEditor.
---

# Admin dashboard

The dashboard at `app/admin/page.tsx` is a tabbed client component (Events, Communities, RSVPs, Newsletter, Admins). Event creation gets its own page at `app/admin/create-event/`.

Detailed request/response shapes for every endpoint are in [reference.md](reference.md) — read that when you need exact payloads. The concepts below apply everywhere and are the part that's easy to get wrong.

## Permission model

Every admin API route authenticates by looking up an email in the `approved_admins` Firestore collection. There is no session token on these routes — the caller passes `adminEmail` (or `organizerEmail`) in the body or query string and the server verifies it.

| Role | Scope |
|---|---|
| `superadmin` | Everything, including deletes |
| `admin` | Everything, including deletes |
| `organizer` | Only their own community — the record's `communityId` must equal the organizer's `communityId` |

Two consequences worth holding onto:

- **Organizers are scoped, not read-only.** Any new admin endpoint that touches community-owned data needs the organizer branch, or organizers silently get global access.
- **Deletes are admin/superadmin only.** Organizers must not be able to delete RSVPs or newsletter records.

## Firestore collections

Names are centralized in `COLLECTIONS` in `lib/firebase-admin.ts` — import from there rather than writing string literals. The ones the dashboard touches: `events`, `communities`, `event_rsvps`, `newsletter_subscriptions`, `approved_admins`, `access_requests`.

## Patterns that repeat

**Static fallback.** `GET /api/events` merges Firestore events with the seed events in `data/events.ts`. Firestore wins on slug collision. Communities and partners follow the same shape. Anything you add to the dashboard should assume both sources exist.

**Slugs are generated, not user-supplied.** Event titles become URL-safe slugs with a random suffix (`monthly-meetup-k5f3a2`) so duplicate titles don't collide.

**`?? null`, never `undefined`.** Firestore rejects `undefined` values. Optional fields must be coerced when writing.

**Partial updates.** Community edits build an update object from only the fields present in the request and apply it with `.update()`, so omitted fields survive. Don't switch these to `.set()`.

**Email failures don't fail the write.** RSVP confirmation emails are sent after the Firestore write and their errors are logged and swallowed. Keep that ordering — a Resend outage must not cost someone their RSVP.

## Rich text

Event descriptions are HTML strings produced by `components/rich-text-editor.tsx`, a textarea with a floating toolbar that wraps selections in `<strong>`, `<ul><li>`, and `<a href>`. Output is stored raw and rendered on the public event page, so anything rendering it must go through `lib/sanitize.ts`.

## Uploads

Community logos go to Vercel Blob via `POST /api/upload` under `communities/{communityId}-{timestamp}.{ext}`. Allow-list: JPEG, PNG, WebP, SVG, GIF, max 5 MB. The route re-checks admin/organizer permissions — it is not an open upload endpoint.
