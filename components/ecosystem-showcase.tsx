"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { logoOnLight } from "@/lib/logo-invert"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ArrowUpRight } from "lucide-react"

type LogoType = "community" | "partner"

interface LogoItem {
  id: string
  name: string
  logo: string
  type: LogoType
}



/**
 * The logo slot is 48x96px, so a mark is bounded by height and a wordmark by
 * width — each gets the axis it needs.
 *
 * Those two numbers are a taste call, arrived at by rendering the real wall at
 * 100/90/82/75% of the tile's content box. Full-bleed read heavy once the logo
 * files were cropped; below about 80% UTSA's tagline stops resolving, since it
 * is 5.8:1 and bounded by width. 96x48 is a shade over 80% on both axes.
 *
 * This replaced a hand-kept WIDE_LOGO_IDS list that handed nine ids a 128px
 * slot and everything else a 56px square. Two things were wrong with it. 128px
 * is wider than a tile's content box at the lg two-column breakpoint (~115px),
 * so the widest wordmarks overflowed their own padding. And the list was drawn
 * up by measuring the ink bounds of the logo *files*, so a wordmark that
 * shipped inside a square canvas of transparent padding measured as a square
 * and got the square slot: 434 MEDIA, Geeks && {...}, DEF CON, AWS, SAHA and
 * Greater Gaming Society were all sorted wrong that way, and only showed it
 * once those files were re-cropped to their ink.
 *
 * Going full-width costs the widest marks about 10% of their former width at
 * lg and nothing at any other breakpoint. What it buys is that there is no
 * longer a list to keep in step with the artwork — re-crop a logo, or add one,
 * and it sizes itself.
 */

interface ApiLogo {
  id: string
  name: string
  logo: string
}

function asLogos(items: ApiLogo[], type: LogoItem["type"]): LogoItem[] {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    logo: i.logo,
    type,
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
  return (
    <Link href={`/buildingtogether/${logo.id}`} className="group/logo block h-full">
      {/* Fixed-height logo slot and `justify-start`, so names share a baseline
          across the grid — see the matching note in logo-showcase.tsx. Width is
          whatever the tile has, so each mark is bounded on the axis it needs. */}
      <div className="flex h-full flex-col items-center justify-start gap-3 p-4 text-center">
        <div className="relative flex h-12 w-full max-w-24 shrink-0 items-center justify-center">
          <Image
            src={logo.logo}
            alt={logo.name}
            fill
            unoptimized
            sizes="96px"
            className={`object-contain ${logoOnLight(logo)}`}
          />
        </div>
        <span className="flex min-h-[2.5rem] items-start justify-center text-sm font-medium leading-tight text-gray-600 transition-colors duration-200 group-hover/logo:text-gray-900">
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
  const [partnerLogos, setPartnerLogos] = useState<LogoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paused, setPaused] = useState(false)

  // Partners come from Firestore now, the same as communities. They used to be
  // a module-scope import from data/partners.ts, which is why a partner deleted
  // in the admin kept appearing here. Both are fetched together so one wall
  // cannot be fresh while the other is months stale.
  useEffect(() => {
    const fetchData = async () => {
      const [communityRes, partnerRes] = await Promise.allSettled([
        fetch("/api/communities"),
        fetch("/api/partners"),
      ])
      if (communityRes.status === "fulfilled" && communityRes.value.ok) {
        const data = await communityRes.value.json()
        setCommunities(asLogos(data.communities || [], "community"))
      }
      if (partnerRes.status === "fulfilled" && partnerRes.value.ok) {
        const data = await partnerRes.value.json()
        setPartnerLogos(asLogos(data.partners || [], "partner"))
      }
      setIsLoading(false)
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

      <div className="relative z-10 page-shell">
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

            <div className="space-y-4 max-w-5xl">
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
