"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, X, ChevronLeft, ChevronRight, Maximize2, Music } from 'lucide-react'
import Image from "next/image"

// Media data for the grid - shuffled mix of images and videos with filters
type MediaItem = {
  type: "image" | "video"
  src: string
  alt: string
  filter?: "sepia" | "grayscale" | "none"
  poster?: string // Poster image for videos
  autoplayInHero?: boolean // Whether video autoplays in hero (default: false for power saving)
}

const mediaItems: MediaItem[] = [
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.mov", alt: "PySanAntonio Conference", filter: "none", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg", autoplayInHero: true },
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.mov", alt: "PySanAntonio Conference Audience", filter: "grayscale", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa4.jpg", autoplayInHero: false },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg", alt: "PySanAntonio Conference Audience", filter: "sepia" },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa8.jpg", alt: "PySanAntonio Conference Audience", filter: "grayscale" },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa-paul.jpg", alt: "PySanAntonio Conference Audience", filter: "grayscale" },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg", alt: "PySanAntonio Conference Audience", filter: "none" }, 
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa6.MOV", alt: "PySanAntonio Conference Audience", filter: "sepia", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.jpg", autoplayInHero: false },
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.mov", alt: "PySanAntonio Conference Audience", filter: "none", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa-mauricio.png", autoplayInHero: true },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.jpg", alt: "PySanAntonio Conference Audience", filter: "sepia" },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa6.jpg", alt: "PySanAntonio Conference Audience", filter: "grayscale" },
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.MOV", alt: "PySanAntonio Conference Audience", filter: "sepia", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa-joel.png", autoplayInHero: false },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg", alt: "After Party", filter: "none" },
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa4.mov", alt: "PySanAntonio Conference Audience", filter: "grayscale", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa4.jpg", autoplayInHero: false },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.jpg", alt: "PySanAntonio Conference Audience", filter: "none" },
  { type: "video", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.mov", alt: "PySanAntonio Conference Audience", filter: "sepia", poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg", autoplayInHero: false },
  { type: "image", src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg", alt: "PySanAntonio Conference Audience", filter: "grayscale" },
]

export default function HeroSection() {
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false)
  const [isMusicOpen, setIsMusicOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})

  // Handle keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryIndex === null) return

      if (e.key === "ArrowLeft") {
        navigateGallery(-1)
      } else if (e.key === "ArrowRight") {
        navigateGallery(1)
      } else if (e.key === "Escape") {
        setGalleryIndex(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [galleryIndex])

  const navigateGallery = (direction: number) => {
    if (galleryIndex === null) return
    const newIndex = (galleryIndex + direction + mediaItems.length) % mediaItems.length
    setGalleryIndex(newIndex)
  }

  // Distribute items across columns - 2 on mobile, 4 on desktop
  const column1 = mediaItems.filter((_, idx) => idx % 4 === 0)
  const column2 = mediaItems.filter((_, idx) => idx % 4 === 1)
  const column3 = mediaItems.filter((_, idx) => idx % 4 === 2)
  const column4 = mediaItems.filter((_, idx) => idx % 4 === 3)

  // Mobile: Show only first 6 items (3 per column) for larger, spotlighted display
  const mobileItems = mediaItems.slice(0, 6)
  const mobileColumn1 = mobileItems.filter((_, idx) => idx % 2 === 0)
  const mobileColumn2 = mobileItems.filter((_, idx) => idx % 2 === 1)

  return (
    <section className="relative min-h-screen md:min-h-[140vh] w-full overflow-hidden bg-[#0a0a0a]">
      {/* Grid Background - Extended beyond viewport */}
      <div className="absolute inset-0 -top-20 -bottom-20 -left-4 -right-4">
        {/* Mobile 2-column layout */}
        <div className="flex md:hidden flex-row gap-1 h-full opacity-90">
          <div className="flex flex-col gap-1 w-1/2 pt-32">
            {mobileColumn1.map((item, idx) => {
              const originalIndex = idx * 2
              return (
                <GridItem 
                  key={idx} 
                  item={item} 
                  index={originalIndex} 
                  onClick={() => setGalleryIndex(originalIndex)}
                  videoRef={(el) => {
                    if (el) videoRefs.current[originalIndex] = el
                  }}
                />
              )
            })}
          </div>
          <div className="flex flex-col gap-1 w-1/2 pt-32">
            {mobileColumn2.map((item, idx) => {
              const originalIndex = idx * 2 + 1
              return (
                <GridItem 
                  key={idx} 
                  item={item} 
                  index={originalIndex} 
                  onClick={() => setGalleryIndex(originalIndex)}
                  videoRef={(el) => {
                    if (el) videoRefs.current[originalIndex] = el
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Desktop 4-column layout */}
        <div className="hidden md:flex flex-row gap-1 h-full opacity-90">
          {/* Column 1 */}
          <div className="flex flex-col gap-1 w-1/4 pt-20">
            {column1.map((item, idx) => (
              <GridItem 
                key={idx} 
                item={item} 
                index={idx * 4} 
                onClick={() => setGalleryIndex(idx * 4)}
                videoRef={(el) => {
                  if (el) videoRefs.current[idx * 4] = el
                }}
              />
            ))}
          </div>
          {/* Column 2 */}
          <div className="flex flex-col gap-1 w-1/4 pt-16">
            {column2.map((item, idx) => (
              <GridItem 
                key={idx} 
                item={item} 
                index={idx * 4 + 1} 
                onClick={() => setGalleryIndex(idx * 4 + 1)}
                videoRef={(el) => {
                  if (el) videoRefs.current[idx * 4 + 1] = el
                }}
              />
            ))}
          </div>
          {/* Column 3 */}
          <div className="flex flex-col gap-1 w-1/4 pt-32">
            {column3.map((item, idx) => (
              <GridItem 
                key={idx} 
                item={item} 
                index={idx * 4 + 2} 
                onClick={() => setGalleryIndex(idx * 4 + 2)}
                videoRef={(el) => {
                  if (el) videoRefs.current[idx * 4 + 2] = el
                }}
              />
            ))}
          </div>
          {/* Column 4 */}
          <div className="flex flex-col gap-1 w-1/4 pt-12">
            {column4.map((item, idx) => (
              <GridItem 
                key={idx} 
                item={item} 
                index={idx * 4 + 3} 
                onClick={() => setGalleryIndex(idx * 4 + 3)}
                videoRef={(el) => {
                  if (el) videoRefs.current[idx * 4 + 3] = el
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay Gradient - Subtle for better media visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/40 to-[#0a0a0a]/70 pointer-events-none" />

      {/* Centered Content - Compact for media focus */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-auto text-center max-w-3xl mx-auto p-6 md:p-10 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-[#FFD43B]/20 shadow-2xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FFD43B] via-[#4B8BBE] to-[#646464] leading-tight">
            Thank You!
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            PySanAntonio 2025 was an incredible experience. <span className="md:block">Relive the memories below.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <button
              onClick={() => setIsLiveStreamOpen(true)}
              className="group relative inline-flex h-11 md:h-12 items-center justify-center overflow-hidden rounded-full bg-[#FFD43B] px-6 md:px-8 font-bold text-sm md:text-base text-[#0a0a0a] transition-all hover:bg-[#FFD43B]/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD43B] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-[#FFD43B]/30"
            >
              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 fill-current" />
              <span>Watch Livestream</span>
            </button>

            <button
              onClick={() => setIsMusicOpen(true)}
              className="group relative inline-flex h-11 md:h-12 items-center justify-center overflow-hidden rounded-full bg-[#4B8BBE] px-6 md:px-8 font-bold text-sm md:text-base text-white transition-all hover:bg-[#4B8BBE]/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4B8BBE] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-[#4B8BBE]/30"
            >
              <Music className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span>Conference Music</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Livestream Modal */}
      <AnimatePresence>
        {isLiveStreamOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setIsLiveStreamOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsLiveStreamOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=1782"
                title="PySanAntonio Livestream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Modal */}
      <AnimatePresence>
        {isMusicOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setIsMusicOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMusicOpen(false)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-[#FFD43B] text-[#0a0a0a] hover:bg-[#FFD43B]/90 transition-all hover:scale-110 shadow-lg"
              >
                <X className="h-6 w-6 md:h-7 md:w-7 font-bold" strokeWidth={3} />
              </button>
              <div className="mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  PySanAntonio Conference Playlist
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Music for the first Python conference in San Antonio
                </p>
              </div>
              <iframe
                allow="autoplay *; encrypted-media *;"
                className="border-0"
                height="450"
                style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src="https://embed.music.apple.com/us/playlist/music-for-the-first-python-conference-in-san-antonio/pl.u-PJpZILNbDqW3"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {galleryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setGalleryIndex(null)}
          >
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateGallery(-1)
              }}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                navigateGallery(1)
              }}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setGalleryIndex(null)
              }}
              className="absolute top-10 right-2 md:top-8 md:right-60 z-50 p-3 rounded-full bg-[#FFD43B] text-[#0a0a0a] hover:bg-[#FFD43B]/90 transition-all hover:scale-110 shadow-lg"
            >
              <X className="h-6 w-6 md:h-7 md:w-7 font-bold" strokeWidth={3} />
            </button>

            {/* Main Media */}
            <motion.div
              key={galleryIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh] p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {mediaItems[galleryIndex].type === "video" ? (
                  <video
                    src={mediaItems[galleryIndex].src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-contain max-h-full max-w-full rounded-lg shadow-2xl"
                  />
                ) : (
                  <Image
                    src={mediaItems[galleryIndex].src || "/placeholder.svg"}
                    alt={mediaItems[galleryIndex].alt || "Gallery Image"}
                    width={1200}
                    height={800}
                    className="object-contain max-h-full max-w-full rounded-lg shadow-2xl"
                    priority
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function GridItem({
  item,
  index,
  onClick,
  videoRef,
}: { 
  item: MediaItem
  index: number
  onClick: () => void
  videoRef?: (el: HTMLVideoElement | null) => void
}) {
  const getFilterClass = (filter?: string) => {
    switch (filter) {
      case "sepia":
        return "sepia-[0.7]"
      case "grayscale":
        return "grayscale"
      default:
        return ""
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      className="relative group cursor-pointer overflow-hidden rounded-lg md:rounded-xl bg-[#1a1a1a] shadow-lg aspect-[4/3]"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Maximize2 className="text-white w-6 h-6 md:w-8 md:h-8 drop-shadow-lg" />
      </div>
      {item.type === "video" ? (
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          autoPlay={item.autoplayInHero ?? false}
          loop
          muted
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${getFilterClass(item.filter)}`}
        />
      ) : (
        <Image
          src={item.src || "/placeholder.svg"}
          alt={item.alt}
          width={600}
          height={450}
          priority={index < 6}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${getFilterClass(item.filter)}`}
        />
      )}
    </motion.div>
  )
}
