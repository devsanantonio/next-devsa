"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { logoOnLight } from "@/lib/logo-invert"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"

type LogoType = "community" | "partner"

interface LogoItem {
  id: string
  name: string
  logo: string
  type: LogoType
}



/**
 * Wide wordmark logos, which need horizontal room rather than a bigger square.
 *
 * UTSA is the clearest case: its artwork is 290x50, so 5.8:1. Fitted into a
 * square box it is limited by width and draws about 11px tall — technically
 * present, practically unreadable. Widening the slot is what makes it legible;
 * enlarging a square box does almost nothing for a mark this shape.
 *
 * Partners and communities share one list and there is no type check, because
 * the two share the /buildingtogether/<id> namespace and so cannot collide.
 * A wide community logo works the moment its id is added here.
 *
 * The community entries are few on purpose. Every community logo was measured
 * by its ink bounds, ignoring the transparent padding in the file: AITX
 * (3.69:1) and .NET (2.68:1) are wordmarks, and the rest run 0.80 to 1.90,
 * which is a mark rather than a wordmark and reads correctly in the square
 * slot.
 *
 * Still an id list, and still a guess — but a guess about aspect ratio, which
 * does not change when someone swaps a white mark for a black one. A stale
 * entry here makes a logo the wrong size, not invisible.
 */
const WIDE_LOGO_IDS = [
  // partners
  "tech-bloc",
  "geekdom",
  "youth-code-jam",
  "utsa",
  "learn2ai",
  "project-quest",
  "the-creative-futures",
  // communities
  "aitx",
  "dotnet-user-group",
]

function isWideLogo(logo: LogoItem) {
  return WIDE_LOGO_IDS.includes(logo.id)
}

function splitIntoRows<T>(items: T[], rows: number): T[][] {
  const out: T[][] = Array.from({ length: rows }, () => [])
  items.forEach((item, i) => out[i % rows].push(item))
  return out
}

/* Desktop — a logo-forward tile, on the canvas (no card). */
function LogoTile({ logo }: { logo: LogoItem }) {
  const wide = isWideLogo(logo)
  return (
    <Link href={`/buildingtogether/${logo.id}`} className="group/logo block h-full">
      {/* `justify-start`, not `justify-center`.
      
          Every tile now opens with a logo slot of the same height, so the names
          underneath share a baseline across the whole grid. Centring the column
          was what broke that: a taller logo box pushed its name down, and a name
          that wrapped to two lines pulled its logo up, so no two columns lined
          up unless their contents happened to match.
          
          The slot is a fixed height for everyone and only its WIDTH varies —
          which is the axis a wide wordmark actually needs. */}
      <div className="flex h-full flex-col items-center justify-start gap-3 p-4 text-center">
        <div
          className={`relative flex h-14 shrink-0 items-center justify-center ${
            wide ? "w-32" : "w-14"
          }`}
        >
          <Image
            src={logo.logo}
            alt={logo.name}
            fill
            unoptimized
            sizes={wide ? "128px" : "56px"}
            className={`object-contain ${logoOnLight(logo)}`}
          />
        </div>
        {/* min-h reserves two lines. Without it a one-line name leaves the row
            short and the next grid row creeps up, which reads as ragged even
            though each tile is internally correct. */}
        <span className="flex min-h-[2.5rem] items-start justify-center text-sm font-medium leading-tight text-gray-600 transition-colors duration-200 group-hover/logo:text-gray-900">
          {logo.name}
        </span>
      </div>
    </Link>
  )
}

/* Mobile — a compact chip used inside the scrolling marquee */
function MarqueeChip({ logo }: { logo: LogoItem }) {
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
            className={`object-contain ${logoOnLight(logo)}`}
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
      // Both walls read Firestore. Partners used to be a module-scope import
      // from data/partners.ts while communities were fetched, so in this one
      // component a deleted community vanished and a deleted partner did not.
      const asLogos = (
        items: Array<{ id: string; name: string; logo: string }>,
        type: LogoItem["type"]
      ): LogoItem[] =>
        items.map((i) => ({
          id: i.id,
          name: i.name,
          logo: i.logo,
          type,
        }))

      let partnerLogos: LogoItem[] = []
      try {
        const partnerRes = await fetch("/api/partners")
        if (partnerRes.ok) {
          const data = await partnerRes.json()
          partnerLogos = asLogos(data.partners || [], "partner")
        }
      } catch {
        // Leave partners empty — an empty wall is honest about the outage.
      }

      try {
        const res = await fetch("/api/communities")
        if (res.ok) {
          const data = await res.json()
          const communities: LogoItem[] = asLogos(data.communities || [], "community")
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

      <div className="page-shell py-16 sm:py-20 md:py-24">
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
