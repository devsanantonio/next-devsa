"use client"

import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, X, Loader2 } from "lucide-react"
import { useState } from "react"

/**
 * The original mark — the terminal window with the teal/pink/orange title bar.
 * The navbar wears the monochrome alternate; this is the colour one, so the two
 * ends of the page are the same logo in its two registers rather than the same
 * file twice.
 *
 * Local rather than the S3 bucket the navbar reads from. It is 2 KB of vector,
 * it renders on every page, and a footer that cannot draw its own logo when a
 * bucket hiccups is a worse trade than checking the file in.
 */
const DEVSA_LOGO = "/branding/devsa-logo.svg"

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
        <div className="w-full max-w-160" onClick={(e) => e.stopPropagation()}>
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
  const [showDonate, setShowDonate] = useState(false)

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800/50 overflow-hidden">
      {/* Main Footer Content */}
      <div className="page-shell pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          {/* Left Side - Brand (terminal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4 shrink-0"
          >
            {/* The mark, standing on its own.

                What used to be here: an ASCII-art DEVSA inside a fake terminal
                — three window dots, a `~/devsa` path, a `$` prompt, a blinking
                cursor — that opened a conference video on click and threw
                confetti on hover.

                The terminal chrome went with the ASCII, not as extra scope. The
                dots and the prompt existed to frame type as a shell session,
                and the logo is itself a terminal window with those same three
                colours across its title bar. Kept, they would have been a
                second window drawn around the first, and the blinking cursor
                would have been a prompt with nothing left to prompt. */}
            <Link
              href="/"
              aria-label="DEVSA — home"
              className="inline-block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={DEVSA_LOGO}
                alt="DEVSA"
                width={736}
                height={552}
                className="h-auto w-28 sm:w-32"
              />
            </Link>

            <p className="mt-7 text-neutral-400 text-[13px] font-normal leading-normal">
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

      {/* Donate Modal */}
      <AnimatePresence>
        <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
      </AnimatePresence>
    </footer>
  )
}