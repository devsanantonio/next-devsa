# DEVSA - San Antonio Tech Community Hub

DEVSA is the central platform connecting San Antonio's tech community. We bridge the gap between passionate builders, local partners, and the growing tech ecosystem.

🌐 **Live Site:** [devsa.community](https://devsa.community)

## About

DEVSA started with a simple question: *"Where is the tech community in San Antonio?"*

We found 20+ tech-focused organizations scattered across the city, not collaborating and living in their own bubbles. So we built DEVSA to bring them together—a platform where you can discover tech communities that match your interests and where these groups can collaborate, share resources, and grow stronger together.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion (Framer Motion)](https://motion.dev/)
- **Database:** [Convex](https://convex.dev/) - Real-time backend
- **Authentication:** Convex Auth with [Resend](https://resend.com/) for magic links
- **Bot Protection:** [MAGEN](https://magenminer.io/) - Human-first verification
- **Deployment:** [Vercel](https://vercel.com/)
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/next-devsa.git
cd next-devsa

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see Environment Variables section)

# Start development server
pnpm dev
```

The app will be running at [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=dev:your-deployment

# MAGEN (Bot Protection)
MAGEN_API_KEY=your_magen_api_key
MAGEN_SECRET_KEY=your_magen_secret_key

# Resend (Email) - Set in Convex dashboard for production
AUTH_RESEND_KEY=your_resend_api_key
AUTH_RESEND_FROM=Your Name <noreply@yourdomain.com>
```

## Project Structure

```
next-devsa/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout with navbar/footer
│   ├── globals.css           # Global styles & Tailwind
│   ├── api/                  # API routes
│   │   ├── magen/            # MAGEN bot protection endpoints
│   │   └── og/               # Open Graph image generation
│   ├── events/               # Events pages
│   │   ├── page.tsx          # Community calendar
│   │   ├── create/           # Create event page
│   │   ├── community/[slug]/ # Dynamic community event pages
│   │   ├── morehumanthanhuman/ # AI Conference page
│   │   └── pysanantonio/     # PySA event page
│   ├── coworking-space/      # Geekdom coworking page
│   └── signin/               # Authentication page
│
├── components/               # React components
│   ├── hero-bridge.tsx       # Main hero section
│   ├── hero-communities.tsx  # Community showcase grid
│   ├── partner-section.tsx   # Partners carousel
│   ├── magen-newsletter-cta.tsx # Community spotlight section
│   ├── navbar.tsx            # Navigation bar
│   ├── footer.tsx            # Site footer
│   ├── events/               # Event-specific components
│   ├── coworking-space/      # Coworking page components
│   ├── pysa/                 # PySA event components
│   ├── aiconference/         # AI Conference components
│   └── icons/                # SVG icon components
│
├── convex/                   # Convex backend
│   ├── schema.ts             # Database schema
│   ├── auth.ts               # Authentication config
│   ├── events.ts             # Event mutations/queries
│   ├── users.ts              # User mutations/queries
│   ├── newsletter.ts         # Newsletter subscriptions
│   ├── speakers.ts           # Speaker submissions
│   └── _generated/           # Auto-generated Convex types
│
├── data/                     # Static data files
│   ├── communities.ts        # Tech community listings
│   ├── events.ts             # Community events
│   ├── partners.ts           # Partner organizations
│   └── pysa/                 # PySA event data
│       ├── sessions.ts       # Conference sessions
│       ├── speakers.ts       # Speaker information
│       └── sponsors.ts       # Event sponsors
│
├── lib/                      # Utility functions
│   ├── utils.ts              # General utilities (cn, etc.)
│   └── magen.ts              # MAGEN verification helpers
│
├── types/                    # TypeScript type definitions
│   └── magen.d.ts            # MAGEN types
│
└── public/                   # Static assets
```

## Contributing

We welcome contributions from the San Antonio tech community! Here's how you can help:

### Adding a New Community

1. Edit `data/communities.ts`
2. Add your community object following the existing format:

```typescript
{
  id: "your-community-id",
  name: "Your Community Name",
  description: "Brief description of your community",
  logo: "https://your-logo-url.png",
  color: "#yourBrandColor",
  website: "https://your-website.com",
  meetup: "https://meetup.com/your-group",
  discord: "https://discord.gg/your-invite",
}
```

### Adding a New Partner

1. Edit `data/partners.ts`
2. Add your partner organization:

```typescript
{
  id: "partner-id",
  name: "Partner Name",
  logo: "https://partner-logo-url.png",
  description: "What the partner does",
  website: "https://partner-website.com",
}
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/add-my-community`
3. Make your changes
4. Test locally with `pnpm dev`
5. Commit with a clear message: `git commit -m "Add XYZ Community to listings"`
6. Push to your fork: `git push origin feature/add-my-community`
7. Open a Pull Request with a description of your changes

## Development Commands

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Convex Commands

```bash
npx convex dev    # Start Convex development server
npx convex deploy # Deploy to production
npx convex env list --prod  # List production env vars
```

## Connect With Us

- 💬 [Discord](https://discord.gg/cvHHzThrEw)
- 🔗 [LinkedIn](https://www.linkedin.com/company/devsa)
- 📸 [Instagram](https://www.instagram.com/devsatx/)
- 🐦 [X (Twitter)](https://x.com/devsatx)
- 📺 [YouTube](https://www.youtube.com/@devsatx)
- 👥 [Facebook](https://www.facebook.com/devsatx)

