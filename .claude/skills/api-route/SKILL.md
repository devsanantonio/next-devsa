---
name: api-route
description: Conventions for adding or changing a route handler under app/api/ — bot protection, rate limiting, input sanitizing, Firestore writes, auth, and Vercel cron endpoints. Use when creating a new API route, adding an endpoint behind a public form, or reviewing an existing handler in this repo.
---

# Adding an API route

Routes live at `app/api/<name>/route.ts` and export named HTTP methods. Compose the four `lib/` helpers below as the endpoint's exposure requires — they're independent, and most routes need only some of them.

## Pick the gates by exposure

**Public, unauthenticated, and it writes or sends mail** (newsletter, RSVP, speaker submissions, contact forms):

```ts
import { checkBotId } from 'botid/server';

export async function POST(request: NextRequest) {
  const { isBot } = await checkBotId();
  if (isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  // ...
}
```

Then add the path to `instrumentation-client.ts`:

```ts
{ path: '/api/your-route', method: 'POST' },
```

**Both edits are required.** `checkBotId()` without a client entry fails closed and rejects real users; a client entry without a server check does nothing. `checkBotId()` always returns `isBot: false` in local dev, and blocks `curl` in production — test with a `fetch` from a page in the app.

**Also expensive or attention-costing** (sends email, pings a human, calls a paid API) — add rate limiting on top:

```ts
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const limit = rateLimit(getClientIp(request), 5, 60_000);
if (!limit.success) return rateLimitResponse(limit.resetMs);
```

The limiter is in-memory and therefore per-serverless-instance — it blunts bursts, it does not enforce a global quota. Treat it as defense in depth behind BotID, not as the primary control.

**Authenticated user routes** (bounties, profiles, messages) use Firebase ID tokens:

```ts
import { verifyJobBoardUser } from '@/lib/auth-middleware';

const result = await verifyJobBoardUser(request, { requireProfile: true });
if (result instanceof NextResponse) return result; // already an error response
const { uid, email, profile, isSuperAdmin } = result;
```

The `instanceof NextResponse` early return is the idiom — don't rewrite it into a try/catch.

**Admin routes** authenticate differently: they look up an email against the `approved_admins` collection rather than verifying a token. See the `admin-features` skill.

**Vercel cron routes** (registered in `vercel.json`) must check `CRON_SECRET` from the `Authorization` header before doing work, since the path is publicly reachable.

## Always sanitize free text

Anything a user types that will later be stored or rendered goes through `lib/sanitize.ts`:

```ts
import { sanitizeInput, sanitizeHtml } from '@/lib/sanitize';

const name = sanitizeInput(body.name.trim().slice(0, 100));   // strips all tags
const bio = sanitizeHtml(body.bio);                            // keeps safe formatting
```

Use `sanitizeInput` for plain fields and `sanitizeHtml` only where formatted output is intended. Cap length at the same time — the allow-list doesn't bound size.

## Firestore writes

Import collection names from `COLLECTIONS` in `lib/firebase-admin.ts`; don't inline string literals.

Coerce every optional field with `?? null` before writing — Firestore rejects `undefined` and the failure surfaces as an opaque write error.

Add the document's TypeScript interface to `lib/firebase-admin.ts` alongside the others rather than declaring it in the route.

## Ordering and failure behavior

Cheap local checks first, then network calls: rate limit → bot check → validation → Firestore → email. Get the persistent write done before side effects.

Side effects that aren't the user's goal — confirmation emails, Discord webhooks, LinkedIn posts — go after the write, wrapped in try/catch, logged and swallowed. A Resend outage must not cost someone their RSVP.

Optional integrations fail soft. Follow the `isResendConfigured()` pattern: when the key is absent, skip the feature and continue rather than throwing, so the site runs locally with a partial `.env.local`.

## Errors

Return `NextResponse.json({ error: '...' }, { status })` with a message safe to show a user. Log the real error server-side. Conventions in use: 400 validation, 403 bot/permission, 404 missing, 409 duplicate, 429 rate limited, 500 unexpected.

## After adding a route

If you deleted or renamed one, `rm -rf .next` before building — the Turbopack route-type validator caches stale route paths and fails the build.
