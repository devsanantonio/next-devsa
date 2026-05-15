"use client"

import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, X, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const DEVSA_VIDEO_URL = "https://devsa-assets.s3.us-east-2.amazonaws.com/morehuman/DevSA_MoreHuman2026_0313B.mp4"
const PRESET_AMOUNTS = [50, 100, 250, 500]

const communityGroups = [
  { id: "alamo-python", name: "Alamo Python" },
  { id: "acm-sa", name: "ACM SA" },
  { id: "defcongroup-sa", name: "DEFCON Group" },
  { id: "greater-gaming-society", name: "Greater Gaming Society" },
  { id: "atc", name: "Alamo Tech Collective" },
  { id: "gdg", name: "Google Developer Groups" },
  { id: "geeks-and-drinks", name: "Geeks && {...}" },
  { id: "dotnet-user-group", name: ".NET User Group" },
  { id: "datanauts", name: "Datanauts" },
]

// Confetti burst effect for logo easter egg
function LogoConfetti({ isActive }: { isActive: boolean }) {
  const [pieces, setPieces] = useState<Array<{
    id: number; x: number; y: number; color: string; size: number
    rotation: number; speedX: number; speedY: number; rotationSpeed: number
  }>>([])

  useEffect(() => {
    if (!isActive) { setPieces([]); return }

    const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#ec4899', '#f472b6', '#ffffff']
    setPieces(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 2,
      rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 8,
      speedY: Math.random() * -10 - 6,
      rotationSpeed: (Math.random() - 0.5) * 20,
    })))

    const interval = setInterval(() => {
      setPieces(prev => prev.map(p => ({
        ...p,
        x: p.x + p.speedX,
        y: p.y + p.speedY,
        rotation: p.rotation + p.rotationSpeed,
        speedX: p.speedX * 0.98,
        speedY: p.speedY + 0.8,
      })).filter(p => p.y < 150 && p.y > -50 && p.x > -20 && p.x < 120))
    }, 40)

    const timeout = setTimeout(() => { clearInterval(interval); setPieces([]) }, 1500)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [isActive])

  if (!isActive) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  )
}

// Donate modal (mirrors DonationCta from building together page)
function DonateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const donationAmount = isCustom ? Number(customAmount) : selectedAmount

  const handleDonate = async () => {
    if (!donationAmount || donationAmount < 5 || donationAmount > 10000) {
      setError("Please enter an amount between $5 and $10,000")
      return
    }
    setError("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationAmount,
          name: name || undefined,
          email: email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed inset-0 z-70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Support DEVSA</p>
                <h3 className="text-lg font-bold text-white leading-tight">Make a Donation</h3>
              </div>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-2.5">Select amount</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedAmount(amt); setIsCustom(false); setError("") }}
                    className={`cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      !isCustom && selectedAmount === amt
                        ? "bg-[#ef426f] text-white"
                        : "bg-white/6 text-neutral-400 hover:bg-white/10 hover:text-neutral-200"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <button
                type="button"
                onClick={() => { setIsCustom(true); setError("") }}
                className={`cursor-pointer text-sm font-medium transition-colors ${
                  isCustom ? "text-[#ef426f]" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Custom amount
              </button>
              {isCustom && (
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">$</span>
                  <input
                    type="number"
                    min={5}
                    max={10000}
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setError("") }}
                    className="w-full rounded-lg bg-white/6 border border-neutral-800 text-white pl-7 pr-4 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
                  />
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                Name <span className="text-neutral-600 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-white/6 border border-neutral-800 text-white px-4 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-500 mb-1.5">
                Email <span className="text-neutral-600 font-normal">(for receipt)</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/6 border border-neutral-800 text-white px-4 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="button"
              onClick={handleDonate}
              disabled={isSubmitting}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] hover:bg-[#d93a62] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Donate ${donationAmount || "..."}</>
              )}
            </button>

            <p className="text-xs text-neutral-600 text-center leading-relaxed">
              Secure payment via Stripe. You&apos;ll be redirected to complete your donation.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showDonate, setShowDonate] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800/50 overflow-hidden">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          {/* Left Side - Brand (terminal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4 shrink-0"
          >
            <div className="font-mono">
              {/* Terminal header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-[#00b2a9] rounded-full" />
                  <div className="w-2.5 h-2.5 bg-[#ef426f] rounded-full" />
                  <div className="w-2.5 h-2.5 bg-[#ff8200] rounded-full" />
                </div>
                <span className="text-[#ef426f] text-[10px] leading-none">
                  builder@devsa.community
                </span>
              </div>

              {/* ASCII Art DEVSA — clickable for video, hover for confetti */}
              <div
                className="relative inline-block mb-5 cursor-pointer"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onClick={() => setShowVideo(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setShowVideo(true)
                  }
                }}
                aria-label="Watch the DEVSA conference recap"
              >
                <div className="absolute -inset-8 z-20 pointer-events-none">
                  <LogoConfetti isActive={isLogoHovered} />
                </div>
                <pre
                  className="text-[#ef426f] text-[9px] sm:text-[10px] leading-tight whitespace-pre relative z-10 transition-transform duration-200 hover:scale-[1.02]"
                  aria-hidden="true"
                >{`██████╗ ███████╗██╗   ██╗███████╗ █████╗
██╔══██╗██╔════╝██║   ██║██╔════╝██╔══██╗
██║  ██║█████╗  ██║   ██║███████╗███████║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██╔══██║
██████╔╝███████╗ ╚████╔╝ ███████║██║  ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝`}</pre>
              </div>

              {/* Tagline as terminal output */}
              <p className="text-white/70 text-xs sm:text-sm leading-normal mb-2">
                <span className="text-[#ef426f]">$</span> Find Your People.
                Build Your Future.
              </p>

              {/* Blinking cursor */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#ef426f]">
                <span>$</span>
                <span
                  className="inline-block w-1.5 h-3 bg-[#ef426f] animate-pulse"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-7 space-y-0.5 text-neutral-500 text-[12px] font-normal leading-relaxed">
              <p>110 E Houston St, 6th Floor</p>
              <p>San Antonio, TX 78205</p>
            </div>
            <p className="mt-5 text-neutral-400 text-[13px] font-normal leading-normal">
              © {currentYear} DEVSA. All rights reserved.
            </p>
            <p className="text-neutral-400 text-[13px] font-normal mt-2 leading-normal">
              A{" "}
              <button
                onClick={() => setShowDonate(true)}
                className="text-[#ef426f] hover:text-[#fbbf24] transition-colors cursor-pointer"
              >
                501(c)(3)
              </button>
              {" "}tech education nonprofit.
            </p>
          </motion.div>

          {/* Right Side - Link Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {/* Pages */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Site Navigation</h3>
              <ul className="space-y-3.5">
                <li><Link href="/buildingtogether" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Building Together</Link></li>
                <li><Link href="/coworking-space" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Coworking Space</Link></li>
                <li><Link href="/events" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Community Calendar</Link></li>
                <li><Link href="/jobs" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Job Board <span className="inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/30">Testing</span></Link></li>
                <li><Link href="/shop" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Shop</Link></li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Stay Connected</h3>
              <ul className="space-y-3.5">
                <li><Link href="https://discord.gg/cvHHzThrEw" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Discord</Link></li>
                <li><Link href="https://linkedin.com/company/devsa" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">LinkedIn</Link></li>
                <li><Link href="https://instagram.com/devsatx" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Instagram</Link></li>
                <li><Link href="https://twitter.com/devsatx" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Twitter (X)</Link></li>
                <li><Link href="https://github.com/devsanantonio" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">GitHub</Link></li>
              </ul>
            </div>

            {/* Community Groups - spans 2 columns */}
            <div className="col-span-2">
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Find Your Community</h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                {communityGroups.map((group) => (
                  <li key={group.id}>
                    <Link
                      href={`/buildingtogether/${group.id}`}
                      className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors"
                    >
                      {group.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/buildingtogether"
                    className="inline-flex items-center gap-1.5 text-[#ef426f] hover:text-[#fbbf24] text-[13px] font-medium leading-normal transition-colors"
                  >
                    See All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <>
            <motion.div
              key="video-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
              onClick={() => setShowVideo(false)}
            />
            <motion.div
              key="video-player"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-70 flex items-center justify-center p-4"
              onClick={() => setShowVideo(false)}
            >
              <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute -top-10 right-0 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-xl shadow-2xl"
                  controls
                  autoPlay
                  playsInline
                >
                  <source src={DEVSA_VIDEO_URL} type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Donate Modal */}
      <AnimatePresence>
        <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
      </AnimatePresence>
    </footer>
  )
}