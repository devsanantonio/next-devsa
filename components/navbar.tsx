"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Menu } from "lucide-react"
import { SlideOutMenu } from "./slide-out-menu"
import { SocialMediaMenu } from "./social-media-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <>
      <nav className="w-full fixed top-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-md border-b border-neutral-950">
        <div className="container-responsive">
          <div className="flex justify-between items-center py-1.5 md:py-1">
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-1 block"
                aria-label="Go to home page"
              >
                <img
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
                  alt="DEVSA - San Antonio Developer Community"
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-12 xl:h-12"
                />
              </Link>
            </div>

            <div className="flex-1 min-w-0 text-right relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-neutral-950 cursor-pointer transition-all duration-200 hover:text-neutral-700 hover:bg-neutral-100/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-950/20 p-2.5 rounded-lg"
                aria-label="Toggle menu"
                aria-expanded={isDropdownOpen}
              >
                <Menu className="w-6 h-6" strokeWidth={2} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <Link
                        href="/pysanantonio"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block w-full text-left px-5 py-3.5 text-neutral-900 font-semibold hover:bg-neutral-50 transition-colors duration-150 border-b border-neutral-200 whitespace-nowrap"
                      >
                        PySanAntonio
                      </Link>
                      <button
                        onClick={() => {
                          setIsSocialMenuOpen(true)
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-5 py-3.5 text-neutral-900 font-semibold hover:bg-neutral-50 transition-colors duration-150 whitespace-nowrap"
                      >
                        Stay Connected
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
