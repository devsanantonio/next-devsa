"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { X } from "lucide-react"

const partners = [
  {
    name: "Alamo Python",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-alamo.png",
    description:
      "Alamo Python is part of the PyTexas network of Python user groups. We are focused at providing in person training and social events to help grow the San Antonio Python community. We are proud to be a part of the DevSA community of San Antonio technology user groups.",
    link: "https://www.meetup.com/alamo-python/",
    linkText: "Follow on Meetup",
  },
  {
    name: "PyTexas",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-pytexas.png",
    description:
      "The PyTexas Foundation is a 501(c)3 non-profit run by a Texas-based volunteer group. We are Python enthusiasts that want to share the programming language with the world, starting right here in Texas. We host and support a variety of programs that benefit the Python community in Texas, including the largest Python conference in Texas, a virtual community for the Python developers in Texas and beyond, and various in-person meetups in cities throughout the state.",
    link: "https://www.pytexas.org/",
    linkText: "Visit PyTexas",
  },
  {
    name: "Geekdom",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-geekdom.png",
    description:
      "San Antonio's collaborative coworking space and tech community hub, fostering innovation and entrepreneurship in the heart of downtown.",
    link: "https://geekdom.com/",
    linkText: "Explore Geekdom",
  },
  {
    name: "DEVSA",
    image: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-devsa.png",
    description:
      "Activating the tech community in San Antonio through collaboration, strategic partnerships, and video content that connects developers.",
    link: "https://devsa.community/",
    linkText: "Visit DEVSA",
  },
]

function PartnerModal({
  partner,
  isOpen,
  onClose,
}: {
  partner: (typeof partners)[0] | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!partner) return null

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full relative overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-black" />
              </button>

              {/* Partner Image - Smaller */}
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={partner.image || "/placeholder.svg"}
                  alt={partner.name}
                  fill
                  className="object-contain bg-gradient-to-br from-teal-50 to-orange-50"
                />
              </div>

              {/* Partner Info - Compact */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-black">{partner.name}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{partner.description}</p>
                <Link
                  href={partner.link}
                  className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                >
                  {partner.linkText}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function PySanAntonioPage() {
  const [selectedPartner, setSelectedPartner] = useState<(typeof partners)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (partner: (typeof partners)[0]) => {
    setSelectedPartner(partner)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPartner(null), 300)
  }

  const cardRotations = [-4, 3, -2, 5]

  return (
    <main className="bg-white min-h-screen">
      <section className="w-full py-24 lg:py-0">
        {/* Mobile Layout - Hero + Horizontal Scroll */}
        <div className="block lg:hidden max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto mb-12"
          >
            <div className="relative w-full aspect-[1080/1350] rounded-xl overflow-hidden">
              <Image
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-10-python.png"
                alt="Python San Antonio Conference"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Mobile Partner Cards - Horizontal Scroll */}
          <div className="relative">
            <h2 className="text-4xl font-bold text-black text-center mb-6">Our Partners</h2>

            {/* Scroll Indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {partners.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-gray-300" />
              ))}
            </div>

            <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <div className="flex gap-4 pb-4 px-4">
                {partners.map((partner, index) => (
                  <motion.button
                    key={partner.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => openModal(partner)}
                    className="flex-shrink-0 w-64 snap-center"
                  >
                    <div className="relative w-full aspect-[1080/1350] rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
                      <Image
                        src={partner.image || "/placeholder.svg"}
                        alt={partner.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Scroll Hint Text */}
            <p className="text-center text-sm text-gray-500 mt-2">← Swipe to see all partners →</p>
          </div>
        </div>

        <div className="hidden lg:flex relative w-screen h-screen overflow-hidden mt-6">
          {/* Gradient Background - Full Screen */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-orange-600" />

          {/* Content Container - Full Screen with tighter spacing */}
          <div className="relative z-10 w-full h-full flex justify-center items-center px-8">
            {/* Left Column - 2 Partner Cards with Rotations */}
            <div className="absolute left-60 top-1/2 -translate-y-1/2 flex flex-col gap-8">
              <motion.button
                initial={{ opacity: 0, x: -50, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: cardRotations[0] }}
                whileHover={{ scale: 1.05, rotate: 0, y: -4 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={() => openModal(partners[0])}
                className="w-48 cursor-pointer group"
              >
                <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden">
                  <Image
                    src={partners[0].image || "/placeholder.svg"}
                    alt={partners[0].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-3 py-1.5 rounded-lg">
                      Click to Learn More
                    </span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -50, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: cardRotations[1] }}
                whileHover={{ scale: 1.05, rotate: 0, y: -4 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => openModal(partners[1])}
                className="w-48 cursor-pointer group"
              >
                <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden">
                  <Image
                    src={partners[1].image || "/placeholder.svg"}
                    alt={partners[1].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-3 py-1.5 rounded-lg">
                      Click to Learn More
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Center - Main Hero Card (No Rotation, Larger) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-20 w-full max-w-sm p-24"
            >
              <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-25-pysa+(1).png"
                  alt="Python San Antonio Conference"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Right Column - 2 Partner Cards with Rotations */}
            <div className="absolute right-60 top-1/2 -translate-y-1/2 flex flex-col gap-8">
              <motion.button
                initial={{ opacity: 0, x: 50, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: cardRotations[2] }}
                whileHover={{ scale: 1.05, rotate: 0, y: -4 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={() => openModal(partners[2])}
                className="w-48 cursor-pointer group"
              >
                <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden">
                  <Image
                    src={partners[2].image || "/placeholder.svg"}
                    alt={partners[2].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-3 py-1.5 rounded-lg">
                      Click to Learn More
                    </span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 50, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: cardRotations[3] }}
                whileHover={{ scale: 1.05, rotate: 0, y: -4 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => openModal(partners[3])}
                className="w-48 cursor-pointer group"
              >
                <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden">
                  <Image
                    src={partners[3].image || "/placeholder.svg"}
                    alt={partners[3].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-3 py-1.5 rounded-lg">
                      Click to Learn More
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-32 mb-16 text-center"
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-8">
          PyTexas is coming <span className="block md:inline">to San Antonio!</span>
        </h2>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
          Alamo Python is hosting a half-day PyTexas conference at Geekdom on Saturday, November 8, starting at 1 PM
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="https://www.meetup.com/alamo-python/events/311325578/"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-black rounded-xl hover:bg-gray-900 transition-all duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            RSVP Now
          </Link>
        </motion.div>
      </motion.section>

      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={closeModal} />
    </main>
  )
}
