import type { Metadata } from "next";
import { getProduct, parseSlug } from "@/lib/printify";
import { ProductDetailClient } from "@/components/shop/product-detail-client";
import { notFound } from "next/navigation";

const BASE_URL = "https://devsa.community";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseSlug(id);
  try {
    const product = await getProduct(productId);
    const description = product.description.replace(/<[^>]*>/g, "").slice(0, 160);
    const ogImage = `${BASE_URL}/api/og/shop/${productId}`;
    return {
      title: `${product.title} | DEVSA Shop`,
      description,
      openGraph: {
        title: `${product.title} | DEVSA Shop`,
        description,
        url: `${BASE_URL}/shop/${id}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} | DEVSA Shop`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Product Not Found | DEVSA Shop" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseSlug(id);

  let product;
  try {
    product = await getProduct(productId);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <ProductDetailClient product={product} />
    </main>
  );
}
