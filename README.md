# DEVSA — San Antonio Tech Community Hub

DEVSA is the central platform connecting San Antonio's tech community. We bridge the gap between passionate builders, local partners, and the growing tech ecosystem.

🌐 **Live Site:** [www.devsa.community](https://www.devsa.community)

## About

DEVSA started with a simple question: *"Where is the tech community in San Antonio?"*

We found 20+ tech-focused organizations scattered across the city, not collaborating and living in their own bubbles. So we built DEVSA to bring them together—a platform where you can discover tech communities that match your interests and where these groups can collaborate, share resources, and grow stronger together.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router (Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion](https://motion.dev/), [Three.js](https://threejs.org/), [Paper shaders](https://github.com/paper-design/shaders)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore)
- **Auth:** [Firebase Authentication](https://firebase.google.com/docs/auth) — Google OAuth + email/password
- **Email:** [Resend](https://resend.com/)
- **Bot protection:** [Vercel BotID](https://vercel.com/docs/botid)
- **Payments:** [Stripe](https://stripe.com/)
- **Merch fulfillment:** [Printify](https://printify.com/)
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
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

**Firestore is the source of truth; [data/](data/) is a fallback.** Communities, partners, and events are read from Firestore and fall back to the checked-in TypeScript files when Firestore is unavailable or a document is missing. If you add a community or partner, it needs to exist in both places to render reliably.

---

## Key Features

### Community Calendar (`/events`)
Event listings aggregated across member communities, with RSVP capture, calendar feeds (`/api/events/feed`), and per-event Open Graph images. The primary front door for the community.

### Coworking (`/coworking-space`)
The Geekdom coworking partnership page, including a "ping an admin" inquiry form that reaches a real person.

### Partners + Communities (`/buildingtogether`)
Discover 20+ local tech communities and partner organizations.

### Shop (`/shop`)
DEVSA merch, checked out through Stripe and fulfilled by Printify.

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

We welcome contributions from the San Antonio tech community.

1. **Fork** the repository on GitHub and clone your fork
2. **Branch:** `git checkout -b feature/your-feature-name`
3. **Install:** `pnpm install`
4. **Develop:** `pnpm dev`
5. **Check your work:** `pnpm lint && pnpm build`
6. **Commit** with a clear message and push to your fork
7. **Open a Pull Request** against [the main repository](https://github.com/devsanantonio/next-devsa)

### Adding a community or partner

Both are managed through the Admin Dashboard, but the static fallback lives in [data/communities.ts](data/communities.ts) and [data/partners.ts](data/partners.ts). Add your entry there too, matching the shape of the existing records — the fallback is what renders if Firestore is unreachable.

---

## Connect With Us

- 💬 [Discord](https://discord.gg/cvHHzThrEw)
- 🔗 [LinkedIn](https://www.linkedin.com/company/devsa)
- 📸 [Instagram](https://www.instagram.com/devsatx/)
- 🐦 [X (Twitter)](https://x.com/devsatx)
- 📺 [YouTube](https://www.youtube.com/@devsatx)
- 👥 [Facebook](https://www.facebook.com/devsatx)
