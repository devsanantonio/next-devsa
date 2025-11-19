"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { featuredSessions } from "@/data/pysa/sessions"
import { useState } from "react"
import { Play, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

const LinkedInIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="w-4 h-4">
    <path 
      id="Subtract" 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M2 0C0.895431 0 0 0.895431 0 2V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0H2ZM5 6.75V13H3V6.75H5ZM5 4.50008C5 5.05554 4.61409 5.5 3.99408 5.5H3.98249C3.38582 5.5 3 5.05554 3 4.50008C3 3.93213 3.39765 3.5 4.00584 3.5C4.61409 3.5 4.98845 3.93213 5 4.50008ZM8.5 13H6.5C6.5 13 6.53178 7.43224 6.50007 6.75H8.5V7.78371C8.5 7.78371 9 6.75 10.5 6.75C12 6.75 13 7.59782 13 9.83107V13H11V10.1103C11 10.1103 11 8.46616 9.7361 8.46616C8.4722 8.46616 8.5 9.93972 8.5 9.93972V13Z" 
      fill="currentColor"
    />
  </svg>
)

// Session data with video URLs and slide deck links
const sessionData = {
  "joel-grus": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=1740",
    slideDeck: "https://docs.google.com/presentation/d/1hirudbqv-OAVXyvJJlHFrvykEwE2loXQo4crb583dks/edit",
    linkedin: "https://www.linkedin.com/in/joelgrus/"
  },
  "paul-bailey": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=5040",
    slideDeck: "https://www.neutron.studio/talks/2025-01-06-async-django.html",
    linkedin: "https://www.linkedin.com/in/paul-bailey-a313869/"
  },
  "cody-fincher": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=7740",
    slideDeck: "https://docs.google.com/presentation/d/1L9tYaLz5XlWCDqC9rt6OfAAhKft9oyNl93CltXg39wA/edit?usp=sharing",
    linkedin: "https://www.linkedin.com/in/cofin/"
  },
  "mauricio-figueroa": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=4200",
    linkedin: "https://www.linkedin.com/in/mauricio-e-figueroa/"
  },
  "mayank-gohil": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=5040",
    linkedin: "https://www.linkedin.com/in/mayank-gohil10/"
  },
  "corrina-alcoser": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=9540",
    linkedin: "https://www.linkedin.com/in/corrina-alcoser/"
  },
  "gennaro-maida": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=10440",
    linkedin: "https://www.linkedin.com/in/gennaro-maida/"
  },
  "sean-roberson": {
    videoUrl: "https://www.youtube.com/embed/3jZ9ktAFGpk?si=ITd6HwHRVcpnrHQk&amp;start=11340",
    linkedin: "https://www.linkedin.com/in/szroberson/"
  }
}

export default function SessionsSection() {
  const [selectedSession, setSelectedSession] = useState<keyof typeof sessionData | null>(null)

  const getSessionKey = (name: string): keyof typeof sessionData => {
    return name.toLowerCase().replace(/\s+/g, '-') as keyof typeof sessionData
  }

  const openSession = (speakerName: string) => {
    const key = getSessionKey(speakerName)
    if (sessionData[key]?.videoUrl) {
      setSelectedSession(key)
    }
  }
  return (
    <section className="relative bg-black text-white" data-testid="pysa-homepage-container-sessions" id="sessions">
      <div className="flex flex-col gap-10 p-6 md:p-16 lg:p-20 container mx-auto">
        {/* Section Title */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <p className="font-sans text-white leading-tight text-2xl lg:text-4xl xl:text-6xl font-semibold uppercase tracking-tight">
            Conference Sessions
          </p>
        </motion.header>


        {/* Schedule Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-col">
            {/* Joel Grus - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Building Your Own AI Coding Assistant with DSPy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Joel Grus"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-joel-grus.png"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Joel Grus
                          </div>
                          <a
                            href={sessionData["joel-grus"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Principal Engineer/AI Tech Leader, Capital Group
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Introducing the Alamo Python community to building your own AI coding assistant using DSPy. Discover how to create intelligent development tools.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0 flex flex-col gap-3">
                  <button
                    onClick={() => openSession("Joel Grus")}
                    className="w-full bg-[#FFD43B] hover:bg-[#FFD43B]/90 text-[#0a0a0a] font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                  {sessionData["joel-grus"].slideDeck && (
                    <a
                      href={sessionData["joel-grus"].slideDeck}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono uppercase tracking-wide">Slide Deck</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Mauricio Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Python Driving Innovation at Alt-Bionics
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Mauricio Figueroa"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-mauricio.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Mauricio Figueroa
                          </div>
                          <a
                            href={sessionData["mauricio-figueroa"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Electrical Engineer, Alt-Bionics
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Showcasing how Python powers next-generation prosthetic technology and medical device innovation.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0">
                  <button
                    onClick={() => openSession("Mauricio Figueroa")}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#0a0a0a] font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Mayank Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Flexible AI Workflow Automation Powered by Python and n8n
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Mayank Gohil"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/LTAISASW-13.jpg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Mayank Gohil
                          </div>
                          <a
                            href={sessionData["mayank-gohil"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          AI Innovation, Learn2AI
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Demonstrating seamless integration of Python with n8n for intelligent automation workflows.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0">
                  <button
                    onClick={() => openSession("Mayank Gohil")}
                    className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Paul Bailey - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Asynchronous Patterns for Django
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Paul Bailey"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-paul.png"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Paul Bailey
                          </div>
                          <a
                            href={sessionData["paul-bailey"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Principal Engineer, Clarity
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Presenting asynchronous patterns for Django in celebration of Django&apos;s 20th anniversary. Learn modern async techniques to improve your Django applications.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0 flex flex-col gap-3">
                  <button
                    onClick={() => openSession("Paul Bailey")}
                    className="w-full bg-[#FFD43B] hover:bg-[#FFD43B]/90 text-[#0a0a0a] font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                  {sessionData["paul-bailey"].slideDeck && (
                    <a
                      href={sessionData["paul-bailey"].slideDeck}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono uppercase tracking-wide">Slide Deck</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Cody Fincher - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Advanced Alchemy: Your Companion to SQLAlchemy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Cody Fincher"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-cody-fincher.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Cody Fincher
                          </div>
                          <a
                            href={sessionData["cody-fincher"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Staff Technical Solutions Consultant, Google
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Visiting from Dallas to share advanced SQLAlchemy techniques and patterns. Master database interactions in Python applications.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0 flex flex-col gap-3">
                  <button
                    onClick={() => openSession("Cody Fincher")}
                    className="w-full bg-[#FFD43B] hover:bg-[#FFD43B]/90 text-[#0a0a0a] font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                  {sessionData["cody-fincher"].slideDeck && (
                    <a
                      href={sessionData["cody-fincher"].slideDeck}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono uppercase tracking-wide">Slide Deck</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
       
            {/* Corrina Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Meet R-O-D-E-O: Your Sarcastic Sidekick Against Digital Threats
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Corrina Alcoser"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-corrina.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Corrina Alcoser
                          </div>
                          <a
                            href={sessionData["corrina-alcoser"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Cybersecurity Specialist, AI Cowboys
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Introducing R-O-D-E-O, an AI-powered cybersecurity assistant with attitude, built using Python frameworks.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0">
                  <button
                    onClick={() => openSession("Corrina Alcoser")}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Gennaro Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Building Context-Aware AI with Graph + Vector Synergy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Gennaro Maida"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-gennaro.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Gennaro Maida
                          </div>
                          <a
                            href={sessionData["gennaro-maida"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          MedTech Executive, Denovo Innovations
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Exploring Military Healthcare Policy Intelligence using advanced Python-based AI architectures.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0">
                  <button
                    onClick={() => openSession("Gennaro Maida")}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sean Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    A Mathematician&apos;s Perspective on Math and Python
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Sean Roberson"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-sean.jpg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            Sean Roberson
                          </div>
                          <a
                            href={sessionData["sean-roberson"].linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <LinkedInIcon />
                          </a>
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Operations Research Analyst, AETC
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Bridging mathematical theory and practical Python implementation from an academic viewpoint.
                    </p>
                  </div>
                </div>
                <div className="w-48 lg:w-52 shrink-0">
                  <button
                    onClick={() => openSession("Sean Roberson")}
                    className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-sm font-mono uppercase tracking-wide">View Session</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSession(null)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-[#FFD43B] text-[#0a0a0a] hover:bg-[#FFD43B]/90 transition-all hover:scale-110 shadow-lg"
              >
                <X className="h-6 w-6 md:h-7 md:w-7 font-bold" strokeWidth={3} />
              </button>
              <iframe
                width="100%"
                height="100%"
                src={sessionData[selectedSession].videoUrl}
                title="Session Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}