"use client"

import { useState, useEffect } from "react"
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
const LARGER_PARTNER_IDS = ["geekdom", "learn2ai", "utsa", "project-quest"]

function shouldInvert(logo: LogoItem) {
  if (logo.type === "partner") return INVERT_PARTNER_IDS.includes(logo.id)
  return INVERT_COMMUNITY_NAMES.some((n) =>
    logo.name.toLowerCase().includes(n)
  )
}

function isLarger(logo: LogoItem) {
  return logo.type === "partner" && LARGER_PARTNER_IDS.includes(logo.id)
}

function partnersAsLogos(): LogoItem[] {
  return partners.map((p) => ({
    id: p.id,
    name: p.name,
    logo: p.logo,
    type: "partner" as const,
  }))
}

export function EcosystemShowcase() {
  const [allLogos, setAllLogos] = useState<LogoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
          setAllLogos([...communities, ...partnersAsLogos()])
        } else {
          setAllLogos(partnersAsLogos())
        }
      } catch {
        setAllLogos(partnersAsLogos())
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section
      id="ecosystem-showcase"
      className="w-full bg-white py-12 md:py-20 relative overflow-hidden"
      data-bg-type="light"
    >
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
                Partners &amp; Communities
              </p>
              <h2 className="font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
                The Organizations{" "}
                <span className="text-gray-600 font-light italic">
                  Behind the
                </span>{" "}
                Movement.
              </h2>
            </div>

            <div className="space-y-6 max-w-3xl">
              <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
                From grassroots meetups to enterprise partners — these are the
                groups shaping San Antonio&apos;s{" "}
                <strong className="font-semibold text-gray-900">
                  tech ecosystem
                </strong>
                .
              </p>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                Tap any logo to learn more about their mission and upcoming
                events.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
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
                {/* Desktop: wrapped grid */}
                <div className="hidden md:block">
                  <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                    {allLogos.map((logo, index) => {
                      const invert = shouldInvert(logo)
                      const larger = isLarger(logo)
                      return (
                        <motion.div
                          key={`${logo.type}-${logo.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                        >
                          <Link href={`/buildingtogether/${logo.id}`}>
                            <div className="group relative flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200">
                              <div
                                className={`relative shrink-0 ${larger ? "h-10 w-10" : "h-8 w-8"}`}
                              >
                                <Image
                                  src={logo.logo}
                                  alt={logo.name}
                                  fill
                                  unoptimized
                                  className={`object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200${invert ? " invert" : ""}`}
                                  sizes={larger ? "40px" : "32px"}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
                                {logo.name}
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: compact 2-column grid */}
                <div className="md:hidden">
                  <div className="grid grid-cols-2 gap-2">
                    {allLogos.map((logo, index) => {
                      const invert = shouldInvert(logo)
                      const larger = isLarger(logo)
                      return (
                        <motion.div
                          key={`${logo.type}-${logo.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.015 }}
                        >
                          <Link href={`/buildingtogether/${logo.id}`}>
                            <div className="group flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 transition-all duration-200 active:bg-gray-100 active:border-gray-200">
                              <div
                                className={`relative shrink-0 ${larger ? "h-9 w-9" : "h-7 w-7"}`}
                              >
                                <Image
                                  src={logo.logo}
                                  alt={logo.name}
                                  fill
                                  unoptimized
                                  className={`object-contain opacity-50${invert ? " invert" : ""}`}
                                  sizes={larger ? "36px" : "28px"}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-400 truncate leading-[1.4]">
                                {logo.name}
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
