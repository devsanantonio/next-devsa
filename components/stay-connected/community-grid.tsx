"use client"

import { COMMUNITY_LOGOS } from "@/data/communities"
import { cn } from "@/lib/utils"

// White/knockout logos that need inverting to show on the white tiles.
const INVERT = new Set([
  "Alamo Python",
  "Unreal Engine SA",
  "AWS User Group",
  "Alamo City Locksport",
  "Alamo Tech Collective",
  "Datanauts",
  "Greater Gaming Society",
  "Red Hat User Group",
  "Women in Data",
])

/** Logo wall of San Antonio tech communities — context for the calendar slide. */
export function CommunityGrid() {
  return (
    <div className="flex flex-wrap gap-2">
      {COMMUNITY_LOGOS.map((c) => {
        const invert = INVERT.has(c.name)
        return (
          <div
            key={c.name}
            title={c.name}
            className="flex h-12 w-20 items-center justify-center rounded-lg border border-neutral-200 bg-white p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.logo}
              alt={c.name}
              className={cn(
                "max-h-full max-w-full object-contain",
                invert && "invert"
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
