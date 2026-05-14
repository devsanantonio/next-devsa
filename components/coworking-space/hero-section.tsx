"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useMagen } from "@/lib/hooks/use-magen"

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
  code?: string
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

const COLD_START_RETRY_MS = 30_000

const PING_CODE_COPY: Record<string, string> = {
  BOT_UNAVAILABLE: "The bot is waking up. Try again in a moment.",
  BOT_REQUEST_FAILED: "We can't reach the bot right now. Try Discord directly.",
  BOT_AUTH_NOT_CONFIGURED: "Bot connection isn't configured. Try Discord directly.",
  RATE_LIMITED: "Too many pings. Please wait a moment.",
  VERIFICATION_FAILED: "We couldn't verify you. Refresh the page and try again.",
  NAME_REQUIRED: "Please add your name.",
  MESSAGE_REQUIRED: "Please include a short message.",
}

function friendlyPingMessage(code: string | undefined, serverMessage: string | undefined): string {
  if (code && PING_CODE_COPY[code]) return PING_CODE_COPY[code]
  return serverMessage || "Unable to send ping right now."
}

const DISCORD_INVITE_URL = "https://discord.gg/cvHHzThrEw"
const PENDING_PING_KEY = "devsa:coworking:pending-ping"
const PENDING_PING_STALE_MS = 10 * 60 * 1000

const QUICK_MESSAGES: Array<{ label: string; message: string }> = [
  { label: "Access", message: "How do I access the coworking space? Are there set hours or do I need to coordinate with an admin?" },
  { label: "Hours", message: "When is the coworking space typically open? Are there regular hours?" },
  { label: "Cost", message: "Is the space really free to use? Are there any fees, RSVPs, or membership requirements?" },
  { label: "Tour", message: "I'd love to come by and see the space. Can we set up a quick tour?" },
  { label: "Membership", message: "How do I get more involved with DEVSA or become a regular at the space?" },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface PendingPing {
  adminName: string
  sentAt: number
  cooldownEndsAt: number | null
}

function formatTimeAgo(sentAt: number, currentTime: number): string {
  const elapsedMs = Math.max(0, currentTime - sentAt)
  const seconds = Math.floor(elapsedMs / 1000)
  if (seconds < 30) return "just now"
  if (seconds < 60) return "less than a minute ago"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function HeroSection() {
  const [status, setStatus] = useState<StatusState>(fallbackStatus)
  const [now, setNow] = useState(Date.now())
  const [expanded, setExpanded] = useState(false)
  const [showPingDialog, setShowPingDialog] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [pingName, setPingName] = useState("")
  const [pingEmail, setPingEmail] = useState("")
  const [pingMessage, setPingMessage] = useState("")
  const [pingFeedback, setPingFeedback] = useState<{ tone: "success" | "error" | "info"; message: string } | null>(null)
  const [pendingPing, setPendingPing] = useState<PendingPing | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!pingFeedback) return
    // pending/retrying states stay until replaced by success or error
    if (pingFeedback.tone === "info") return
    const timer = setTimeout(() => setPingFeedback(null), 20_000)
    return () => clearTimeout(timer)
  }, [pingFeedback])

  // Pending ping: hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PENDING_PING_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as PendingPing
      if (typeof parsed?.sentAt !== "number" || typeof parsed?.adminName !== "string") return
      setPendingPing(parsed)
    } catch {
      // Corrupted entry — ignore and clean up
      try {
        window.localStorage.removeItem(PENDING_PING_KEY)
      } catch {
        // ignore
      }
    }
  }, [])

  // Pending ping: persist or remove on change
  useEffect(() => {
    try {
      if (pendingPing) {
        window.localStorage.setItem(PENDING_PING_KEY, JSON.stringify(pendingPing))
      } else {
        window.localStorage.removeItem(PENDING_PING_KEY)
      }
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }, [pendingPing])

  // Pending ping: auto-clear when cooldown ends or 10 min has elapsed
  useEffect(() => {
    if (!pendingPing) return
    const cooldownDone =
      typeof pendingPing.cooldownEndsAt === "number" && pendingPing.cooldownEndsAt <= now
    const stale = now - pendingPing.sentAt > PENDING_PING_STALE_MS
    if (cooldownDone || stale) {
      setPendingPing(null)
    }
  }, [now, pendingPing])

  // Modal a11y: autofocus, Escape, Tab focus trap
  useEffect(() => {
    if (!showPingDialog) return

    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus()
    }, 0)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPingDialog(false)
        setPingName("")
        setPingEmail("")
        setPingMessage("")
        return
      }
      if (event.key !== "Tab") return

      const root = dialogRef.current
      if (!root) return
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"))
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener("keydown", onKey)
    }
  }, [showPingDialog])

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

  // Direct-bot DM is the "express lane" — only available with an active admin + open space + ping enabled.
  // The inquiry form itself (with email + ops fallback) is ALWAYS available when status has loaded.
  const canDmActiveAdmin = status.state === "open" && Boolean(status.activeAdmin) && status.ping.enabled && !status.ping.cooldownActive && !isPinging
  const canAsk = status.ok && !isPinging

  // Contextual hint shown inside the expanded panel — reassures the user that the inquiry will still
  // go through email + ops queue even if the direct-bot path isn't available. Not a blocker.
  const inquiryHint = useMemo(() => {
    if (!status.ok) return null
    if (status.state !== "open") {
      return "The space isn't open right now — we'll still get your question and reply by email."
    }
    if (!status.activeAdmin) {
      return "No admin on duty right now — we'll still get your question and reply by email."
    }
    if (!status.ping.enabled) {
      return "The admin on duty isn't taking direct pings — we'll route your question by email."
    }
    return null
  }, [status.ok, status.state, status.activeAdmin, status.ping.enabled])

  const cooldownLabel = useMemo(() => {
    if (!status.ping.cooldownActive || remainingCooldown <= 0) return null
    return `Direct admin ping available in ${formatCooldown(remainingCooldown)}`
  }, [remainingCooldown, status.ping.cooldownActive])

  const feedbackClass =
    pingFeedback?.tone === "error"
      ? "border-red-100 bg-red-50 text-red-700"
      : pingFeedback?.tone === "info"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-green-100 bg-green-50 text-green-700"

  const emailValid = pingEmail.trim() === "" || EMAIL_REGEX.test(pingEmail.trim())
  const canSubmitPing = pingName.trim().length >= 2 && pingMessage.trim().length >= 5 && emailValid && !isPinging

  const submitPing = async (): Promise<{ ok: boolean; status: number; data: PingResponse | null }> => {
    const magenResult = await magenVerify()
    const magenSessionId = magenResult?.session_id
    const emailTrimmed = pingEmail.trim()

    try {
      const res = await fetch("/api/coworking-space/ping-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pingName.trim().slice(0, 100),
          message: pingMessage.trim().slice(0, 1000),
          ...(emailTrimmed && { email: emailTrimmed }),
          ...(magenSessionId && { magenSessionId }),
        }),
      })
      const data = (await res.json().catch(() => null)) as PingResponse | null
      return { ok: res.ok && Boolean(data?.ok), status: res.status, data }
    } catch {
      return { ok: false, status: 0, data: null }
    }
  }

  const applyPingState = (data: PingResponse | null) => {
    if (!data?.ping) return
    setStatus((current) => ({
      ...current,
      ping: { ...current.ping, ...data.ping },
    }))
  }

  const successMessage = (emailProvided: boolean) =>
    emailProvided
      ? "Got it — we'll reply to your email shortly."
      : "Got it — an admin will follow up on Discord."

  const handlePingConfirm = async () => {
    if (!canSubmitPing) return
    setIsPinging(true)
    setPingFeedback(null)

    // Capture submit-time values — status and form may change while we await.
    const adminNameAtSubmit = status.activeAdmin?.name ?? "the DEVSA team"
    const emailProvided = pingEmail.trim().length > 0

    const first = await submitPing()
    applyPingState(first.data)

    if (first.ok) {
      setPingFeedback({ tone: "success", message: successMessage(emailProvided) })
      setPendingPing({
        adminName: adminNameAtSubmit,
        sentAt: Date.now(),
        cooldownEndsAt: first.data?.ping?.cooldownEndsAt ?? null,
      })
      setExpanded(true)
      setShowPingDialog(false)
      setPingName("")
      setPingEmail("")
      setPingMessage("")
      setIsPinging(false)
      void refreshStatus()
      return
    }

    // Cold-start signals: 503 from our route, network error (status 0), or explicit code
    const couldBeColdStart =
      first.status === 503 || first.status === 0 || first.data?.code === "BOT_UNAVAILABLE"

    if (couldBeColdStart) {
      setShowPingDialog(false)
      setPingName("")
      setPingEmail("")
      setPingMessage("")
      setExpanded(true)
      setPingFeedback({
        tone: "info",
        message: "Bot is waking up — retrying in 30 seconds…",
      })

      await new Promise((resolve) => setTimeout(resolve, COLD_START_RETRY_MS))

      const second = await submitPing()
      applyPingState(second.data)

      if (second.ok) {
        setPingFeedback({ tone: "success", message: successMessage(emailProvided) })
        setPendingPing({
          adminName: adminNameAtSubmit,
          sentAt: Date.now(),
          cooldownEndsAt: second.data?.ping?.cooldownEndsAt ?? null,
        })
      } else {
        setPingFeedback({
          tone: "error",
          message: friendlyPingMessage(second.data?.code, second.data?.message),
        })
      }
      setIsPinging(false)
      void refreshStatus()
      return
    }

    // Non-retryable failure (rate limit, validation, verification, etc.)
    setPingFeedback({
      tone: "error",
      message: friendlyPingMessage(first.data?.code, first.data?.message),
    })
    setShowPingDialog(false)
    setPingName("")
    setPingEmail("")
    setPingMessage("")
    setIsPinging(false)
    void refreshStatus()
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
                    A Space to{" "}
                    <span className="font-light italic text-gray-600">Build</span>,{" "}
                    in Downtown San Antonio.
                  </h1>
                </div>

                <div className="space-y-5">
                  <p className="text-lg font-light leading-[1.4] text-gray-700 md:text-xl">
                    Workstations with monitors, a private office for calls, a
                    projector, and always-stocked coffee.{" "}
                    <strong className="font-semibold text-gray-900">
                      Free to use
                    </strong>{" "}
                    — no Geekdom day pass or membership required. Generously
                    supported by{" "}
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
                        <div className="space-y-3">
                          {pendingPing && (
                            <div className="space-y-1.5 rounded-lg border border-green-100 bg-green-50 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold leading-snug text-green-800">
                                  Sent to {pendingPing.adminName} · {formatTimeAgo(pendingPing.sentAt, now)}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPendingPing(null)
                                  }}
                                  aria-label="Dismiss"
                                  className="-mr-1 -mt-0.5 shrink-0 text-base leading-none text-green-700 opacity-60 transition hover:opacity-100"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-[11px] leading-relaxed text-green-700">
                                Check your inbox — we&apos;ll reply by email. If you also use Discord, watch the{" "}
                                <span className="font-medium">#coworking-space</span> channel.
                              </p>
                              <a
                                href={DISCORD_INVITE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold leading-none text-green-800 underline underline-offset-2 transition hover:text-green-900"
                              >
                                Open Discord (optional) →
                              </a>
                            </div>
                          )}
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

                          {canAsk && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowPingDialog(true)
                              }}
                              className="inline-flex items-center gap-2 self-start rounded-full bg-gray-900 px-3.5 py-1.5 text-[11px] font-bold leading-none text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-md"
                            >
                              {canDmActiveAdmin && status.activeAdmin
                                ? `Message ${status.activeAdmin.name.split(" ")[0]} directly`
                                : "Ask the team a question"}
                            </button>
                          )}

                          {pingFeedback && (
                            <div
                              role={pingFeedback.tone === "error" ? "alert" : "status"}
                              aria-live={pingFeedback.tone === "error" ? "assertive" : "polite"}
                              className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${feedbackClass}`}
                            >
                              <span className="flex-1 text-xs font-medium leading-relaxed">
                                {pingFeedback.message}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPingFeedback(null)}
                                aria-label="Dismiss notification"
                                className="-mr-1 -mt-0.5 shrink-0 text-base leading-none opacity-60 transition hover:opacity-100"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {cooldownLabel && (
                            <p className="text-[11px] font-medium leading-none text-gray-400">
                              {cooldownLabel}
                            </p>
                          )}

                          {inquiryHint && (
                            <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
                              {inquiryHint}
                            </p>
                          )}

                          <p className="text-balance border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
                            The space doesn&apos;t keep regular office hours. We coordinate access through{" "}
                            <a
                              href={DISCORD_INVITE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-600 underline underline-offset-2 transition hover:text-gray-900"
                            >
                              Discord
                            </a>
                            {" "}— but if you&apos;d rather not, send us your question above and we&apos;ll reply by email.
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
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg"
                  alt="Open workspace area with desks and natural lighting at the DEVSA coworking space"
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  priority
                  className="object-cover grayscale"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {showPingDialog && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowPingDialog(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ping-dialog-title"
            className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowPingDialog(false)
                setPingName("")
                setPingEmail("")
                setPingMessage("")
              }}
              aria-label="Close dialog"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {canDmActiveAdmin && status.activeAdmin && (
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
                    Active Admin · On Duty
                  </p>
                  <p className="mt-1 text-sm font-bold leading-none text-gray-900">{status.activeAdmin.name}</p>
                </div>
              </div>
            )}

            <div className={`${canDmActiveAdmin && status.activeAdmin ? "mt-4" : ""} space-y-1.5`}>
              <h3 id="ping-dialog-title" className="text-base font-black leading-tight tracking-[-0.01em] text-gray-900">
                {canDmActiveAdmin && status.activeAdmin
                  ? `Message ${status.activeAdmin.name.split(" ")[0]} directly`
                  : "Ask the team a question"}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 font-light">
                {canDmActiveAdmin && status.activeAdmin
                  ? "Your message goes straight to the admin on Discord. Add your email if you'd prefer a reply by email."
                  : "Send us a question about the space. We'll reply by email if you give us one, or in our Discord #coworking-space channel."}
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="ping-name" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Your name
              </label>
              <input
                id="ping-name"
                ref={nameInputRef}
                type="text"
                value={pingName}
                onChange={(e) => setPingName(e.target.value)}
                maxLength={100}
                placeholder="First and last name"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm leading-none text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
            </div>

            <div className="mt-3">
              <label htmlFor="ping-email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Email <span className="font-medium normal-case tracking-normal text-gray-400">— for our reply</span>
              </label>
              <input
                id="ping-email"
                type="email"
                value={pingEmail}
                onChange={(e) => setPingEmail(e.target.value)}
                maxLength={254}
                placeholder="you@example.com"
                aria-invalid={!emailValid}
                className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-sm leading-none text-gray-900 placeholder:text-gray-400 focus:outline-none ${emailValid ? "border-gray-200 focus:border-gray-400" : "border-red-300 focus:border-red-400"}`}
              />
              {!emailValid && (
                <p className="mt-1 text-[10px] text-red-600">Please enter a valid email — or leave it blank.</p>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor="ping-message" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Your question
              </label>
              <textarea
                id="ping-message"
                value={pingMessage}
                onChange={(e) => setPingMessage(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="e.g. How do I access the space if I'd like to visit on a weekend?"
                className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {QUICK_MESSAGES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setPingMessage(item.message)}
                    className="rounded-full border border-gray-200 px-2.5 py-1 text-[10px] font-medium leading-none text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">
                {pingMessage.length}/1000 · Tap a chip to start, then add your details.
              </p>
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
                  setPingEmail("")
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
                {isPinging ? "Sending..." : "Send"}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
