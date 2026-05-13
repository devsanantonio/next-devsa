"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { partners } from "@/data/partners"
import { Loader2 } from "lucide-react"

interface LogoItem {
  id: string
  name: string
  logo: string
  type: "community" | "partner"
}

export function LogoShowcase() {
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
          const partnerLogos: LogoItem[] = partners.map((p) => ({
            id: p.id,
            name: p.name,
            logo: p.logo,
            type: "partner" as const,
          }))
          setAllLogos([...communities, ...partnerLogos])
        } else {
          fallbackToPartners()
        }
      } catch {
        fallbackToPartners()
      } finally {
        setIsLoading(false)
      }
    }

    const fallbackToPartners = () => {
      setAllLogos(
        partners.map((p) => ({
          id: p.id,
          name: p.name,
          logo: p.logo,
          type: "partner" as const,
        }))
      )
    }

    fetchData()
  }, [])

  return (
    <section className="bg-black border-b border-gray-800" data-bg-type="dark">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-10 md:mb-14"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Partners &amp; Communities
            </p>
            <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Explore the{" "}
              <span className="text-white/50 font-light italic">Ecosystem</span>.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              Every tech group, meetup, and partner organization powering San
              Antonio&apos;s{" "}
              <strong className="font-semibold text-white">tech network</strong>{" "}
              — in one place.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              Tap any logo to see their mission, upcoming events, and how to get
              involved.
            </p>
          </div>
        </motion.div>

        {/* Logo grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-start py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
          ) : (
            <>
              {/* Desktop: wrapped grid */}
              <div className="hidden md:block overflow-hidden">
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                  {allLogos.map((logo) => (
                    <Link key={logo.id} href={`/buildingtogether/${logo.id}`}>
                      <div className="group relative flex items-center gap-3 rounded-xl bg-white/4 border border-white/6 px-4 py-3 transition-all duration-200 hover:bg-white/8 hover:border-white/12">
                        <div className="relative h-8 w-8 shrink-0">
                          <Image
                            src={logo.logo}
                            alt={logo.name}
                            fill
                            className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                            sizes="32px"
                          />
                        </div>
                        <span className="text-sm font-medium text-white/50 group-hover:text-white/90 transition-colors duration-200 whitespace-nowrap">
                          {logo.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile: marquee rows */}
              <div className="md:hidden space-y-3 overflow-hidden">
                {/* Row 1 — scrolls left */}
                <div className="relative">
                  <div className="flex gap-2.5 animate-[marquee-left_80s_linear_infinite] w-max">
                    {[...allLogos, ...allLogos].map((logo, i) => (
                      <Link key={`${logo.id}-r1-${i}`} href={`/buildingtogether/${logo.id}`}>
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/4 border border-white/6 px-3 py-2.5 whitespace-nowrap active:bg-white/10 active:border-white/15 transition-colors">
                          <div className="relative h-7 w-7 shrink-0">
                            <Image
                              src={logo.logo}
                              alt={logo.name}
                              fill
                              className="object-contain opacity-60"
                              sizes="28px"
                            />
                          </div>
                          <span className="text-xs font-medium text-white/50 leading-[1.4]">
                            {logo.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Row 2 — scrolls right */}
                <div className="relative">
                  <div className="flex gap-2.5 animate-[marquee-right_90s_linear_infinite] w-max">
                    {[...allLogos.slice().reverse(), ...allLogos.slice().reverse()].map((logo, i) => (
                      <Link key={`${logo.id}-r2-${i}`} href={`/buildingtogether/${logo.id}`}>
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/4 border border-white/6 px-3 py-2.5 whitespace-nowrap active:bg-white/10 active:border-white/15 transition-colors">
                          <div className="relative h-7 w-7 shrink-0">
                            <Image
                              src={logo.logo}
                              alt={logo.name}
                              fill
                              className="object-contain opacity-60"
                              sizes="28px"
                            />
                          </div>
                          <span className="text-xs font-medium text-white/50 leading-[1.4]">
                            {logo.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Row 3 — scrolls left, offset start */}
                <div className="relative">
                  <div className="flex gap-2.5 animate-[marquee-left_100s_linear_infinite] w-max">
                    {(() => {
                      const mid = Math.ceil(allLogos.length / 2)
                      const shifted = [...allLogos.slice(mid), ...allLogos.slice(0, mid)]
                      return [...shifted, ...shifted].map((logo, i) => (
                        <Link key={`${logo.id}-r3-${i}`} href={`/buildingtogether/${logo.id}`}>
                          <div className="flex items-center gap-2.5 rounded-lg bg-white/4 border border-white/6 px-3 py-2.5 whitespace-nowrap active:bg-white/10 active:border-white/15 transition-colors">
                            <div className="relative h-7 w-7 shrink-0">
                              <Image
                                src={logo.logo}
                                alt={logo.name}
                                fill
                                className="object-contain opacity-60"
                                sizes="28px"
                              />
                            </div>
                            <span className="text-xs font-medium text-white/50 leading-[1.4]">
                              {logo.name}
                            </span>
                          </div>
                        </Link>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
