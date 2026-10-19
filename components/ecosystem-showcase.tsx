"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { logoOnLight, logoSrcOnLight } from "@/lib/logo-invert"
import Image from "next/image"
import Link from "next/link"
import { MobileLogoTile } from "@/components/partners/mobile-logo-tile"
import { CommunityNetwork } from "@/components/community-network"
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
 *
 * The 96px cap binds only on marks wider than 2:1; everything squarer is
 * bounded by the 48px height and does not notice it. Past about 6:1 it stops
 * being a cap and starts being a starvation: the mark is already limited by
 * width, and holding it 72px short of the room its own tile has buys nothing.
 * Those ids are listed below and get the whole tile.
 *
 * This is a list again, which the paragraph above was pleased to be rid of —
 * but not the same kind. The old one guessed which marks were wordmarks by
 * measuring files that turned out to be mostly padding, so it was wrong from
 * the day it was written. An entry here records an intrinsic ratio taken from
 * the artwork itself, which only changes if the partner redraws their logo.
 */
const EXTREME_WORDMARK_IDS = [
  // viewBox 178.83 x 17.75 — 10.1:1, nearly twice as wide as UTSA, the next
  // widest thing on either wall.
  "learnopentech",
]

function isExtremeWordmark(logo: LogoItem) {
  return EXTREME_WORDMARK_IDS.includes(logo.id)
}

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


/* Desktop — a logo-forward tile, on the canvas (no card). Hover draws a
   brand-pink underline under the name and darkens it. */
function LogoTile({ logo }: { logo: LogoItem }) {
  return (
    <Link href={`/buildingtogether/${logo.id}`} className="group/logo block h-full">
      {/* Fixed-height logo slot and `justify-start`, so names share a baseline
          across the grid — see the matching note in logo-showcase.tsx. Width is
          whatever the tile has, so each mark is bounded on the axis it needs. */}
      <div className="flex h-full flex-col items-center justify-start gap-3 p-4 text-center">
        <div
          className={`relative flex h-12 w-full shrink-0 items-center justify-center ${
            isExtremeWordmark(logo) ? "" : "max-w-24"
          }`}
        >
          <Image
            src={logoSrcOnLight(logo, logo.logo)}
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

/**
 * The partners this section names, in this order.
 *
 * It showed the first six partners in display order, a sample. Now it names
 * the partnerships DEVSA most wants seen: PyTexas (PySanAntonio), BSides,
 * Geekdom (where the events happen), learnOPENtech, Texas Linux Fest, Tech
 * Bloc, Youth Code Jam and The Creative Futures.
 *
 * Ids rather than records, and still read from /api/partners: a partner
 * deleted in the admin drops out of this row on the next load, and the full
 * list stays on Building Together.
 */
const SPOTLIGHT_PARTNER_IDS = [
  "pytexas",
  "bsides",
  "geekdom",
  "learnopentech",
  "txlf",
  "tech-bloc",
  "youth-code-jam",
  "the-creative-futures",
]

export function EcosystemShowcase() {
  const [communities, setCommunities] = useState<LogoItem[]>([])
  const [partnerLogos, setPartnerLogos] = useState<LogoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const spotlightPartners = useMemo(
    () =>
      SPOTLIGHT_PARTNER_IDS.map((id) => partnerLogos.find((p) => p.id === id)).filter(
        (p): p is LogoItem => !!p
      ),
    [partnerLogos]
  )

  return (
    <section
      id="ecosystem-showcase"
      className="w-full bg-white py-12 md:py-20 relative overflow-x-clip"
      data-bg-type="light"
    >

      <div className="relative z-10 page-shell">
        <div className="lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12 xl:gap-16">
          {/* Text rail — leads on mobile/tablet; sticky left column on desktop */}
          <motion.div
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 md:mb-14 lg:mb-0 lg:order-1 lg:sticky lg:top-28 lg:self-start space-y-8"
          >
            <div className="space-y-4">
              {/* gray-500: gray-400 measured 2.5:1 on white, under the 4.5:1
                  floor for text this size; gray-500 is 4.8:1. */}
              <p className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-[0.2em]">
                Who&apos;s Building Here
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
                  tech scene
                </strong>
                .
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                Every community group on the calendar, connected, and the
                partners DEVSA builds with. Tap any one for its mission and
                upcoming events, or see them all on Building Together.
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
            initial={{ y: 20 }}
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
                {/* Every group, connected through DEVSA — the same drawing as
                    the LinkedIn banner and the posters. It replaced a sample
                    grid of twelve community logos; now all of them show, as
                    one network, each linking to its page. Dark panel because
                    the network is drawn for a black ground. */}
                <div className="rounded-2xl bg-[#0a0a0a] p-3 sm:p-5" data-bg-type="dark">
                  <CommunityNetwork communities={communities} className="w-full" />
                </div>

                {spotlightPartners.length > 0 && (
                  <div className="mt-10">
                    {/* gray-500 like the eyebrow above: 4.8:1 on white. */}
                    <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                      Partners DEVSA builds with
                    </p>
                    {/* Tablet & desktop: the section's logo tiles, four across */}
                    <div className="mt-6 hidden md:grid grid-cols-4 gap-x-4 gap-y-8">
                      {spotlightPartners.map((logo) => (
                        <LogoTile key={logo.id} logo={logo} />
                      ))}
                    </div>
                    {/* Mobile: the Building Together tiles, four across, two rows */}
                    <div className="mt-5 grid grid-cols-4 gap-2 md:hidden">
                      {spotlightPartners.map((logo) => (
                        <MobileLogoTile key={logo.id} logo={logo} />
                      ))}
                    </div>
                  </div>
                )}

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
