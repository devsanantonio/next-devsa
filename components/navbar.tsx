"use client"

import { useState } from "react"
import { SlideOutMenu } from "./slide-out-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-md border-b border-neutral-950">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="">
            Where is the tech community?
          </h1>
          <div className="">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <img
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
                alt="DEVSA - San Antonio Developer Community"
                className="w-full h-8 md:h-10"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Menu */}
      <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
