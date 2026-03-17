import type { Metadata } from "next";
import { getProducts } from "@/lib/printify";
import { ShopClient } from "@/components/shop/shop-client";

const BASE_URL = "https://devsa.community";

export const metadata: Metadata = {
  title: "Shop | DEVSA – Official Community Merch",
  description:
    "Community vibes, wear the source. Print-on-demand apparel designed in San Antonio — bridging the gap between code and community.",
  openGraph: {
    title: "Shop | DEVSA – Official Community Merch",
    description:
      "Print-on-demand apparel designed in San Antonio. Bridging the gap between code and community with high-fidelity threads.",
    type: "website",
    url: `${BASE_URL}/shop`,
    images: [
      {
        url: `${BASE_URL}/api/og/shop`,
        width: 1200,
        height: 630,
        alt: "DEVSA Shop – Official Community Merch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | DEVSA – Official Community Merch",
    description:
      "Print-on-demand apparel designed in San Antonio. Bridging the gap between code and community.",
    images: [`${BASE_URL}/api/og/shop`],
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
