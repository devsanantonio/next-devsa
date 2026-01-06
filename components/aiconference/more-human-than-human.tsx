"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Calendar, MapPin, Tv, Send, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

const sessionFormats = [
  { id: "talk", label: "Talk (30-45 min)", description: "Standard presentation with Q&A" },
  { id: "lightning", label: "Lightning Talk (10 min)", description: "Quick, focused presentation" },
]

// Aztec-inspired geometric pattern for background
function AztecBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#ff9900 1px, transparent 1px),
            linear-gradient(90deg, #ff9900 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#ff9900]/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#00f2ff]/5 blur-[150px]" />
    </div>
  )
}

// Corner decoration component
function AztecCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }
  
  return (
    <div className={`w-12 h-12 lg:w-16 lg:h-16 ${rotations[position]}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M0 0h8v64H0z" fill="#333" />
        <path d="M0 0h64v8H0z" fill="#333" />
        <path d="M16 16h4v24h-4z" fill="#ff9900" opacity="0.6" />
        <path d="M16 16h24v4H16z" fill="#ff9900" opacity="0.6" />
        <path d="M28 28h2v12h-2z" fill="#00f2ff" opacity="0.4" />
        <path d="M28 28h12v2H28z" fill="#00f2ff" opacity="0.4" />
      </svg>
    </div>
  )
}

// Border decoration
function AztecBorder() {
  return (
    <div className="h-1 w-full bg-linear-to-r from-[#ff9900] via-[#00f2ff] to-[#ff9900] opacity-60" />
  )
}

export function MoreHumanThanHuman() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    sessionTitle: "",
    sessionFormat: "",
    abstract: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magenSessionId, setMagenSessionId] = useState<string | null>(null)

  useEffect(() => {
    const startMagenSession = async () => {
      try {
        const response = await fetch('/api/magen/start-session', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          setMagenSessionId(data?.sessionId || null)
        }
      } catch {
        // MAGEN not available
      }
    }

    startMagenSession()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/call-for-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          magenSessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proposal')
      }

      router.push('/events/aiconference2026?submitted=true')
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="h-dvh bg-[#0a0a0a] overflow-hidden">
      <section className="relative h-full flex items-center pt-16" data-bg-type="dark">
        <AztecBackground />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 hidden sm:block">
          <AztecCorner position="top-left" />
        </div>
        <div className="absolute top-3 right-3 lg:top-4 lg:right-4 hidden sm:block">
          <AztecCorner position="top-right" />
        </div>
        <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 hidden sm:block">
          <AztecCorner position="bottom-left" />
        </div>
        <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 hidden sm:block">
          <AztecCorner position="bottom-right" />
        </div>

        {/* Top border */}
        <div className="absolute top-0 left-0 right-0">
          <AztecBorder />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-4">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-14 items-center">
            
            {/* Left Column - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* DEVSA TV Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 border border-[#333] bg-[#111]/80 backdrop-blur-sm"
              >
                <Tv className="w-3.5 h-3.5 text-[#ff9900]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#a3a3a3] tracking-[0.15em] uppercase">DEVSA TV Recording</span>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4 leading-[0.9]"
              >
                <span className="block text-[#e5e5e5]">More Human</span>
                <span className="block text-[#ff9900] mt-1">Than Human</span>
              </motion.h1>

              {/* Subtitle & Tagline Combined */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <h2 className="font-mono text-base sm:text-lg md:text-xl text-[#00f2ff] tracking-[0.2em] uppercase font-medium mb-3">
                  DEVSA AI Conference
                </h2>
                <p className="font-mono text-sm text-[#737373] tracking-wide leading-relaxed max-w-md mx-auto lg:mx-0">
Join San Antonio's builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship. Submit your talk and share your expertise with the San Antonio tech community.
                </p>
              </motion.div>

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 sm:gap-6 mb-6"
              >
                <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-[#e5e5e5]">
                  <Calendar className="w-4 h-4 text-[#ff9900]" />
                  <span className="tracking-wide">February 28, 2026</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-[#333]" />
                <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-[#e5e5e5]">
                  <MapPin className="w-4 h-4 text-[#00f2ff]" />
                  <span className="tracking-wide">Geekdom, San Antonio TX</span>
                </div>
              </motion.div>

              {/* Deadline Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="inline-flex items-center gap-3 px-4 py-3 border border-[#ff9900]/30 bg-[#ff9900]/5"
              >
                <div className="w-8 h-8 flex items-center justify-center border border-[#ff9900]/50 text-[#ff9900]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Deadline</p>
                  <p className="text-sm font-semibold text-[#e5e5e5]">January 31, 2026</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Speaker Information */}
                <div className="border border-[#333] bg-[#111]/80 backdrop-blur-sm p-3 sm:p-4">
                  <h3 className="font-mono text-xs text-[#00f2ff] tracking-[0.15em] uppercase mb-3">
                    Speaker Info
                  </h3>
                  <div className="space-y-2">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                          Full Name <span className="text-[#ff9900]">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                          Email <span className="text-[#ff9900]">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Talk Details */}
                <div className="border border-[#333] bg-[#111]/80 backdrop-blur-sm p-3 sm:p-4">
                  <h3 className="font-mono text-xs text-[#00f2ff] tracking-[0.15em] uppercase mb-3">
                    Talk Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="sessionTitle" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Talk Title <span className="text-[#ff9900]">*</span>
                      </label>
                      <input
                        type="text"
                        id="sessionTitle"
                        name="sessionTitle"
                        required
                        value={formData.sessionTitle}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                        placeholder="Your talk title"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#a3a3a3]">
                        Format <span className="text-[#ff9900]">*</span>
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sessionFormats.map((format) => (
                          <label
                            key={format.id}
                            className={`flex cursor-pointer items-center gap-2.5 border p-3 transition-all ${
                              formData.sessionFormat === format.id
                                ? "border-[#ff9900] bg-[#ff9900]/10"
                                : "border-[#333] hover:border-[#525252] bg-[#0a0a0a]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="sessionFormat"
                              value={format.id}
                              checked={formData.sessionFormat === format.id}
                              onChange={handleInputChange}
                              className="h-3.5 w-3.5 accent-[#ff9900]"
                              required
                            />
                            <div>
                              <span className="block text-xs font-semibold text-[#e5e5e5]">{format.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="abstract" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Abstract <span className="text-[#ff9900]">*</span>
                      </label>
                      <textarea
                        id="abstract"
                        name="abstract"
                        required
                        rows={3}
                        value={formData.abstract}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm leading-relaxed text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all resize-none"
                        placeholder="Describe your talk (150-300 words)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="space-y-2">
                  {error && (
                    <div className="flex items-start gap-2.5 border border-red-500/30 bg-red-500/10 p-3">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex w-full items-center justify-center gap-2 bg-[#ff9900] px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#00f2ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-mono">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono">Submit Proposal</span>
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-[#525252]">
                    
                    Protected by{" "}
                    <Link
                      href="https://magenminer.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#b45309] hover:text-[#ff9900] transition-colors"
                    >
                      Magen
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0">
          <AztecBorder />
        </div>
      </section>
    </main>
  )
}
