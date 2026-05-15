import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
