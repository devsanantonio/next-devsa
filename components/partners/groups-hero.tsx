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

export function GroupsHero() {
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
      const partnerLogos: LogoItem[] = partners.map((p) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        type: "partner" as const,
      }))
      setAllLogos(partnerLogos)
    }

    fetchData()
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-black border-b border-gray-800 min-h-dvh flex flex-col items-center justify-center"
      data-bg-type="dark"
    >
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-gray-900/50 via-black to-black" />

      {/* Main content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <div className="h-1 w-8 rounded-full bg-[#ef426f]" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#ef426f]">
              Building Together
            </span>
            <div className="h-1 w-8 rounded-full bg-[#ef426f]" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black tracking-tighter text-white leading-[0.95] mb-5 sm:mb-6">
            Partners +{" "}
            <span className="text-[#ef426f]">Communities</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-medium leading-[1.7] text-white/70 max-w-3xl mx-auto">
            Our platform is bridging the gap between passionate builders,
            local partners, and the growing tech ecosystem in San Antonio.
          </p>
        </motion.div>

        {/* Logo showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 w-full max-w-6xl mx-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : (
            <>
              {/* Desktop: flowing grid */}
              <div className="hidden md:block">
                <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-5 xl:gap-6">
                  {allLogos.map((logo) => (
                    <Link key={logo.id} href={`/buildingtogether/${logo.id}`}>
                      <motion.div
                        className="group relative"
                        whileHover={{ scale: 1.15, zIndex: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <div className="relative h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 2xl:h-28 2xl:w-28 rounded-2xl bg-gray-900/80 p-2 lg:p-2.5 xl:p-3 border border-gray-800 backdrop-blur-sm transition-all duration-300 group-hover:border-[#ef426f] group-hover:bg-gray-800/90 group-hover:shadow-lg group-hover:shadow-[#ef426f]/20">
                          <Image
                            src={logo.logo}
                            alt={logo.name}
                            fill
                            className="object-contain p-2 lg:p-2.5 xl:p-3 grayscale group-hover:grayscale-0 transition-all duration-300"
                            sizes="(min-width: 1536px) 112px, (min-width: 1280px) 96px, (min-width: 1024px) 80px, 64px"
                          />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-900 shadow-lg">
                            {logo.name}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile: grid layout */}
              <div className="md:hidden">
                <p className="text-center text-[11px] font-black tracking-widest text-white/40 uppercase mb-5">
                  Tap to learn more
                </p>
                <div className="grid grid-cols-4 gap-3 px-2">
                  {allLogos.map((logo) => (
                    <Link key={logo.id} href={`/buildingtogether/${logo.id}`}>
                      <div className="group relative aspect-square rounded-xl bg-gray-900/80 p-2 border border-gray-800 transition-all duration-200 active:scale-95 active:border-[#ef426f]">
                        <Image
                          src={logo.logo}
                          alt={logo.name}
                          fill
                          className="object-contain p-2.5"
                          sizes="80px"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Bridge metaphor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 sm:mt-12 lg:mt-16 flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 max-w-24 bg-linear-to-r from-transparent to-gray-600" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white/40">
            We&apos;re the bridge
          </span>
          <div className="h-px flex-1 max-w-24 bg-linear-to-l from-transparent to-gray-600" />
        </motion.div>
      </div>
    </section>
  )
}
