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

**Identity comes from a Firebase ID token, never from the request body.** The admin page signs in with Firebase Auth (emailed sign-in link, or Google) and sends every request through `adminFetch`, which adds `Authorization: Bearer <idToken>`. Routes call `verifiedEmail(request)` from `lib/admin-auth.ts`, which verifies the token with the Admin SDK and returns the email only if Firebase has verified it; the route then looks that email up in `approved_admins` for role and community. The site's owner, whom no one can remove or demote, is `PROTECTED_ADMIN_EMAILS` in `lib/protected-admins.ts` (jesse@devsanantonio.com and jesseovr@gmail.com); the server enforces it and the Manage Admins table hides those controls.

Until 2026-10-12 the caller passed `adminEmail` / `organizerEmail` / `approverEmail` in the body or query string and the server trusted it — anyone who knew an admin's address (the super admin's is published on /about) had admin access. The client still sends those fields in some bodies; the server ignores them for identity. **A new admin route must call `verifiedEmail(request)`; never read an identity email from the request.** Sign-in requires the Email link and Google providers to be enabled in the Firebase console, with the site's domains under Authorized domains.

| Role | Scope |
|---|---|
| `admin` | Everything |
| `organizer` | Their own community only — the record's `communityId` must equal theirs |

There were three roles until 2026-11-01. `superadmin` was never treated differently from `admin` on the server; what it was meant to do, protect the creator, is the email list above. It was retired and its records became `admin`. Test roles with `isAdminRole()` from `lib/admin-roles.ts` (which still reads a stray `superadmin` as admin), and write every check as "is an admin", never "is an organizer": until that day the event, RSVP and upload routes restricted only `role === 'organizer'`, so any other string, a typo included, had full access.

**The portal grants one role: organizer.** `POST /api/admin/auth` refuses any other role, and an organizer must name a group that exists. Nobody is made an admin from the portal, the owner included; that is a hand edit in Firestore (see the README). An account that is already an admin can be changed or removed only by the owner: Manage Admins shows those controls to the owner alone, and the route enforces it.

- **Organizers are scoped, not read-only.** Any new endpoint touching community-owned data needs the organizer branch, or organizers silently get global access.
- **"Deletes are admin-only" is too broad.** It holds for RSVP and newsletter records. It does *not* hold for events or communities, where an organizer may delete within their own community — `DELETE /api/events` checks `adminData.communityId !== eventData.communityId` rather than refusing organizers outright.
- Speakers and volunteers are scoped per *event*. `HOSTED_EVENTS` in `lib/hosted-events.ts` names which conference each host community may see submissions for; adding an event to that list is the whole job.
- **Every group also has its own standing call for speakers** (`lib/speaker-calls.ts`). An organizer ticks "Looking for speakers" in the **call-for-speakers panel at the top of their Speakers tab** (`components/admin/speaker-call-panel.tsx`, which saves only the three call fields through `PUT /api/communities`; it moved out of the community editor on 2026-11-01, and the editor no longer sends those fields, so it can't write back a stale call). The Overview's quick action reads "Open a call for speakers" or "Call for speakers open · N to review" and goes there; the group page (`/buildingtogether/[id]#speak`) shows a form and `/give-a-talk` lists the group. Its talks are stored with `eventId: "group:<communityId>"`, and `hostedEventIdsFor()` always includes that id, so the Speakers tab, its review controls and the decision emails need nothing extra. The submission route refuses a group whose call is closed, and emails the group's organizers (assigned or via `organizerOf`). Call text is stored with `plainText()`, not `sanitizeInput`, which HTML-encodes.
- **The open pool** (`eventId: "open-pool"`) takes talks from `/give-a-talk` that have no group yet, only with the speaker's consent to share. Admins only: organizers never see it. In the Speakers tab an admin picks a group and clicks "Share with group" (`PATCH /api/call-for-speakers` with `shareWith`), which copies the talk into that group's queue (`routedFrom`, `suggestedBy`), records the share on the pool talk (`sharedWith`), logs it to Activity as a Talk, and emails the group's organizers and the speaker. A pool talk can't be accepted directly; a group accepts its own copy. New pool talks email the site's owner (`PROTECTED_ADMIN_EMAILS`).

**Views: an admin who also runs groups.** An admin can tick "Groups you run" on their own profile (`organizerOf` on their `approved_admins` record; `groupsOf()` in `lib/organizer-directory.ts` adds their `communityId`). The account menu then offers **View as** — DEVSA, or the organizer view of each group. In the page, `adminRole` / `adminCommunityId` hold the view on screen and `accountRole` / `accountCommunityId` the account's own, so every role check follows the switch. On the server only reads are narrowed: `/api/admin/data?view=<group>` takes the organizer branch, and RSVPs pass `communityId`. Writes still run with the account's real authority, which is why the view hides Hand off (an organizer-only route that would refuse an admin). A view narrows; nothing about it may widen access.

## Reads go through one endpoint

`GET /api/admin/data` is the dashboard's aggregate fetch — newsletter, speakers, volunteers, access requests, admins and communities in one response, already permission-filtered. Events, partners, RSVPs and Confluencia inquiries have their own routes.

If you add a tab, prefer extending `/api/admin/data` over a new route, unless the data is large or needs its own query params.

## Firestore collections

Names live in `COLLECTIONS` in `lib/firebase-admin.ts` — import from there, never write string literals. The dashboard touches: `events`, `communities`, `partners`, `event_rsvps`, `newsletter_subscriptions`, `speaker_submissions`, `volunteer_signups`, `access_requests`, `approved_admins`, `demo_day_inquiries`, `get_involved_inquiries`.

`getDb()` opens the **named** database `'devsa'`, not `(default)`. Any script you write against this data must pass `'devsa'` explicitly or it reads a different, near-empty database in the same project and reports zeros for everything.

## Patterns that repeat

**Firestore is the only source for events.** `GET /api/events` returns `{ events: firestoreEvents }` and imports nothing from `data/`. An earlier version of this skill said it merged seed events from `data/events.ts` and that Firestore won on slug collision — that is no longer true, and `data/events.ts` no longer holds an event array. Communities and partners never shadow Firestore either; `data/communities.ts` is a type plus a logo list, and `data/partners.ts` is gone. Do not reintroduce a static list for any of the three — the last one kept a deleted partner rendering across the site for weeks.

**Slugs: a readable default, or the organizer's own.** Events created from 2026-10-17 get title + short date in San Antonio time — `tech-tuesdays-oct-20` — with the year added only on a clash (`-oct-20-2027`), then `-2`, `-3`. Link-only events keep a random code, because a guessable address undoes the privacy. The drawer's **Customize the link** (admins only; the API ignores `slug` from anyone else, on create and edit) takes a custom one, validated against `RESERVED_EVENT_SLUGS` (the static pages under `/events`) and checked free. Organizers never set one: no organizer had in its first two weeks, and left open it let anyone claim a name like `the-model-2027` before DEVSA did. Changing an existing event's address pushes the old one into `slugHistory`; the event page and the share cards look up `slugHistory` and redirect, so shared links survive. All of it is in `lib/event-slug.ts` (server) and `lib/event-slug-shared.ts` (pure, used by the drawer's preview). Events from before that date keep their `-mv1cvoco`-style timestamp suffixes. The RSVPs tab groups by `eventId`, not slug, so an address change does not split an event's RSVPs.

**`?? null`, never `undefined`.** Firestore rejects `undefined` and the Admin SDK throws before it issues the RPC — `ignoreUndefinedProperties` is **not** set on this project. Coerce optional fields when writing.

> **Fixed 2026-10-28.** `PUT /api/communities` used to build its update with `updates.website = website || undefined` for all eleven link fields, so clearing a link threw and the admin got a 500. It now stores `null` for a cleared link. Don't reintroduce `|| undefined` anywhere.

**Partial updates.** Community edits build an update object from only the fields present in the request and apply it with `.update()`, so omitted fields survive. Don't switch these to `.set()`.

**Email failures don't fail the write.** RSVP confirmation emails are sent after the Firestore write and their errors are logged and swallowed. Keep that ordering — a Resend outage must not cost someone their RSVP.

**PATCH means something different per route.** On `communities` and `partners` it takes `{ orderedIds, adminEmail }` and rewrites display order for drag-to-reorder, admin only. On `events` it takes an `action` of `audit` or `fix`, a maintenance path, not a content edit.

## Event fields that gate each other

The event drawer is five sections (2026-11-01; it had been one long column that led with plumbing):

1. **Hosts:** Groups (an organizer's own group fixed, plus co-hosts; admins pick any), Partners, then **Official DEVSA event** for admins only.
2. **The event:** title, date + start + end on one row, Format as three buttons, venue and address.
3. **Details:** description; the one-line summary folded under "Add a one-line summary for the Monday Discord post".
4. **Registration:** one choice of External link / RSVP here / None. "None" is stored as no RSVP and no link, so `eventRegChoice` holds "External" while its link is still empty; the RSVP question and capacity fold under "More RSVP options".
5. **Publishing:** one **Visibility** menu (Published / Link only / Draft) writing `status` and `unlisted`; "Customize the link" (admins only) under it.

Two later additions. **Registration** carries an optional custom question (`rsvpQuestion`, plus `rsvpQuestionRequired`) that only mounts while the devsa.community RSVP form is selected; the API clears both whenever `rsvpEnabled` is false, and each RSVP stores the question's wording with its `answer`. **Link only (private)** (`unlisted`) sits under Status; every listing surface filters through `isListed()` in `lib/event-visibility.ts`, so a new surface that lists events must call it too.

`isOfficial` is the hinge, and it is admins only: the drawer hides it from organizers, and the API drops `isOfficial`, `brand` and `detailsUrl` from non-admins on create and ignores them on edit. **Activation branding** (`brand`) and **External details link** (`detailsUrl`) only mount while it is ticked, because neither means anything on an event DEVSA merely listed. Unticking clears both, and the submit handler derives both from the flag rather than from field state, so a record cannot end up branded-but-unofficial. If you add another field that only applies to DEVSA's own events, put it inside that same conditional and clear it the same way.

An event needs a title, a date, a description, an `organizerEmail`, and **at least one host** — a `communityId` or a `partnerId`. Location is not required, despite the form presenting Venue and Address prominently.

## Tabs in their own files

The page is being split up as it's worked on, not all at once. Already out of `app/admin/page.tsx`, each owning its own state and handlers: `components/admin/rsvps-tab.tsx` (RSVPs, check-in, waitlist, CSV, the message dialog), `admins-tab.tsx` (Manage Admins and its drawer), `activity-tab.tsx`, `newsletter-composer.tsx` (the Newsletter tab's drawer), `group-health.tsx` (the admin Overview's table), and `group-picker.tsx` (shared by your profile and Manage Admins). When you work on a tab still inside the page, move it out the same way: the page keeps data that other tabs read (`rsvps`, `events`, `admins`) and passes it down, and the tab takes `adminFetch`, `onError`, `onSuccess` and `onChanged` callbacks.

**Activity** (admins only) lists `activity_log` with Restore on deletes; see CLAUDE.md. **Manage Admins** sets an admin's "Groups they run" (`organizerOf`) as well as each admin's own profile can. A blank last sign-in reads "Not since Oct 12": nothing was recorded before Firebase sign-in arrived on 2026-10-12.

## Co-hosts, capacity, the door, and messages

**A group "hosts" an event by membership, never equality.** A collaboration stores `communityId: "alamo-python,pytexas"` (and co-hosting partners in `partnerId`). Use `isHostedBy()` from `lib/event-hosts.ts` for every "is this my group's event?" check. Until 2026-10 the events API compared with `===`, so a co-hosted event was missing from both organizers' Events tabs and refused both their edits. Organizers add co-host groups from the event drawer's **Hosts** field; an edit must leave their own group among the hosts. `includeAll` sends an organizer only their own group's drafts and link-only events, plus everyone's published, listed ones.

**Capacity** (`capacity`, only while the DEVSA RSVP form is on): past it, `POST /api/rsvp` saves the RSVP with `waitlisted: true`, counted and written in one transaction, and sends the waitlist email. Attendees can't cancel their own RSVP, so nothing frees a seat automatically: organizers **Move up** from the RSVPs tab (`PATCH /api/rsvp`, `action: 'promote'`), which sends the confirmation saying a spot opened. The waitlist gets change and cancellation notices but not reminders or messages. The event page's slug read returns `spotsLeft`.

**Check-in**: the RSVPs tab's "Came" box (`PATCH /api/rsvp`, `action: 'checkin'`, stamps `checkedInAt`). Turnout shows on the event's RSVP header and the organizer Overview.

**Message attendees** (`POST /api/events/notify`, `kind: 'message'`): the organizers' own note to the people going, from DEVSA with the sender as reply-to. Open from three days before to seven days after, two per event, logged in the event's `messages`. The rule is `lib/event-messages.ts`, shared by the route and the button. Pass plain text into the email templates; they escape it. `sanitizeInput` HTML-encodes, so using both double-escapes.

**Duplicate** on an event opens the create drawer filled from it: four weeks later at the same time, a fresh address, as a draft. **Add an organizer** (the handoff route) adds a co-organizer, or the next lead with "Step down".

## Rich text

Event descriptions are **markdown**, not HTML. An earlier version of this skill said the editor wrapped selections in `<strong>` and `<ul><li>`; it has written `**bold**` and `- item` for as long as the current tree has existed.

`components/rich-text-editor.tsx` is a textarea with a fixed toolbar (bold, italic, heading, bullets, numbered list, link; ⌘B / ⌘I / ⌘K) and a Write/Preview switch. Pasted bullet glyphs (`•`, `●`) are stored as `- `.

**One parser, everywhere.** `lib/event-markdown.ts` reads the markdown once. `components/events/event-description.tsx` renders it — on the event page *and* in the editor's Preview, so what an organizer previews is what goes out. Anything that can't render markup (calendar cards, .ics and Google Calendar notes, the RSS feed, JSON-LD, the Discord digest, the admin list) goes through `eventDescriptionToPlainText`. A new surface that shows a description uses one of those two. Writing another regex stripper is how there came to be five, and how calendar invites carried literal `**` into people's calendars.

**Summary** (`summary`, optional, 120 characters) sits under Description. It is the event's line in the Monday Discord digest; blank falls back to the description's first sentence (`eventTeaser` in `lib/discord.ts`). The API stores it as plain single-line text, `null` when empty.

## Uploads

Logos go to Vercel Blob via `POST /api/upload`. Allow-list: JPEG, PNG, WebP, SVG, GIF, max 5 MB. The route re-checks permissions — it is not an open endpoint.

| field sent | blob path | who may upload |
|---|---|---|
| `communityId` | `communities/{id}-{ts}.{ext}` | admin, or the organizer assigned to that community |
| `partnerId` | `partners/{id}-{ts}.{ext}` | admin only |

The branch keys on `partnerId !== null`, not on truthiness, so an unsaved record can still upload — it lands as `new-{ts}` and the form carries the returned URL into the create request. That distinction is also what stops an organizer reaching the partner path: sending `partnerId` takes the admin-only branch instead of falling through to the community check.

**Profile photos** take a third branch: `purpose=profile`, any signed-in admin, JPEG/PNG/WebP only. The browser crops to a 256px square first (`lib/profile-photo.ts`). The route files it at `profiles/{admin record id}-<random>` (the id comes from the token, never the form), writes `profileImage` itself and deletes the photo it replaces. `PATCH /api/admin/auth` can only *remove* a photo (`profileImage: null`), never set one, and `isProfilePhotoUrl()` gates every read. So no other address can become someone's photo; keep it that way if you touch either route.

## The Overview (landing tab)

Since 2026-10-28 every role lands on `overview` (unless a `?tab=` deep link says otherwise): `components/admin/admin-overview.tsx`, borrowed from next-geekdom's admin Overview. It shows what needs doing, using only data the role already receives.

- **Admins:** inbox counts (access requests, speakers to review, Get Involved, drafts), each a button to its tab; this week's calendar with RSVP counts; quick actions; group and organizer health (groups with no organizer, organizers not seen signing in, not in the directory, student leads' graduation terms); and a preview of the next Monday Discord digest from `GET /api/admin/digest-preview` (admin-only, posts nothing).
- **Organizers:** their own upcoming events and drafts, a checklist for their group's public page, their listed organizers, and other groups' events in the next 30 days (to prompt co-hosting). RSVP counts are hidden on other groups' events, because an organizer only receives their own group's RSVPs.
- **The digest preview and the cron share `gatherWeekDigestEvents`** (`lib/weekly-digest.ts`), so the preview is the message that will post. `buildWeeklyDigestPayload(events, at)` takes the post date for its "Week of" title; the cron leaves it as now.
- **"Not seen signing in"** counts organizers with no `lastLoginAt`, which means no sign-in since tracking began, not necessarily never. The tile says so.

## The organizer directory (Communities tab)

Since 2026-10-28 the Communities tab is also a directory of who runs each group, for the other organizers. It is never public.

- **Opt-in profiles on `approved_admins`:** `title`, `contactEmail`, `linkedin`, `gradTerm`, `inDirectory`, `profileConfirmedAt`, edited in the **Your profile** drawer (account menu, or the tab's nudge banner) and saved through `PATCH /api/admin/auth`. Every save stamps `profileConfirmedAt`; rows show it and go amber after six months.
- **What leaves the server** is decided once, in `toDirectoryEntry` (`lib/organizer-directory.ts`): opted-in people only, directory fields only. `/api/admin/data` returns `directory` to every role; organizers get it from an `inDirectory == true` query, so the rest of `approved_admins` never reaches them. LinkedIn must be a linkedin.com URL and the contact email must parse; both are refused, not stored, otherwise.
- **Groups** gained `kind` (`'tech' | 'student'`, absent = tech), `school` and `pastLeads` (`{ name, title, until }`, no contact details). The type and school are set in both community drawers.
- **The tab:** organizers see their own group on top (editable, with **Hand off to a new lead**), then every group as a read-only `DirectoryRow` from `components/admin/community-directory.tsx`. Admins see the same rows with Edit/Delete, and drag-to-reorder only while no search or filter is active, because reordering a filtered subset would write a partial order. Admins with no `communityId` who opt in are listed together as the **DEVSA team** row.
- **Handoff** (`POST /api/admin/handoff`) is organizer-only and scoped to the caller's own group: it creates organizer access for the successor (never moving someone from another group, never touching an admin) and sends the access-approved email. With `stepDown`, the caller's name and title go into `pastLeads` and their access is deleted, which signs them out.

## List tabs use the shared table system

Newsletter, Volunteers, Access Requests, Manage Admins and Confluencia are all built from `components/admin/data-table.tsx`: `TabHeader` (title, one-line summary of counts, actions), `DataTable`/`Th`/`Tr`/`Td`, `PrimaryCell` for the first column, `Pill`, `DateCell`, `LongText` for notes and messages, `RowAction(s)`, `EmptyState` and `ToolbarButton`. A new list tab should be assembled from these, not from class strings copied out of a neighbor — that is how the five tabs ended up with five header styles.

Readable text never goes below `text-neutral-400`. On the admin panel's ground `neutral-500` measures 4.3:1 and `neutral-600` 2.5:1, both under AA. Speakers is a review queue (list + detail) rather than a table, but its header uses `TabHeader` too. **Get Involved** is a table whose rows open a `SlideDrawer` (`Tr` takes `onClick`; give the row a real button too): the whole inquiry, its status, its past replies, and a reply box using `RichTextEditor`. `POST /api/admin/get-involved` sends the reply through Resend in the branded shell (`lib/emails/get-involved-reply.ts`, markdown rendered by `lib/emails/markdown.ts` with the event parser), with an optional button, reply-to the sending admin; `test: true` sends it to that admin and saves nothing. A combobox inside a table or drawer needs `floating`, or the scroll container clips its menu.

## Check-in at the door

`components/admin/checkin-door.tsx`, opened from each event's **Check in** button in the RSVPs tab, from the organizer Overview's "Check in: {event}" on the day of an event, or directly with `?tab=rsvps&checkin=<eventId>` (a door phone can keep it bookmarked). Built after next-sasw's door: a full-screen, phone-first screen with a 56px pinned search, a full-size Check in per row, a loud confirmation bar with Undo that clears itself, and "Add {name}" for a walk-in when nobody matches. Writes go through `lib/checkin-queue.ts`, which keeps them on the device when venue wifi drops and replays them, so every operation must stay safe to send twice:

- `PATCH /api/rsvp` `{ rsvpId, action: "checkin", value }` sets or clears `checkedInAt` (and `checkedInBy`).
- `PATCH /api/rsvp` `{ action: "walkin", eventId, clientId, firstName, lastName?, email? }` writes `door-<clientId>` once, already checked in, `source: "door"`, and sends no email. Admins, or organizers of a hosting group.

## The portal on a phone

Every tab must fit 390px without the page widening. Phones answer a page wider than the screen by zooming the whole portal out, so "the page doesn't scroll sideways" is not the test: measure `document.documentElement.scrollWidth` with a mobile viewport. Three causes found on 2026-11-01, worth checking first:

- A horizontal scroller (`overflow-x-auto`) that isn't `relative`: an absolutely positioned descendant, like a header's `sr-only` label, escapes it and widens the page. `DataTable`'s wrapper is relative for this reason.
- A grid or flex item without `min-w-0`, which won't shrink below its content (the Overview's tiles, the partner cards).
- Unbreakable text (a URL in a description) inside such an item.

Under `sm`, `.admin-table` (globals.css) turns `DataTable` rows and the RSVP list into stacked cards, and the page's panel drops its border and padding.
