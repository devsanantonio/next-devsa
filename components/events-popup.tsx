"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#ff9900] via-[#fbbf24] to-[#ff9900]" />
            
            {/* Content */}
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[#ff9900]/30">
                  {upcomingDevsaEvent.video ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={upcomingDevsaEvent.video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="absolute inset-0 bg-[#ff9900]/10" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#666] mb-1">
                    Upcoming Event
                  </p>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {upcomingDevsaEvent.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-[#999] leading-relaxed mb-4 line-clamp-2">
                {upcomingDevsaEvent.description}
              </p>

              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#666]">
                  {new Date(upcomingDevsaEvent.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Chicago",
                  })}
                </p>
                <Link
                  href="/events"
                  onClick={handleDismiss}
                  className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#0a0a0a] font-semibold text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#ff9900] transition-colors"
                >
                  View Events
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
