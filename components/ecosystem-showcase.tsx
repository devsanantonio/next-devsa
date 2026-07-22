"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { partners } from "@/data/partners"
import { Loader2, ArrowUpRight } from "lucide-react"

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

function shouldInvert(logo: LogoItem) {
  if (logo.type === "partner") return INVERT_PARTNER_IDS.includes(logo.id)
  return INVERT_COMMUNITY_NAMES.some((n) => logo.name.toLowerCase().includes(n))
}

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

function isLargeLogo(logo: LogoItem) {
  return logo.type === "partner" && LARGE_PARTNER_IDS.includes(logo.id)
}

function partnersAsLogos(): LogoItem[] {
  return partners.map((p) => ({
    id: p.id,
    name: p.name,
    logo: p.logo,
    type: "partner" as const,
  }))
}

function splitIntoRows<T>(items: T[], rows: number): T[][] {
  const out: T[][] = Array.from({ length: rows }, () => [])
  items.forEach((item, i) => out[i % rows].push(item))
  return out
}

/* Desktop — a logo-forward tile, on the canvas (no card). Hover draws a
   brand-pink underline under the name and darkens it. */
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

/* Desktop — a uniform grid of logo tiles */
function LogoGroup({ logos }: { logos: LogoItem[] }) {
  if (logos.length === 0) return null
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4">
      {logos.map((logo) => (
        <LogoTile key={`${logo.type}-${logo.id}`} logo={logo} />
      ))}
    </div>
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
        animation: `eco-marquee-${direction} ${durationS}s linear infinite`,
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {doubled.map((logo, i) => (
        <MarqueeChip key={`${logo.id}-${i}`} logo={logo} />
      ))}
    </div>
  )
}

export function EcosystemShowcase() {
  const [communities, setCommunities] = useState<LogoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const partnerLogos = useMemo(() => partnersAsLogos(), [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/communities")
        if (res.ok) {
          const data = await res.json()
          const list: LogoItem[] = (data.communities || []).map(
            (c: { id: string; name: string; logo: string }) => ({
              id: c.id,
              name: c.name,
              logo: c.logo,
              type: "community" as const,
            })
          )
          setCommunities(list)
        }
      } catch {
        // fall back to partners only
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const allLogos = useMemo(
    () => [...communities, ...partnerLogos],
    [communities, partnerLogos]
  )
  const marqueeRows = useMemo(() => splitIntoRows(allLogos, 3), [allLogos])

  return (
    <section
      id="ecosystem-showcase"
      className="w-full bg-white py-12 md:py-20 relative overflow-x-clip"
      data-bg-type="light"
    >
      <style>{`
        @keyframes eco-marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes eco-marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12 xl:gap-16">
          {/* Text rail — leads on mobile/tablet; sticky left column on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 md:mb-14 lg:mb-0 lg:order-1 lg:sticky lg:top-28 lg:self-start space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-[0.2em]">
                Partners &amp; Communities
              </p>
              <h2 className="text-balance font-sans text-gray-900 leading-none text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.03em]">
                The Orgs{" "}
                <span className="text-gray-500 font-light italic tracking-[-0.01em]">
                  Behind the
                </span>{" "}
                Movement.
              </h2>
            </div>

            <div className="space-y-4 max-w-lg">
              <p className="text-pretty text-xl xl:text-2xl text-gray-600 leading-[1.45] font-light">
                From grassroots meetups to enterprise partners — these are the
                groups shaping San Antonio&apos;s{" "}
                <strong className="font-semibold text-gray-900">
                  tech ecosystem
                </strong>
                .
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                Tap any logo to learn more about their mission and upcoming
                events.
              </p>
            </div>

            {/* Link to the full directory — desktop only; on mobile/tablet it
                moves below the logos to close out the section */}
            <div className="hidden lg:block pt-1">
              <Link
                href="/buildingtogether"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
              >
                Building Together
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>

          {/* Logos — bottom on mobile/tablet; right column on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:order-2"
          >
            {isLoading ? (
              <div className="flex items-start py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : (
              <>
                {/* Tablet & desktop: uniform grids (communities, then partners) */}
                <div className="hidden md:block space-y-8">
                  <LogoGroup logos={communities} />
                  <LogoGroup logos={partnerLogos} />
                </div>

                {/* Mobile: full-bleed auto-scrolling marquee (pause on touch so links stay tappable) */}
                <div
                  className="md:hidden relative -mx-4"
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

                {/* Mobile/tablet: button closes out the section below the logos */}
                <div className="lg:hidden mt-10">
                  <Link
                    href="/buildingtogether"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-gray-900 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
                  >
                    Building Together
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
