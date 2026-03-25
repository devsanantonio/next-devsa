"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useEffectEvent, useMemo, useState } from "react"

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

type SpaceState = "open" | "closed" | "unknown"

interface ActiveAdmin {
  id?: string
  name: string
  avatarUrl: string | null
  discordUserId?: string
}

interface PingState {
  enabled: boolean
  cooldownActive: boolean
  cooldownEndsAt: number | null
  cooldownSecondsRemaining: number
}

interface StatusState {
  ok: boolean
  online: boolean
  state: SpaceState
  updatedAt: number | null
  activeAdmin: ActiveAdmin | null
  ping: PingState
}

interface PingResponse {
  ok?: boolean
  message?: string
  ping?: Partial<PingState>
}

const POLL_INTERVAL_MS = 120_000
const fallbackStatus: StatusState = {
  ok: false,
  online: false,
  state: "unknown",
  updatedAt: null,
  activeAdmin: null,
  ping: {
    enabled: false,
    cooldownActive: false,
    cooldownEndsAt: null,
    cooldownSecondsRemaining: 0,
  },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatCooldown(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const remainder = seconds % 60
  if (remainder === 0) return `${mins}m`
  return `${mins}m ${remainder}s`
}

export function HeroSection() {
  const [status, setStatus] = useState<StatusState>(fallbackStatus)
  const [now, setNow] = useState(Date.now())
  const [showPingDialog, setShowPingDialog] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [pingFeedback, setPingFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const refreshStatus = useEffectEvent(async () => {
    try {
      const res = await fetch("/api/discord-status", { cache: "no-store" })
      const data = await res.json()
      setStatus({
        ...fallbackStatus,
        ...data,
        activeAdmin: data.activeAdmin ?? null,
        ping: {
          ...fallbackStatus.ping,
          ...(data.ping || {}),
        },
      })
    } catch {
      setStatus(fallbackStatus)
    }
  })

  useEffect(() => {
    void refreshStatus()
    const refreshTimer = setInterval(() => {
      void refreshStatus()
    }, POLL_INTERVAL_MS)
    const clockTimer = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      clearInterval(refreshTimer)
      clearInterval(clockTimer)
    }
  }, [])

  useEffect(() => {
    if (!pingFeedback) return
    const timer = setTimeout(() => setPingFeedback(null), 5000)
    return () => clearTimeout(timer)
  }, [pingFeedback])

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

  const remainingCooldown = useMemo(() => {
    if (!status.ping.cooldownActive) return 0
    if (typeof status.ping.cooldownEndsAt === "number") {
      return Math.max(0, Math.ceil((status.ping.cooldownEndsAt - now) / 1000))
    }
    return Math.max(0, status.ping.cooldownSecondsRemaining)
  }, [now, status.ping.cooldownActive, status.ping.cooldownEndsAt, status.ping.cooldownSecondsRemaining])

  useEffect(() => {
    if (!status.ping.cooldownActive) return
    if (remainingCooldown !== 0) return
    void refreshStatus()
  }, [remainingCooldown, refreshStatus, status.ping.cooldownActive])

  const canPing = status.state === "open" && Boolean(status.activeAdmin) && status.ping.enabled && !status.ping.cooldownActive && !isPinging

  const pingLabel = useMemo(() => {
    if (isPinging) return "Sending ping..."
    if (!status.activeAdmin || status.state !== "open") return "Ping unavailable"
    if (status.ping.cooldownActive && remainingCooldown > 0) return `Ping available in ${formatCooldown(remainingCooldown)}`
    if (status.ping.enabled) return "Ping active admin"
    return "Ping unavailable"
  }, [isPinging, remainingCooldown, status.activeAdmin, status.ping.cooldownActive, status.ping.enabled, status.state])

  const feedbackClass = pingFeedback?.tone === "error" ? "text-rose-500" : "text-emerald-600"

  const handlePingConfirm = async () => {
    setIsPinging(true)
    setPingFeedback(null)

    try {
      const res = await fetch("/api/coworking-space/ping-admin", {
        method: "POST",
      })
      const data = (await res.json().catch(() => null)) as PingResponse | null

      if (data?.ping) {
        setStatus((current) => ({
          ...current,
          ping: {
            ...current.ping,
            ...data.ping,
          },
        }))
      }

      if (!res.ok || !data?.ok) {
        setPingFeedback({
          tone: "error",
          message: data?.message || "Ping unavailable right now.",
        })
        setShowPingDialog(false)
        return
      }

      setPingFeedback({
        tone: "success",
        message: "Admin notified on Discord.",
      })
      setShowPingDialog(false)
    } catch {
      setPingFeedback({
        tone: "error",
        message: "Unable to reach the bot right now.",
      })
      setShowPingDialog(false)
    } finally {
      setIsPinging(false)
      void refreshStatus()
    }
  }

  return (
    <section className="relative" data-testid="coworking-homepage-container-carousel" id="carousel" data-bg-type="light">
      <div className="-mt-px bg-white pb-6 pt-[calc(1.5rem-var(--header-height))] text-black md:pb-24 md:pt-[calc(6rem-var(--header-height))] lg:pt-[calc(12rem-var(--header-height))]">
        <div className="flex flex-col gap-6 md:gap-y-12 lg:gap-y-10">
          <div className="container-responsive my-0! grid grid-cols-1 gap-10 lg:grid-cols-[repeat(18,1fr)] lg:gap-5">
            <div className="mt-20 flex flex-col items-start gap-y-12 md:mt-24 lg:col-span-11">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <p className="letter-spacing-wide text-sm font-medium uppercase tracking-[0.2em] text-gray-500 md:text-base">
                    Community Driven Coworking Space
                  </p>
                  <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
                    A True Community Space,{" "}
                    <span className="font-light italic text-gray-600">Powered by</span>{" "}
                    Local Builders.
                  </h1>
                </div>

                <div className="max-w-3xl space-y-6">
                  <p className="text-xl font-light leading-[1.4] text-gray-700 md:text-2xl">
                    What started as a simple idea grew into a physical reality, generously supported by{" "}
                    <strong className="font-semibold text-gray-900">Geekdom!</strong>
                  </p>

                  <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                    Our downtown coworking space is completely{" "}
                    <strong className="font-semibold text-gray-900">free to use</strong> — no membership or daily fees.
                  </p>

                  <p className="text-base leading-relaxed text-gray-500 md:text-lg">
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

          <div className="relative w-full overflow-hidden">
            <div className="flex animate-marquee-slow gap-8 lg:animate-marquee">
              {[...mediaItems, ...mediaItems].map((item, index) => (
                <div key={`carousel-${index}`} className="flex w-80 shrink-0 flex-col justify-end">
                  <div className="relative aspect-4/5 overflow-hidden">
                    <div className="absolute inset-0 rounded-lg bg-gray-100" />
                    <Image
                      alt={item.alt}
                      loading="lazy"
                      width={item.width}
                      height={item.height}
                      className="h-full w-full rounded-lg object-cover grayscale transition-transform duration-300 hover:scale-105"
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
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] backdrop-blur-[28px] [mask-image:radial-gradient(ellipse_at_center,black_22%,rgba(0,0,0,0.92)_36%,rgba(0,0,0,0.55)_56%,rgba(0,0,0,0.2)_72%,transparent_86%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_22%,rgba(0,0,0,0.92)_36%,rgba(0,0,0,0.55)_56%,rgba(0,0,0,0.2)_72%,transparent_86%)]"
            />

            <button
              type="button"
              onClick={() => {
                if (canPing) setShowPingDialog(true)
              }}
              disabled={!canPing}
              className={`relative w-full max-w-[34rem] rounded-[1.65rem] border border-gray-200 bg-white px-5 py-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition ${
                canPing ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.18)]" : "cursor-default"
              }`}
            >
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className={`h-4 w-4 shrink-0 rounded-full ${indicatorClass}`} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold uppercase tracking-[0.3em] text-slate-900 sm:text-[14px]">
                    Space {statusLabel}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-400 sm:text-[13px]">
                    <span>{lastUpdatedText}</span>
                    {status.activeAdmin && (
                      <span className="sm:hidden text-slate-500">with {status.activeAdmin.name}</span>
                    )}
                  </div>
                </div>

                {status.activeAdmin && (
                  <div className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 sm:flex">
                    {status.activeAdmin.avatarUrl ? (
                      <img
                        src={status.activeAdmin.avatarUrl}
                        alt={status.activeAdmin.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {getInitials(status.activeAdmin.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        On Duty
                      </p>
                      <p className="max-w-36 truncate text-xs font-semibold text-slate-700">
                        {status.activeAdmin.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(status.activeAdmin || pingFeedback) && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.16em]">
                    {pingFeedback ? (
                      <span className={feedbackClass}>{pingFeedback.message}</span>
                    ) : (
                      <>
                        {status.activeAdmin && (
                          <span className="text-slate-500">
                            {canPing ? "Click to ping on Discord" : pingLabel}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {showPingDialog && status.activeAdmin && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowPingDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {status.activeAdmin.avatarUrl ? (
                <img
                  src={status.activeAdmin.avatarUrl}
                  alt={status.activeAdmin.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {getInitials(status.activeAdmin.name)}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Active Admin
                </p>
                <p className="text-base font-semibold text-slate-900">{status.activeAdmin.name}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Ping active admin?</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                This will notify the current space admin on Discord that you need help accessing the space.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPingDialog(false)}
                className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePingConfirm}
                disabled={isPinging}
                className="cursor-pointer rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
              >
                {isPinging ? "Sending..." : "Send ping"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
