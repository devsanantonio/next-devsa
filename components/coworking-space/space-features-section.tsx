"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { Dithering } from '@paper-design/shaders-react'
import { ExternalLink } from "lucide-react"


interface SpaceFeature {
  id: string
  category: string
  title: string
  description: string
  link: string
  linkText: string
  image?: string
}

interface SpaceFeaturesSectionProps {
  features: SpaceFeature[]
}

interface FeatureCardProps {
  feature: SpaceFeature
}

function FeatureCard({ feature }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getFeatureColor = (id: string) => {
    switch (id) {
      case "parking": return "#3B82F6"
      case "discord": return "#8B5CF6"
      case "coworking": return "#F97316"
      case "events": return "#10B981"
      default: return "#6B7280"
    }
  }

  return (
    <motion.a
      href={feature.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white border border-gray-200 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:border-gray-300 overflow-hidden block"
      style={{ minHeight: "320px" }}
    >
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${getFeatureColor(feature.id)}, transparent 70%)`
        }}
      />
      
      {/* Content container with proper spacing */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-center space-y-5">
          <span 
            className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-bold text-white w-fit uppercase tracking-wide"
            style={{ backgroundColor: getFeatureColor(feature.id) }}
          >
            {feature.category}
          </span>
          
          <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 group-hover:text-gray-700 transition-colors leading-tight tracking-[-0.01em]">
            {feature.title}
          </h3>
          
          <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
            {feature.description}
          </p>
        </div>
        
        {/* Interactive footer section with link text */}
        <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-semibold transition-colors duration-300 flex items-center gap-2"
              style={{ color: getFeatureColor(feature.id) }}
            >
              {feature.linkText}
              <ExternalLink className="w-4 h-4" />
            </span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ 
                backgroundColor: isHovered ? getFeatureColor(feature.id) : '#efefef',
                transform: isHovered ? 'rotate(45deg)' : 'rotate(0deg)'
              }}
            >
              <svg 
                className="w-4 h-4 transition-colors duration-300" 
                fill="none" 
                stroke={isHovered ? "white" : "#6B7280"} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Paper Design Dithering Effect - Full Width */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden rounded-b-2xl"
        >
          <div className="w-full h-full">
            <Dithering
              width={800}
              height={128}
              colorBack="#ffffff"
              colorFront={getFeatureColor(feature.id)}
              shape="wave"
              type="4x4"
              size={11}
              speed={1}
              scale={1.2}
            />
          </div>
        </motion.div>
      )}
    </motion.a>
  )
}

export function SpaceFeaturesSection({ features }: SpaceFeaturesSectionProps) {

  return (
    <section className="py-20 md:py-32 bg-white" data-bg-type="light">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20" 
        >
          <div className="space-y-6">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Essential Information
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] tracking-[-0.02em] max-w-4xl">
              Getting Here: Parking & Space Access
            </h2>
            <div className="space-y-4 max-w-2xl">
              <p className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-[1.4] font-light">
                Your two biggest questions, answered!
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Read below for a quick guide on finding affordable downtown parking and gaining entry via our community Discord server.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature: SpaceFeature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
