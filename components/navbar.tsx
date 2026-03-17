"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SlideOutMenu } from "./slide-out-menu"
import { SocialMediaMenu } from "./social-media-menu"
import { TerminalDropdown } from "./terminal-dropdown"
import { useCart } from "./shop/cart-context"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { openCart, totalItems } = useCart()
  const pathname = usePathname()
  const isShopPage = pathname.startsWith("/shop")

  return (
    <>
      <nav className="w-full fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-b border-black/10">
        <div className="container-responsive">
          <div className="flex justify-between items-center">
            <div className="shrink-0">
              <Link
                href="/"
                className="transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-2 md:px-0 block"
                aria-label="Go to home page"
              >
                <img
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
                  alt="DEVSA - San Antonio Developer Community"
                  className="w-8 h-8 md:w-10 md:h-10"
                />
              </Link>
            </div>

            <div className="flex-1 min-w-0 relative flex items-center justify-end gap-0.5 lg:gap-1">
              {/* Desktop Nav Links — hidden on mobile */}
              <div className="hidden lg:flex items-center gap-0.5">
                <Link
                  href="/buildingtogether"
                  className={`px-3 py-1.5 rounded-lg text-[13px] leading-tight font-normal tracking-wide transition-colors ${
                    pathname === "/buildingtogether"
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Building Together
                </Link>
                <Link
                  href="/coworking-space"
                  className={`px-3 py-1.5 rounded-lg text-[13px] leading-tight font-normal tracking-wide transition-colors ${
                    pathname === "/coworking-space"
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Coworking Space
                </Link>
                <Link
                  href="/events"
                  className={`px-3 py-1.5 rounded-lg text-[13px] leading-tight font-normal tracking-wide transition-colors ${
                    pathname === "/events"
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Community Calendar
                </Link>
                <Link
                  href="/jobs"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] leading-tight font-normal tracking-wide transition-colors ${
                    pathname.startsWith("/jobs")
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Job Board
                  <span className="inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/30">
                    Testing
                  </span>
                </Link>
                <Link
                  href="/shop"
                  className={`px-3 py-1.5 rounded-lg text-[13px] leading-tight font-normal tracking-wide transition-colors ${
                    isShopPage
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Shop
                </Link>
              </div>

              {/* Cart Icon — visible on all pages when items in cart */}
              {totalItems > 0 && (
                <button
                  onClick={openCart}
                  className="relative cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-white"
                  aria-label="Open cart"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-[#ef426f] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                </button>
              )}

              {/* Terminal dots — mobile only */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="lg:hidden cursor-pointer transition-all duration-200 ease-in-out active:scale-90 focus:outline-none focus:ring-2 focus:ring-black/30 p-3 rounded-xl hover:bg-black/5 group"
                aria-label="Toggle menu"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-[#00b2a9] rounded-full transition-transform duration-200 group-hover:scale-110"></div>
                  <div className="w-2.5 h-2.5 bg-[#ef426f] rounded-full transition-transform duration-200 group-hover:scale-110 group-hover:delay-75"></div>
                  <div className="w-2.5 h-2.5 bg-[#ff8200] rounded-full transition-transform duration-200 group-hover:scale-110 group-hover:delay-150"></div>
                </div>
              </button>

              <TerminalDropdown 
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onSocialMenuOpen={() => setIsSocialMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-out Menu */}
      <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <SocialMediaMenu isOpen={isSocialMenuOpen} onClose={() => setIsSocialMenuOpen(false)} />
    </>
  )
}
