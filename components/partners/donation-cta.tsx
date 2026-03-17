"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Heart, Loader2 } from "lucide-react"

const PRESET_AMOUNTS = [10, 25, 50, 100]

export function DonationCta() {
  const [selectedAmount, setSelectedAmount] = useState(25)
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

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-black border-b border-gray-800" data-bg-type="dark">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: intro text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
                Support DEVSA
              </p>
              <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Keep the{" "}
                <span className="text-white/50 font-light italic">
                  Momentum
                </span>{" "}
                Going.
              </h2>
            </div>

            <div className="space-y-6 max-w-lg mt-8">
              <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
                Every dollar goes directly toward workshops,{" "}
                <strong className="font-semibold text-white">
                community events
                </strong>
                , and the resources that keep San
                Antonio&apos;s tech scene growing.
              </p>
              <p className="text-base md:text-lg text-white/50 leading-relaxed">
                As a 501(c)(3), your donation may be tax-deductible.
              </p>
            </div>
          </motion.div>

          {/* Right: donation form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center"
          >
            <div className="w-full max-w-md rounded-2xl bg-white/4 border border-white/8 p-6 sm:p-8 space-y-6">
              {/* Amount selection */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-3">
                  Select amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt)
                        setIsCustom(false)
                        setError("")
                      }}
                      className={`cursor-pointer rounded-lg py-3 text-sm font-semibold transition-all ${
                        !isCustom && selectedAmount === amt
                          ? "bg-[#ef426f] text-white"
                          : "bg-white/6 text-white/60 hover:bg-white/10 hover:text-white/80"
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
                  onClick={() => {
                    setIsCustom(true)
                    setError("")
                  }}
                  className={`cursor-pointer text-sm font-medium transition-colors ${
                    isCustom
                      ? "text-[#ef426f]"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  Custom amount
                </button>
                {isCustom && (
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      min={5}
                      max={10000}
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setError("")
                      }}
                      className="w-full rounded-lg bg-white/6 border border-white/10 text-white pl-7 pr-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
                    />
                  </div>
                )}
              </div>

              {/* Name (optional) */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">
                  Name{" "}
                  <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-white/6 border border-white/10 text-white px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
                />
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">
                  Email{" "}
                  <span className="text-white/30 font-normal">
                    (for receipt)
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/6 border border-white/10 text-white px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ef426f]/50 focus:ring-1 focus:ring-[#ef426f]/30"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Donate button */}
              <button
                type="button"
                onClick={handleDonate}
                disabled={isSubmitting}
                className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-[#ef426f] hover:bg-[#d93a62] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-base transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    Donate ${donationAmount || "..."}
                  </>
                )}
              </button>

              <p className="text-xs text-white/30 text-center leading-relaxed">
                Secure payment via Stripe. You&apos;ll be redirected to
                complete your donation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
