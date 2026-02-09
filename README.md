# DEVSA - San Antonio Tech Community Hub

DEVSA is the central platform connecting San Antonio's tech community. We bridge the gap between passionate builders, local partners, and the growing tech ecosystem.

🌐 **Live Site:** [devsa.community](https://devsa.community)

## About

DEVSA started with a simple question: *"Where is the tech community in San Antonio?"*

We found 20+ tech-focused organizations scattered across the city, not collaborating and living in their own bubbles. So we built DEVSA to bring them together—a platform where you can discover tech communities that match your interests and where these groups can collaborate, share resources, and grow stronger together.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion (Framer Motion)](https://motion.dev/)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore) — NoSQL cloud database
- **Auth:** [Firebase Authentication](https://firebase.google.com/docs/auth) — Google OAuth + Email/Password
- **Email:** [Resend](https://resend.com/) — Transactional emails
- **Bot Protection:** [MAGEN](https://magenminer.io/) — Human-first verification
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — File uploads
- **Deployment:** [Vercel](https://vercel.com/)
- **Analytics:** Vercel Analytics

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm
- A Firebase project with Firestore and Authentication enabled
- A [Resend](https://resend.com/) account (for transactional emails)

### 1. Clone the Repository

```bash
git clone https://github.com/devsanantonio/next-devsa.git
cd next-devsa
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Google Firestore — Service Account Key (JSON string)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}

# MAGEN (Bot Protection)
MAGEN_API_KEY=your_magen_api_key
MAGEN_SECRET_KEY=your_magen_secret_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Admin Setup (one-time use to create first admin)
ADMIN_SETUP_SECRET=your_random_secret_for_initial_setup
```

### 4. Start the Dev Server

```bash
pnpm dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### 5. Setting Up the First Admin

After deploying, create the first admin by making a POST request:

```bash
curl -X POST https://your-domain.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "secret": "your_admin_setup_secret"}'
```

This only works once when no admins exist in the system.

---

## Project Structure

```
next-devsa/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout (navbar + footer)
│   ├── globals.css               # Global styles + Tailwind
│   ├── robots.ts                 # SEO robots config
│   ├── sitemap.ts                # Dynamic sitemap
│   │
│   ├── admin/                    # 🔒 Admin Dashboard
│   │   ├── page.tsx              # Admin dashboard (events, communities, admins)
│   │   └── create-event/         # Create new community event
│   │       └── page.tsx
│   │
│   ├── jobs/                     # 💼 Job Board
│   │   ├── page.tsx              # Jobs landing page (hero + listings)
│   │   ├── layout.tsx            # Jobs layout (auth provider)
│   │   ├── signin/               # Firebase Auth sign-in
│   │   │   └── page.tsx
│   │   ├── post/                 # Post a new job listing
│   │   │   └── page.tsx
│   │   ├── [slug]/               # Individual job detail page
│   │   │   └── page.tsx
│   │   ├── admin/                # Jobs super-admin panel
│   │   │   └── page.tsx
│   │   └── dashboard/            # Authenticated user dashboard
│   │       ├── page.tsx          # Dashboard home (stats, activity)
│   │       ├── profile/          # Edit user profile
│   │       ├── messages/         # Direct messages
│   │       └── notifications/    # Notification center
│   │
│   ├── buildingtogether/         # Partners + Communities hub
│   │   ├── page.tsx              # Logo grid hero page
│   │   └── [slug]/               # Individual community/partner page
│   │       ├── page.tsx
│   │       ├── group-page-client.tsx
│   │       └── partner-page-client.tsx
│   │
│   ├── events/                   # Community Events
│   │   ├── page.tsx              # Events calendar
│   │   ├── [slug]/               # Dynamic event detail pages
│   │   ├── morehumanthanhuman/   # AI Conference page
│   │   └── pysanantonio/         # PySA event page
│   │
│   ├── coworking-space/          # Geekdom coworking page
│   ├── devsatv/                  # DEVSA TV content page
│   ├── signin/                   # Admin access request page
│   │
│   └── api/                      # API Routes
│       ├── admin/                # Admin endpoints
│       │   ├── auth/             # Admin authentication
│       │   ├── data/             # Admin data management
│       │   ├── migrate/          # Data migration utilities
│       │   └── setup/            # First-time admin setup
│       ├── auth/                 # Firebase Auth
│       │   └── verify/           # Token verification
│       ├── jobs/                 # Job listings CRUD
│       │   ├── route.ts          # GET/POST jobs
│       │   ├── admin/            # Jobs admin endpoints
│       │   ├── applications/     # Job applications
│       │   └── comments/         # Job comments/discussions
│       ├── job-board/            # Job board user management
│       │   ├── profile/          # User profile CRUD
│       │   └── upload/           # Profile image uploads
│       ├── communities/          # Communities CRUD
│       ├── events/               # Events CRUD
│       ├── messages/             # Direct messaging
│       ├── notifications/        # Notifications
│       ├── newsletter/           # Newsletter subscription
│       ├── rsvp/                 # Event RSVP
│       ├── ai-conference/        # AI Conference registration
│       ├── call-for-speakers/    # Speaker submissions
│       ├── access-request/       # Organizer access requests
│       ├── upload/               # General file uploads
│       ├── magen/                # MAGEN bot protection
│       │   ├── health/           # Health check
│       │   ├── start-session/    # Start verification session
│       │   └── verify/           # Verify session
│       └── og/                   # Open Graph image generation
│           ├── buildingtogether/
│           ├── coworking-space/
│           ├── devsatv/
│           ├── event/
│           ├── events/
│           └── morehumanthanhuman/
│
├── components/                   # React Components
│   ├── navbar.tsx                # Site navigation
│   ├── footer.tsx                # Site footer
│   ├── hero-bridge.tsx           # Homepage hero
│   ├── hero-communities.tsx      # Community showcase grid
│   ├── partner-section.tsx       # Partners carousel
│   ├── auth-provider.tsx         # Firebase Auth context provider
│   ├── auth-button.tsx           # Auth button component
│   ├── newsletter-form.tsx       # Newsletter signup
│   ├── access-request-form.tsx   # Organizer access request
│   ├── magen-newsletter-cta.tsx  # Community spotlight section
│   ├── glowing-effect.tsx        # Glowing border effect
│   ├── rich-text-editor.tsx      # Rich text editor
│   ├── slide-out-menu.tsx        # Mobile slide-out menu
│   ├── social-media-menu.tsx     # Social media links panel
│   ├── terminal-dropdown.tsx     # Terminal-style dropdown
│   ├── events-popup.tsx          # Events notification popup
│   ├── jobs/                     # Job board components
│   │   ├── jobs-navbar.tsx       # Jobs-specific navigation
│   │   ├── job-card.tsx          # Job listing card
│   │   ├── job-filters.tsx       # Search + filter controls
│   │   ├── comment-section.tsx   # Job discussion thread
│   │   ├── message-thread.tsx    # Direct message UI
│   │   └── notification-bell.tsx # Notification indicator
│   ├── events/                   # Event components
│   ├── partners/                 # Partner/community components
│   ├── coworking-space/          # Coworking page components
│   ├── aiconference/             # AI Conference components
│   ├── pysa/                     # PySA event components
│   ├── devsatv/                  # DEVSA TV components
│   └── icons/                    # SVG icon components
│
├── data/                         # Static Data (fallback)
│   ├── communities.ts            # Tech community listings
│   ├── events.ts                 # Community events
│   ├── partners.ts               # Partner organizations
│   └── pysa/                     # PySA event data
│       ├── sessions.ts
│       ├── speakers.ts
│       ├── faqs.ts
│       └── partners.ts
│
├── lib/                          # Utilities + Config
│   ├── firebase-admin.ts         # Firebase Admin SDK (server)
│   ├── firebase.ts               # Firebase Client SDK (browser)
│   ├── auth-middleware.ts        # Auth middleware helpers
│   ├── magen.ts                  # MAGEN verification helpers
│   ├── resend.ts                 # Resend email client
│   ├── utils.ts                  # General utilities (cn, etc.)
│   ├── emails/                   # Email templates
│   │   ├── access-approved.ts
│   │   ├── access-request-received.ts
│   │   └── speaker-thank-you.ts
│   └── hooks/                    # Custom React hooks
│
├── types/                        # TypeScript Type Definitions
│   └── magen.d.ts
│
└── public/                       # Static Assets
```

---

## Key Features

### Admin Dashboard (`/admin`)
Protected dashboard for community organizers. Manage events, communities, and admin users. Requires approved admin access via Firestore.

### Job Board (`/jobs`)
Full-featured job board for the San Antonio tech ecosystem:
- **For employers:** Post W2, 1099, or equity-based roles
- **For job seekers:** Browse listings, filter by type/location, apply directly
- **Dashboard:** Profile management, messaging, notifications
- **Auth:** Firebase Authentication (Google OAuth + email/password)

### Partners + Communities (`/buildingtogether`)
Discover 20+ local tech communities and partner organizations. Data is sourced from Firestore with a static fallback.

### Events (`/events`)
Community event calendar with RSVP functionality. Includes special event pages for the AI Conference and PySA.

---

## Contributing

We welcome contributions from the San Antonio tech community!

### How to Contribute

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/next-devsa.git
   cd next-devsa
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies:**
   ```bash
   pnpm install
   ```
5. **Make your changes** and test locally:
   ```bash
   pnpm dev
   ```
6. **Run the linter:**
   ```bash
   pnpm lint
   ```
7. **Commit** with a clear message:
   ```bash
   git commit -m "Add: brief description of your change"
   ```
8. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open a Pull Request** on the [main repository](https://github.com/devsanantonio/next-devsa) with a description of your changes

### Adding a New Community

Communities are managed through the Admin Dashboard, but static fallback data lives in `data/communities.ts`:

```typescript
{
  id: "your-community-id",
  name: "Your Community Name",
  description: "Brief description of your community",
  logo: "https://your-logo-url.png",
  website: "https://your-website.com",
  meetup: "https://meetup.com/your-group",
  discord: "https://discord.gg/your-invite",
}
```

### Adding a New Partner

Edit `data/partners.ts`:

```typescript
{
  id: "partner-id",
  name: "Partner Name",
  logo: "https://partner-logo-url.png",
  description: "What the partner does",
  website: "https://partner-website.com",
}
```

---

## Development Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

---

## Connect With Us

- 💬 [Discord](https://discord.gg/cvHHzThrEw)
- 🔗 [LinkedIn](https://www.linkedin.com/company/devsa)
- 📸 [Instagram](https://www.instagram.com/devsatx/)
- 🐦 [X (Twitter)](https://x.com/devsatx)
- 📺 [YouTube](https://www.youtube.com/@devsatx)
- 👥 [Facebook](https://www.facebook.com/devsatx)

