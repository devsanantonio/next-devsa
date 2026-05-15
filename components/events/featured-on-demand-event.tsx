"use client"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, ArrowRight, X } from "lucide-react"
import { featuredOnDemandEvent, moreHumanThanHumanEvent } from "@/data/events"
import Image from "next/image"
import Link from "next/link"

const MORE_HUMAN_RECAP_VIDEO_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"

function formatPastDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  })
}

export function FeaturedOnDemandEvent() {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  if (!featuredOnDemandEvent && !moreHumanThanHumanEvent) return null

  return (
    <>
      <section
        className="bg-black border-b border-gray-800"
        data-bg-type="dark"
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mb-12 md:mb-16"
          >
            <div className="space-y-4 max-w-3xl">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                On Demand
              </p>
              <h2 className="text-balance font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Watch Past{" "}
                <span className="text-white/50 font-light italic">
                  Conferences{" "}
                </span>
                Powered by <strong className="font-semibold text-white">DEVSA</strong>.
              </h2>
            </div>

            <div className="space-y-6 max-w-3xl mt-8">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                <strong className="font-semibold text-white">
                  DEVSA conferences
                </strong>{" "}
                built right here in San&nbsp;Antonio — for the community, by
                the community.
              </p>
              <p className="text-base md:text-lg text-white/50 leading-relaxed">
                Part of{" "}
                <span className="font-medium text-white/70">
                  Building Together
                </span>
                , our 501(c)(3) platform. Watch talks, panels, and workshops at
                your own pace.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* PySanAntonio */}
            {featuredOnDemandEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href={featuredOnDemandEvent.url || "#"}
                  className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-all duration-300 hover:border-white/20 hover:bg-neutral-900/70"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <Image
                      src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg"
                      alt={featuredOnDemandEvent.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                    <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/80">
                      Past Event
                    </span>

                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                      <Play className="h-3 w-3 fill-white" />
                      Full Event
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40 mb-2">
                      {formatPastDate(featuredOnDemandEvent.date)} ·{" "}
                      {featuredOnDemandEvent.location}
                    </p>

                    <h3 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-white mb-3">
                      {featuredOnDemandEvent.title}
                    </h3>

                    <p className="text-sm text-white/55 leading-relaxed mb-5">
                      {featuredOnDemandEvent.description}
                    </p>

                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-white/80">
                      View all sessions
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* More Human Than Human */}
            {moreHumanThanHumanEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="group block w-full text-left h-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-neutral-900/70"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    >
                      <source
                        src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.mp4"
                        type="video/mp4"
                      />
                      <source
                        src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.webm"
                        type="video/webm"
                      />
                    </video>
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                    <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/80">
                      Past Event
                    </span>

                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                      <Play className="h-3 w-3 fill-white" />
                      Event Recap
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/40 mb-2">
                      {formatPastDate(moreHumanThanHumanEvent.date)} ·{" "}
                      {moreHumanThanHumanEvent.location}
                    </p>

                    <h3 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-white mb-3">
                      {moreHumanThanHumanEvent.title}
                    </h3>

                    <p className="text-sm text-white/55 leading-relaxed mb-5">
                      {moreHumanThanHumanEvent.description}
                    </p>

                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-white/80">
                      Watch the recap
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
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
                <source src={MORE_HUMAN_RECAP_VIDEO_URL} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
