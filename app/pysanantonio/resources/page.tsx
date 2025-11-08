"use client"

import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

const ResourceLink = ({ 
  title, 
  description, 
  href, 
  icon, 
  variant = "primary",
  isExternal = true 
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  variant?: "primary" | "secondary" | "accent"
  isExternal?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/30"
      case "secondary":
        return "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-600/30"
      case "accent":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border-yellow-400/30"
      default:
        return "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/30"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Link
        href={href}
        target={isExternal ? "_blank" : "_self"}
        rel={isExternal ? "noopener noreferrer" : ""}
        className="block w-full group"
      >
        <div className={`relative w-full p-6 lg:p-8 rounded-xl transition-all duration-300 border ${getVariantStyles()} shadow-lg hover:shadow-xl overflow-hidden`}>
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-60" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center space-x-5">
            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-lg border border-white/20">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg lg:text-xl leading-tight tracking-tight">
                {title}
              </h3>
              <p className="text-white/70 text-sm lg:text-base mt-2 leading-relaxed">
                {description}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <motion.svg
                animate={{ x: isHovered ? 3 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isExternal ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" : "M9 5l7 7-7 7"}
                />
              </motion.svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-black min-h-screen flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(252,203,15,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,65,179,0.08)_0%,transparent_50%)]" />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-12 lg:space-y-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 lg:space-y-12"
            >
              <div className="space-y-4 lg:space-y-6">
                <p className="text-sm lg:text-base font-medium text-yellow-400 uppercase tracking-wider">
                  Conference Resources
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.85] tracking-tight">
                  <span className="block font-light text-white/90 mb-3 lg:mb-4">PySanAntonio</span>
                  <span className="block font-black bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    Resources
                  </span>
                </h1>
              </div>
              
              <p className="max-w-4xl mx-auto text-xl sm:text-2xl lg:text-3xl text-white/80 leading-relaxed font-normal">
                Access slide decks, presentations, and materials from PySanAntonio 2025. 
                Everything you need to continue your Python journey.
              </p>
            </motion.div>

            {/* Event Feedback Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pt-8 lg:pt-12"
            >
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSdxnha6KX35_Y_NcU-1u3T9ojoHBIQHpne45CazQX3v6rVDjA/viewform?usp=sharing&ouid=108614570363889129398"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-10 py-5 lg:px-12 lg:py-6 text-lg lg:text-xl font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-2xl hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-yellow-300/50"
              >
                <span className="tracking-wide">Share Your Feedback</span>
                <svg 
                  className="w-6 h-6 lg:w-7 lg:h-7 ml-3 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Main Talk Slides */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Main Talk Slide Decks
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Presentations from our featured speakers
                </p>
              </div>
              
              <div className="space-y-4">
                <ResourceLink
                  title="Building Your Own AI Coding Assistant with DSPy"
                  description="Joel Grus • 1:15 PM - 2:00 PM"
                  href="https://docs.google.com/presentation/d/1hirudbqv-OAVXyvJJlHFrvykEwE2loXQo4crb583dks/edit"
                  variant="accent"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  }
                />
                
                <ResourceLink
                  title="Asynchronous Patterns for Django"
                  description="Paul Bailey • 2:30 PM - 3:15 PM"
                  href="https://www.neutron.studio/talks/2025-01-06-async-django.html"
                  variant="primary"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  }
                />
                
                <ResourceLink
                  title="Advanced Alchemy: Your Companion to SQLAlchemy"
                  description="Cody Fincher • 3:30 PM - 4:15 PM"
                  href="https://docs.google.com/presentation/d/1L9tYaLz5XlWCDqC9rt6OfAAhKft9oyNl93CltXg39wA/edit?usp=sharing"
                  variant="primary"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  }
                />
              </div>
            </motion.div>

            {/* Additional Resources */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Additional Resources
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Community connections and feedback
                </p>
              </div>
              
              <div className="space-y-4">
                <ResourceLink
                  title="PyTexas Foundation"
                  description="Learn more about PyTexas and upcoming events"
                  href="https://www.pytexas.org/"
                  variant="primary"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>
            </motion.div>
            {/* PyTexas Discord */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <ResourceLink
                title="Join the PyTexas Discord"
                description="Connect with other attendees and speakers"
                href="https://discord.gg/kEKJZxR8qm"
                variant="secondary"
                icon={
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5C8.5 4.5 5.5 6.5 4 9c-1.5 2.5-1 5.5 1 7 2 2 5 2 7 1 2-1 4-3 5-5 1-2 1-5-1-7-1.5-1.5-3.5-2-5-2z" />
                  </svg>
                }
              />
            </motion.div>

            {/* Back to Event */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="pt-8 text-center"
            >
              <Link
                href="/pysanantonio"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to PySanAntonio</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}