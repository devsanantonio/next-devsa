"use client"

import { AdminsSection } from "@/components/coworking-space/admins-section"
import { GeekdomSection } from "@/components/coworking-space/geekdom-section"
import { ClosingCta } from "@/components/coworking-space/closing-cta"

/**
 * What is left of the coworking page now the room has closed.
 *
 * The hero went because it polled Discord for whether an admin was in the
 * space, and that answer is permanently no. The features section went because
 * it gave parking directions and told people how to get the door opened — copy
 * that was not merely stale but would actively send someone downtown.
 *
 * What stays is the part worth keeping a URL for: the volunteers who ran it,
 * and the thanks to Geekdom.
 */
export function CoworkingSpaceClient() {


  const admins = [
    {
      name: "Zander Brysch",
      role: "ACM-UTSA/RowdyHacks",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-zander.png",
      linkedin: "https://www.linkedin.com/in/zander-brysch/",
      instagram: "https://www.instagram.com/acmutsa/",
    },
    {
      name: "Zaquariah Holland",
      role: "ACM-SA",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/admin-holland.png",
      linkedin: "https://www.linkedin.com/in/zaquariah-holland/",
      instagram: "https://www.instagram.com/acmsanantonio/",
    },
    {
      name: "Al Dungo",
      role: "Dungo Digital",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-dungo2.webp",
      linkedin: "https://www.linkedin.com/in/al-d-543688113/",
      instagram: "https://www.instagram.com/dungodigital/",
    },
    {
      name: "Ansley Rose",
      role: "Greater Gaming Society",
      image: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-ansley.jpeg",
      linkedin: "https://www.linkedin.com/in/ansley-partosa/",
      instagram: "https://www.instagram.com/greatergamingsociety/",
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
      <AdminsSection admins={admins} />
      <GeekdomSection />
      <ClosingCta />
    </div>
  )
}