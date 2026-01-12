"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, X, Music } from "lucide-react"
import Image from "next/image"

const mediaItems = [
  {
    type: "video",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.mov",
    poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg",
    alt: "PySanAntonio Conference",
  },
  {
    type: "image",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg",
    alt: "PySanAntonio Conference Audience",
    width: 1600,
    height: 1067,
  },
  {
    type: "image",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa8.jpg",
    alt: "PySanAntonio Conference Audience",
    width: 1600,
    height: 1067,
  },
  {
    type: "video",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.mov",
    poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa-mauricio.png",
    alt: "PySanAntonio Speaker",
  },
  {
    type: "image",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg",
    alt: "PySanAntonio Conference",
    width: 1600,
    height: 1067,
  },
  {
    type: "video",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa6.MOV",
    poster: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.jpg",
    alt: "PySanAntonio Conference Audience",
  },
  {
    type: "image",
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg",
    alt: "PySanAntonio After Party",
    width: 1600,
    height: 1067,
  },
]

export default function HeroSection() {
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false)
  const [isMusicOpen, setIsMusicOpen] = useState(false)

  return (
    <section className="relative" data-testid="pysa-homepage-container-carousel" id="carousel" data-bg-type="light">
      <div className="-mt-px pt-[calc(1.5rem-var(--header-height))] md:pt-[calc(6rem-var(--header-height))] lg:pt-[calc(12rem-var(--header-height))] pb-6 md:pb-24 text-white bg-[#0a0a0a]">
        <div className="flex flex-col gap-6 md:gap-y-12 lg:gap-y-10">
          <div className="my-0! gap-10 lg:gap-5 container-responsive grid grid-cols-1 lg:grid-cols-[repeat(18,1fr)]">
            <div className="lg:col-span-11 flex flex-col gap-y-12 items-start mt-20 md:mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <p className="text-sm md:text-base font-medium text-[#FFD43B] uppercase tracking-[0.2em] letter-spacing-wide">
                    San Antonio&apos;s First Python Conference
                  </p>
                  <h1 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                    Thank You{" "}
                    <span className="text-[#4B8BBE] font-light italic">for an</span>{" "}
                    Incredible Experience.
                  </h1>
                </div>

                <div className="space-y-6 max-w-3xl">
                  <p className="text-xl md:text-2xl text-gray-300 leading-[1.4] font-light">
                    PySanAntonio 2025 brought together Python enthusiasts from across the region for a day of{" "}
                    <strong className="font-semibold text-white">learning, networking, and community building.</strong>
                  </p>

                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                    Relive the memories below and{" "}
                    <strong className="font-semibold text-white">stay tuned</strong> for future events!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsLiveStreamOpen(true)}
                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-[#FFD43B] px-8 font-bold text-base text-[#0a0a0a] transition-all hover:bg-[#FFD43B]/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD43B] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-[#FFD43B]/30"
                  >
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    <span>Watch Livestream</span>
                  </button>

                  <button
                    onClick={() => setIsMusicOpen(true)}
                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-[#4B8BBE] px-8 font-bold text-base text-white transition-all hover:bg-[#4B8BBE]/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4B8BBE] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] shadow-lg shadow-[#4B8BBE]/30"
                  >
                    <Music className="mr-2 h-5 w-5" />
                    <span>Conference Music</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Marquee Carousel */}
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-8 animate-marquee-slow lg:animate-marquee">
              {/* First set of items */}
              {mediaItems.map((item, index) => (
                <div key={`${item.alt}-${index}`} className="flex w-80 shrink-0 flex-col justify-end">
                  <div className="relative aspect-4/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900 rounded-lg"></div>
                    {item.type === "image" ? (
                      <Image
                        alt={item.alt}
                        loading="lazy"
                        width={item.width || 1067}
                        height={item.height || 1600}
                        className="rounded-lg sepia-[0.3] object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        src={item.src}
                      />
                    ) : (
                      <video
                        className="rounded-lg sepia-[0.3] w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        poster={item.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={item.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ))}

              {/* Duplicate set for seamless loop */}
              {mediaItems.map((item, index) => (
                <div key={`duplicate-${item.alt}-${index}`} className="flex w-80 shrink-0 flex-col justify-end">
                  <div className="relative aspect-4/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900 rounded-lg"></div>
                    {item.type === "image" ? (
                      <Image
                        alt={item.alt}
                        loading="lazy"
                        width={item.width || 1067}
                        height={item.height || 1600}
                        className="rounded-lg sepia-[0.3] object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        src={item.src}
                      />
                    ) : (
                      <video
                        className="rounded-lg sepia-[0.3] w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        poster={item.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={item.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                style={{ width: "100%", maxWidth: "660px", overflow: "hidden", background: "transparent" }}
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src="https://embed.music.apple.com/us/playlist/music-for-the-first-python-conference-in-san-antonio/pl.u-PJpZILNbDqW3"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
