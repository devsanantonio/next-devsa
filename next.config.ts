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
      // Job board → bounty marketplace pivot. Permanent (308) so old Discord
      // and LinkedIn links keep working and search engines re-index.
      { source: "/jobs", destination: "/bounties", permanent: true },
      { source: "/jobs/:path*", destination: "/bounties/:path*", permanent: true },
      { source: "/api/jobs/:path*", destination: "/api/bounties/:path*", permanent: true },
      { source: "/api/og/jobs", destination: "/api/og/bounties", permanent: true },

      // Legacy devsanantonio.com pages. That domain now redirects here
      // path-for-path, so old indexed URLs must resolve instead of 404ing.
      { source: "/mission", destination: "/buildingtogether", permanent: true },

      // SA Startup + Tech Week runs its own site, so DEVSA no longer hosts a
      // landing page or call for speakers for it. Permanent (308) — a future
      // year would live at its own slug, not this one.
      { source: "/startup-week-2026", destination: "https://www.sasw.co/", permanent: true },
    ];
  },
};

// withBotId adds the proxy rewrites BotID needs. Without it the challenge
// script is served from a third-party origin and ad-blockers defeat it.
export default withBotId(nextConfig);
