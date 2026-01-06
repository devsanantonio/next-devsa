"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { techCommunities } from "@/data/communities"
import { partners } from "@/data/partners"

// Combine and shuffle communities and partners for the mosaic
const allLogos = [...techCommunities.map(c => ({ ...c, type: 'community' as const })), ...partners.map(p => ({ ...p, type: 'partner' as const }))]

// Deterministic pseudo-random function based on index (same on server and client)
function seededOffset(index: number): number {
  return ((index * 7 + 3) % 10)
}

export function EventsHero() {
  return (
    <section className="relative overflow-hidden bg-black border-b border-gray-800">
      {/* Logo mosaic background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/80 to-black z-10" />
        
        {/* Animated floating logos */}
        <div className="absolute inset-0">
          {allLogos.map((logo, index) => {
            // Create a scattered, organic layout with deterministic offsets
            const row = Math.floor(index / 6)
            const col = index % 6
            const offsetX = (col * 16.66) + (row % 2 === 0 ? 8 : 0)
            const offsetY = (row * 25) + seededOffset(index)
            
            return (
              <motion.div
                key={logo.id}
                className="absolute"
                style={{
                  left: `${offsetX}%`,
                  top: `${offsetY}%`,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0.15, 0.3, 0.15],
                  scale: [0.9, 1.1, 0.9],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4 + (index % 3),
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              >
                <div className="relative h-12 w-12 md:h-16 md:w-16 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                  <Image
                    src={logo.logo}
                    alt={logo.name}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-20 mx-auto max-w-6xl px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left md:text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
            Community{" "}
            <span className="text-[#ef426f]">Events</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400 md:text-xl md:mx-auto">
            Bridging the gap between passionate builders, local partners, and the growing tech ecosystem in San Antonio.
          </p>
        </motion.div>

        {/* Interactive logo showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 md:mt-16"
        >
          {/* Desktop: Two rows of logos with hover effects */}
          <div className="hidden md:block">
            <div className="flex flex-wrap justify-center gap-6">
              {allLogos.slice(0, 12).map((logo, index) => (
                <motion.div
                  key={logo.id}
                  className="group relative"
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="relative h-14 w-14 rounded-xl bg-gray-900/80 p-2 border border-gray-800 backdrop-blur-sm transition-all duration-300 group-hover:border-[#ef426f] group-hover:bg-gray-800/90 group-hover:shadow-lg group-hover:shadow-[#ef426f]/20">
                    <Image
                      src={logo.logo}
                      alt={logo.name}
                      fill
                      className="object-contain p-1.5 grayscale group-hover:grayscale-0 transition-all duration-300"
                      sizes="56px"
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg">
                      {logo.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {allLogos.slice(12).map((logo) => (
                <motion.div
                  key={logo.id}
                  className="group relative"
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="relative h-14 w-14 rounded-xl bg-gray-900/80 p-2 border border-gray-800 backdrop-blur-sm transition-all duration-300 group-hover:border-[#ef426f] group-hover:bg-gray-800/90 group-hover:shadow-lg group-hover:shadow-[#ef426f]/20">
                    <Image
                      src={logo.logo}
                      alt={logo.name}
                      fill
                      className="object-contain p-1.5 grayscale group-hover:grayscale-0 transition-all duration-300"
                      sizes="56px"
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg">
                      {logo.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: Scrolling logo strip */}
          <div className="md:hidden overflow-hidden">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-linear-to-r from-black to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-linear-to-l from-black to-transparent" />
              
              <motion.div
                className="flex gap-4"
                animate={{ x: [0, -60 * allLogos.length] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear",
                  },
                }}
              >
                {[...allLogos, ...allLogos].map((logo, index) => (
                  <div
                    key={`${logo.id}-${index}`}
                    className="relative h-12 w-12 shrink-0 rounded-lg bg-gray-900/80 p-2 border border-gray-800"
                  >
                    <Image
                      src={logo.logo}
                      alt={logo.name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bridge metaphor - connection lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 max-w-24 bg-linear-to-r from-transparent to-gray-600" />
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-500">Building Together</span>
          <div className="h-px flex-1 max-w-24 bg-linear-to-l from-transparent to-gray-600" />
        </motion.div>
      </div>
    </section>
  )
}

