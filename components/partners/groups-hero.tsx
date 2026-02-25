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
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Building Together
            </p>
            <h1 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Where Partners and Communities{" "}
              <span className="text-white/50 font-light italic">Come Together to</span>{" "}
              Align.
            </h1>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              Our platform simplifies how local partners and tech communities{" "}
              <strong className="font-semibold text-white">collaborate</strong>,{" "}
              exchange resources, and grow the ecosystem together.
            </p>

            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              We&apos;re the bridge for a reason — connecting{" "}
              <span className="font-medium text-white/70">organizers</span>,{" "}
              <span className="font-medium text-white/70">companies</span>, and{" "}
              <span className="font-medium text-white/70">builders</span>{" "}
              across San Antonio&apos;s tech landscape.
            </p>
          </div>
        </motion.div>

        {/* Logo showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 md:mt-20 w-full"
        >
          <p className="text-sm md:text-base font-medium text-white/30 uppercase tracking-[0.2em] mb-6">
            Partners &amp; Communities
          </p>

          {isLoading ? (
            <div className="flex items-start py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
          ) : (
            <>
              {/* Desktop: horizontal scroll row */}
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

              {/* Mobile: compact list */}
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {allLogos.map((logo) => (
                    <Link key={logo.id} href={`/buildingtogether/${logo.id}`}>
                      <div className="group flex items-center gap-2.5 rounded-lg bg-white/4 border border-white/6 px-3 py-2.5 transition-all duration-200 active:bg-white/8 active:border-white/12">
                        <div className="relative h-7 w-7 shrink-0">
                          <Image
                            src={logo.logo}
                            alt={logo.name}
                            fill
                            className="object-contain opacity-60"
                            sizes="28px"
                          />
                        </div>
                        <span className="text-xs font-medium text-white/50 truncate leading-[1.4]">
                          {logo.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
