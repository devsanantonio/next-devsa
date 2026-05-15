"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type PrintifyProduct, slugify } from "@/lib/printify";
import { MerchSubmissionForm } from "./merch-submission-form";

interface ShopClientProps {
  products: PrintifyProduct[];
}

function getDefaultImage(product: PrintifyProduct) {
  const defaultImg = product.images.find((img) => img.is_default);
  return defaultImg?.src || product.images[0]?.src || "";
}

function getEnabledPriceRange(product: PrintifyProduct) {
  const enabled = product.variants.filter((v) => v.is_enabled);
  if (enabled.length === 0) return null;
  const prices = enabled.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getColorOptions(product: PrintifyProduct) {
  const colorOption = product.options.find(
    (o) => o.type === "color" || o.name.toLowerCase() === "colors"
  );
  return colorOption?.values || [];
}

function getImageForVariant(product: PrintifyProduct, variantId: number) {
  const img = product.images.find(
    (img) => img.variant_ids.includes(variantId) && img.position === "front"
  );
  return img?.src;
}

export function ShopClient({ products }: ShopClientProps) {
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white pt-28 pb-16 md:pt-32 md:pb-20 border-b border-gray-200">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="space-y-4 max-w-3xl">
              <p className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-[0.2em]">
                Community Merch
              </p>
              <h1 className="font-sans text-gray-900 leading-none text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Community Threads.{" "}
                <span className="text-gray-400 font-light italic">Wear the</span>{" "}
                Source.
              </h1>
            </div>

            <div className="space-y-6 max-w-3xl mt-8">
              <p className="text-xl md:text-2xl text-gray-500 leading-[1.4] font-normal">
                Developer apparel designed in San Antonio. Every purchase
                supports DEVSA&apos;s{" "}
                <span className="font-medium text-gray-700">workshops</span>,{" "}
                <span className="font-medium text-gray-700">conferences</span>,
                and{" "}
                <span className="font-medium text-gray-700">
                  the coworking space
                </span>
                .
              </p>

              <p className="text-base md:text-lg text-gray-400 leading-[1.6] font-normal">
                Print-on-demand — part of{" "}
                <span className="font-medium text-gray-600">
                  Building Together
                </span>
                , DEVSA&apos;s 501(c)(3) platform.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-900 text-white font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
                >
                  Shop the Collection
                </a>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Submit Your Logo
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PSF Credential Band */}
      <section className="bg-white border-b border-gray-100 py-6 md:py-7">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5"
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <BadgeCheck className="h-5 w-5 text-[#306998]" strokeWidth={2} />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                Officially Licensed
              </p>
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              DEVSA is licensed by the{" "}
              <a
                href="https://www.python.org/psf/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#306998] underline underline-offset-2 decoration-2 decoration-[#FFD43B] hover:text-[#24507a] transition-colors"
              >
                Python Software Foundation
              </a>
              {" "}for commercial use of the Python logo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="bg-white py-16 md:py-24 scroll-mt-20">
        <div className="container-responsive">
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-normal leading-normal">No products available yet.</p>
              <p className="mt-2 text-sm font-normal leading-normal">Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-8 md:mb-10">
                <h2 className="text-gray-900 text-lg md:text-xl font-semibold leading-normal">
                  All Products
                </h2>
                <span className="text-gray-400 text-[13px] font-normal leading-normal">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Community CTA */}
      <section className="bg-black border-t border-gray-800 pt-16 pb-20 md:pt-20 md:pb-24" data-bg-type="dark">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="space-y-4 max-w-3xl">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                Community Collection
              </p>
              <h2 className="font-sans text-white leading-none text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Your Logo.{" "}
                <span className="text-white/50 font-light italic">Remixed</span>.
              </h2>
            </div>

            <div className="space-y-6 max-w-3xl mt-8">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-normal">
                Part of our mission is spotlighting the groups that power
                San&nbsp;Antonio. Submit your logo and let our team remix it
                into a fresh, production-ready design for the DEVSA store.
              </p>
              <p className="text-base md:text-lg text-white/50 leading-[1.6] font-normal">
                We&apos;ll handle the{" "}
                <span className="font-medium text-white">design</span>, the{" "}
                <span className="font-medium text-white">printing</span>, and
                the{" "}
                <span className="font-medium text-white">shipping</span> — you
                bring the community.
              </p>

              <p className="text-sm font-medium text-white/60 italic">
                The Python Software Foundation was our first — your community
                could be next.
              </p>

              <button
                onClick={() => setShowSubmitForm(true)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[#ef426f] hover:bg-[#d93a62] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer mt-2"
              >
                Submit Your Logo
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Cross-links footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-14 md:mt-20 pt-8 border-t border-white/10"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40 mb-4">
              More from DEVSA
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/buildingtogether"
                className="font-medium text-white/60 hover:text-white transition-colors"
              >
                Building Together
              </Link>
              <Link
                href="/coworking-space"
                className="font-medium text-white/60 hover:text-white transition-colors"
              >
                Coworking Space
              </Link>
              <Link
                href="/events"
                className="font-medium text-white/60 hover:text-white transition-colors"
              >
                Community Calendar
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {showSubmitForm && (
        <MerchSubmissionForm onClose={() => setShowSubmitForm(false)} />
      )}
    </>
  );
}

function ProductCard({
  product,
  index,
}: {
  product: PrintifyProduct;
  index: number;
}) {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const colors = getColorOptions(product);
  const priceRange = getEnabledPriceRange(product);

  // Get the image based on selected color
  const displayImage = (() => {
    if (selectedColorId !== null) {
      // Find a variant with this color option
      const variant = product.variants.find(
        (v) => v.is_enabled && v.options.includes(selectedColorId)
      );
      if (variant) {
        const variantImage = getImageForVariant(product, variant.id);
        if (variantImage) return variantImage;
      }
    }
    return getDefaultImage(product);
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={`/shop/${slugify(product.title, product.id)}`}
        className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300"
      >
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 sm:p-6">
          <h3 className="text-gray-900 text-[15px] sm:text-base font-semibold leading-normal group-hover:text-[#ef426f] transition-colors truncate">
            {product.title}
          </h3>

          {/* Price */}
          {priceRange && (
            <p className="mt-2 text-gray-900 font-bold text-sm sm:text-[15px] leading-normal">
              {priceRange.min === priceRange.max
                ? formatPrice(priceRange.min)
                : `${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}`}
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-normal"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
