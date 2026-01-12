"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SlideOutMenu } from "./slide-out-menu"
import { SocialMediaMenu } from "./social-media-menu"
import { TerminalDropdown } from "./terminal-dropdown"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

            <div className="flex-1 min-w-0 text-right relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer transition-all duration-200 ease-in-out active:scale-90 focus:outline-none focus:ring-2 focus:ring-black/30 p-3 rounded-xl hover:bg-black/5 group"
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
