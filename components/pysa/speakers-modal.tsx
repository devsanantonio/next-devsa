"use client"

import { motion, AnimatePresence } from "motion/react"
import { X, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Speaker } from "@/data/pysa/speakers"

interface SpeakersModalProps {
  isOpen: boolean
  onClose: () => void
  speakers: Speaker[]
}

export function SpeakersModal({ isOpen, onClose, speakers }: SpeakersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold text-black mb-2">All Speakers</h2>
                <p className="text-sm lg:text-base text-gray-600">Meet the experts sharing their knowledge</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Speakers Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {speakers.map((speaker, index) => (
                  <motion.div
                    key={speaker.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    {/* Speaker Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-blue-100 to-yellow-100">
                      <Image
                        src={speaker.image || "/placeholder.svg"}
                        alt={speaker.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Speaker Info */}
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1">{speaker.name}</h3>
                      <p className="text-blue-600 font-semibold text-sm mb-1">{speaker.title}</p>
                      <p className="text-gray-600 text-sm mb-2">{speaker.company}</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{speaker.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-yellow-50">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-lg font-bold text-black mb-2">Interested in speaking?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We're always looking for passionate speakers to share their Python expertise.
                </p>
                <Link
                  href="https://www.meetup.com/alamo-python/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Organizers
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
