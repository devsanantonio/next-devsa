# next-devsa

Next.js 16 App Router site for DEVSA, San Antonio's tech community hub. Firestore + Firebase Auth, deployed on Vercel.

## Verification

`pnpm build` is the real gate — there is no broad test suite (one Vitest file, `pnpm test:feed`).

`pnpm lint` currently exits 1 on ~15 pre-existing errors (unescaped entities, setState-in-effect, impure calls during render). A non-zero exit does not mean you broke something — compare against the errors already on `main` before assuming your change caused one.

Deleting or renaming an API route poisons the Turbopack route-type cache: the build fails with `Cannot find module '../../../app/api/<deleted>/route.js'` from `.next/dev/types/validator.ts`. Fix with `rm -rf .next` and rebuild.

## Firestore

Firestore is the source of truth for **communities, partners and events**, and nothing shadows it. Add or delete one in the admin and every surface follows.

This used to say `data/` held a static fallback and that adding a record meant writing to both places. That is no longer true, and while it was, it was not really a fallback:

- **Communities** migrated first. `data/communities.ts` is now a `TechCommunity` type and a small `COMMUNITY_LOGOS` array that seeds one dropdown — no records.
- **Partners** migrated after a partner deleted in the admin kept rendering on the homepage, on Building Together and on its own URL. Every surface imported `data/partners.ts` at module scope and none of them called `/api/partners`, so the static list was the primary and Firestore was the copy nobody read. The two had drifted to eleven records against ten. That file is gone; read partners through `lib/partners.ts` on the server or `/api/partners` on the client.

The lesson worth keeping: a "fallback" that is consulted unconditionally is not a fallback, it is a second source of truth, and it will drift. If you add one, make it fire only on error.

`/api/admin/migrate` no longer writes partners. It used to seed Firestore from the static file, which meant running a migration would resurrect a partner an admin had deliberately deleted. Both halves are no-ops now.

## Real time is the contract for admin changes

Adds, edits and deletes in the admin must show on the public site immediately. Every client-facing surface honours this by reading its data at request time:

- the homepage wall, `/buildingtogether`, the calendar list and the event pages all fetch `/api/communities`, `/api/partners` or `/api/events` client-side — always live
- `/buildingtogether/[slug]` and `/events/[slug]` render per request, with **no** `generateStaticParams` and no `revalidate`

`/buildingtogether/[slug]` was briefly prerendered with `dynamicParams = false`. That bought a correct 404 status, and cost a deploy before any newly added partner or community had a page — `generateStaticParams` only runs at build time. The trade was wrong for admin-managed content and was reverted. **Do not reintroduce it.** If prerendering is ever wanted back, it needs a deploy webhook on admin writes first.

## Unknown slugs answer 200, and are noindexed

`notFound()` fires after the response has begun streaming, so it cannot take back a status header already sent. `/buildingtogether/<unknown>` and `/events/<unknown>` therefore render the not-found page with a **200**. Things that were tried and do not change it: adding `app/not-found.tsx` (it improves the page, not the status), and removing `generateStaticParams` to make the route fully dynamic. Only `dynamicParams = false` produces a real 404, by moving the decision to the router — and that is the option ruled out above.

The exposure was search engines indexing soft 404s, so `generateMetadata` on both routes returns `robots: { index: false, follow: false }` for slugs that resolve to nothing. Crawlers drop them; the status stays imperfect. If you touch either `generateMetadata`, keep that branch.

## Bot protection

Public unauthenticated POST endpoints are protected by Vercel BotID. Two files must agree:

- `instrumentation-client.ts` lists the protected paths — this is what attaches classification headers
- the route calls `checkBotId()` and returns 403 when `isBot`

A route that calls `checkBotId()` without a matching entry in `instrumentation-client.ts` fails closed and rejects real users. Adding a new public form means editing both.

`checkBotId()` always returns `isBot: false` in local dev. In production it blocks `curl` and direct navigation by design — test protected routes with a `fetch` from a page in the app, not from a terminal.

## Removed: the bounty board and the Discord digests

`/bounties` and everything under it is gone — pages, API routes, `components/jobs/`, `components/bounties/`, the account layer (`/api/auth/verify`, `/api/messages`, `/api/notifications`, `lib/auth-middleware.ts`), Stripe Connect payouts, and the job/bounty types in `lib/firebase-admin.ts`. `/jobs` and `/bounties` now 404; the old redirects went with them.

The three Discord digest crons went too — `/api/events/weekly-digest`, `/api/news-digest`, `/api/youtube-digest` — and with them all of `lib/discord.ts` and the `rss-parser` dependency. `vercel.json` is down to one cron, `/api/shop/reconcile`.

**Their thirteen Firestore collections still hold 2,444 documents.** Nothing reads them, but the data is there — including 12 `job_board_users`, real accounts whose owners can no longer sign in. See the `COLLECTIONS` comment in `lib/firebase-admin.ts` for the counts and what is safe to clear.

## Firestore uses a NAMED database

`getDb()` opens `getFirestore(app, 'devsa')`. There is also a `(default)` database in the same project holding an unrelated app's data — `crm_*`, `blog_posts`, a 4-document `events` collection.

Any script written against this data must pass `'devsa'` explicitly. `getFirestore(app)` connects to `(default)` without erroring and returns zero for every DEVSA collection, which reads as "empty" rather than "wrong database". This has already produced one false all-clear in this repo.

Two things that survived and look like they shouldn't:

- **Stripe** — the shop uses it. Only Connect went.
- **`STATUS_API_TOKEN` and `DISCORD_BOT_BASE_URL`** — these drive the Discord *bot* behind the coworking page's live status and "ping an admin", not the digest webhooks. `CRON_SECRET` likewise still guards `/api/shop/reconcile` and `/api/shop/orders`.

The dead Vercel env vars (`DISCORD_JOBS_WEBHOOK_URL`, `DISCORD_EVENTS_WEBHOOK_URL`, `DISCORD_NEWS_WEBHOOK_URL`, `DISCORD_YOUTUBE_WEBHOOK_URL`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORG_ID`) have been deleted from the project.

## Naming leftovers

- Canonical host is `www.devsa.community`. Bare `devsa.community` and the legacy `devsanantonio.com` redirect to it, so absolute URLs should use the `www` form.

## Working here

Product judgment for this site — what to lead with, who the audience is — lives in memory, not here. Check it before restructuring pages or CTAs.

Skills in `.claude/skills/` cover recurring procedures (admin dashboard internals, adding an API route, adding an OG image route). Load the relevant one instead of pattern-matching from a neighboring file.
