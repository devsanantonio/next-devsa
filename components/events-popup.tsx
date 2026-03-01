"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { upcomingDevsaEvent } from "@/data/events"

export function EventsPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if popup was dismissed in this session
    const dismissed = sessionStorage.getItem("events-popup-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem("events-popup-dismissed", "true")
  }

  if (isDismissed || !upcomingDevsaEvent) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 w-80 sm:w-90"
        >
          <div className="relative border border-[#333] bg-[#111] shadow-2xl shadow-black/50 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 text-[#666] hover:text-white hover:bg-[#333] transition-colors"
              aria-label="Dismiss popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Accent gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#306998] via-[#FFD43B] to-[#306998]" />
            
            {/* Hero Image */}
            <div className="bg-white flex items-center justify-center px-6 py-5">
              <Image
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pytexas2026_day_color.svg"
                alt="PyTexas 2026"
                width={280}
                height={120}
                className="object-contain w-full h-auto max-h-32"
              />
            </div>
            
            {/* Content */}
            <div className="px-5 pt-4 pb-5">
              <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#FFD43B] mb-1.5">
                Celebrating 20 Years · Apr 17–19, 2026
              </p>

              <p className="text-[13px] font-normal text-[#aaa] leading-snug mb-4">
                The largest gathering of Python developers in Texas. Three days of software development, data science, and community.
              </p>

              <Link
                href="https://pretix.eu/pytexas/2026/"
                onClick={handleDismiss}
                className="inline-flex items-center gap-2 bg-[#FFD43B] text-[#0a0a0a] font-semibold text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#306998] hover:text-white transition-colors"
              >
                Get Tickets
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
