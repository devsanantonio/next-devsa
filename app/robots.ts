import type { MetadataRoute } from "next"

/*
 * /api/ stays closed to crawlers, with three public exceptions; the more
 * specific allow wins over the /api/ disallow.
 *
 * Blocking all of /api/ also blocked the share cards (/api/og/), which X's
 * crawler honors robots.txt for, and the community calendar's public feed and
 * iCal subscription, the one source built for an assistant asked "what's on in
 * San Antonio tech this week?".
 */
const PUBLIC = ["/", "/api/og/", "/api/events/feed", "/api/events/calendar"]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devsa.community"

  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC,
        disallow: ["/api/", "/admin/", "/signin/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "Anthropic-ai",
          "ClaudeBot",
          "PerplexityBot",
          "Perplexity-User",
          "OAI-SearchBot",
          "Claude-User",
          "Claude-SearchBot",
          "Cohere-ai",
        ],
        allow: [...PUBLIC, "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/signin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
