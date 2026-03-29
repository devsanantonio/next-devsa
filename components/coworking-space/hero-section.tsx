"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { useMagen } from "@/lib/hooks/use-magen"

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
  const [expanded, setExpanded] = useState(false)
  const [showPingDialog, setShowPingDialog] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [pingName, setPingName] = useState("")
  const [pingMessage, setPingMessage] = useState("")
  const [pingFeedback, setPingFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const { verify: magenVerify, isReady: magenReady } = useMagen()

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

  const feedbackClass = pingFeedback?.tone === "error" ? "text-red-500" : "text-green-600"

  const canSubmitPing = pingName.trim().length >= 2 && pingMessage.trim().length >= 5 && !isPinging

  const handlePingConfirm = async () => {
    if (!canSubmitPing) return
    setIsPinging(true)
    setPingFeedback(null)

    // MAGEN verification
    const magenResult = await magenVerify()
    const magenSessionId = magenResult?.session_id

    try {
      const res = await fetch("/api/coworking-space/ping-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pingName.trim().slice(0, 100),
          message: pingMessage.trim().slice(0, 280),
          ...(magenSessionId && { magenSessionId }),
        }),
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
      setPingName("")
      setPingMessage("")
      void refreshStatus()
    }
  }

  return (
    <section className="relative" data-testid="coworking-homepage-container-carousel" id="carousel" data-bg-type="light">
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
                    Community Driven Coworking Space
                  </p>
                  <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-gray-900 md:text-5xl lg:text-6xl xl:text-7xl">
                    A True Community Space,{" "}
                    <span className="font-light italic text-gray-600">Powered by</span>{" "}
                    Local Builders.
                  </h1>
                </div>

                <div className="space-y-4">
                  <p className="text-lg font-light leading-[1.4] text-gray-700 md:text-xl">
                    What started as a simple idea grew into a physical reality, generously supported by{" "}
                    <strong className="font-semibold text-gray-900">Geekdom!</strong>{" "}
                    Our downtown coworking space is completely{" "}
                    <strong className="font-semibold text-gray-900">free to use</strong> — no membership or daily fees.
                  </p>

                  <p className="text-base leading-relaxed text-gray-500 md:text-lg">
                    This resource is proudly administered by volunteers from{" "}
                    <span className="font-medium text-gray-700">Greater Gaming Society</span>,{" "}
                    <span className="font-medium text-gray-700">Alamo Python</span>,{" "}
                    <span className="font-medium text-gray-700">Dungo Digital</span>,{" "}
                    <span className="font-medium text-gray-700">ACM San Antonio</span>{" "}
                    and more.
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
                        <div className="space-y-3">
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
                              {canPing && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowPingDialog(true)
                                  }}
                                  className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-bold leading-none text-white transition-all duration-300 hover:bg-gray-800 hover:scale-105"
                                >
                                  Ping
                                </button>
                              )}
                            </div>
                          )}

                          {pingFeedback && (
                            <p className={`text-[11px] font-medium leading-none ${feedbackClass}`}>
                              {pingFeedback.message}
                            </p>
                          )}

                          {!canPing && status.activeAdmin && status.ping.cooldownActive && remainingCooldown > 0 && (
                            <p className="text-[11px] font-medium leading-none text-gray-400">
                              {pingLabel}
                            </p>
                          )}

                          <p className="text-balance border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
                            Live status from our{" "}
                            <a
                              href="https://discord.gg/cvHHzThrEw"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-600 underline underline-offset-2 transition hover:text-gray-900"
                            >
                              Discord
                            </a>{" "}
                            bot monitoring the{" "}
                            <span className="font-medium text-gray-500">#coworking-space</span>{" "}
                            channel — when an admin opens the space, this button updates in real time.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
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

      {showPingDialog && status.activeAdmin && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowPingDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              {status.activeAdmin.avatarUrl ? (
                <img
                  src={status.activeAdmin.avatarUrl}
                  alt={status.activeAdmin.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold leading-none text-white">
                  {getInitials(status.activeAdmin.name)}
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-gray-500">
                  Active Admin
                </p>
                <p className="mt-1 text-sm font-bold leading-none text-gray-900">{status.activeAdmin.name}</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-black leading-tight tracking-[-0.01em] text-gray-900">Ping active admin?</h3>
              <p className="text-sm leading-relaxed text-gray-600 font-light">
                This will notify the current space admin on{" "}
                <a
                  href="https://discord.gg/cvHHzThrEw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
                >
                  Discord
                </a>{" "}
                that you need help accessing the space.
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="ping-name" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Your name
              </label>
              <input
                id="ping-name"
                type="text"
                value={pingName}
                onChange={(e) => setPingName(e.target.value)}
                maxLength={100}
                placeholder="First and last name"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm leading-none text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div className="mt-3">
              <label htmlFor="ping-message" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Message
              </label>
              <textarea
                id="ping-message"
                value={pingMessage}
                onChange={(e) => setPingMessage(e.target.value)}
                maxLength={280}
                rows={2}
                placeholder="e.g. I'm downstairs at the lobby entrance"
                className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-gray-400">{pingMessage.length}/280</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2.5">
              <p className="text-[10px] text-gray-400">
                Protected by{" "}
                <a
                  href="https://magentrust.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-500 underline underline-offset-2 transition hover:text-gray-900"
                >
                  Magen
                </a>
              </p>
              <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowPingDialog(false)
                  setPingName("")
                  setPingMessage("")
                }}
                className="cursor-pointer rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium leading-none text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePingConfirm}
                disabled={!canSubmitPing}
                className="cursor-pointer rounded-full bg-gray-900 px-3.5 py-1.5 text-sm font-bold leading-none text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPinging ? "Sending..." : "Send ping"}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
