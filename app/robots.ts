import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://devsa.community"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"], // Block API routes and any admin areas
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
