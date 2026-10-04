---
name: admin-features
description: How the DEVSA admin dashboard works — the single-page tabbed shell, the event and community slide-out drawers, the organizer permission model, RSVP capture and CSV export, logo uploads, and the submission inboxes (speakers, volunteers, access requests, merch). Use when working on app/admin/page.tsx, the admin API routes (/api/admin/*, /api/events, /api/communities, /api/partners, /api/rsvp, /api/newsletter, /api/upload), or the RichTextEditor.
---

# Admin dashboard

The whole dashboard is **one file**: `app/admin/page.tsx`, a ~4,900-line client component. Only two pieces are extracted — `components/admin/admin-combobox.tsx` and `components/admin/slide-drawer.tsx`. There is no `app/admin/create-event/` route; an earlier version of this skill claimed one and it has never existed in the current tree.

Everything happens in `SlideDrawer`s over the tab you are on. **Create and edit share one drawer per entity**, distinguished only by whether the record has an id:

```tsx
{editingEvent.id ? "Edit Event" : "Create Event"}
```

So a change to "the create form" is a change to the edit form, and vice versa. Check both readings before you touch one.

Detailed request/response shapes are in [reference.md](reference.md). The concepts below are the part that is easy to get wrong.

## Tabs

Eleven, not the five an earlier version of this skill listed. `Tab` is a union near the top of the file and `tabTitles` maps each to its display name.

| Tab | Title | Gated |
|---|---|---|
| `events` | Events | all roles |
| `rsvps` | RSVPs | all roles (organizers see only their community) |
| `communities` | Communities, or **My Community** for organizers | all roles |
| `partners` | Partners | `hasAdminAccess` |
| `devsa` | DEVSA Subscribers | `hasAdminAccess` |
| `newsletter` | Newsletter | `hasAdminAccess` |
| `speakers` | Speakers | all roles, scoped |
| `volunteers` | Volunteers | all roles, scoped |
| `access` | Access Requests | `hasAdminAccess` |
| `admins` | Manage Admins | `hasAdminAccess` |
| `merch` | Merch Submissions | `hasAdminAccess` |

The active tab syncs to a `?tab=` query param. Organizers land on `communities`, everyone else on `events`.

## Permission model

Every admin API route authenticates by looking up an email in `approved_admins`. There is no session token — the caller passes `adminEmail` (or `organizerEmail`, depending on the route; they are not interchangeable) in the body or query string and the server verifies it. `SUPER_ADMIN_EMAIL` in `lib/firebase-admin.ts` is the bootstrap account.

| Role | Scope |
|---|---|
| `superadmin` | Everything |
| `admin` | Everything |
| `organizer` | Their own community only — the record's `communityId` must equal theirs |

- **Organizers are scoped, not read-only.** Any new endpoint touching community-owned data needs the organizer branch, or organizers silently get global access.
- **"Deletes are admin-only" is too broad.** It holds for RSVP and newsletter records. It does *not* hold for events or communities, where an organizer may delete within their own community — `DELETE /api/events` checks `adminData.communityId !== eventData.communityId` rather than refusing organizers outright.
- Speakers and volunteers are scoped per *event*, not per community. `app/api/admin/data/route.ts` carries a small table naming which event each host community may see submissions for; adding an event to that list is the whole job.

## Reads go through one endpoint

`GET /api/admin/data` is the dashboard's aggregate fetch — newsletter, speakers, volunteers, access requests, admins and communities in one response, already permission-filtered. Events, partners, RSVPs, DEVSA subscribers and merch submissions have their own routes.

If you add a tab, prefer extending `/api/admin/data` over a new route, unless the data is large or needs its own query params.

## Firestore collections

Names live in `COLLECTIONS` in `lib/firebase-admin.ts` — import from there, never write string literals. The dashboard touches: `events`, `communities`, `partners`, `event_rsvps`, `newsletter_subscriptions`, `devsa_subscribers`, `speaker_submissions`, `volunteer_signups`, `access_requests`, `approved_admins`, `merch_submissions`.

`getDb()` opens the **named** database `'devsa'`, not `(default)`. Any script you write against this data must pass `'devsa'` explicitly or it reads a different, near-empty database in the same project and reports zeros for everything.

## Patterns that repeat

**Firestore is the only source for events.** `GET /api/events` returns `{ events: firestoreEvents }` and imports nothing from `data/`. An earlier version of this skill said it merged seed events from `data/events.ts` and that Firestore won on slug collision — that is no longer true, and `data/events.ts` no longer holds an event array. Communities and partners never shadow Firestore either; `data/communities.ts` is a type plus a logo list, and `data/partners.ts` is gone. Do not reintroduce a static list for any of the three — the last one kept a deleted partner rendering across the site for weeks.

**Slugs are generated, not user-supplied, and the suffix is a timestamp.** The title is lowercased, non-alphanumerics become hyphens, and `Date.now().toString(36)` is appended — `monthly-meetup-mfq2x8k1`. An earlier version of this skill called it a random suffix. It is not random, so two events created in the same millisecond would still collide; nothing depends on that today.

**`?? null`, never `undefined`.** Firestore rejects `undefined` and the Admin SDK throws before it issues the RPC — `ignoreUndefinedProperties` is **not** set on this project. Coerce optional fields when writing.

> **Known violation.** `PUT /api/communities` builds its update object with `updates.website = website || undefined` for all eleven link fields. Setting or editing a link works; *clearing* one sends `""`, which becomes `undefined`, and `communityRef.update()` throws — the admin gets a 500 and "Failed to update community". The fix is `|| null` (or `?? null`) on those lines. Do not copy this pattern from that file.

**Partial updates.** Community edits build an update object from only the fields present in the request and apply it with `.update()`, so omitted fields survive. Don't switch these to `.set()`.

**Email failures don't fail the write.** RSVP confirmation emails are sent after the Firestore write and their errors are logged and swallowed. Keep that ordering — a Resend outage must not cost someone their RSVP.

**PATCH means something different per route.** On `communities` and `partners` it takes `{ orderedIds, adminEmail }` and rewrites display order for drag-to-reorder, admin only. On `events` it takes an `action` of `audit` or `fix`, a maintenance path, not a content edit.

## Event fields that gate each other

The event drawer's fields, in order: Community (multi-select), Partners (optional co-hosts), **Official DEVSA event**, Event Title, Date, Start/End Time, Venue, Address, Event Format, Description, Registration, Status.

`isOfficial` is the hinge. **Activation branding** (`brand`) and **External details link** (`detailsUrl`) only mount while it is ticked, because neither means anything on an event DEVSA merely listed. Unticking clears both, and the submit handler derives both from the flag rather than from field state, so a record cannot end up branded-but-unofficial. If you add another field that only applies to DEVSA's own events, put it inside that same conditional and clear it the same way.

An event needs a title, a date, a description, an `organizerEmail`, and **at least one host** — a `communityId` or a `partnerId`. Location is not required, despite the form presenting Venue and Address prominently.

## Rich text

Event descriptions are HTML strings from `components/rich-text-editor.tsx`, a textarea with a floating toolbar that wraps selections in `<strong>`, `<ul><li>` and `<a href>`. Output is stored raw, so anything rendering it must go through `lib/sanitize.ts`.

## Uploads

Logos go to Vercel Blob via `POST /api/upload`. Allow-list: JPEG, PNG, WebP, SVG, GIF, max 5 MB. The route re-checks permissions — it is not an open endpoint.

| field sent | blob path | who may upload |
|---|---|---|
| `communityId` | `communities/{id}-{ts}.{ext}` | admin, or the organizer assigned to that community |
| `partnerId` | `partners/{id}-{ts}.{ext}` | admin/superadmin only |

The branch keys on `partnerId !== null`, not on truthiness, so an unsaved record can still upload — it lands as `new-{ts}` and the form carries the returned URL into the create request. That distinction is also what stops an organizer reaching the partner path: sending `partnerId` takes the admin-only branch instead of falling through to the community check.
