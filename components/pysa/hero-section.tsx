"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { useState, useEffect } from "react"
import { Metaballs } from '@paper-design/shaders-react'

export default function HeroSection() {
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    if (typeof window !== 'undefined') {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  return (
    <>
      {/* Mobile Hero Section - Image-First Design */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full min-h-screen flex flex-col lg:hidden relative overflow-hidden bg-[#2a273f]"
      >
        {/* Mobile Metaballs Background - Extended height to cover bottom section */}
        <div className="absolute inset-0 w-full h-full">
          <Metaballs
            width={dimensions.width || window?.innerWidth || 390}
            height={(dimensions.height || window?.innerHeight || 844) + 200}
            colors={["#facb0f", "#0041b3"]}
            colorBack="#2a273f"
            count={13}
            size={0.81}
            speed={0.5}
            scale={4}
            offsetX={-0.3}
          />
        </div>
        
        {/* Hero Content - Image Dominant Layout */}
        <div className="relative z-10 flex flex-col min-h-screen container mx-auto px-4 sm:px-6">
          {/* Header Text - Mobile */}
          <div className="pt-20 pb-6 text-center flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-1"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-[-0.02em] drop-shadow-lg">
                <span className="block font-extralight italic text-white/95 mb-1">Python</span>
                <span className="block font-black tracking-[-0.03em]">Conference</span>
              </h1>
            </motion.div>
          </div>

          {/* Hero Image - Takes Center Stage */}
          <div className="flex-1 flex items-center justify-center py-6 min-h-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
              className="w-full max-w-[280px] sm:max-w-[320px] group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-500 border-2 border-white/30 backdrop-blur-sm">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-11-python.png"
                  alt="Python San Antonio Conference"
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Enhanced Glare Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-50" />
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/60 rounded-full blur-lg opacity-70" />
                
                {/* Premium Glare Animation */}
                <motion.div 
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ 
                    duration: 2, 
                    delay: 1.5, 
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12"
                />
                
                {/* Depth Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-60" />
              </div>
              
              {/* Enhanced Drop Shadow */}
              <div className="absolute inset-0 bg-black/30 rounded-2xl blur-3xl transform translate-y-6 scale-95 -z-10" />
            </motion.div>
          </div>

          {/* Bottom Content Section - Mobile */}
          <div className="pb-10 space-y-6 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center space-y-6"
            >
              <p className="max-w-md mx-auto text-lg leading-[1.6] font-normal text-white/90 drop-shadow-sm">
                <span className="font-bold text-yellow-200">Alamo Python</span>, the{" "}
                <span className="font-bold text-blue-200">PyTexas Foundation</span>, and{" "}
                <span className="font-bold text-white">DEVSA</span> are excited to activate the first-ever Python conference in San Antonio!
              </p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="https://www.meetup.com/alamo-python/events/311325578/"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 rounded-xl hover:from-sky-700 hover:via-sky-800 hover:to-blue-800 transition-all duration-300 shadow-xl border border-sky-400/30 drop-shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="mr-2 tracking-wide">RSVP Now</span>
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Desktop Hero Section - Wide Image Layout */}
      <div className="hidden lg:flex w-full min-h-screen relative overflow-hidden bg-[#2a273f]">
        {/* Desktop Metaballs Background - Extended height to cover bottom section */}
        <div className="absolute inset-0 w-full h-full">
          <Metaballs
            width={dimensions.width || window?.innerWidth || 1920}
            height={(dimensions.height || window?.innerHeight || 1080) + 300}
            colors={["#facb0f", "#0041b3"]}
            colorBack="#2a273f"
            count={13}
            size={0.81}
            speed={0.5}
            scale={4}
            offsetX={-0.3}
          />
        </div>

        {/* Hero Content - Wide Image Layout */}
        <div className="relative z-10 flex flex-col w-full min-h-screen container mx-auto px-8 xl:px-12 py-8">
          {/* Top Spacer - Optimal navbar clearance */}
          <div className="pt-16 flex-shrink-0"></div>

          {/* Hero Image - Enhanced Desktop Star Treatment */}
          <div className="flex items-center justify-center py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
              transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
              className="w-full max-w-4xl xl:max-w-5xl group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 border-2 border-white/20 backdrop-blur-sm group-hover:shadow-yellow-500/25 group-hover:border-yellow-400/40">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-9-python.png"
                  alt="Python San Antonio Conference - Main Event"
                  fill
                  className="object-contain filter brightness-110 contrast-105 saturate-110 transition-all duration-300 group-hover:brightness-115 group-hover:contrast-110"
                  priority
                />
                
                {/* Enhanced Desktop Glare Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/50 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Premium Glare Animation - Desktop */}
                <motion.div 
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ 
                    duration: 2.5, 
                    delay: 2, 
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatDelay: 6
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                />
                
                {/* Depth and Lighting Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-500/10 opacity-60" />
                
                {/* Corner Highlights */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-white/30 to-transparent opacity-40" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-blue-400/20 to-transparent opacity-50" />
              </div>
              
              {/* Enhanced Multi-layer Drop Shadow */}
              <div className="absolute inset-0 bg-black/20 rounded-3xl blur-2xl transform translate-y-8 scale-95 -z-10 group-hover:bg-yellow-500/20 transition-colors duration-300" />
              <div className="absolute inset-0 bg-black/10 rounded-3xl blur-3xl transform translate-y-12 scale-90 -z-20" />
            </motion.div>
          </div>

          {/* Bottom Content Section - Guaranteed space */}
          <div className="pt-8 pb-12 space-y-6 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center space-y-6 max-w-4xl mx-auto"
            >
              <p className="text-lg lg:text-xl xl:text-2xl text-balance text-white/90 leading-[1.4] font-normal drop-shadow-sm tracking-[-0.01em]">
                <span className="font-bold text-yellow-200">Alamo Python</span>, the{" "}
                <span className="font-bold text-blue-200">PyTexas Foundation</span>, and{" "}
                <span className="font-bold text-white">DEVSA</span> are excited to activate the first-ever Python conference in San Antonio!
              </p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="https://www.meetup.com/alamo-python/events/311325578/"
                  className="group inline-flex items-center justify-center px-8 py-3.5 text-base lg:text-lg font-bold text-white bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 rounded-xl hover:from-sky-700 hover:via-sky-800 hover:to-blue-800 transition-all duration-300 shadow-xl border border-sky-400/30 drop-shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="mr-2 tracking-wide">RSVP Now</span>
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Desktop White Section - Conference Title and Description */}
      <section className="hidden lg:block w-full bg-white border-t border-gray-200">
        <div className="container mx-auto px-8 xl:px-12 py-20 lg:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8 lg:space-y-10"
            >
              <h2 className="font-sans text-black leading-[0.9] text-4xl lg:text-6xl xl:text-7xl font-semibold uppercase tracking-[-0.02em]">
                <span className="font-extralight italic text-black/90 mr-3">Python</span>
                <span className="font-black tracking-[-0.03em]">Conference</span>
              </h2>
              
              <p className="text-gray-600 text-xl lg:text-2xl xl:text-3xl leading-[1.4] max-w-4xl mx-auto font-normal tracking-[-0.01em]">
                PySanAntonio brings together developers, data scientists, security specialists, automation engineers, hobbyists, and curious minds across all experience levels. <strong className="text-black font-semibold">This is your opportunity to connect with the local community.</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}