"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { PrintifyProduct, PrintifyProductVariant } from "@/lib/printify";
import { useCart } from "@/components/shop/cart-context";
import { sanitizeHtml } from "@/lib/sanitize";

interface ProductDetailClientProps {
  product: PrintifyProduct;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const enabledVariants = product.variants.filter((v) => v.is_enabled);

  // Extract option types (Colors, Sizes)
  const colorOption = product.options.find(
    (o) => o.type === "color" || o.name.toLowerCase() === "colors"
  );
  const sizeOption = product.options.find(
    (o) => o.type === "size" || o.name.toLowerCase() === "sizes" || o.name.toLowerCase() === "size"
  );

  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    () => {
      if (!colorOption) return null;
      // Pick the color of the default variant, or first enabled
      const defaultVariant = enabledVariants.find((v) => v.is_default) || enabledVariants[0];
      if (!defaultVariant || !colorOption) return null;
      return colorOption.values.find((c) =>
        defaultVariant.options.includes(c.id)
      )?.id ?? null;
    }
  );

  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  // Filter available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!sizeOption) return [];
    return sizeOption.values.filter((size) =>
      enabledVariants.some(
        (v) =>
          v.options.includes(size.id) &&
          (selectedColorId === null || v.options.includes(selectedColorId))
      )
    );
  }, [sizeOption, enabledVariants, selectedColorId]);

  // Currently selected variant
  const selectedVariant: PrintifyProductVariant | null = useMemo(() => {
    if (selectedColorId !== null && selectedSizeId !== null) {
      return (
        enabledVariants.find(
          (v) =>
            v.options.includes(selectedColorId) &&
            v.options.includes(selectedSizeId)
        ) || null
      );
    }
    return null;
  }, [enabledVariants, selectedColorId, selectedSizeId]);

  // Images for current color
  const currentImages = useMemo(() => {
    if (selectedColorId === null) return product.images;
    // Get variant ids that match the color
    const variantIds = enabledVariants
      .filter((v) => v.options.includes(selectedColorId))
      .map((v) => v.id);
    const filtered = product.images.filter((img) =>
      img.variant_ids.some((vid) => variantIds.includes(vid))
    );
    return filtered.length > 0 ? filtered : product.images;
  }, [product.images, enabledVariants, selectedColorId]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = currentImages[activeImageIndex] || currentImages[0];

  // Reset image index when color changes
  const handleColorChange = (colorId: number) => {
    setSelectedColorId(colorId);
    setActiveImageIndex(0);
    setSelectedSizeId(null);
  };

  // Clean description HTML for rendering
  const descriptionHtml = sanitizeHtml(product.description);

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 md:pt-28 bg-white">
        <div className="container-responsive">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/shop"
              className="hover:text-[#ef426f] transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8 md:py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                {activeImage ? (
                  <Image
                    src={activeImage.src}
                    alt={`${product.title} - ${activeImage.position}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {currentImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={`${img.src}-${idx}`}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        idx === activeImageIndex
                          ? "border-[#ef426f]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt={`${product.title} view ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-4">
                {selectedVariant ? (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(selectedVariant.price)}
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const prices = enabledVariants.map((v) => v.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      return min === max
                        ? formatPrice(min)
                        : `${formatPrice(min)} – ${formatPrice(max)}`;
                    })()}
                  </p>
                )}
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Color Selection */}
              {colorOption && colorOption.values.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Color
                    {selectedColorId !== null && (
                      <span className="ml-2 font-normal text-gray-500">
                        —{" "}
                        {
                          colorOption.values.find(
                            (c) => c.id === selectedColorId
                          )?.title
                        }
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOption.values.map((color) => {
                      const hex = color.colors?.[0] || "#ccc";
                      const isSelected = selectedColorId === color.id;
                      const hasEnabledVariants = enabledVariants.some((v) =>
                        v.options.includes(color.id)
                      );
                      if (!hasEnabledVariants) return null;
                      return (
                        <button
                          key={color.id}
                          title={color.title}
                          onClick={() => handleColorChange(color.id)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "border-[#ef426f] scale-110 ring-2 ring-[#ef426f]/30"
                              : "border-gray-300 hover:border-gray-500"
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizeOption && availableSizes.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Size
                    {selectedSizeId !== null && (
                      <span className="ml-2 font-normal text-gray-500">
                        —{" "}
                        {
                          sizeOption.values.find(
                            (s) => s.id === selectedSizeId
                          )?.title
                        }
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSizeId === size.id;
                      return (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSizeId(size.id)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "border-[#ef426f] bg-[#ef426f] text-white"
                              : "border-gray-300 text-gray-700 hover:border-gray-500"
                          }`}
                        >
                          {size.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="mt-8">
                <AddToCartButton
                  product={product}
                  selectedVariant={selectedVariant}
                  selectedColorId={selectedColorId}
                  selectedSizeId={selectedSizeId}
                  colorOption={colorOption}
                  sizeOption={sizeOption}
                  activeImage={activeImage}
                />
              </div>

              {/* Variant Status */}
              {selectedVariant && !selectedVariant.is_available && (
                <p className="mt-4 text-sm text-red-600 font-medium">
                  Currently out of stock
                </p>
              )}

              {/* Info Notice */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Print on demand</span>{" "}
                  — Each item is printed and shipped by our partner when you
                  order. No returns for buyer&apos;s remorse, but we&apos;ll replace defective
                  items.
                </p>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <div
                  className="prose prose-sm prose-gray max-w-none text-gray-600 [&_br]:block [&_br]:mt-2"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Back to Shop */}
      <section className="pb-12 md:pb-16">
        <div className="container-responsive text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[#ef426f] hover:text-[#d63660] font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Shop
          </Link>
        </div>
      </section>
    </>
  );
}

function AddToCartButton({
  product,
  selectedVariant,
  selectedColorId,
  selectedSizeId,
  colorOption,
  sizeOption,
  activeImage,
}: {
  product: PrintifyProduct;
  selectedVariant: PrintifyProductVariant | null;
  selectedColorId: number | null;
  selectedSizeId: number | null;
  colorOption?: { values: Array<{ id: number; title: string; colors?: string[] }> };
  sizeOption?: { values: Array<{ id: number; title: string }> };
  activeImage?: { src: string } | null;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const needsColor = colorOption && colorOption.values.length > 0;
  const needsSize = sizeOption && sizeOption.values.length > 0;
  const missingSelection =
    (needsColor && selectedColorId === null) ||
    (needsSize && selectedSizeId === null);

  const isDisabled =
    missingSelection || !selectedVariant || !selectedVariant.is_available;

  const handleAdd = () => {
    if (!selectedVariant || isDisabled) return;

    const colorName = colorOption?.values.find(
      (c) => c.id === selectedColorId
    )?.title;
    const sizeName = sizeOption?.values.find(
      (s) => s.id === selectedSizeId
    )?.title;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: activeImage?.src || "",
      colorName,
      sizeName,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const label = (() => {
    if (added) return "Added to Cart ✓";
    if (missingSelection) {
      if (needsColor && selectedColorId === null && needsSize && selectedSizeId === null)
        return "Select color & size";
      if (needsColor && selectedColorId === null) return "Select a color";
      if (needsSize && selectedSizeId === null) return "Select a size";
    }
    if (selectedVariant && !selectedVariant.is_available) return "Out of Stock";
    return `Add to Cart — ${formatPrice(selectedVariant?.price ?? 0)}`;
  })();

  return (
    <button
      onClick={handleAdd}
      disabled={isDisabled}
      className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer ${
        added
          ? "bg-emerald-600"
          : isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#ef426f] hover:bg-[#d63660] active:scale-[0.98]"
      }`}
    >
      {label}
    </button>
  );
}
