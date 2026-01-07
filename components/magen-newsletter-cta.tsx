"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2, CheckCircle, Mail, ArrowRight, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function MagenNewsletterCTA() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  
  const subscribe = useMutation(api.newsletter.subscribe)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      await subscribe({
        email,
        source: "homepage-cta",
      })
      setStatus("success")
      setEmail("")
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Failed to subscribe")
    }
  }

  return (
    <section className="relative bg-white py-16 sm:py-24 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ef426f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left Column - Magen Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-6 -ml-3">
              <div className="relative h-16 w-24 shrink-0">
                <Image
                  src="/magen-logo.png"
                  alt="Magen"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <div className="-ml-8 h-px flex-1 bg-linear-to-r from-[#f59e0b]/30 to-transparent" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Secured by{" "}
              <Link 
                href="https://magenminer.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#f59e0b] hover:text-[#fbbf24] transition-colors underline decoration-2 underline-offset-4"
              >
                MAGEN
              </Link>
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Experience bot protection without the disruption. Proudly using San Antonio&apos;s own MAGEN to keep the DEVSA ecosystem human-first.
            </p>

            <Link
              href="https://magenminer.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#b45309] font-semibold hover:text-[#92400e] transition-colors group"
            >
              Learn more about Magen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Right Column - Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Stay Connected with DEVSA
                </h3>
                <p className="text-gray-600">
                  Get the latest updates on events, meetups, and opportunities in the San Antonio tech community.
                </p>
              </div>

              {status === "success" ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">You&apos;re subscribed!</p>
                    <p className="text-sm text-gray-600">Thanks for joining the DEVSA community.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={status === "loading"}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-lg bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Subscribe to Newsletter
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  )}
                </form>
              )}

              <p className="mt-4 text-center text-xs text-gray-500">
                Protected by{" "}
                <Link
                  href="https://magenminer.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#b45309] hover:text-[#92400e] transition-colors"
                >
                  Magen
                </Link>
                {" "}• No spam, unsubscribe anytime
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
