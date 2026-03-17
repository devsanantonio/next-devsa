"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-context";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartSlideOut() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm lg:max-w-[25%] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Cart ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer rounded-lg hover:bg-gray-100"
                aria-label="Close cart"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sm text-[#ef426f] hover:text-[#d63660] font-medium cursor-pointer"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.variantId}
                      className="flex gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.variantTitle}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity & Remove */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(
                                      item.variantId,
                                      item.quantity - 1
                                    )
                                  : removeItem(item.variantId)
                              }
                              className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Subtotal
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Shipping calculated at checkout.
                </p>
                <Link
                  href="/shop/checkout"
                  onClick={closeCart}
                  className="block w-full text-center bg-[#ef426f] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#d63660] transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
