"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { X } from "lucide-react"
import { partners, Partner } from "@/data/pysa/partners"

function PartnerModal({
  partner,
  isOpen,
  onClose,
}: {
  partner: Partner | null
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
            <div className="bg-white rounded-2xl max-w-sm w-full relative overflow-hidden max-h-[85vh] flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-black" />
              </button>

              {/* Partner Image - Fixed Height */}
              <div className="relative w-full h-48 flex-shrink-0">
                <Image
                  src={partner.image || "/placeholder.svg"}
                  alt={partner.name}
                  fill
                  className="object-contain bg-gradient-to-br from-teal-50 to-orange-50"
                />
              </div>

              {/* Partner Info - Scrollable Content */}
              <div className="p-6 space-y-3 overflow-y-auto flex-1">
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

export default function PartnersSection() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPartner(null), 300)
  }

  return (
    <section className="w-full bg-white py-16" data-bg-type="light">
      {/* Mobile Layout - Partner Cards */}
      <div className="block lg:hidden max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Partners</h2>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {partners.map((partner, index) => (
              <motion.button
                key={partner.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => openModal(partner)}
                className="w-full group"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative w-full aspect-[1080/1350] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
                  <Image
                    src={partner.image || "/placeholder.svg"}
                    alt={partner.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  
                  {/* Loteria Card Glare Effects for Mobile */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-30" />
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/40 rounded-full blur-lg opacity-40" />
                  
                  {/* Animated Glare Sweep on Hover */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-800 ease-out opacity-0 group-hover:opacity-100"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Partner Cards */}
      <div className="hidden lg:block w-full">
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

      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}