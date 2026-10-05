"use client"

import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, X, Loader2 } from "lucide-react"
import { conferences } from "@/data/conferences"
import type { CommunityLink } from "@/lib/communities"
import { useState } from "react"

/**
 * The original mark — the terminal window with the teal/pink/orange title bar.
 * The navbar wears the monochrome alternate; this is the color one, so the two
 * ends of the page are the same logo in its two registers rather than the same
 * file twice.
 *
 * Local rather than the S3 bucket the navbar reads from. It is 2 KB of vector,
 * it renders on every page, and a footer that cannot draw its own logo when a
 * bucket hiccups is a worse trade than checking the file in.
 */
const DEVSA_LOGO = "/branding/devsa-logo.svg"

const PRESET_AMOUNTS = [50, 100, 250, 500]

/**
 * The footer used to list ten community groups by name.
 *
 * It was the heaviest thing here — eleven of the footer's twenty-four links,
 * spanning half the grid — and it was an arbitrary ten of twenty-three, sliced
 * off the admin's display order. Too many names to scan at 13px, too few to be
 * the directory, and no way for a reader to tell why those ten.
 *
 * /buildingtogether is the directory, with logos, descriptions and live data.
 * One link to it says more than ten names do.
 *
 * Nothing is lost by crawlers: app/sitemap.ts generates an entry for every
 * community document straight from Firestore, so all twenty-three are
 * advertised whether or not the footer repeats them.
 *
 * Worth knowing, though: LogoShowcase on /buildingtogether fetches in a
 * useEffect, so that page server-renders none of its own community links. The
 * footer was quietly half-covering that gap for ten of them. Fixing it belongs
 * on that page, not here.
 */

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

export function Footer({ communities }: { communities: CommunityLink[] }) {
  const currentYear = new Date().getFullYear()
  const [showDonate, setShowDonate] = useState(false)

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800/50 overflow-hidden">
      {/* Main Footer Content */}
      <div className="page-shell pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          {/* Left Side - Brand (terminal) */}
          <motion.div
            initial={{ y: 20 }}
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
                colors across its title bar. Kept, they would have been a
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
              {/* Not "tech education nonprofit".
              
                  The same claim that came out of Meet the Team's headline, in
                  shorter form. /buildingtogether spends a section establishing
                  that the teaching belongs to the groups and the partners —
                  "the people who can teach, from the people DEVSA knows" — so a
                  footer calling DEVSA an education nonprofit contradicts the
                  page two clicks away.
              
                  The 501(c)(3) stays, because that is the part a footer is for:
                  it is what makes a donation deductible and it is checkable.
                  Whether "educational" is the registered exempt purpose is a
                  question for the determination letter, not for this file —
                  describing the work precisely here does not change what the
                  letter says. */}
              {" "}nonprofit for San Antonio tech.
            </p>
          </motion.div>

          {/* Right Side - Link Columns */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {/* Pages */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Site Navigation</h3>
              <ul className="space-y-3.5">
                <li><Link href="/buildingtogether" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Building Together</Link></li>
                <li><Link href="/events" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Community Calendar</Link></li>
                <li><Link href="/about" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">About</Link></li>
                <li><Link href="/shop" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Shop</Link></li>
              </ul>

              {/* Stacked under Site Navigation rather than given a column of
                  its own, and not merged into the list above it.

                  The list above is the navbar: three top-level destinations.
                  These four are children of /events, so dropping them in with
                  Building Together and the Community Calendar would flatten a
                  hierarchy that is currently exact. A second heading in the
                  same column keeps them subordinate and visibly separate, and
                  leaves the grid — grid-cols-2 md:grid-cols-4, with Find Your
                  Community spanning two — untouched. A fifth group would have
                  needed five columns, which narrows the community sub-grid
                  enough to start wrapping group names.

                  They are here at all because the four pages had almost no way
                  in. Every inbound link came from data/conferences.ts, feeding
                  exactly two surfaces — the /events band and the homepage strip
                  — both well down a scroll, while app/sitemap.ts advertises all
                  four at priority 0.9. Asking search engines to rank a page the
                  site barely links to is a mismatch, and a reader on one
                  conference page had no route to the other three.

                  Names only, from data/conferences.ts so the list cannot drift.
                  No dates and no status: three of the four have no next date,
                  and a footer that implies a schedule goes stale. No lockups
                  either — at 13px the marks would be illegible, and four of
                  them would compete with the DEVSA mark above. */}
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mt-8 mb-5">Conferences</h3>
              <ul className="space-y-3.5">
                {conferences
                  .filter((conference) => conference.href)
                  .map((conference) => (
                    <li key={conference.key}>
                      <Link
                        href={conference.href!}
                        className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors"
                      >
                        {conference.name}
                      </Link>
                    </li>
                  ))}
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

            {/* Last on purpose: the column order is the arc the homepage
                makes — what DEVSA is, what DEVSA runs, how to reach DEVSA,
                then who else is in it.

                The count is live, from the same list the page already has, so
                it cannot drift the way the hardcoded names did. */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Find Your Community</h3>
              <p className="text-neutral-400 text-[13px] font-normal leading-relaxed">
                {communities.length}+ specialty groups across San Antonio —
                Python, Linux, AI, security, game dev and more.
              </p>
              <Link
                href="/buildingtogether"
                className="mt-4 inline-flex items-center gap-1.5 text-[#ef426f] hover:text-[#fbbf24] text-[13px] font-medium leading-normal transition-colors"
              >
                Browse the directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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