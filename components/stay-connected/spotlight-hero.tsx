"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { QRCode } from "@/components/qr-code"
import { GlowingEffect } from "@/components/glowing-effect"
import { StartupWeekIntro } from "@/components/startup-week/intro"
import { LogoParticles } from "@/components/ai-builder/logo-particles"
import { WhoServesCards } from "@/components/stay-connected/who-serves-cards"
import { CommunityGrid } from "@/components/stay-connected/community-grid"
import { SPOTLIGHTS, stayConnectedUrl } from "@/data/stay-connected"

const ROTATE_MS = 6500

/**
 * Motion-driven "slide deck" hero that auto-advances through the spotlight
 * announcements. Mirrors the /startup-week-2026 hero layout — co-branded
 * content on the left, a take-it-with-you QR on the right where that page has
 * its form. Built to run unattended on the booth monitor, but tappable too.
 */
export function SpotlightHero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const item = SPOTLIGHTS[index]
  // Some slides (AI Builder particles, event flyers) run on a black background.
  const dark = !!item.dark

  const go = useCallback(
    (next: number) => setIndex((next + SPOTLIGHTS.length) % SPOTLIGHTS.length),
    []
  )

  useEffect(() => {
    if (paused) return
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const id = setInterval(() => setIndex((i) => (i + 1) % SPOTLIGHTS.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section
      id="stay-connected-hero"
      data-bg-type={dark ? "dark" : "light"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "relative w-full transition-colors duration-500 lg:h-dvh lg:overflow-hidden",
        dark ? "bg-[#050505]" : "bg-white"
      )}
    >
      <div
        className={cn(
          "mx-auto grid min-h-dvh max-w-7xl grid-cols-1 lg:h-dvh lg:pt-14",
          // The events slide gets a wider left so the two posters can grow.
          item.events ? "lg:grid-cols-[2.5fr_1fr]" : "lg:grid-cols-[1.7fr_1fr]"
        )}
      >
        {/* LEFT — rotating announcement + progress */}
        <div className="flex flex-col px-6 py-12 sm:px-10 lg:h-full lg:overflow-y-auto lg:px-14 lg:py-10">
          <div className="flex flex-1 flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "space-y-6 xl:space-y-8",
                  dark ? "max-w-2xl xl:max-w-3xl" : "max-w-xl xl:max-w-2xl"
                )}
              >
                {item.key === "startup-week" ? (
                  <StartupWeekIntro size="lg" showTracks={false} />
                ) : item.key === "ai-builder" ? (
                  <>
                    <LogoParticles className="h-72 w-full sm:h-80 xl:h-104 2xl:h-120" />
                    <p className="text-balance text-center text-base leading-relaxed text-white/70 md:text-lg xl:max-w-2xl xl:text-xl">
                      {item.blurb}
                    </p>
                  </>
                ) : item.events ? (
                  <>
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-[0.2em] xl:text-sm",
                        dark ? "text-white/50" : "text-neutral-400"
                      )}
                    >
                      {item.eyebrow}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {item.events.map((e) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={e.name}
                          src={e.image.src}
                          alt={e.image.alt}
                          className={cn(
                            "max-h-[72dvh] w-full rounded-xl object-contain ring-1",
                            dark ? "ring-white/10" : "ring-black/10"
                          )}
                        />
                      ))}
                    </div>
                  </>
                ) : item.video ? (
                  <>
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-[0.2em] xl:text-sm",
                        dark ? "text-white/50" : "text-neutral-400"
                      )}
                    >
                      {item.eyebrow}
                    </p>
                    <video
                      src={item.video.src}
                      poster={item.video.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="max-h-[60dvh] w-full max-w-2xl rounded-2xl object-contain xl:max-w-3xl"
                    />
                  </>
                ) : item.image ? (
                  <>
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-[0.2em] xl:text-sm",
                        dark ? "text-white/50" : "text-neutral-400"
                      )}
                    >
                      {item.eyebrow}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image.src}
                      alt={item.image.alt}
                      className={cn(
                        "max-h-[60dvh] w-auto max-w-full rounded-2xl object-contain ring-1",
                        dark ? "ring-white/10" : "ring-black/10"
                      )}
                    />
                  </>
                ) : (
                  <>
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-[0.2em] xl:text-sm",
                        dark ? "text-white/55" : "text-neutral-400"
                      )}
                    >
                      {item.eyebrow}
                    </p>
                    <h1
                      className={cn(
                        "text-balance font-sans text-4xl font-black leading-[1.05] tracking-[-0.02em] md:text-5xl xl:text-6xl 2xl:text-7xl",
                        dark ? "text-white" : "text-neutral-900"
                      )}
                    >
                      {item.title}
                    </h1>
                    {item.blurb && (
                      <p
                        className={cn(
                          "max-w-md text-balance text-base leading-relaxed md:text-lg xl:max-w-lg xl:text-xl",
                          dark ? "text-white/65" : "text-neutral-600"
                        )}
                      >
                        {item.blurb}
                      </p>
                    )}
                    {item.images && (
                      <div
                        className={cn(
                          "grid gap-3",
                          item.images.length >= 4 ? "grid-cols-4" : "grid-cols-3"
                        )}
                      >
                        {item.images.map((img) => (
                          <figure key={img.src}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.src}
                              alt={img.caption ?? ""}
                              className={cn(
                                "aspect-4/3 w-full rounded-xl object-cover ring-1",
                                dark ? "ring-white/10" : "ring-black/10"
                              )}
                            />
                            {img.caption && (
                              <figcaption
                                className={cn(
                                  "mt-1.5 text-[11px] font-medium",
                                  dark ? "text-white/55" : "text-neutral-500"
                                )}
                              >
                                {img.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}
                    {item.key === "who-serves" && <WhoServesCards />}
                    {item.key === "calendar" && <CommunityGrid />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div
            className="mt-10 flex items-center gap-3"
            role="tablist"
            aria-label="Announcements"
          >
            {SPOTLIGHTS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.title}
                onClick={() => go(i)}
                className={cn(
                  "group relative h-1.5 flex-1 overflow-hidden rounded-full transition-colors",
                  dark ? "bg-white/15 hover:bg-white/25" : "bg-neutral-200 hover:bg-neutral-300"
                )}
              >
                {i === index && (
                  <motion.span
                    layoutId="spotlight-progress"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: s.accent }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — QR (desktop only; this is what sits on the table at the event) */}
        <div
          className={cn(
            "hidden items-center justify-center px-6 py-12 transition-colors duration-500 sm:px-10 lg:flex lg:h-full lg:border-l lg:px-14 lg:py-10",
            dark ? "lg:border-white/10" : "bg-neutral-50/60 lg:border-neutral-200"
          )}
        >
          <div className="relative rounded-2xl">
            <GlowingEffect
              disabled={false}
              variant="devsa"
              proximity={120}
              spread={50}
              borderWidth={2}
              inactiveZone={0.5}
            />
            <QRCode
              value={stayConnectedUrl("monitor")}
              label="Scan to stay connected"
              size={208}
              className="relative shadow-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
