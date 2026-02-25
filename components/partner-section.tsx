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
      <section className="w-full bg-white py-8 md:py-16 relative overflow-hidden" data-bg-type="light">
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10 md:mb-14">
            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                  Our Strategic Partners
                </p>
                <h2 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                  Connecting Our{" "}
                  <span className="text-gray-600 font-light italic">Ecosystem</span>.
                </h2>
              </div>
              <div className="space-y-6 max-w-3xl">
                <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                  Thanks to the unwavering support of our partners, DEVSA has become the{" "}
                  <strong className="font-semibold text-gray-900">vital bridge</strong> in San Antonio&apos;s tech ecosystem.
                </p>
                <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                  Connecting passionate{" "}
                  <span className="font-medium text-gray-700">builders</span> with key{" "}
                  <span className="font-medium text-gray-700">resources</span> and{" "}
                  <span className="font-medium text-gray-700">organizations</span>.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Partner Logos Grid */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-[0.2em] mb-6">
                Partners &amp; Supporters
              </p>

              {/* Desktop: horizontal wrap row */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                  {partners.map((partner, index) => {
                    const invertIds = ['youth-code-jam', '434media', 'digital-canvas']
                    const largerIds = ['geekdom', 'learn2ai', 'utsa', 'project-quest']
                    const shouldInvert = invertIds.includes(partner.id)
                    const isLarger = largerIds.includes(partner.id)

                    return (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredPartner(partner.id)}
                        onMouseLeave={() => setHoveredPartner(null)}
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <div className="relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200">
                          {/* Confetti Celebration Effect - Only for Easter Eggs */}
                          {partner.isEasterEgg && (
                            <div className="absolute -inset-12 z-20 pointer-events-none">
                              <ConfettiEffect isActive={hoveredPartner === partner.id} />
                            </div>
                          )}

                          <div className={`relative z-10 shrink-0 ${isLarger ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <Image
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              fill
                              unoptimized
                              className={`object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200${shouldInvert ? ' invert' : ''}`}
                              sizes={isLarger ? '40px' : '32px'}
                            />
                          </div>
                          <span className="relative z-10 text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
                            {partner.name}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Mobile: compact 2-column grid */}
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {partners.map((partner, index) => {
                    const invertIds = ['youth-code-jam', '434media', 'digital-canvas']
                    const largerIds = ['geekdom', 'learn2ai', 'utsa', 'project-quest']
                    const shouldInvert = invertIds.includes(partner.id)
                    const isLarger = largerIds.includes(partner.id)

                    return (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredPartner(partner.id)}
                        onMouseLeave={() => setHoveredPartner(null)}
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <div className="relative flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 transition-all duration-200 active:bg-gray-100 active:border-gray-200">
                          {partner.isEasterEgg && (
                            <div className="absolute -inset-12 z-20 pointer-events-none">
                              <ConfettiEffect isActive={hoveredPartner === partner.id} />
                            </div>
                          )}

                          <div className={`relative z-10 shrink-0 ${isLarger ? 'h-9 w-9' : 'h-7 w-7'}`}>
                            <Image
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              fill
                              unoptimized
                              className={`object-contain opacity-50${shouldInvert ? ' invert' : ''}`}
                              sizes={isLarger ? '36px' : '28px'}
                            />
                          </div>
                          <span className="relative z-10 text-xs font-medium text-gray-400 truncate leading-[1.4]">
                            {partner.name}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Modal */}
      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
