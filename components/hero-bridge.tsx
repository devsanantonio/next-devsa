"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { partners } from "../data/partners"
import { techCommunities } from "../data/communities"
import Image from "next/image"

export function HeroBridge() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [linesComplete, setLinesComplete] = useState(false)

  // Combine partners and communities into a single array for top row layout
  const allLogos = [
    ...partners.slice(0, 3),
    ...techCommunities.slice(0, 3)
  ]

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white w-full relative h-screen flex flex-col overflow-hidden pt-24 md:pt-28 md:mt-10 md:items-center md:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="md:text-center max-w-6xl mx-auto mb-0 md:mb-0 z-10 relative px-4 md:px-8"
      >
        <h1 className="text-slate-900 tracking-tight text-balance text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.05] mb-3 md:mb-4">
          Your {' '}
          <span className="bg-gradient-to-r from-[#ef426f] to-rose-500 bg-clip-text text-transparent">
            Direct Connection
          </span>
          {' '}to the Tech Community in San Antonio
        </h1>
        <p className="text-slate-700 text-lg leading-relaxed max-w-sm mx-auto font-semibold">
          <strong>You&apos;re absolutely right!</strong> DEVSA bridges the gap between passionate builders, local partners, and the growing tech ecosystem.
        </p>
      </motion.div>

      <div className="relative w-full max-w-full mx-auto px-1 md:px-2 flex-1 md:flex md:items-center md:justify-center -mt-6 md:mt-0">
        <motion.div 
          className="relative w-full h-[340px] md:h-[520px]"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        >
          {/* SVG Canvas for connection lines - Mobile optimized */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none md:hidden"
            viewBox="0 0 1400 360"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="blur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {allLogos.map((logo, index) => {
              const totalLogos = allLogos.length
              const spacing = 1200 / (totalLogos + 1)
              const startX = 100 + spacing * (index + 1)
              
              // Mobile-specific coordinates for longer lines
              const startY = 30
              const endX = 700
              const endY = 310 // Much lower for dramatic mobile lines
              
              const isLeftSide = index < totalLogos / 2
              const distanceFromCenter = Math.abs(index - (totalLogos - 1) / 2)
              
              // More horizontal flow pattern like reference image
              const controlX1 = startX + (isLeftSide ? -15 - distanceFromCenter * 15 : 15 + distanceFromCenter * 15)
              const controlY1 = 80 + distanceFromCenter * 8 // Less dramatic initial curve
              const controlX2 = endX + (isLeftSide ? -40 - distanceFromCenter * 25 : 40 + distanceFromCenter * 25)
              const controlY2 = 200 + distanceFromCenter * 12 // More horizontal middle section

              return (
                <g key={`mobile-line-${logo.id}`}>
                  {/* Background blur line */}
                  <path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    fill="none"
                    stroke={logo.color || "#94A3B8"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.15"
                    filter="url(#blur)"
                  />
                  {/* Animated main line */}
                  <motion.path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    fill="none"
                    stroke={logo.color || "#94A3B8"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: hoveredItem === logo.id ? 1 : 0.85,
                    }}
                    transition={{
                      pathLength: { 
                        duration: 2, 
                        delay: 0.8 + index * 0.2,
                        ease: [0.4, 0, 0.2, 1] 
                      },
                      opacity: { duration: 0.4, ease: "easeInOut" }
                    }}
                    onAnimationComplete={() => {
                      if (index === allLogos.length - 1) {
                        setTimeout(() => setLinesComplete(true), 600)
                      }
                    }}
                  />
                  {/* Flowing particles */}
                  {linesComplete && (
                    <motion.circle
                      r="3"
                      fill={logo.color || "#94A3B8"}
                      filter="url(#glow)"
                      animate={{
                        opacity: [0, 0.8, 0.8, 0],
                      }}
                      transition={{
                        opacity: { duration: 5, repeat: Number.POSITIVE_INFINITY, delay: index * 0.6 },
                      }}
                    >
                      <animateMotion
                        dur="5s"
                        repeatCount="indefinite"
                        begin={`${index * 0.6}s`}
                        path={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                      />
                    </motion.circle>
                  )}
                </g>
              )
            })}
          </svg>

          {/* SVG Canvas for connection lines - Desktop */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            viewBox="0 0 1400 320"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow-desktop">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="blur-desktop">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {allLogos.map((logo, index) => {
              const totalLogos = allLogos.length
              const spacing = 1200 / (totalLogos + 1)
              const startX = 100 + spacing * (index + 1)
              
              // Desktop coordinates - keeping original good spacing
              const startY = 45
              const endX = 672 // Adjusted to match desktop logo position (48% of 1400)
              const endY = 185 // Adjusted to match desktop logo position (58% of 320)
              
              const isLeftSide = index < totalLogos / 2
              const distanceFromCenter = Math.abs(index - (totalLogos - 1) / 2)
              
              // Reference image style - more horizontal flow and gradual curves
              const controlX1 = startX + (isLeftSide ? -10 - distanceFromCenter * 12 : 10 + distanceFromCenter * 12)
              const controlY1 = 75 + distanceFromCenter * 6 // Gentler initial curve
              const controlX2 = endX + (isLeftSide ? -35 - distanceFromCenter * 20 : 35 + distanceFromCenter * 20)
              const controlY2 = 130 + distanceFromCenter * 8 // More horizontal middle section

              return (
                <g key={`desktop-line-${logo.id}`}>
                  {/* Background blur line */}
                  <path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    fill="none"
                    stroke={logo.color || "#94A3B8"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.15"
                    filter="url(#blur-desktop)"
                  />
                  {/* Animated main line */}
                  <motion.path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    fill="none"
                    stroke={logo.color || "#94A3B8"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow-desktop)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: hoveredItem === logo.id ? 1 : 0.85,
                    }}
                    transition={{
                      pathLength: { 
                        duration: 2, 
                        delay: 0.8 + index * 0.2,
                        ease: [0.4, 0, 0.2, 1] 
                      },
                      opacity: { duration: 0.4, ease: "easeInOut" }
                    }}
                    onAnimationComplete={() => {
                      if (index === allLogos.length - 1) {
                        setTimeout(() => setLinesComplete(true), 600)
                      }
                    }}
                  />
                  {/* Flowing particles */}
                  {linesComplete && (
                    <motion.circle
                      r="3"
                      fill={logo.color || "#94A3B8"}
                      filter="url(#glow-desktop)"
                      animate={{
                        opacity: [0, 0.8, 0.8, 0],
                      }}
                      transition={{
                        opacity: { duration: 5, repeat: Number.POSITIVE_INFINITY, delay: index * 0.6 },
                      }}
                    >
                      <animateMotion
                        dur="5s"
                        repeatCount="indefinite"
                        begin={`${index * 0.6}s`}
                        path={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                      />
                    </motion.circle>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="absolute top-2.5 md:top-0 -left-10 md:-left-10 w-full h-full pointer-events-none">
            <div className="relative w-full h-full">
              {/* Top row of all logos */}
              {allLogos.map((logo, index) => {
                const totalLogos = allLogos.length
                const leftPercentage = 8 + (84 / (totalLogos + 1)) * (index + 1) // Distribute evenly across full width
                
                return (
                  <motion.div
                    key={logo.id}
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    onMouseEnter={() => setHoveredItem(logo.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${leftPercentage}%`,
                      top: "15%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      className="w-20 h-16 lg:w-24 lg:h-18 flex items-center justify-center transition-all duration-300 bg-white rounded-xl md:rounded-2xl shadow-lg shadow-black/10 border border-gray-100"
                      whileHover={{ scale: 1.05, y: -4 }}
                      style={{
                        filter:
                          hoveredItem === logo.id
                            ? `drop-shadow(0 0 16px ${logo.color}50) drop-shadow(0 0 32px ${logo.color}25)`
                            : "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                      }}
                    >
                      <img
                        src={logo.logo || "/placeholder.svg"}
                        alt={logo.name}
                        className="w-14 h-12 lg:w-20 lg:h-16 object-contain"
                      />
                    </motion.div>
                  </motion.div>
                )
              })}
              {/* Bottom center DevSA logo - Mobile optimized */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2, type: "spring", stiffness: 200 }}
                className="absolute pointer-events-auto md:hidden"
                style={{
                  left: "48%",
                  top: "53%",
                  transform: "translate(-50%, -50%)",
                }}
              > 
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-purple-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                  <Image
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-35-globe.png"
                    alt="DevSA - San Antonio Developer Community"
                    width={80}
                    height={80}
                    className="w-24 h-24 object-contain relative z-10 drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.6)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.4))'
                    }}
                    priority
                  />
                </div>
              </motion.div>

              {/* Bottom center DevSA logo - Desktop enhanced */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2, type: "spring", stiffness: 200 }}
                className="absolute pointer-events-auto hidden md:block"
                style={{
                  left: "45.5%",
                  top: "50.2%",
                  transform: "translate(-50%, -50%)",
                }}
              > 
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-blue-500/40 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-ping"></div>
                  <Image
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-35-globe.png"
                    alt="DevSA - San Antonio Developer Community"
                    width={140}
                    height={140}
                    className="w-32 h-32 lg:w-36 lg:h-36 object-contain relative z-10 drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(244, 63, 94, 0.8)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.6)) drop-shadow(0 0 90px rgba(59, 130, 246, 0.4))'
                    }}
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
