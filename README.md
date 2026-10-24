# DEVSA — San Antonio Tech Community Hub

DEVSA connects the people building San Antonio tech: the active learners and builders, the city's tech community groups, and the partners who back the work. This is the source of [devsa.community](https://www.devsa.community): one calendar, one public directory, and the pages for the rooms DEVSA puts on.

🌐 **Live Site:** [www.devsa.community](https://www.devsa.community)

## About

DEVSA started with a simple question: *"Where is the tech community in San Antonio?"*

The groups were always here. They ran in separate orbits, with no shared calendar and no single place for a newcomer to find them. In April 2024 there were about ten we could find; today there are 25, on one calendar, alongside the partners who back them.

DEVSA's work is the rooms: getting the people who build San Antonio tech into the same place. The calendar and the directory exist so those rooms are easy to find, and nothing on the calendar is a sales pitch.

---

## What's on the site

**The rooms DEVSA puts on.** Each conference has its own pages under [app/events/](app/events/):

| Route | What it is |
|---|---|
| `/events/pysanantonio` | PySanAntonio, San Antonio's Python conference, with the 2025 sessions and livestream |
| `/events/morehumanthanhuman` | More Human Than Human, DEVSA's AI conference |
| `/events/access-granted` | Access Granted, a hands-on security room during SA Startup + Tech Week |
| `/events/the-model` | The Model: creatives, founders and builders in the same room |
| `/events/zero-to-agent` | Zero to Agent, San Antonio's part of Vercel's global build week |

**The community calendar (`/events`).** Every group's events in one list, with a page per event at `/events/[slug]`, RSVPs, and calendar subscriptions for Google, Apple and Outlook. It's how people find the rooms, DEVSA's and everyone else's.

**Building Together (`/buildingtogether`).** The 25 community groups and the partners who back the work, with a page for each at `/buildingtogether/[slug]`. It also explains how DEVSA helps a group put something on (DEVSA doesn't run your event; it finds the room, the people who can teach, and access to a network of builders), and takes **donations** at `#donate`, through Stripe.

**About (`/about`).** Where DEVSA came from, and the volunteer board that runs it.

**Also in here:**

- **Discord automation.** Two Vercel crons in [vercel.json](vercel.json): the Monday digest of the week's events (`/api/events/weekly-digest`), and weekday prompts in the Discord (`/api/discord/prompts`: a question or poll in #vibe-chat, Build-and-tell Friday in #build-and-tell).
- **A public events feed.** RSS at `/api/events/feed`, with a schema and an iCalendar subscription. It's documented, with examples, in [community-calendar-api](https://github.com/devsanantonio/community-calendar-api).
- **[llms.txt](app/llms.txt)** for AI agents that read the site.
- **Admin (`/admin`).** Where organizers manage events, groups, partners and admins. Access is by approved email, recorded in Firestore.
- **`/coworking-space`**, a thank-you to Geekdom and the volunteers who kept the coworking space open. The space closed in September 2026.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router (Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion](https://motion.dev/), [Three.js](https://threejs.org/), [Paper shaders](https://github.com/paper-design/shaders)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore)
- **Auth:** [Firebase Authentication](https://firebase.google.com/docs/auth) — Google OAuth + email/password
- **Email:** [Resend](https://resend.com/)
- **Bot protection:** [Vercel BotID](https://vercel.com/docs/botid)
- **Donations:** [Stripe](https://stripe.com/)
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.9+
- [pnpm](https://pnpm.io/)
- A Firebase project with Firestore and Authentication enabled, for anything that reads events, groups or partners

### Setup

```bash
git clone https://github.com/devsanantonio/next-devsa.git
cd next-devsa
pnpm install
cp .env.example .env.local   # then fill in what you need
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000). [.env.example](.env.example) says what each variable is for. Most features fail soft when their keys are absent, so plenty of changes (copy, layout, components, lint fixes) need no keys at all.

### Creating the first admin

On a new deployment, bootstrap the first admin account. This only works once, while no admins exist:

```bash
curl -X POST https://your-domain.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "secret": "your_admin_setup_secret"}'
```

---

## How the codebase is organized

Standard Next.js App Router layout: routes in [app/](app/), UI in [components/](components/), server helpers and third-party clients in [lib/](lib/), and types and small seed arrays in [data/](data/).

**Firestore is the source of truth for groups, partners and events, and nothing shadows it.** Add or delete one in the admin and every page follows. Read them through the API routes (`/api/communities`, `/api/partners`, `/api/events`) on the client, or [lib/partners.ts](lib/partners.ts) on the server. Don't add a static copy: [CLAUDE.md](CLAUDE.md) explains what happened the last time there was one.

Before adding or restyling a section, read the design system in [.claude/skills/design-system/SKILL.md](.claude/skills/design-system/SKILL.md). There's no component library, so it's what keeps the pages consistent.

---

## Development Commands

```bash
pnpm dev             # Dev server (Turbopack)
pnpm build           # Production build: the real gate, since the test suite is small
pnpm exec vitest run # All tests
pnpm test:feed       # Just the events feed contract test
pnpm lint            # ESLint (already fails on main; see below)
pnpm lint:fix        # ESLint with autofix
```

`pnpm lint` reports a handful of errors that are already on `main`. That doesn't mean your change broke something: compare against `main`, and don't add new ones. Fixing the existing ones is a [good first issue](https://github.com/devsanantonio/next-devsa/labels/good%20first%20issue).

---

## Contributing

We welcome contributions from the San Antonio tech community, and first-time contributors especially. Start with an issue labeled [`good first issue`](https://github.com/devsanantonio/next-devsa/labels/good%20first%20issue), and read [CONTRIBUTING.md](CONTRIBUTING.md).

1. **Fork** the repository and clone your fork
2. **Branch:** `git checkout -b your-change`
3. **Install and run:** `pnpm install`, then `pnpm dev`
4. **Check your work:** `pnpm build` must pass, and `pnpm lint` should show no new errors
5. **Open a pull request** saying what you changed, why, and how you checked it. Add screenshots for anything visual.

**Want your group listed?** Groups and partners are managed in the admin, not in code. Ask in the [Discord](https://www.devsa.community/discord).

**Want to build on DEVSA's data, or San Antonio's?** See [community-calendar-api](https://github.com/devsanantonio/community-calendar-api) for the calendar, [localhost](https://github.com/devsanantonio/localhost) for the City, County and VIA's open data, and [devsa-sessions](https://github.com/devsanantonio/devsa-sessions) for the live build sessions.

---

## License

The code is [MIT](LICENSE). The DEVSA name and logos, and the photographs, community and partner logos in [public/](public/), are not covered by it. See [LICENSE](LICENSE).

---

## Connect With Us

- 💬 [Discord](https://www.devsa.community/discord)
- 🔗 [LinkedIn](https://www.linkedin.com/company/devsa)
- 📸 [Instagram](https://www.instagram.com/devsatx/)
- 🐦 [X (Twitter)](https://x.com/devsatx)
- 📺 [YouTube](https://www.youtube.com/@devsatx)
- 👥 [Facebook](https://www.facebook.com/devsatx)
