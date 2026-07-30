"use client"

import { useRef } from "react"
import Image from "next/image"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import { PYSA_ASSETS } from "@/data/pysa/2026"

/** Full-scale figure height, and therefore the height the section reserves. */
const STAGE = "h-96" // 384px; the w-44 figure stands 378px tall

/**
 * Mobile-only interlude between the hero and the call for speakers.
 *
 * The mascot is the whole point of this stretch of scroll, so he gets his own
 * band rather than being tucked into a hero corner — which also kept the hero's
 * countdown line above the fold on small phones.
 *
 * He grows as the section travels up the viewport, anchored at his boots so he
 * rises off the floor rather than inflating from his middle. The section keeps
 * a fixed height so the growth never reflows the page.
 *
 * Purely decorative: aria-hidden, empty alt, no tab stop. Honours
 * prefers-reduced-motion by simply standing at full size.
 */
export function MascotInterlude() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when the section's top reaches the bottom of the viewport, 1 once its
    // centre reaches the centre — so he is full size by the time he is the
    // thing you are looking at.
    offset: ["start end", "center center"],
  })

  // Spring it so the growth trails the scroll slightly instead of tracking it
  // pixel-for-pixel, which reads mechanical.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  const scale = useTransform(progress, [0, 1], [0.58, 1])
  const opacity = useTransform(progress, [0, 0.35], [0.35, 1])

  return (
    <section
      ref={ref}
      aria-hidden
      data-bg-type="dark"
      className={`relative flex ${STAGE} items-end justify-center overflow-hidden bg-[#0a0a0a] sm:hidden`}
    >
      <motion.div
        className="w-44"
        style={
          reduceMotion
            ? undefined
            : { scale, opacity, transformOrigin: "bottom center" }
        }
      >
        <Image
          src={PYSA_ASSETS.mascotSticker}
          alt=""
          width={PYSA_ASSETS.mascotStickerWidth}
          height={PYSA_ASSETS.mascotStickerHeight}
          sizes="50vw"
          className="h-auto w-full"
        />
      </motion.div>

      {/* Floor line — grounds the boots and hands off to the section below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0a0a0a] to-transparent"
      />
    </section>
  )
}
