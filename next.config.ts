import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/groovy-ego-462522-v2.firebasestorage.app/**",
      },
      {
        protocol: "https",
        hostname: "devsa-assets.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images-api.printify.com",
      },
    ],
  },
  async redirects() {
    return [
      // The /jobs → /bounties redirects are gone with the bounty board itself.
      // They were the job-board-to-bounty-marketplace pivot, and forwarding one
      // removed feature to another removed feature is a 308 into a 404 — worse
      // than the 404 on its own, because a permanent redirect is cached by the
      // browser and the crawler that followed it. Both paths now 404, which is
      // what a withdrawn feature should do.

      // Legacy devsanantonio.com pages. That domain now redirects here
      // path-for-path, so old indexed URLs must resolve instead of 404ing.
      { source: "/mission", destination: "/buildingtogether", permanent: true },

      // SA Startup + Tech Week runs its own site, so DEVSA no longer hosts a
      // landing page or call for speakers for it. Permanent (308) — a future
      // year would live at its own slug, not this one.
      { source: "/startup-week-2026", destination: "https://www.sasw.co/", permanent: true },

      // Confluencia (first called Demo Day) left this site on 2026-10-13: 434
      // MEDIA activates it, with DEVSA as a partner. Links already shared land
      // on the calendar. DEVSA's own event on its own stage will get its own
      // slug when it has a name; do not reuse these.
      { source: "/events/confluencia", destination: "/events", permanent: true },
      { source: "/events/demo-day", destination: "/events", permanent: true },
      // The shop was removed on 2026-10-12. Old product links and shares land
      // on the donation form, the nearest thing to what a shopper came to do.
      { source: "/shop", destination: "/buildingtogether#donate", permanent: true },
      { source: "/shop/:path*", destination: "/buildingtogether#donate", permanent: true },
    ];
  },
};

// withBotId adds the proxy rewrites BotID needs. Without it the challenge
// script is served from a third-party origin and ad-blockers defeat it.
export default withBotId(nextConfig);
