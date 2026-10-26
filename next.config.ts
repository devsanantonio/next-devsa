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

      // localhost:210's short link, for slides, stickers and QR codes. The :210
      // in the mark is San Antonio's area code.
      { source: "/210", destination: "/localhost", permanent: true },

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
      // The Get Involved form's short link, on every spotlight end card and the
      // YouTube channel. It was a page that called permanentRedirect(), which
      // fires after streaming has begun and so lands as a client-side
      // navigation: the URL arrived at #get-involved but the browser never
      // scrolled to it, leaving people at the top of /buildingtogether. A real
      // 308 lets the browser handle the fragment. ?path= and ?way= pass
      // through, as the page used to carry them.
      { source: "/get-involved", destination: "/buildingtogether#get-involved", permanent: true },
      // DEVSA's Discord, at an address people can remember and that outlives any
      // one invite. The invite is Jesse's and never expires, but if it is ever
      // replaced (or a vanity discord.gg/devsa arrives with more boosts), this is
      // the only line that changes. Temporary on purpose: browsers cache a
      // permanent redirect, which would pin them to the old invite.
      { source: "/discord", destination: "https://discord.gg/cvHHzThrEw", permanent: false },
    ];
  },
};

// withBotId adds the proxy rewrites BotID needs. Without it the challenge
// script is served from a third-party origin and ad-blockers defeat it.
export default withBotId(nextConfig);
