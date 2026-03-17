"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/shop/cart-context";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type CheckoutStep = "info" | "redirecting" | "error";

interface ShippingForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

const INITIAL_FORM: ShippingForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  zip: "",
  country: "US",
};

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [form, setForm] = useState<ShippingForm>(INITIAL_FORM);
  const [step, setStep] = useState<CheckoutStep>("info");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof ShippingForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isFormValid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) &&
    form.address1.trim() &&
    form.city.trim() &&
    form.region.trim() &&
    form.zip.trim() &&
    form.country.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || items.length === 0) return;

    setStep("redirecting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            variantTitle: item.variantTitle,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shipping: {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone || "",
            country: form.country,
            region: form.region,
            address1: form.address1,
            address2: form.address2 || "",
            city: form.city,
            zip: form.zip,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Checkout failed (${res.status})`);
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setStep("error");
    }
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container-responsive max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Checkout</h1>
            <p className="text-gray-500 mb-8">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[#ef426f] hover:text-[#d63660] font-medium transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
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
            <span className="text-gray-900">Checkout</span>
          </nav>
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Shipping Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-2xl font-bold mb-6">
                  Shipping Information
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.first_name}
                        onChange={(e) =>
                          updateField("first_name", e.target.value)
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.last_name}
                        onChange={(e) =>
                          updateField("last_name", e.target.value)
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.address1}
                      onChange={(e) => updateField("address1", e.target.value)}
                      placeholder="Street address"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apt / Suite / Unit
                    </label>
                    <input
                      type="text"
                      value={form.address2}
                      onChange={(e) => updateField("address2", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.region}
                        onChange={(e) => updateField("region", e.target.value)}
                        placeholder="TX"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.zip}
                        onChange={(e) => updateField("zip", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#ef426f] focus:ring-2 focus:ring-[#ef426f]/20 outline-none transition-all text-sm"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="MX">Mexico</option>
                    </select>
                  </div>

                  {/* Error */}
                  {step === "error" && errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => setStep("info")}
                        className="mt-2 text-sm text-red-600 underline cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isFormValid || step === "redirecting"}
                    className="w-full bg-[#ef426f] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-[#d63660] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                  >
                    {step === "redirecting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Redirecting to Stripe...
                      </span>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    You&apos;ll be redirected to Stripe to securely complete your
                    payment. Items are printed on demand and typically ship
                    within 3-7 business days.
                  </p>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="sticky top-28 bg-gray-50 rounded-xl border border-gray-200 p-6"
              >
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                <ul className="space-y-4 mb-6">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-200">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.variantTitle}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">
                      Calculated by Printify
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Estimated Total</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
