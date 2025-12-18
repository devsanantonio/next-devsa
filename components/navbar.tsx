"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { SlideOutMenu } from "./slide-out-menu"
import { SocialMediaMenu } from "./social-media-menu"
import { TerminalDropdown } from "./terminal-dropdown"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDarkSection, setIsDarkSection] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        const mostVisibleEntry = entries.reduce((prev, current) => 
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        )

        if (mostVisibleEntry.intersectionRatio > 0) {
          const element = mostVisibleEntry.target as HTMLElement
          const bgType = element.getAttribute('data-bg-type')
          
          // Check for dark backgrounds using data attribute or class names
          const isDark = 
            bgType === 'dark' ||
            element.classList.contains('bg-slate-950') ||
            element.classList.contains('bg-black') ||
            element.classList.contains('bg-gray-900')

          setIsDarkSection(isDark)
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-70px 0px -30% 0px' // Account for navbar height and prioritize top sections
      }
    )

    // Observe all sections that could affect navbar color
    const sections = document.querySelectorAll('section[data-bg-type], section[class*="bg-"]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  return (
    <>
      <nav className={`w-full fixed top-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-md border-b transition-colors duration-300 ${
        isDarkSection ? "border-white/20" : "border-neutral-950"
      }`}>
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
                className={`cursor-pointer transition-all duration-300 ease-in-out active:scale-95 focus:outline-none focus:ring-2 p-2.5 rounded-lg ${
                  isDarkSection
                    ? "text-white hover:text-gray-200 hover:bg-white/10 focus:ring-white/20"
                    : "text-neutral-950 hover:text-neutral-700 hover:bg-neutral-100/10 focus:ring-neutral-950/20"
                }`}
                aria-label="Toggle menu"
                aria-expanded={isDropdownOpen}
              >
                <Menu className="w-6 h-6" strokeWidth={2} />
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
