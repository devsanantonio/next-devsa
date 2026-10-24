# DEVSA — San Antonio Tech Community Hub

DEVSA connects the people building San Antonio tech: the active learners and builders, the city's tech community groups, and the partners who back the work. This is the source of [devsa.community](https://www.devsa.community): one calendar, one public directory, and the pages for the rooms DEVSA puts on.

🌐 **Live Site:** [www.devsa.community](https://www.devsa.community)

## About

DEVSA started with a simple question: *"Where is the tech community in San Antonio?"*

The groups were always here. They ran in separate orbits, with no shared calendar and no single place for a newcomer to find them. In April 2024 there were about ten we could find; today there are 25, on one calendar, alongside the partners who back them.

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
- A Firebase project with Firestore and Authentication enabled
- A [Resend](https://resend.com/) account

### Setup

```bash
git clone https://github.com/devsanantonio/next-devsa.git
cd next-devsa
pnpm install
cp .env.example .env.local   # then fill in your keys
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000). See [.env.example](.env.example) for which variables are required versus optional — most features fail soft when their keys are absent, so you can run the site with just the Firebase and Resend blocks filled in.

### Creating the first admin

After deploying, bootstrap the first admin account. This only works once, while no admins exist:

```bash
curl -X POST https://your-domain.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "secret": "your_admin_setup_secret"}'
```

---

## How the codebase is organized

Standard Next.js App Router layout — routes in [app/](app/), UI in [components/](components/), server helpers and third-party clients in [lib/](lib/), and static seed data in [data/](data/).

One thing worth knowing before you start:

**Firestore is the source of truth for communities, partners and events, and nothing shadows it.** Add or delete one in the admin and every surface follows. [data/](data/) holds types and a couple of small seed arrays — no records.

This used to say `data/` was a fallback you had to write to as well. It was not a fallback: every surface imported it at module scope and none of them called the API, so the static list was the primary and Firestore was the copy nobody read. The two drifted, and a partner deleted in the admin kept rendering for weeks. Read partners through [lib/partners.ts](lib/partners.ts) on the server or `/api/partners` on the client.

---

## Key Features

### Community Calendar (`/events`)
Event listings aggregated across member communities, with RSVP capture, calendar feeds (`/api/events/feed`), and per-event Open Graph images. The primary front door for the community.

### Coworking (`/coworking-space`)
A record, not an offer. The room Geekdom hosted closed on 19 September 2026; the page was rewritten in past tense and unlinked from the nav, and its "ping an admin" form and live Discord presence check were removed with it. What is left is the volunteer wall and the thanks to Geekdom, which is why the URL still exists.

### Partners + Communities (`/buildingtogether`)
The 25 community groups and the partners who back the work, with a page for each.

### Admin Dashboard (`/admin`)
Protected dashboard for community organizers — manage events, communities, and admin users. Requires approved admin access recorded in Firestore.

---

## Development Commands

```bash
pnpm dev        # Dev server (Turbopack)
pnpm build      # Production build — the main correctness gate, since there is no broad test suite
pnpm lint       # ESLint
pnpm lint:fix   # ESLint with autofix
pnpm test:feed  # Vitest: events feed contract test
```

---

## Contributing

We welcome contributions from the San Antonio tech community, and first-time contributors especially. Start with an issue labeled [`good first issue`](https://github.com/devsanantonio/next-devsa/labels/good%20first%20issue), and read [CONTRIBUTING.md](CONTRIBUTING.md).

1. **Fork** the repository on GitHub and clone your fork
2. **Branch:** `git checkout -b feature/your-feature-name`
3. **Install:** `pnpm install`
4. **Develop:** `pnpm dev`
5. **Check your work:** `pnpm lint && pnpm build`
6. **Commit** with a clear message and push to your fork
7. **Open a Pull Request** against [the main repository](https://github.com/devsanantonio/next-devsa)

### Adding a community or partner

Both live in Firestore and are managed through the Admin Dashboard. There is no static copy to update: see "How the codebase is organized" above for why that copy was removed. If you run a San Antonio tech group and want it listed, ask in the [Discord](https://www.devsa.community/discord).

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
