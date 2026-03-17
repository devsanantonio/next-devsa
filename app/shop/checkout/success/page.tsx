"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { useCart } from "@/components/shop/cart-context";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (sessionId && !cleared) {
      // Remove from localStorage directly — this must happen before
      // CartProvider's hydration effect reads it (child effects run first)
      try {
        localStorage.removeItem("devsa-shop-cart");
      } catch {}
      clearCart();
      setCleared(true);
    }
  }, [sessionId, cleared, clearCart]);

  if (!sessionId) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container-responsive max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              No session found
            </h1>
            <p className="text-gray-500 mb-8">
              It looks like you arrived here without completing a purchase.
            </p>
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
      <div className="pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-responsive max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-2">
              Your payment has been processed and your order is being prepared.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You&apos;ll receive a shipping notification at your email once your
              items are on their way.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ef426f] text-white font-semibold py-3 px-8 rounded-xl hover:bg-[#d63660] transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
