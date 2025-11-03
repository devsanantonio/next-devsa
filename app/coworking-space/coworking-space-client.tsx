"use client"

import { motion } from "motion/react"
import { ExternalLink, X } from "lucide-react"
import { useState } from "react"
import { HeroSection } from "@/components/coworking-space/hero-section"
import { SpaceFeaturesSection } from "@/components/coworking-space/space-features-section"
import { AdminsSection } from "@/components/coworking-space/admins-section"
import { GeekdomSection } from "@/components/coworking-space/geekdom-section"

function SpaceModal({
  isOpen,
  onClose,
  title,
  description,
  link,
  linkText,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  link: string
  linkText: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl aspect-[4/5] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-6" />
        </button>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">{description}</p>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105"
        >
          {linkText}
          <ExternalLink className="size-4" />
        </a>
      </motion.div>
    </div>
  )
}

export function CoworkingSpaceClient() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const spaceFeatures = [
    {
      id: "parking",
      category: "Parking",
      title: "Downtown SA Parking: Your Quick Guide to Garages & Free Hours",
      description:
        "The City of San Antonio provides convenient and affordable parking options—including free parking during Downtown Tuesdays and on Sundays—all within easy walking distance of the DEVSA space at Geekdom on Houston St.",
      link: "https://sapark.sanantonio.gov/Parking-Locations/Affordable-Parking",
      linkText: "View Affordable Parking Options",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/FAQsResources.png",
    },
    {
      id: "discord",
      category: "Access",
      title: "Access to DEVSA Managed via Discord Server",
      description:
        "To meet safety and compliance guidelines, the DEVSA space is only available when an approved admin is present. Join our Discord Server and follow the #community-space channel for daily availability, updates, and access instructions.",
      link: "https://discord.gg/cvHHzThrEw",
      linkText: "Join our Discord Server",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/discord-invite.svg",
    },
  ]

  const admins = [
    {
      name: "Al Dungo",
      role: "Dungo Digital",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-dungo2.webp",
      linkedin: "https://www.linkedin.com/in/al-d-543688113/",
      instagram: "https://www.instagram.com/dungodigital/",
    },
    {
      name: "Daniel Ochoa",
      role: "Alamo Python",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-daniel.jpeg",
      linkedin: "https://www.linkedin.com/in/dochoa3/",
      instagram: "https://www.instagram.com/devsatx/",
    },
    {
      name: "Ansley Rose",
      role: "Greater Gaming Society",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-ansley.jpeg",
      linkedin: "https://www.linkedin.com/in/ansley-partosa/",
      instagram: "https://www.instagram.com/greatergamingsociety/",
    },
    {
      name: "Ruben Garcia",
      role: "Inspire Media Productions",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-ruben.JPG",
      linkedin: "https://www.linkedin.com/in/ruben-garcia-1a5086251/",
      instagram: "https://www.instagram.com/inspiremediapro/",
    },
    {
      name: "Jesse Hernandez",
      role: "DEVSA",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-jesse.jpeg",
      linkedin: "https://www.linkedin.com/in/jessebubble/",
      instagram: "https://www.instagram.com/jessebubble/",
    },
  ]

  return (
    <div className="w-full min-h-screen bg-white">
      <HeroSection />
      <AdminsSection admins={admins} />
      <SpaceFeaturesSection features={spaceFeatures} activeModal={activeModal} setActiveModal={setActiveModal} />
      <GeekdomSection />
    </div>
  )
}