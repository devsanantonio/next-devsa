"use client"

import { motion, AnimatePresence } from "motion/react"
import { Play, X } from "lucide-react"
import { useRef, useState } from "react"

const VIDEO_URL =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"

export function AboutDevsa() {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  return (
    <>
      <section
        id="about-devsa"
        className="w-full bg-white py-16 md:py-24 relative overflow-hidden"
        data-bg-type="light"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                About DEVSA
              </p>
              <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                A 501(c)(3) Built to{" "}
                <span className="text-gray-600 font-light italic">Serve</span>{" "}
                San Antonio&apos;s Tech Communities.
              </h2>
            </div>

            <div className="space-y-6 max-w-3xl">
              <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                DEVSA is the bridge across San Antonio&apos;s tech ecosystem.
                Through our platform we connect{" "}
                <strong className="font-semibold text-gray-900">
                  20+ grassroots groups
                </strong>
                , local builders, and industry partners into one shared
                ecosystem.
              </p>

              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                We don&apos;t replace the communities doing the work — we{" "}
                <span className="font-medium text-gray-700">host them</span>,{" "}
                <span className="font-medium text-gray-700">connect them</span>,
                and{" "}
                <span className="font-medium text-gray-700">help them grow</span>{" "}
                through a downtown coworking space, a shared community calendar,
                monthly workshops, and conferences built right here in
                San&nbsp;Antonio.
              </p>
            </div>

            {/* Pull quote + video trigger */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-gray-900 pl-6 md:pl-8 space-y-5 max-w-3xl"
            >
              <p className="text-xl md:text-2xl text-gray-900 leading-[1.35] font-light italic">
                &ldquo;DEVSA is never going to be the final destination.
                It&apos;s the platform that allows you to find your people, to
                help build your future, to build your network.&rdquo;
              </p>
              <button
                onClick={() => setShowVideoModal(true)}
                className="group relative block w-full max-w-md aspect-video rounded-xl overflow-hidden bg-gray-900 cursor-pointer"
                aria-label="Watch the More Human Than Human conference recap"
              >
                <img
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/0P3A9676.jpg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/95 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-xl">
                    <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-1" />
                  </span>
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-medium text-white/90 uppercase tracking-[0.15em]">
                  Watch the Video
                </span>
              </button>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.15em]">
                Jesse Hernandez, Founder
              </p>
            </motion.div>
          </motion.div>
        </div>
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
                aria-label="Close video"
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
