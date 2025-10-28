"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Metaballs } from '@paper-design/shaders-react'

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
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.max(window.innerWidth, 1280),
        height: Math.max(window.innerHeight, 720)
      })
    }

    if (typeof window !== 'undefined') {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

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
    <main className="bg-white overflow-x-hidden" data-bg-type="light">
      {/* Mobile CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 sm:px-6 lg:hidden pt-24 pb-8 relative overflow-hidden"
      >
        {/* Mobile Metaballs Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="w-full h-full min-w-[100vw] min-h-[100vh] flex items-center justify-center">
            <Metaballs
              width={dimensions.width}
              height={dimensions.height}
              colors={["#facb0f", "#0041b3"]}
              colorBack="#2a273f"
              count={13}
              size={0.81}
              speed={0.5}
              scale={4}
              offsetX={-0.3}
            />
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight text-center">
            PyTexas is coming{" "}
            <span className="block bg-gradient-to-r from-[#facb0f] to-[#ff8400] bg-clip-text text-transparent">
              to San Antonio!
            </span>
          </h1>
          <p className="max-w-md mx-auto text-lg text-white/95 leading-relaxed font-medium text-center">
            We&apos;re excited to announce some of the talks scheduled for the first Python conference in San Antonio, <strong>PySanAntonio!</strong>
          </p>
          <div className="flex justify-center pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://www.meetup.com/alamo-python/events/311325578/"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl hover:from-sky-700 hover:to-sky-800 transition-all duration-300 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="mr-2">RSVP Now</span>
                <svg 
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
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

        {/* Desktop Layout - Full Background Metaballs */}
        <div className="hidden lg:flex w-full py-32 md:py-40 mx-auto relative overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>
          {/* Full Desktop Metaballs Background */}
          <div className="absolute inset-0 w-full h-full">
            <div className="w-full h-full min-w-[100vw] min-h-[100vh] flex items-center justify-center">
              <Metaballs
                width={dimensions.width}
                height={dimensions.height}
                colors={["#facb0f", "#0041b3"]}
                colorBack="#2a273f"
                count={13}
                size={0.81}
                speed={0.5}
                scale={4}
                offsetX={-0.3}
              />
            </div>
          </div>

          {/* Left Side - CTA Section */}
          <div className="w-1/2 flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-xl px-8 xl:px-12 text-left space-y-8"
            >
              {/* Hero Headline - Improved Typography */}
              <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-black text-white leading-[1.1] tracking-tight">
                PyTexas is coming{" "}
                <span className="block bg-gradient-to-r from-[#facb0f] to-[#ff8400] bg-clip-text text-transparent font-black">
                  to San Antonio!
                </span>
              </h1>
              
              {/* Subtitle with Better Hierarchy */}
              <p className="text-xl xl:text-2xl text-white/95 leading-relaxed font-medium max-w-lg">
                We&apos;re excited to announce some of the talks scheduled for the first Python conference in San Antonio, <strong>PySanAntonio!</strong>
              </p>
              
              {/* CTA Button with Enhanced Design */}
              <div className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="https://www.meetup.com/alamo-python/events/311325578/"
                    className="group inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-sky-600 to-sky-700 rounded-2xl hover:from-sky-700 hover:to-sky-800 transition-all duration-300 shadow-xl hover:shadow-2xl border border-sky-500/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="mr-2">RSVP Now</span>
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
              </div>
            </motion.div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="w-1/2 relative overflow-hidden">
            {/* Hero Image Container */}
            <div className="relative z-10 w-full h-full flex justify-center items-center p-8">
              {/* Main Hero Card with Glare Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02, rotateY: 3 }}
                className="relative w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl group cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500 border border-white/20">
                  <Image
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-7-meetup.png"
                    alt="Python San Antonio Conference"
                    fill
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  
                  {/* Static Glare Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-20" />
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/40 rounded-full blur-xl opacity-30" />
                  
                  {/* Animated Glare on Hover */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"
                  />
                  
                  {/* Subtle Overlay for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 opacity-60" />
                </div>
                
                {/* Drop Shadow Enhancement */}
                <div className="absolute inset-0 bg-black/20 rounded-2xl blur-2xl transform translate-y-4 scale-95 -z-10 group-hover:translate-y-6 group-hover:scale-100 transition-all duration-500" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Partner Cards - Below Hero */}
        <div className="hidden lg:block w-full bg-white py-16 mt-10" data-bg-type="light">
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
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => openModal(partner)}
                  className="w-full group cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative w-full aspect-[1080/1350] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
                    <Image
                      src={partner.image || "/placeholder.svg"}
                      alt={partner.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    
                    {/* Loteria Card Glare Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-30" />
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/40 rounded-full blur-lg opacity-40" />
                    
                    {/* Animated Glare Sweep on Hover */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                      transition-transform duration-800 ease-out opacity-0 group-hover:opacity-100"
                    />
                    
                    {/* Subtle Card Depth Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 opacity-50" />
                  </div>
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
