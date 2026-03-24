"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

const mediaItems = [
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg",
    alt: "Open workspace area with desks and natural lighting",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_7186.jpg",
    alt: "Community members collaborating at the DEVSA space",
    width: 1067,
    height: 1600,
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg",
    alt: "Downtown San Antonio view from Geekdom on Houston Street",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6429.jpg",
    alt: "DEVSA coworking lounge and meeting area",
    width: 1067,
    height: 1600,
  },
]

export function HeroSection() {
  const POLL_INTERVAL_MS = 120_000
  const [status, setStatus] = useState<{
    ok: boolean
    online: boolean
    state: "open" | "closed" | "unknown"
    updatedAt: number | null
  }>({ ok: false, online: false, state: "unknown", updatedAt: null })
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let cancelled = false

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/discord-status", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled) setStatus(data)
      } catch {
        if (!cancelled) setStatus({ ok: false, online: false, state: "unknown", updatedAt: null })
      }
    }

    fetchStatus()
    const refreshTimer = setInterval(fetchStatus, POLL_INTERVAL_MS)
    const clockTimer = setInterval(() => setNow(Date.now()), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(refreshTimer)
      clearInterval(clockTimer)
    }
  }, [])

  const indicatorClass = useMemo(() => {
    if (!status.ok) return "bg-gray-400"
    return status.online ? "bg-green-500 animate-pulse" : "bg-red-500"
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
    <section className="relative" data-testid="coworking-homepage-container-carousel" id="carousel" data-bg-type="light">
      <div className="-mt-px pt-[calc(1.5rem-var(--header-height))] md:pt-[calc(6rem-var(--header-height))] lg:pt-[calc(12rem-var(--header-height))] pb-6 md:pb-24 text-black bg-white">
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
                  <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em] letter-spacing-wide">
                    Community Driven Coworking Space
                  </p>
                  <h1 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                    A True Community Space,{" "}
                    <span className="text-gray-600 font-light italic">Powered by</span>{" "}
                    Local Builders.
                  </h1>
                </div>
              
                <div className="space-y-6 max-w-3xl">
                  <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                    What started as a simple idea grew into a physical reality, generously supported by{" "}
                    <strong className="font-semibold text-gray-900">Geekdom!</strong>
                  </p>
                  
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                    Our downtown coworking space is completely{" "}
                    <strong className="font-semibold text-gray-900">free to use</strong> — no membership or daily fees.
                  </p>
                  
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                    This resource is proudly administered by a volunteer team of organizers from{" "}
                    <span className="font-medium text-gray-700">Greater Gaming Society</span>,{" "}
                    <span className="font-medium text-gray-700">Alamo Python</span>,{" "}
                    <span className="font-medium text-gray-700">Dungo Digital</span>,{" "}
                    <span className="font-medium text-gray-700">ACM San Antonio</span>{" "}
                    and more!
                  </p>
                </div>    

              </motion.div>
            </div>
          </div>

          {/* Marquee Carousel */}
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-8 animate-marquee-slow lg:animate-marquee">
              {[...mediaItems, ...mediaItems].map((item, index) => (
                <div key={`carousel-${index}`} className="flex w-80 shrink-0 flex-col justify-end">
                  <div className="relative aspect-4/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-100 rounded-lg" />
                    <Image
                      alt={item.alt}
                      loading="lazy"
                      width={item.width}
                      height={item.height}
                      className="rounded-lg grayscale object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      src={item.src}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {status.ok && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6"
        >
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${indicatorClass}`}
            />
            <div className="leading-tight">
              <p className="text-xs font-medium text-gray-900 uppercase tracking-[0.15em]">
                Space {statusLabel}
              </p>
              <p className="text-[11px] text-gray-400 tracking-wide">{lastUpdatedText}</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
