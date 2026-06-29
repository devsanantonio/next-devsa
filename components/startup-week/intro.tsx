"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarClock, CalendarDays, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { TRACKS, type Track } from "@/data/startup-week"

const ACCENT = "#ec228d"
const DEVSA_LOGO = "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
const STARTUP_WEEK_LOGO =
  "https://devsa-assets.s3.us-east-2.amazonaws.com/poweredbygeekdom.png"

/**
 * The San Antonio Startup Week left-column content: co-branded lockup, dates,
 * headline, blurb, and the five tracks with hover descriptions. Shared by the
 * /startup-week-2026 hero and the /stay-connected spotlight slide so the two
 * stay visually identical.
 */
export function StartupWeekIntro({
  size = "md",
  showTracks = true,
  showDeadline = true,
}: {
  size?: "md" | "lg"
  showTracks?: boolean
  showDeadline?: boolean
}) {
  const [hoveredTrack, setHoveredTrack] = useState<Track | null>(null)
  const lg = size === "lg"

  return (
    <div className="flex flex-col gap-7">
      {/* Status */}
      <span
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
        style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
        Call for speakers open
      </span>

      {/* Co-brand lockup */}
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
          An open call from
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STARTUP_WEEK_LOGO}
            alt="San Antonio Startup Week"
            className={cn("w-auto", lg ? "h-20 sm:h-28 lg:h-36" : "h-16 sm:h-20 lg:h-24")}
          />
          <span
            className={cn("font-light text-neutral-300", lg ? "text-4xl" : "text-3xl")}
          >
            ×
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEVSA_LOGO}
            alt="DEVSA"
            className={cn("w-auto", lg ? "h-16 sm:h-20 lg:h-24 xl:h-28" : "h-12 sm:h-14 lg:h-16")}
          />
        </div>
      </div>

      {/* Dates + location */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" style={{ color: ACCENT }} />
          Sept 28 – Oct 2, 2026
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4" style={{ color: ACCENT }} />
          San Antonio, TX
        </span>
      </div>

      {/* Deadline */}
      {showDeadline && (
        <div className="inline-flex w-fit items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-700">
          <CalendarClock className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
          <span>
            Speaker submissions close{" "}
            <span className="font-semibold text-neutral-900">June 30, 2026</span>
          </span>
        </div>
      )}

      <p
        className={cn(
          "max-w-md text-balance text-base leading-relaxed text-neutral-600 md:text-lg",
          lg && "xl:max-w-lg xl:text-xl"
        )}
      >
        DEVSA and Geekdom are coming together for an open call for speakers.
        Share what you&apos;re building with founders, operators, and investors
        from across the San&nbsp;Antonio ecosystem.
      </p>

      {/* Tracks, integrated as context — hover a chip to read who it's for */}
      {showTracks && (
        <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Five tracks
        </p>
        <div className="flex flex-wrap gap-2">
          {TRACKS.map((t) => (
            <button
              key={t.name}
              type="button"
              onMouseEnter={() => setHoveredTrack(t)}
              onMouseLeave={() => setHoveredTrack(null)}
              onFocus={() => setHoveredTrack(t)}
              onBlur={() => setHoveredTrack(null)}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-white"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </button>
          ))}
        </div>
        <div className="min-h-11 max-w-md">
          <AnimatePresence mode="wait">
            <motion.p
              key={hoveredTrack?.name ?? "none"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm leading-relaxed text-neutral-600"
            >
              {hoveredTrack ? (
                <>
                  <span className="font-semibold text-neutral-900">
                    {hoveredTrack.name}:
                  </span>{" "}
                  {hoveredTrack.description}
                </>
              ) : (
                <span className="italic text-neutral-400">
                  Hover a track to see who it&apos;s for.
                </span>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
        </div>
      )}
    </div>
  )
}
