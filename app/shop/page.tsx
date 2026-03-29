import type { Metadata } from "next";
import { getProducts } from "@/lib/printify";
import { ShopClient } from "@/components/shop/shop-client";

const BASE_URL = "https://devsa.community";

export const metadata: Metadata = {
  title: "Shop | DEVSA – Official Community Merch & Developer Apparel",
  description:
    "Community threads, wear the source. Print-on-demand developer apparel designed in San Antonio — bridging the gap between code and community. Support the SA tech scene with every purchase.",
  keywords: [
    "DEVSA merch",
    "developer apparel",
    "tech community merch",
    "San Antonio tech shirts",
    "coding apparel",
    "programmer clothing",
    "dev community shop",
    "print on demand developer",
    "DEVSA shop",
    "tech nonprofit merch",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop | DEVSA – Official Community Merch & Developer Apparel",
    description:
      "Print-on-demand developer apparel designed in San Antonio. Support the tech community with every purchase.",
    type: "website",
    url: `${BASE_URL}/shop`,
    siteName: "DEVSA",
    images: [
      {
        url: `${BASE_URL}/api/og/shop`,
        width: 1200,
        height: 630,
        alt: "DEVSA Shop – Official Community Merch & Developer Apparel",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | DEVSA – Official Community Merch & Developer Apparel",
    description:
      "Print-on-demand developer apparel designed in San Antonio. Support the tech community with every purchase.",
    images: [`${BASE_URL}/api/og/shop`],
    creator: "@devsatx",
    site: "@devsatx",
  },
};

export default async function ShopPage() {
  const productsData = await getProducts(1, 50);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <ShopClient products={productsData.data} />
    </main>
  );
}
