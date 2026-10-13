"use client"

import Image from "next/image"
import Link from "next/link"
import { logoOnLight, logoSrcOnLight } from "@/lib/logo-invert"

/**
 * A logo tile for phones, shared by the homepage's Who's Building Here and
 * Building Together's Explore the Ecosystem so the two read as one system.
 *
 * Both used to be auto-scrolling marquees, which the copy beside them
 * contradicted ("Tap any logo"): a moving target is hard to tap. The name is
 * the link's accessible name and the image's alt, so it is announced, and a
 * long-press shows it as a tooltip.
 */
export function MobileLogoTile({
  logo,
}: {
  logo: { id: string; name: string; logo: string; type: "community" | "partner" }
}) {
  return (
    <Link
      href={`/buildingtogether/${logo.id}`}
      aria-label={logo.name}
      title={logo.name}
      className="flex aspect-[4/3] items-center justify-center rounded-xl border border-gray-200 bg-white p-3 transition-colors active:bg-gray-50"
    >
      <span className="relative h-full w-full">
        <Image
          src={logoSrcOnLight(logo, logo.logo)}
          alt={logo.name}
          fill
          unoptimized
          sizes="120px"
          className={`object-contain ${logoOnLight(logo)}`}
        />
      </span>
    </Link>
  )
}
