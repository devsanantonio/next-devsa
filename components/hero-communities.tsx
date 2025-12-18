"use client"

import { motion } from "motion/react"
import { useState, useCallback } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { techCommunities, type TechCommunity } from "@/data/communities"

// Fun random colors for hover effect
const hoverColors = [
  "rgba(251, 191, 36, 0.9)",  // amber
  "rgba(236, 72, 153, 0.9)",  // pink
  "rgba(139, 92, 246, 0.9)",  // violet
  "rgba(34, 211, 238, 0.9)",  // cyan
  "rgba(74, 222, 128, 0.9)",  // green
  "rgba(251, 146, 60, 0.9)",  // orange
  "rgba(248, 113, 113, 0.9)", // red
  "rgba(96, 165, 250, 0.9)",  // blue
]

interface TestimonialCardProps {
  community: TechCommunity
  index: number
}

function TestimonialCard({ community, index }: TestimonialCardProps) {
  const [hoverColor, setHoverColor] = useState<string | null>(null)
  const primaryLink = community.website || community.meetup || community.discord || community.instagram || community.twitter

  const handleMouseEnter = useCallback(() => {
    const randomColor = hoverColors[Math.floor(Math.random() * hoverColors.length)]
    setHoverColor(randomColor)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoverColor(null)
  }, [])

  return (
    <motion.a
      href={primaryLink || "#"}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col justify-between p-4 sm:p-5 bg-slate-950 border border-slate-800 transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: hoverColor || undefined,
      }}
    >
      {/* Testimonial text */}
      <p 
        className="text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 transition-colors duration-200"
        style={{ color: hoverColor ? "rgba(0,0,0,0.8)" : "rgb(148, 163, 184)" }}
      >
        {community.description}
      </p>

      {/* Logo and arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={community.logo || "/placeholder.svg"}
            alt={community.name}
            className="w-6 h-6 object-contain"
            style={{ filter: hoverColor ? "brightness(0)" : "none" }}
          />
          <span 
            className="font-semibold text-xs sm:text-sm transition-colors duration-200"
            style={{ color: hoverColor ? "rgba(0,0,0,0.9)" : "white" }}
          >
            {community.name}
          </span>
        </div>
        <ArrowRight 
          className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all duration-200" 
          style={{ color: hoverColor ? "rgba(0,0,0,0.7)" : "rgb(71, 85, 105)" }}
        />
      </div>
    </motion.a>
  )
}

export function HeroCommunities() {
  const [showAll, setShowAll] = useState(false)
  const initialCount = 9
  const displayedCommunities = showAll ? techCommunities : techCommunities.slice(0, initialCount)

  return (
    <section 
      id="hero-communities" 
      className="relative bg-white overflow-hidden" 
      data-bg-type="light"
    >
      {/* Hero header section */}
      <div className="relative z-10 px-6 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-amber-500 text-sm sm:text-base font-semibold tracking-wide uppercase mb-6"
          >
            The Origin Story
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-slate-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]"
          >
            Our mission started with a{" "}
            <span className="bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              simple question
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-snug"
          >
            &ldquo;Where is the tech community <br className="hidden sm:block" />
            in San&nbsp;Antonio?&rdquo;
          </motion.p>

          {/* Answer section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10 sm:mt-12 max-w-2xl mx-auto"
          >
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              We found them scattered across the city, living in their own bubbles.
              <span className="text-slate-900 font-semibold"> So we built DEVSA 
              to bring them together</span>. A platform where you can discover tech communities 
              that match your interests and where these groups can now easily collaborate, 
              share resources, and grow stronger together.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Testimonial grid - white background container */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedCommunities.map((community, index) => (
              <TestimonialCard
                key={community.id}
                community={community}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Show more / Show less button */}
      {techCommunities.length > initialCount && (
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-8"
          >
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className="group inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
              >
                Show more communities
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
              >
                Show less
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 py-20 border-t border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h3 className="text-slate-900 text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            How do I stay connected?
          </h3>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto tracking-tight">
            Many of these communities don&apos;t have their own web presence or social media of their own. 
            <span className="text-slate-900 font-semibold"> DEVSA has become their voice online</span>—sharing 
            their events, amplifying their work, and connecting them with new members. 
            Follow us to stay in the loop. We&apos;re the bridge for a reason.
          </p>

          {/* Social platform grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
            <a
              href="https://discord.gg/cvHHzThrEw"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-[#5865F2] transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="text-white text-xs font-medium">Discord</span>
            </a>

            <a
              href="https://www.linkedin.com/company/devsa"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-[#0A66C2] transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-white text-xs font-medium">LinkedIn</span>
            </a>

            <a
              href="https://www.instagram.com/devsatx/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-linear-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737] transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="text-white text-xs font-medium">Instagram</span>
            </a>

            <a
              href="https://x.com/devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-white text-xs font-medium">X</span>
            </a>

            <a
              href="https://www.facebook.com/devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-[#1877F2] transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-white text-xs font-medium">Facebook</span>
            </a>

            <a
              href="https://www.youtube.com/@devsatx"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 bg-slate-950 rounded-lg hover:bg-[#FF0000] transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-white text-xs font-medium">YouTube</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
