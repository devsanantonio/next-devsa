"use client"

import { motion } from "motion/react"
import { ExternalLink, X } from "lucide-react"

interface SpaceModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  link: string
  linkText: string
  image?: string
}

export function SpaceModal({ isOpen, onClose, title, description, link, linkText, image }: SpaceModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl w-full max-w-sm md:max-w-lg shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden"
        style={{ aspectRatio: "4/5" }}
      >
        <div className="flex flex-col h-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-all duration-200 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm shadow-xl hover:scale-110"
            aria-label="Close modal"
          >
            <X className="size-5 md:size-6" />
          </button>
          
          {/* Image section */}
          {image && (
            <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden rounded-t-3xl flex-shrink-0">
              <img
                src={image}
                alt={title}
                className="w-full h-full md:object-cover object-left md:object-center"
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center center'
                }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          
          {/* Content section */}
          <div className="flex-1 flex flex-col p-6 md:p-8 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-[-0.01em]">{title}</h3>
              <div className="space-y-3">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-light">{description}</p>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0 pt-6">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-bold hover:bg-gray-800 transition-all duration-300 hover:scale-105 w-full text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg"
              >
                {linkText}
                <ExternalLink className="size-4 md:size-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
