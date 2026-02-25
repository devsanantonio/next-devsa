"use client"

import { motion } from "motion/react"
import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { type TechCommunity } from "@/data/communities"
import Link from "next/link"
import Image from "next/image"

export function HeroCommunities() {
  const [communities, setCommunities] = useState<TechCommunity[]>([])

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch('/api/communities')
        if (res.ok) {
          const data = await res.json()
          setCommunities(data.communities || [])
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      }
    }
    fetchCommunities()
  }, [])

  return (
    <section 
      id="hero-communities" 
      className="relative bg-white overflow-hidden" 
      data-bg-type="light"
    >
      {/* Hero header section */}
      <div className="relative z-10 px-4 md:px-6 pt-16 pb-12 md:pt-32 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                The Origin Story
              </p>
              <h1 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                Our Mission Started With a{" "}
                <span className="text-gray-600 font-light italic">Simple</span>{" "}
                Question.
              </h1>
            </div>

            <div className="space-y-6 max-w-3xl">
              <p className="text-2xl md:text-3xl lg:text-4xl text-gray-900 leading-[1.1] font-black tracking-[-0.02em]">
                &ldquo;Where is the tech community{" "}
                <br className="hidden md:block" />
                in San&nbsp;Antonio?&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Answer section — the big reveal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 md:mt-16 max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="border-l-4 border-gray-900 pl-6 md:pl-8 space-y-6"
            >
              <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                We found the tech community — <strong className="font-semibold text-gray-900">20+ tech-focused groups</strong> scattered
                across the city, not collaborating and living in their own bubbles.
              </p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-base md:text-lg text-gray-500 leading-relaxed"
              >
                <span className="font-semibold text-gray-900">So we built DEVSA to bring them together</span> — a platform
                where you can discover communities that match your interests, where
                groups can{" "}
                <span className="font-medium text-gray-700">collaborate</span>,{" "}
                <span className="font-medium text-gray-700">share resources</span>, and{" "}
                <span className="font-medium text-gray-700">grow stronger together</span>.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Community logo showcase */}
          {communities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 md:mt-14 w-full"
            >
              <p className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-[0.2em] mb-6">
                Communities
              </p>

              {/* Desktop: horizontal wrap row */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                  {communities.map((community) => {
                    const invertNames = [
                      'aws user group',
                      'alamo city locksport',
                      'alamo python',
                      'alamo tech collective',
                      'datanauts',
                      'greater gaming society',
                      'red hat user group',
                      'unreal engine',
                      'women in data',
                    ]
                    const shouldInvert = invertNames.some(n => community.name.toLowerCase().includes(n))

                    return (
                      <Link key={community.id} href={`/buildingtogether/${community.id}`}>
                        <div className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200">
                          <div className="relative h-8 w-8 shrink-0">
                            <Image
                              src={community.logo}
                              alt={community.name}
                              fill
                              className={`object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200${shouldInvert ? ' invert' : ''}`}
                              sizes="32px"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
                            {community.name}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Mobile: compact 2-column grid */}
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {communities.map((community) => {
                    const invertNames = [
                      'aws user group',
                      'alamo city locksport',
                      'alamo python',
                      'alamo tech collective',
                      'datanauts',
                      'greater gaming society',
                      'red hat user group',
                      'unreal engine',
                      'women in data',
                    ]
                    const shouldInvert = invertNames.some(n => community.name.toLowerCase().includes(n))

                    return (
                      <Link key={community.id} href={`/buildingtogether/${community.id}`}>
                        <div className="group flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 transition-all duration-200 active:bg-gray-100 active:border-gray-200">
                          <div className="relative h-7 w-7 shrink-0">
                            <Image
                              src={community.logo}
                              alt={community.name}
                              fill
                              className={`object-contain opacity-50${shouldInvert ? ' invert' : ''}`}
                              sizes="28px"
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-400 truncate leading-[1.4]">
                            {community.name}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-4 md:px-6 py-16 sm:py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                Stay Connected
              </p>
              <h3 className="font-sans text-gray-900 leading-[0.95] text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-[-0.02em]">
                Don&apos;t Miss What&apos;s{" "}
                <span className="text-gray-600 font-light italic">Happening</span>{" "}
                in San Antonio.
              </h3>
            </div>

            <div className="space-y-6 max-w-3xl">
              <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                Many local groups don&apos;t have a social media presence — so we{" "}
                <strong className="font-semibold text-gray-900">built one for them</strong>.
              </p>

              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                Follow DEVSA to get the first look at{" "}
                <span className="font-medium text-gray-700">local events</span>,{" "}
                <span className="font-medium text-gray-700">community spotlights</span>, and{" "}
                <span className="font-medium text-gray-700">new opportunities</span>.
              </p>
            </div>
          </motion.div>

          {/* Social platform grid */}
          <div className="flex items-center gap-3 lg:gap-4 flex-wrap mt-10">
            <a
              href="https://discord.gg/cvHHzThrEw"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#5865F2] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Discord</span>
            </a>

            <a
              href="https://www.linkedin.com/company/devsa"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0A66C2] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">LinkedIn</span>
            </a>

            <a
              href="https://x.com/devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">X</span>
            </a>

            <a
              href="https://www.instagram.com/devsatx/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#E1306C] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1877F2] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">Facebook</span>
            </a>

            <a
              href="https://www.youtube.com/@devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#FF0000] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
