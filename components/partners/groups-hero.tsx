"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, X } from "lucide-react"

const VIDEO_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"
const HERO_IMAGE_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9726.jpg"

export function GroupsHero() {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  return (
    <>
    {/* Hero with video background */}
    <section
      className="relative overflow-hidden bg-black min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      {/* Background image */}
      <img
        src={HERO_IMAGE_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover grayscale"
      />

      {/* Dark overlay — heavy left for text readability, fading right to reveal video */}
      <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-transparent z-10" />
      <div className="absolute inset-0 bg-linear-to-b from-neutral-950/70 via-transparent to-neutral-950/70 z-10" />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.15) 65%, transparent 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Building Together
            </p>
            <h1 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Where Partners and Communities{" "}
              <span className="text-white/50 font-light italic">Come Together to</span>{" "}
              Align.
            </h1>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              Our platform simplifies how local partners and tech communities{" "}
              <strong className="font-semibold text-white">collaborate</strong>,{" "}
              exchange resources, and grow the ecosystem together.
            </p>

            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              We&apos;re the bridge for a reason — connecting{" "}
              <span className="font-medium text-white/70">organizers</span>,{" "}
              <span className="font-medium text-white/70">companies</span>, and{" "}
              <span className="font-medium text-white/70">builders</span>{" "}
              across San Antonio&apos;s tech landscape.
            </p>

            <button
              onClick={() => setShowVideoModal(true)}
              className="inline-flex items-center gap-3 group cursor-pointer"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </span>
              <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                Watch the Video
              </span>
            </button>
          </div>
        </motion.div>
      </div>
      {/* Bottom fade into logo showcase */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent z-20" />
    </section>

    {/* Video Modal */}
    <AnimatePresence>
      {showVideoModal && (
        <motion.div
          key="video-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            key="video-player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              ref={modalVideoRef}
              autoPlay
              controls
              playsInline
              className="w-full h-full rounded-xl"
            >
              <source src={VIDEO_URL} type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
