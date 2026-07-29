# next-devsa

Next.js 16 App Router site for DEVSA, San Antonio's tech community hub. Firestore + Firebase Auth, deployed on Vercel.

## Verification

`pnpm build` is the real gate — there is no broad test suite (one Vitest file, `pnpm test:feed`).

`pnpm lint` currently exits 1 on ~15 pre-existing errors (unescaped entities, setState-in-effect, impure calls during render). A non-zero exit does not mean you broke something — compare against the errors already on `main` before assuming your change caused one.

Deleting or renaming an API route poisons the Turbopack route-type cache: the build fails with `Cannot find module '../../../app/api/<deleted>/route.js'` from `.next/dev/types/validator.ts`. Fix with `rm -rf .next` and rebuild.

## Firestore

Firestore is the source of truth; the TypeScript files in `data/` are a static fallback rendered when a document is missing or Firestore is unreachable. Adding a community, partner, or event usually means writing to both — about 15 files read the fallback path.

Firestore rejects `undefined`. Coerce optional fields with `?? null` before writing, never leave them undefined.

`GOOGLE_SERVICE_ACCOUNT_KEY` is the entire service-account JSON as a single env string, parsed lazily in `lib/firebase-admin.ts`. A malformed value throws on first Firestore call, not at boot, so failures surface deep in a request.

## Bot protection

Public unauthenticated POST endpoints are protected by Vercel BotID. Two files must agree:

- `instrumentation-client.ts` lists the protected paths — this is what attaches classification headers
- the route calls `checkBotId()` and returns 403 when `isBot`

A route that calls `checkBotId()` without a matching entry in `instrumentation-client.ts` fails closed and rejects real users. Adding a new public form means editing both.

`checkBotId()` always returns `isBot: false` in local dev. In production it blocks `curl` and direct navigation by design — test protected routes with a `fetch` from a page in the app, not from a terminal.

## Naming leftovers

- `components/jobs/` holds the **bounty** marketplace UI. The job board was renamed; `/jobs` and `/api/jobs` permanently redirect to `/bounties` (see `next.config.ts`).
- Canonical host is `www.devsa.community`. Bare `devsa.community` and the legacy `devsanantonio.com` redirect to it, so absolute URLs should use the `www` form.

## Working here

Product judgment for this site — what to lead with, who the audience is — lives in memory, not here. Check it before restructuring pages or CTAs.

Skills in `.claude/skills/` cover recurring procedures (admin dashboard internals, adding an API route, adding an OG image route). Load the relevant one instead of pattern-matching from a neighboring file.
