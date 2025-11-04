"use client"

import type React from "react"

import { motion } from "motion/react"
import { useState, useEffect } from "react"
import { X, ExternalLink, MessageCircle } from "lucide-react"
import { GlowingEffect } from "./glowing-effect"
import { GrainGradient } from '@paper-design/shaders-react'
import { techCommunities, type TechCommunity } from "@/data/communities"

interface CommunityModalProps {
  community: TechCommunity | null
  isOpen: boolean
  onClose: () => void
}

function CommunityModal({ community, isOpen, onClose }: CommunityModalProps) {
  if (!community || !isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md md:max-w-[400px] md:max-h-[500px]" style={{ aspectRatio: "4/5" }}>
          <GlowingEffect
            disabled={false}
            proximity={100}
            spread={40}
            blur={1}
            movementDuration={2}
            borderWidth={2}
            className="rounded-2xl"
          />
          <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl flex flex-col overflow-hidden h-full shadow-2xl">
            <div className="relative h-40 md:h-40 bg-black/80 flex items-center justify-center flex-shrink-0">
              <img
                src={community.logo || "/placeholder.svg"}
                alt={community.name}
                className="h-36 md:h-32 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-800 rounded-full p-1.5 backdrop-blur-sm shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8 space-y-6 flex-1">
              <div className="space-y-4">
                <h3 className="text-neutral-900 text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.01em] leading-tight">
                  {community.name}
                </h3>
                <p className="text-neutral-700 leading-relaxed text-base md:text-lg text-balance font-light">{community.description}</p>
              </div>

              <div className="space-y-2 pt-4">
                {community.website && (
                  <a
                    href={community.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-neutral-900 hover:text-neutral-700 transition-colors text-sm md:text-base font-semibold hover:bg-gray-100 rounded-xl p-3 md:p-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
                {community.discord && (
                  <a
                    href={community.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors text-sm md:text-base font-semibold hover:bg-indigo-50 rounded-xl p-3 md:p-4"
                  >
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                    Discord
                  </a>
                )}
                {community.instagram && (
                  <a
                    href={community.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-pink-600 hover:text-pink-700 transition-colors text-sm md:text-base font-semibold hover:bg-pink-50 rounded-xl p-3 md:p-4"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    Instagram
                  </a>
                )}
                {community.twitter && (
                  <a
                    href={community.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sky-600 hover:text-sky-700 transition-colors text-sm md:text-base font-semibold hover:bg-sky-50 rounded-xl p-3 md:p-4"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    Twitter
                  </a>
                )}
                {community.meetup && (
                  <a
                    href={community.meetup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-orange-600 hover:text-orange-700 transition-colors text-sm md:text-base font-semibold hover:bg-orange-50 rounded-xl p-3 md:p-4"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    Meetup
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function HeroCommunities() {
  const [selectedCommunity, setSelectedCommunity] = useState<TechCommunity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.max(window.innerWidth, 1920),
        height: Math.max(window.innerHeight, 1080)
      })
    }

    if (typeof window !== 'undefined') {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  const handleCommunityClick = (community: TechCommunity) => {
    setSelectedCommunity(community)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCommunity(null)
  }

  return (
    <>
      <section id="hero-communities" className="relative md:min-h-screen flex flex-col justify-center py-16 md:py-20 overflow-hidden" data-bg-type="light">
        {/* Grain Gradient Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full min-w-[100vw] min-h-[100vh] flex items-center justify-center">
            <GrainGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={["#ff8400", "#ef4371", "#00b3aa"]}
              colorBack="#000000"
              softness={0.5}
              intensity={0.5}
              noise={0.25}
              shape="corners"
              speed={1}
            />
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-12 md:mb-16 lg:mb-20">
          <div className="space-y-6 md:space-y-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 md:space-y-6"
            >
              <h1 className="text-white tracking-[-0.02em] text-balance text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black leading-[0.9] max-w-5xl mx-auto">
                Our mission started with a{" "}
                <span className="text-gray-300 font-light italic">simple question</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-4 md:space-y-6"
            >
              <p className="text-[#facb11] text-lg md:text-4xl font-black tracking-[-0.01em] leading-tight">
                Where is the tech community?
              </p>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-5 md:grid-cols-7 gap-2 md:gap-2 place-items-center max-w-5xl mx-auto md:-mt-8"
          >
            {techCommunities.map((community, index) => (
              <motion.button
                key={community.id}
                onClick={() => handleCommunityClick(community)}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="group relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-slate-950/40 rounded-xl md:rounded-2xl border border-slate-700/50 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden backdrop-blur-sm"
                style={
                  {
                    "--glow-color": community.color || "#3B82F6",
                  } as React.CSSProperties
                }
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--glow-color)]/20 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_var(--glow-color)] rounded-lg md:rounded-xl" />
                <img
                  src={community.logo || "/placeholder.svg"}
                  alt={community.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300 filter brightness-90 group-hover:brightness-110"
                />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <CommunityModal community={selectedCommunity} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
