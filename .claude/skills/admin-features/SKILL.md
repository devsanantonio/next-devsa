---
name: admin-features
description: How the DEVSA admin dashboard works — the single-page tabbed shell, the event and community slide-out drawers, the organizer permission model, RSVP capture and CSV export, logo uploads, and the submission inboxes (speakers, volunteers, access requests, Get Involved, and the legacy Confluencia inbox). Use when working on app/admin/page.tsx, the admin API routes (/api/admin/*, /api/events, /api/communities, /api/partners, /api/rsvp, /api/newsletter, /api/upload), or the RichTextEditor.
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
| `newsletter` | Newsletter | `hasAdminAccess` |
| `speakers` | Speakers | all roles, scoped |
| `volunteers` | Volunteers | all roles, scoped |
| `access` | Access Requests | `hasAdminAccess` |
| `admins` | Manage Admins | `hasAdminAccess` |
| `demoday` | Confluencia (legacy: its page and form left the site 2026-10-13; holds earlier inquiries only). Removed from the sidebar and the notifications on 2026-10-16; still reachable at `?tab=demoday` | `hasAdminAccess` |
| `getinvolved` | Get Involved | `hasAdminAccess` |

The active tab syncs to a `?tab=` query param. Organizers land on `communities`, everyone else on `events`.

## Permission model

**Identity comes from a Firebase ID token, never from the request body.** The admin page signs in with Firebase Auth (emailed sign-in link, or Google) and sends every request through `adminFetch`, which adds `Authorization: Bearer <idToken>`. Routes call `verifiedEmail(request)` from `lib/admin-auth.ts`, which verifies the token with the Admin SDK and returns the email only if Firebase has verified it; the route then looks that email up in `approved_admins` for role and community. The super admins no one can remove or demote are `PROTECTED_ADMIN_EMAILS` in `lib/protected-admins.ts` (jesse@devsanantonio.com and jesseovr@gmail.com); the server enforces it and the Manage Admins table hides those controls.

Until 2026-10-12 the caller passed `adminEmail` / `organizerEmail` / `approverEmail` in the body or query string and the server trusted it — anyone who knew an admin's address (the super admin's is published on /about) had admin access. The client still sends those fields in some bodies; the server ignores them for identity. **A new admin route must call `verifiedEmail(request)`; never read an identity email from the request.** Sign-in requires the Email link and Google providers to be enabled in the Firebase console, with the site's domains under Authorized domains.

| Role | Scope |
|---|---|
| `superadmin` | Everything |
| `admin` | Everything |
| `organizer` | Their own community only — the record's `communityId` must equal theirs |

- **Organizers are scoped, not read-only.** Any new endpoint touching community-owned data needs the organizer branch, or organizers silently get global access.
- **"Deletes are admin-only" is too broad.** It holds for RSVP and newsletter records. It does *not* hold for events or communities, where an organizer may delete within their own community — `DELETE /api/events` checks `adminData.communityId !== eventData.communityId` rather than refusing organizers outright.
- Speakers and volunteers are scoped per *event*, not per community. `app/api/admin/data/route.ts` carries a small table naming which event each host community may see submissions for; adding an event to that list is the whole job.

## Reads go through one endpoint

`GET /api/admin/data` is the dashboard's aggregate fetch — newsletter, speakers, volunteers, access requests, admins and communities in one response, already permission-filtered. Events, partners, RSVPs and Confluencia inquiries have their own routes.

If you add a tab, prefer extending `/api/admin/data` over a new route, unless the data is large or needs its own query params.

## Firestore collections

Names live in `COLLECTIONS` in `lib/firebase-admin.ts` — import from there, never write string literals. The dashboard touches: `events`, `communities`, `partners`, `event_rsvps`, `newsletter_subscriptions`, `speaker_submissions`, `volunteer_signups`, `access_requests`, `approved_admins`, `demo_day_inquiries`, `get_involved_inquiries`.

`getDb()` opens the **named** database `'devsa'`, not `(default)`. Any script you write against this data must pass `'devsa'` explicitly or it reads a different, near-empty database in the same project and reports zeros for everything.

## Patterns that repeat

**Firestore is the only source for events.** `GET /api/events` returns `{ events: firestoreEvents }` and imports nothing from `data/`. An earlier version of this skill said it merged seed events from `data/events.ts` and that Firestore won on slug collision — that is no longer true, and `data/events.ts` no longer holds an event array. Communities and partners never shadow Firestore either; `data/communities.ts` is a type plus a logo list, and `data/partners.ts` is gone. Do not reintroduce a static list for any of the three — the last one kept a deleted partner rendering across the site for weeks.

**Slugs: a readable default, or the organizer's own.** Events created from 2026-10-17 get title + short date in San Antonio time — `tech-tuesdays-oct-20` — with the year added only on a clash (`-oct-20-2027`), then `-2`, `-3`. Link-only events keep a random code, because a guessable address undoes the privacy. The drawer's **Event address** field takes a custom one, validated against `RESERVED_EVENT_SLUGS` (the static pages under `/events`) and checked free. Changing an existing event's address pushes the old one into `slugHistory`; the event page and the share cards look up `slugHistory` and redirect, so shared links survive. All of it is in `lib/event-slug.ts` (server) and `lib/event-slug-shared.ts` (pure, used by the drawer's preview). Events from before that date keep their `-mv1cvoco`-style timestamp suffixes. The RSVPs tab groups by `eventId`, not slug, so an address change does not split an event's RSVPs.

**`?? null`, never `undefined`.** Firestore rejects `undefined` and the Admin SDK throws before it issues the RPC — `ignoreUndefinedProperties` is **not** set on this project. Coerce optional fields when writing.

> **Known violation.** `PUT /api/communities` builds its update object with `updates.website = website || undefined` for all eleven link fields. Setting or editing a link works; *clearing* one sends `""`, which becomes `undefined`, and `communityRef.update()` throws — the admin gets a 500 and "Failed to update community". The fix is `|| null` (or `?? null`) on those lines. Do not copy this pattern from that file.

**Partial updates.** Community edits build an update object from only the fields present in the request and apply it with `.update()`, so omitted fields survive. Don't switch these to `.set()`.

**Email failures don't fail the write.** RSVP confirmation emails are sent after the Firestore write and their errors are logged and swallowed. Keep that ordering — a Resend outage must not cost someone their RSVP.

**PATCH means something different per route.** On `communities` and `partners` it takes `{ orderedIds, adminEmail }` and rewrites display order for drag-to-reorder, admin only. On `events` it takes an `action` of `audit` or `fix`, a maintenance path, not a content edit.

## Event fields that gate each other

The event drawer's fields, in order: Community (multi-select), Partners (optional co-hosts), **Official DEVSA event**, Event Title, Date, Start/End Time, Venue, Address, Event Format, Description, Registration, Status.

Two later additions. **Registration** carries an optional custom question (`rsvpQuestion`, plus `rsvpQuestionRequired`) that only mounts while the devsa.community RSVP form is selected; the API clears both whenever `rsvpEnabled` is false, and each RSVP stores the question's wording with its `answer`. **Link only (private)** (`unlisted`) sits under Status; every listing surface filters through `isListed()` in `lib/event-visibility.ts`, so a new surface that lists events must call it too.

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

## List tabs use the shared table system

Newsletter, Volunteers, Access Requests, Manage Admins and Confluencia are all built from `components/admin/data-table.tsx`: `TabHeader` (title, one-line summary of counts, actions), `DataTable`/`Th`/`Tr`/`Td`, `PrimaryCell` for the first column, `Pill`, `DateCell`, `LongText` for notes and messages, `RowAction(s)`, `EmptyState` and `ToolbarButton`. A new list tab should be assembled from these, not from class strings copied out of a neighbor — that is how the five tabs ended up with five header styles.

Readable text never goes below `text-neutral-400`. On the admin panel's ground `neutral-500` measures 4.3:1 and `neutral-600` 2.5:1, both under AA. Speakers is a review queue (list + detail) rather than a table, but its header uses `TabHeader` too.
