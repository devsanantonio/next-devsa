"use client"

import { HeroSection } from "@/components/coworking-space/hero-section"
import { SpaceFeaturesSection } from "@/components/coworking-space/space-features-section"
import { AdminsSection } from "@/components/coworking-space/admins-section"
import { GeekdomSection } from "@/components/coworking-space/geekdom-section"

export function CoworkingSpaceClient() {

  const spaceFeatures = [
    {
      id: "parking",
      category: "Parking",
      title: "Parking Downtown Has Never Been Easier (or More Affordable)",
      description:
        "The City of San Antonio offers convenient and affordable parking—including easy access to city parking garages and ample street parking—all within walking distance of the DEVSA space on historic Houston Street.",
      link: "https://sapark.sanantonio.gov/Parking-Locations/Affordable-Parking",
      linkText: "View COSA Parking Options",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/FAQsResources.png",
    },
    {
      id: "discord",
      category: "Access",
      title: "Daily Access to Community Space Managed via Discord Server",
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
      <SpaceFeaturesSection features={spaceFeatures} />
      <GeekdomSection />
    </div>
  )
}