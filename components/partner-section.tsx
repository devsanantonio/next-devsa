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

    // Create confetti pieces using brand colors (amber/pink)
    const brandColors = ['#f59e0b', '#fbbf24', '#fcd34d', '#ec4899', '#f472b6', '#ffffff']
    const pieces = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 50,
      color: brandColors[Math.floor(Math.random() * brandColors.length)],
      size: Math.random() * 5 + 2,
      rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 8,
      speedY: Math.random() * -10 - 6,
      rotationSpeed: (Math.random() - 0.5) * 20,
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed inset-0 z-70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className={isEasterEgg ? 'w-full max-w-3xl' : 'w-80'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl ${
            isEasterEgg ? 'border-amber-500/30' : ''
          }`}>
            {isEasterEgg ? (
              // Video Content for Easter Eggs
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 text-neutral-400 hover:text-white transition-colors bg-neutral-900/90 hover:bg-neutral-800 rounded-full p-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
                <video
                  src={partner.video}
                  title={`${partner.name} Video`}
                  className="w-full h-full rounded-xl object-cover"
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
                <div className="relative h-40 bg-neutral-950 flex items-center justify-center shrink-0">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    width={80}
                    height={80}
                    className="h-28 w-auto object-contain"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-neutral-500 hover:text-white transition-colors hover:bg-neutral-800 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-white text-xl font-bold tracking-tight">
                    {partner.name}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{partner.description}</p>

                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm font-medium mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit Website
                    </a>
                  )}
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
      <section className="w-full bg-white py-16 md:py-24 relative overflow-hidden" data-bg-type="light">
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 mb-10 md:mb-14">
            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="space-y-3">
                <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
                  Our Strategic Partners
                </p>
                <h2 className="text-neutral-900 tracking-tight text-balance text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl mx-auto">
                  Connecting Our Ecosystem
                </h2>
              </div>
              <div className="max-w-3xl mx-auto">
                <p className="text-base md:text-lg text-neutral-600 leading-relaxed text-balance">
                  Thanks to the unwavering support of our partners, DEVSA has become the vital bridge in San Antonio for connecting passionate builders with key resources and organizations across the tech ecosystem.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Partner Logos Grid */}
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 mb-14 md:mb-18">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 md:gap-5"
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: getRandomRotation(index) }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPartner(partner.id)}
                  onMouseLeave={() => setHoveredPartner(null)}
                  onClick={() => handlePartnerClick(partner)}
                >
                  {/* Logo Container */}
                  <div 
                    className={`relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-neutral-950 rounded-xl border transition-all duration-300 flex items-center justify-center p-3 md:p-4 ${
                      hoveredPartner === partner.id
                        ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Confetti Celebration Effect - Only for Easter Eggs */}
                    {partner.isEasterEgg && (
                      <div className="absolute -inset-12 z-20 pointer-events-none">
                        <ConfettiEffect isActive={hoveredPartner === partner.id} />
                      </div>
                    )}
                    
                    {/* Logo */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={100}
                        height={100}
                        className={`object-contain w-full h-full transition-all duration-300 ${
                          hoveredPartner === partner.id 
                            ? 'scale-105 brightness-110' 
                            : 'scale-100'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* DevSA Community Space Spotlight */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            {/* Mobile: Regular rounded container */}
            <div className="md:hidden bg-neutral-950 border border-neutral-800 rounded-2xl relative">
              <div className="grid grid-cols-1 gap-0">
                {/* Content for mobile */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                        DEVSA Community Space
                      </p>
                      <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                        Community Driven{" "}
                        <span className="text-neutral-400 font-normal">Coworking Space</span>
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Thanks to <span className="font-semibold text-white">Geekdom</span>, we have one right in the heart of downtown San Antonio that&apos;s available to our growing tech community without the need for a daily pass or monthly membership.
                    </p>
                    <Link
                      href="/coworking-space"
                      className="group inline-flex items-center gap-2 bg-amber-500 text-neutral-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-400 transition-all duration-300 w-fit"
                    >
                      Explore the Space
                      <ArrowRight className="size-4 group-hover:tranneutral-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
                {/* Video for mobile */}
                <div className="relative min-h-70">
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
              className="hidden md:block bg-neutral-950 border border-neutral-800 relative min-h-75 lg:min-h-85 rounded-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-full">
                {/* Left Content - Takes more space */}
                <div className="relative z-10 lg:col-span-3 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
                        DEVSA Community Space
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                        Community Driven{" "}
                        <span className="text-neutral-400 font-normal block">Coworking Space</span>
                      </h3>
                    </div>
                    <p className="text-base text-neutral-400 leading-relaxed max-w-lg">
                      Thanks to <span className="font-semibold text-white">Geekdom</span>, we have one right in the heart of downtown San Antonio that&apos;s available to our growing tech community without the need for a daily pass or monthly membership.
                    </p>
                    <Link
                      href="/coworking-space"
                      className="group inline-flex items-center gap-2 bg-amber-500 text-neutral-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-amber-400 transition-all duration-300 w-fit"
                    >
                      Explore the Space
                      <ArrowRight className="size-4 group-hover:tranneutral-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>

                {/* Right Video - Smaller footprint */}
                <div className="relative lg:col-span-2 lg:h-full min-h-70">
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
