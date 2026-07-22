"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { partners } from "@/data/partners"
import { Loader2 } from "lucide-react"

type LogoType = "community" | "partner"

interface LogoItem {
  id: string
  name: string
  logo: string
  type: LogoType
}

// White-on-transparent marks that need inverting to read on a light surface.
const INVERT_PARTNER_IDS = ["youth-code-jam", "434media", "digital-canvas"]
const INVERT_COMMUNITY_NAMES = [
  "aws user group",
  "alamo city locksport",
  "alamo python",
  "alamo tech collective",
  "datanauts",
  "greater gaming society",
  "red hat user group",
  "unreal engine",
  "women in data",
]

// Horizontal wordmark logos that read small in a square box — give them room.
const LARGE_PARTNER_IDS = [
  "tech-bloc",
  "geekdom",
  "youth-code-jam",
  "digital-canvas",
  "utsa",
  "learn2ai",
  "project-quest",
]

function shouldInvert(logo: LogoItem) {
  if (logo.type === "partner") return INVERT_PARTNER_IDS.includes(logo.id)
  return INVERT_COMMUNITY_NAMES.some((n) => logo.name.toLowerCase().includes(n))
}

function isLargeLogo(logo: LogoItem) {
  return logo.type === "partner" && LARGE_PARTNER_IDS.includes(logo.id)
}

function splitIntoRows<T>(items: T[], rows: number): T[][] {
  const out: T[][] = Array.from({ length: rows }, () => [])
  items.forEach((item, i) => out[i % rows].push(item))
  return out
}

/* Desktop — a logo-forward tile, on the canvas (no card). */
function LogoTile({ logo }: { logo: LogoItem }) {
  const invert = shouldInvert(logo)
  const large = isLargeLogo(logo)
  return (
    <Link href={`/buildingtogether/${logo.id}`} className="group/logo block h-full">
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <div className={`relative shrink-0 ${large ? "h-16 w-16" : "h-12 w-12"}`}>
          <Image
            src={logo.logo}
            alt={logo.name}
            fill
            unoptimized
            sizes={large ? "64px" : "48px"}
            className={`object-contain${invert ? " invert" : ""}`}
          />
        </div>
        <span className="text-sm font-medium leading-tight text-gray-600 transition-colors duration-200 group-hover/logo:text-gray-900">
          {logo.name}
        </span>
      </div>
    </Link>
  )
}

/* Mobile — a compact chip used inside the scrolling marquee */
function MarqueeChip({ logo }: { logo: LogoItem }) {
  const invert = shouldInvert(logo)
  return (
    <Link href={`/buildingtogether/${logo.id}`} className="shrink-0">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="relative h-6 w-6 shrink-0">
          <Image
            src={logo.logo}
            alt={logo.name}
            fill
            unoptimized
            sizes="24px"
            className={`object-contain${invert ? " invert" : ""}`}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-gray-700">
          {logo.name}
        </span>
      </div>
    </Link>
  )
}

/* Mobile — one seamlessly-looping marquee row */
function MarqueeRow({
  logos,
  direction,
  durationS,
  paused,
}: {
  logos: LogoItem[]
  direction: "left" | "right"
  durationS: number
  paused: boolean
}) {
  const doubled = useMemo(() => [...logos, ...logos], [logos])
  return (
    <div
      className="flex w-max gap-2"
      style={{
        animation: `bt-marquee-${direction} ${durationS}s linear infinite`,
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {doubled.map((logo, i) => (
        <MarqueeChip key={`${logo.id}-${i}`} logo={logo} />
      ))}
    </div>
  )
}

export function LogoShowcase() {
  const [allLogos, setAllLogos] = useState<LogoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const partnerLogos: LogoItem[] = partners.map((p) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        type: "partner" as const,
      }))
      try {
        const res = await fetch("/api/communities")
        if (res.ok) {
          const data = await res.json()
          const communities: LogoItem[] = (data.communities || []).map(
            (c: { id: string; name: string; logo: string }) => ({
              id: c.id,
              name: c.name,
              logo: c.logo,
              type: "community" as const,
            })
          )
          setAllLogos([...communities, ...partnerLogos])
        } else {
          setAllLogos(partnerLogos)
        }
      } catch {
        setAllLogos(partnerLogos)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const marqueeRows = useMemo(() => splitIntoRows(allLogos, 3), [allLogos])

  return (
    <section className="w-full bg-white" data-bg-type="light">
      <style>{`
        @keyframes bt-marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes bt-marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-10 md:mb-14"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Partners &amp; Communities
            </p>
            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Explore the{" "}
              <span className="text-gray-600 font-light italic">Ecosystem</span>.
            </h2>
          </div>

          <div className="space-y-5 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
              Every tech group, meetup, and partner organization powering San
              Antonio&apos;s{" "}
              <strong className="font-semibold text-gray-900">tech network</strong>{" "}
              — in one place.
            </p>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed">
              Tap any logo to see their mission, upcoming events, and how to get
              involved.
            </p>
          </div>
        </motion.div>

        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {isLoading ? (
            <div className="flex items-start py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {/* Tablet & desktop: uniform on-canvas grid */}
              <div className="hidden md:grid grid-cols-4 gap-x-4 gap-y-8 lg:grid-cols-5 xl:grid-cols-6">
                {allLogos.map((logo) => (
                  <LogoTile key={`${logo.type}-${logo.id}`} logo={logo} />
                ))}
              </div>

              {/* Mobile: full-bleed auto-scrolling marquee (pause on touch) */}
              <div
                className="md:hidden relative -mx-5"
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setPaused(false)}
                onTouchCancel={() => setPaused(false)}
              >
                <div className="space-y-2.5">
                  {marqueeRows.map((row, i) => (
                    <div key={i} className="overflow-hidden">
                      <MarqueeRow
                        logos={row}
                        direction={i % 2 === 0 ? "left" : "right"}
                        durationS={44 + i * 8}
                        paused={paused}
                      />
                    </div>
                  ))}
                </div>
                {/* Edge fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent" />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
