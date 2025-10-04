"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { X } from "lucide-react"

export function PySAPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the popup in this session
    const dismissed = sessionStorage.getItem("pysa-popup-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem("pysa-popup-dismissed", "true")
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - only on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={handleClose}
          />

          {/* Popup Card */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed z-50
              bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2
              md:bottom-6 md:right-6 md:left-auto md:translate-x-0 md:translate-y-0"
          >
            <div className="relative group">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-2 -right-2 z-10 bg-black text-white rounded-full p-1.5 
                  hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Card Link */}
              <Link
                href="/pysanantonio"
                className="block relative"
                onClick={() => {
                  sessionStorage.setItem("pysa-popup-dismissed", "true")
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 
                  rounded-lg opacity-0 group-hover:opacity-75 blur transition-opacity duration-300"
                />

                {/* Card Image */}
                <div
                  className="relative rounded-lg overflow-hidden
                  w-[280px] md:w-[240px] lg:w-[280px]
                  transform group-hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-25-pysa+(1).png"
                    alt="PySanAntonio - Python Conference - Click to learn more"
                    className="w-full h-auto"
                  />

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    flex items-end justify-center pb-4"
                  >
                    <span className="text-white font-bold text-sm">Click to Learn More</span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
