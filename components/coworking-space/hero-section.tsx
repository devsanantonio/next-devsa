"use client"

import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { Maximize2, X } from "lucide-react"

const HERO_VIDEO_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking.mp4"
const HERO_POSTER_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg"

type SpaceState = "open" | "closed" | "unknown"

interface ActiveAdmin {
  id?: string
  name: string
  avatarUrl: string | null
  discordUserId?: string
}

interface StatusState {
  ok: boolean
  online: boolean
  state: SpaceState
  updatedAt: number | null
  activeAdmin: ActiveAdmin | null
}

const POLL_INTERVAL_MS = 120_000
const DISCORD_INVITE_URL = "https://discord.gg/cvHHzThrEw"
const CONTACT_EMAIL = "coworking@devsa.community"

const fallbackStatus: StatusState = {
  ok: false,
  online: false,
  state: "unknown",
  updatedAt: null,
  activeAdmin: null,
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function HeroSection() {
  const [status, setStatus] = useState<StatusState>(fallbackStatus)
  const [now, setNow] = useState(Date.now())
  const [expanded, setExpanded] = useState(false)
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    if (!enlargedPhoto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedPhoto(null)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [enlargedPhoto])

  const refreshStatus = useEffectEvent(async () => {
    try {
      const res = await fetch("/api/discord-status", { cache: "no-store" })
      const data = await res.json()
      setStatus({
        ...fallbackStatus,
        ...data,
        activeAdmin: data.activeAdmin ?? null,
      })
    } catch {
      setStatus(fallbackStatus)
    }
  })

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      if (refreshTimer) return
      refreshTimer = setInterval(() => {
        void refreshStatus()
      }, POLL_INTERVAL_MS)
    }
    const stopPolling = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
    const onVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        void refreshStatus()
        startPolling()
      }
    }

    void refreshStatus()
    startPolling()
    document.addEventListener("visibilitychange", onVisibility)

    const clockTimer = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      stopPolling()
      clearInterval(clockTimer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const indicatorClass = useMemo(() => {
    if (!status.ok) return "bg-gray-400"
    return status.online ? "bg-green-400 animate-pulse" : "bg-red-400"
  }, [status])

  const statusLabel = useMemo(() => {
    if (!status.ok) return "Checking…"
    return status.state === "open" ? "Open" : status.state === "closed" ? "Closed" : "Unknown"
  }, [status])

  const lastUpdatedText = useMemo(() => {
    if (!status.updatedAt) return "Status unavailable"

    const elapsedMs = Math.max(0, now - status.updatedAt)
    const elapsedMinutes = Math.floor(elapsedMs / 60_000)

    if (elapsedMinutes < 1) return "Updated just now"
    if (elapsedMinutes < 60) return `Updated ${elapsedMinutes}m ago`

    const elapsedHours = Math.floor(elapsedMinutes / 60)
    if (elapsedHours < 24) return `Updated ${elapsedHours}h ago`

    const elapsedDays = Math.floor(elapsedHours / 24)
    return `Updated ${elapsedDays}d ago`
  }, [now, status.updatedAt])

  return (
    <>
    <section className="relative min-h-dvh" data-testid="coworking-homepage-container-carousel" id="carousel" data-bg-type="light">
      <div className="-mt-px bg-white pb-6 pt-[calc(1.5rem-var(--header-height))] text-black md:pb-24 md:pt-[calc(6rem-var(--header-height))] lg:pt-[calc(12rem-var(--header-height))]">
        <div className="flex flex-col gap-6 md:gap-y-12 lg:gap-y-10">
          <div className="container-responsive my-0! grid grid-cols-1 gap-10 lg:grid-cols-[repeat(18,1fr)] lg:gap-5">
            <div className="mt-20 flex flex-col items-start gap-y-8 md:mt-24 lg:col-span-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <p className="letter-spacing-wide text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">
                    Coworking Space
                  </p>
                  <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
                    A Space to{" "}
                    <span className="font-light italic text-gray-600">Build</span>{" "}
                    in Downtown San Antonio.
                  </h1>
                </div>

                <div className="space-y-5">
                  <p className="text-lg font-light leading-[1.4] text-gray-700 md:text-xl">
                    Workstations with monitors, a private office for calls, a
                    projector, and always-stocked coffee.{" "}
                    <strong className="font-semibold text-gray-900">
                      Free to use
                    </strong>
                    , no Geekdom day pass or membership required — part of{" "}
                    <strong className="font-semibold text-gray-900">
                      Building Together
                    </strong>
                    , generously supported by{" "}
                    <strong className="font-semibold text-gray-900">
                      Geekdom
                    </strong>
                    .
                  </p>
                  <p className="text-base leading-relaxed text-gray-500 md:text-lg">
                    Run by volunteer organizers from{" "}
                    <span className="font-medium text-gray-700">Greater Gaming Society</span>,{" "}
                    <span className="font-medium text-gray-700">Alamo Python</span>,{" "}
                    <span className="font-medium text-gray-700">Dungo Digital</span>,{" "}
                    <span className="font-medium text-gray-700">ACM San Antonio</span>{" "}
                    and more — coordinated by{" "}
                    <span className="font-medium text-gray-700">DEVSA</span>, a 501(c)(3) education nonprofit.
                  </p>
                </div>

                {status.ok && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="space-y-3"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3 md:px-8 md:py-4 font-bold text-sm md:text-base text-gray-900 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${indicatorClass}`} />
                      Space {statusLabel}
                      <span className="text-xs font-medium text-gray-400 md:text-sm">{lastUpdatedText}</span>
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.25 }}
                        className="max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-gray-400">
                              Location
                            </p>
                            <p className="mt-1.5 text-sm font-medium leading-snug text-gray-900">
                              110 E Houston St, 6th Floor
                            </p>
                            <p className="text-sm font-light leading-snug text-gray-600">
                              San Antonio, TX 78205
                            </p>
                          </div>

                          {status.activeAdmin && (
                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                              {status.activeAdmin.avatarUrl ? (
                                <img
                                  src={status.activeAdmin.avatarUrl}
                                  alt={status.activeAdmin.name}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold leading-none text-white">
                                  {getInitials(status.activeAdmin.name)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold leading-none text-gray-900">
                                  {status.activeAdmin.name}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-none text-gray-500">On duty</p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 border-t border-gray-100 pt-3">
                            <p className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-gray-400">
                              Get in touch
                            </p>
                            <a
                              href={`mailto:${CONTACT_EMAIL}`}
                              className="block text-sm font-medium text-gray-900 transition-colors hover:text-gray-700"
                            >
                              Email {CONTACT_EMAIL} →
                            </a>
                            <a
                              href={DISCORD_INVITE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm font-medium text-gray-900 transition-colors hover:text-gray-700"
                            >
                              Chat in our Discord →
                            </a>
                          </div>

                          <p className="text-balance border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
                            Access is coordinated through Discord — but email works just as well.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 lg:col-span-8 lg:mt-24"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={HERO_POSTER_URL}
                  className="absolute inset-0 h-full w-full object-cover grayscale"
                  aria-label="Builders working at the DEVSA coworking space"
                >
                  <source src={HERO_VIDEO_URL} type="video/mp4" />
                </video>
              </div>
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="container-responsive"
          >
            <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-5">
              {[
                {
                  src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg",
                  alt: "Builders working together at the DEVSA coworking space",
                  caption: "Plug in & build",
                },
                {
                  src: "https://devsa-assets.s3.us-east-2.amazonaws.com/downtown.jpg",
                  alt: "Downtown San Antonio view from Geekdom on Houston Street",
                  caption: "Downtown SA",
                },
                {
                  src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg",
                  alt: "Lounge and meeting area inside the DEVSA coworking space",
                  caption: "Lounge & breaks",
                },
              ].map((item) => (
                <figure key={item.src} className="space-y-2 md:space-y-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      alt={item.alt}
                      fill
                      sizes="(max-width: 1024px) 33vw, 22vw"
                      className="object-cover grayscale"
                      src={item.src}
                    />
                    {/* Mobile-only: tap to enlarge */}
                    <button
                      type="button"
                      onClick={() => setEnlargedPhoto({ src: item.src, alt: item.alt })}
                      className="absolute inset-0 lg:hidden"
                      aria-label={`Enlarge: ${item.alt}`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm"
                      >
                        <Maximize2 className="h-3.5 w-3.5 text-white" />
                      </span>
                    </button>
                  </div>
                  <figcaption className="text-[10px] md:text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Mobile-only: tap-to-enlarge photo modal */}
    <AnimatePresence>
      {enlargedPhoto && (
        <motion.div
          key="enlarge-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 lg:hidden"
          onClick={() => setEnlargedPhoto(null)}
        >
          <motion.div
            key="enlarge-image"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              aria-label="Close enlarged image"
            >
              <X className="h-7 w-7" />
            </button>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-900">
              <Image
                src={enlargedPhoto.src}
                alt={enlargedPhoto.alt}
                fill
                sizes="100vw"
                className="object-contain grayscale"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
