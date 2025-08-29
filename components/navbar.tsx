"use client"

import { useState } from "react"
import { SlideOutMenu } from "./slide-out-menu"
import { SocialMediaMenu } from "./social-media-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)

  return (
    <>
      <nav className="w-full fixed top-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-md border-b border-neutral-950">
        <div className="container-responsive">
          <div className="flex justify-between items-center py-1.5 md:py-1">
            <div className="flex-1 min-w-0">
              <h1
                onClick={() => setIsMenuOpen(true)}
                className="text-responsive-sm md:text-responsive-base lg:text-responsive-lg text-neutral-950 font-black truncate pr-4 cursor-pointer transition-all duration-200 hover:text-neutral-700 active:scale-95"
              >
                Where is the tech community?
              </h1>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => setIsSocialMenuOpen(true)}
                className="transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-1"
                aria-label="Open social media menu"
              >
                <img
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
                  alt="DEVSA - San Antonio Developer Community"
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-12 xl:h-12"
                />
              </button>
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
