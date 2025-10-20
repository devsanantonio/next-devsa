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
    <main className="bg-white overflow-x-hidden">
      {/* Mobile CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 sm:px-6 lg:hidden pt-24 pb-8"
      >
        <h1 className="text-3xl font-bold text-black mb-4">
          PyTexas is coming <span className="block">to San Antonio!</span>
        </h1>
        <p className="max-w-3xl mx-auto text-base text-gray-700 mb-6 leading-relaxed">
          Alamo Python is hosting a half-day PyTexas conference at Geekdom on Saturday, November 8, starting at 1 PM
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="https://www.meetup.com/alamo-python/events/311325578/"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-900 transition-all duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            RSVP Now
          </Link>
        </motion.div>
      </motion.section>

      <section className="w-full pb-8 lg:pb-0">
        {/* Mobile Layout - Hero + Horizontal Scroll */}
        <div className="block lg:hidden max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile Hero Image - Compact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xs mx-auto mb-8"
          >
            <div className="relative w-full aspect-[1080/1350] rounded-xl overflow-hidden">
              <Image
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-25-pysa+(1).png"
                alt="Python San Antonio Conference"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Mobile Partner Cards - Compact Grid */}
          <div className="relative">
            <h2 className="text-3xl font-bold text-black mb-4">Our Partners</h2>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {partners.map((partner, index) => (
                <motion.button
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => openModal(partner)}
                  className="w-full"
                >
                  <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
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
        </div>

        {/* Desktop Layout - Left CTA, Right Images */}
        <div className="hidden lg:flex w-full max-w-7xl mx-auto" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Left Side - CTA Section */}
          <div className="w-1/2 flex items-center justify-center bg-white">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full px-8 xl:px-12 text-left"
            >
              <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-black mb-6 leading-tight">
                PyTexas is coming{" "}
                <span className="block">to San Antonio!</span>
              </h1>
              <p className="text-lg xl:text-xl text-gray-700 mb-8 leading-relaxed">
                Alamo Python is hosting a half-day PyTexas conference at Geekdom on Saturday, November 8, starting at 1 PM
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="https://www.meetup.com/alamo-python/events/311325578/"
                  className="inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-900 transition-all duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  RSVP Now
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Hero Image with Gradient Background */}
          <div className="w-1/2 relative overflow-hidden">

            {/* Hero Image Container */}
            <div className="relative z-10 w-full h-full flex justify-center items-center p-8 mt-12">
              {/* Main Hero Card Only - Larger */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-80 xl:w-96 2xl:w-[28rem]"
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
            </div>
          </div>
        </div>

        {/* Desktop Partner Cards - Below Hero */}
        <div className="hidden lg:block w-full bg-white py-16 mt-10">
          <div className="max-w-7xl mx-auto px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold text-black mb-12"
            >
              Our Partners
            </motion.h2>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-8 w-full">
              {partners.map((partner, index) => (
                <motion.button
                  key={partner.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => openModal(partner)}
                  className="w-full group cursor-pointer"
                >
                  <div className="relative w-full aspect-[1080/1350] rounded-xl overflow-hidden">
                    <Image
                      src={partner.image || "/placeholder.svg"}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-lg">
                        Learn More
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-black mt-4 group-hover:text-teal-600 transition-colors duration-300">
                    {partner.name}
                  </h3>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={closeModal} />
    </main>
  )
}
