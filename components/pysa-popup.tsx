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

          {/* Popup Card */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.5,
              x: 100,
              y: 100,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              x: 100,
              y: 100,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
            }}
            className="fixed z-50 bottom-4 right-4"
          >
            <div className="relative group">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-1 -right-1 z-10 bg-black/80 text-white rounded-full p-1 
                  hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                aria-label="Close popup"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Card Link */}
              <Link
                href="/pysanantonio"
                className="block relative"
                onClick={() => {
                  sessionStorage.setItem("pysa-popup-dismissed", "true")
                }}
              >
                {/* Card Image with Glare Effect */}
                <div
                  className="relative rounded-lg overflow-hidden shadow-2xl
                  w-[120px] h-[160px] md:w-[140px] md:h-[186px]
                  transform group-hover:scale-105 transition-all duration-300
                  border border-white/20"
                >
                  <img
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-25-pysa+(1).png"
                    alt="PySanAntonio - Python Conference - Click to learn more"
                    className="w-full h-full object-cover"
                  />

                  {/* Glare Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-30" />
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white/60 rounded-full blur-lg opacity-50" />
                  
                  {/* Animated Shine Effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-700 ease-out"
                  />
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
