"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { partners, type Partner } from "@/data/partners"
import { ArrowRight, ExternalLink, X } from "lucide-react"
import { useState, useEffect } from "react"

// Generate random rotation angles for logo variety
const getRandomRotation = (index: number) => {
  const rotations = [-8, -5, -2, 0, 2, 5, 8, -3, 3, -6, 6]
  return rotations[index % rotations.length]
}

// Confetti component for celebration effect
interface ConfettiProps {
  isActive: boolean
}

function ConfettiEffect({ isActive }: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    size: number
    rotation: number
    speedX: number
    speedY: number
    rotationSpeed: number
  }>>([])

  useEffect(() => {
    if (!isActive) {
      setConfettiPieces([])
      return
    }

    // Create confetti pieces starting from the center/top of the box
    const pieces = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 45 + Math.random() * 10, // Start near center
      y: 40 + Math.random() * 20, // Start from top area of box
      color: ['#ef426f', '#ff8400', '#00b3aa', '#3b82f6', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 6)],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 6, // More horizontal spread
      speedY: Math.random() * -12 - 4, // Faster upward burst
      rotationSpeed: (Math.random() - 0.5) * 15,
    }))

    setConfettiPieces(pieces)

    // Animate confetti with burst effect
    const interval = setInterval(() => {
      setConfettiPieces(prev => prev.map(piece => ({
        ...piece,
        x: piece.x + piece.speedX,
        y: piece.y + piece.speedY,
        rotation: piece.rotation + piece.rotationSpeed,
        speedX: piece.speedX * 0.98, // Air resistance
        speedY: piece.speedY + 0.8, // gravity
      })).filter(piece => piece.y < 150 && piece.y > -50 && piece.x > -20 && piece.x < 120)) // keep in bounds
    }, 40)

    // Clear animation after 1.5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setConfettiPieces([])
    }, 1500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            transition: 'all 0.05s linear',
          }}
        />
      ))}
    </div>
  )
}

interface PartnerModalProps {
  partner: Partner | null
  isOpen: boolean
  onClose: () => void
}

function PartnerModal({ partner, isOpen, onClose }: PartnerModalProps) {
  if (!partner || !isOpen) return null

  const isEasterEgg = partner.isEasterEgg && partner.video

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
        <div 
          className={`relative w-full ${
            isEasterEgg 
              ? 'max-w-4xl max-h-[80vh]' 
              : 'max-w-md md:max-w-[400px] max-h-[90vh]'
          }`} 
          style={isEasterEgg ? { aspectRatio: "16/9" } : { aspectRatio: "4/5" }}
        >
          <div className={`bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-2xl flex flex-col overflow-hidden h-full shadow-2xl ${
            isEasterEgg ? 'border-[#ef426f]/50' : ''
          }`}>
            {isEasterEgg ? (
              // Video Content for Easter Eggs
              <div className="relative w-full h-full">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-white transition-colors bg-neutral-900/80 hover:bg-neutral-800 rounded-full p-2 backdrop-blur-sm shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>
                <video
                  src={partner.video}
                  title={`${partner.name} Video`}
                  className="w-full h-full rounded-2xl object-cover"
                  controls
                  autoPlay
                  muted
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              // Regular Partner Content
              <>
                <div className="relative h-32 md:h-36 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    width={120}
                    height={120}
                    className="h-20 md:h-24 w-auto object-contain"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors bg-neutral-700/80 hover:bg-neutral-600 rounded-full p-1.5 backdrop-blur-sm shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                  <h3 className="text-white text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    {partner.name}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed text-base">{partner.description}</p>

                  <div className="pt-2">
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-[#ef426f] hover:text-[#ff6b8a] transition-colors text-sm font-semibold hover:bg-neutral-800/50 rounded-lg p-2.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function PartnersSection() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null)

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPartner(null)
  }

  return (
    <>
      <section className="w-full bg-neutral-950 py-12 md:py-20 relative overflow-hidden" data-bg-type="dark">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <p className="text-sm md:text-base font-semibold text-neutral-400 uppercase tracking-[0.2em]">
                  Our Strategic Partners
                </p>
                <h2 className="text-white tracking-[-0.02em] text-balance text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] max-w-5xl mx-auto">
                  Connecting Our Ecosystem:{" "}
                  <span className="text-neutral-400 font-light italic">Meet the Partners</span>
                </h2>
              </div>
              <div className="space-y-4 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl lg:text-2xl text-neutral-200 leading-[1.4] font-light text-balance">
                  Thanks to the unwavering support of our partners, DEVSA has become the vital bridge in San Antonio.
                </p>
                <p className="text-base md:text-lg text-neutral-300 leading-relaxed max-w-3xl mx-auto text-balance">
                  Connecting passionate builders with key resources and organizations across the San Antonio tech ecosystem.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Single Row of Partner Logos - Full Width */}
          <div className="w-full px-4 md:px-8 mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8"
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: getRandomRotation(index) }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPartner(partner.id)}
                  onMouseLeave={() => setHoveredPartner(null)}
                  onClick={() => handlePartnerClick(partner)}
                >
                  {/* Logo Container */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 flex items-center justify-center p-3 md:p-4">
                    {/* Confetti Celebration Effect - Only for Easter Eggs */}
                    {partner.isEasterEgg && (
                      <div className="absolute -inset-8 z-0 pointer-events-none">
                        <ConfettiEffect isActive={hoveredPartner === partner.id} />
                      </div>
                    )}
                    
                    {/* Logo with celebration glow */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={120}
                        height={120}
                        className={`object-contain w-full h-full transition-all duration-300 ${
                          hoveredPartner === partner.id 
                            ? 'scale-110 brightness-110 drop-shadow-[0_0_20px_rgba(239,66,111,0.6)]' 
                            : 'scale-100'
                        }`}
                      />
                      
                      {/* Sparkle effects around the logo - Only for Easter Eggs */}
                      {partner.isEasterEgg && hoveredPartner === partner.id && (
                        <>
                          <div className="absolute -top-2 -left-2 w-2 h-2 bg-[#ff8400] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-[#00b3aa] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          <div className="absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                          <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="absolute top-1 -left-4 w-1 h-1 bg-[#8b5cf6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                          <div className="absolute top-2 -right-4 w-1 h-1 bg-[#ef426f] rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* DevSA Community Space Spotlight - Refined Size */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            {/* Mobile: Regular rounded container */}
            <div className="md:hidden bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/30 rounded-2xl relative">
              <div className="grid grid-cols-1 gap-0">
                {/* Content for mobile */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-[0.2em]">
                        DEVSA Community Space
                      </p>
                      <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-[-0.01em]">
                        Community Driven{" "}
                        <span className="text-neutral-300 font-light italic">Coworking Space</span>
                      </h3>
                    </div>
                    <p className="text-base text-neutral-300 leading-relaxed font-light">
                      Thanks to <span className="font-semibold text-white">Geekdom</span>, we have one right in the heart of downtown San Antonio that&apos;s available to our growing tech community without the need for a daily pass or monthly membership.
                    </p>
                    <Link
                      href="/coworking-space"
                      className="group inline-flex items-center gap-3 bg-[#ef426f] text-white px-6 py-3 rounded-full font-bold text-base hover:bg-[#d63860] transition-all duration-300 hover:scale-105 w-fit"
                    >
                      Explore the Space
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
                {/* Video for mobile */}
                <div className="relative min-h-[300px]">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full h-full"
                  >
                    <video
                      src="https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_7916.mov"
                      className="w-full h-full object-cover rounded-b-2xl"
                      style={{
                        filter: "contrast(1.2) brightness(0.9) saturate(0.8) sepia(0.1) grayscale(0.05)"
                      }}
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Desktop: Refined and compact design */}
            <div 
              className="hidden md:block bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/30 relative min-h-[320px] lg:min-h-[360px] rounded-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-full">
                {/* Left Content - Takes more space */}
                <div className="relative z-10 lg:col-span-3 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-neutral-400 uppercase tracking-[0.2em]">
                        DEVSA Community Space
                      </p>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-[-0.01em]">
                        Community Driven{" "}
                        <span className="text-neutral-300 font-light italic block">Coworking Space</span>
                      </h3>
                    </div>
                    <p className="text-base md:text-lg text-neutral-300 leading-relaxed font-light max-w-lg text-balance">
                      Thanks to <span className="font-semibold text-white">Geekdom</span>, we have one right in the heart of downtown San Antonio that&apos;s available to our growing tech community without the need for a daily pass or monthly membership.
                    </p>
                    <Link
                      href="/coworking-space"
                      className="group inline-flex items-center gap-3 bg-[#ef426f] text-white px-6 py-3 rounded-full font-bold text-base hover:bg-[#d63860] transition-all duration-300 hover:scale-105 w-fit"
                    >
                      Explore the Space
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>

                {/* Right Video - Smaller footprint */}
                <div className="relative lg:col-span-2 lg:h-full min-h-[300px]">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full h-full"
                  >
                    <video
                      src="https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_7916.mov"
                      className="w-full h-full object-cover rounded-r-2xl"
                      style={{
                        filter: "contrast(1.2) brightness(0.9) saturate(0.8) sepia(0.1) grayscale(0.05)"
                      }}
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Modal */}
      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
