"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Calendar, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react"

const sessionFormats = [
  { id: "talk", label: "Talk (30-45 min)", description: "Standard presentation with Q&A" },
  { id: "lightning", label: "Lightning Talk (10 min)", description: "Quick, focused presentation" },
]

export function CallForSpeakers() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    sessionTitle: "",
    sessionFormat: "",
    abstract: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magenSessionId, setMagenSessionId] = useState<string | null>(null)

  // Start MAGEN verification session via our API route
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
        // MAGEN not available - form will still work without verification
      }
    }

    startMagenSession()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Submit to API with MAGEN session ID
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

      setIsSubmitted(true)
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-green-200 bg-green-50 p-8 text-center sm:p-12"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">Proposal Submitted!</h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600">
              Thank you for submitting your talk proposal. We&apos;ll review your submission and get back to you soon.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              DEVSA AI Conference <span className="text-[#ef426f]">2026</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-gray-600 sm:text-lg">
              Call For Speakers
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#ef426f]" />
                <span className="font-medium">February 28, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#ef426f]" />
                <span className="font-medium">Geekdom 3rd Floor</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Speaker Information */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">Speaker Information</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-700">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    placeholder="Your company (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">Talk Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="sessionTitle" className="mb-2 block text-sm font-medium text-gray-700">
                    Talk Title *
                  </label>
                  <input
                    type="text"
                    id="sessionTitle"
                    name="sessionTitle"
                    required
                    value={formData.sessionTitle}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    placeholder="Give your talk a compelling title"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">Format *</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sessionFormats.map((format) => (
                      <label
                        key={format.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 shadow-sm transition-all ${
                          formData.sessionFormat === format.id
                            ? "border-[#ef426f] bg-[#ef426f]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="sessionFormat"
                          value={format.id}
                          checked={formData.sessionFormat === format.id}
                          onChange={handleInputChange}
                          className="mt-0.5 h-4 w-4 accent-[#ef426f]"
                          required
                        />
                        <div className="flex-1">
                          <span className="block font-medium text-gray-900">{format.label}</span>
                          <p className="mt-1 text-xs text-gray-500">{format.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="abstract" className="mb-2 block text-sm font-medium text-gray-700">
                    Abstract *
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    required
                    rows={5}
                    value={formData.abstract}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20"
                    placeholder="Describe your talk. What will attendees learn? Why is this topic important?"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Aim for 150-300 words. Include key takeaways for attendees.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Proposal
                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                <span className="font-medium">Deadline:</span> January 31, 2026
              </p>
              <p className="text-center text-xs text-gray-500">
                Questions? Contact us at{" "}
                <a href="mailto:hello@devsa.community" className="font-medium text-[#ef426f] hover:underline">
                  hello@devsa.community
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
