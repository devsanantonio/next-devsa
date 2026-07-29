"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { PYSA_ASSETS } from "@/data/pysa/2026"

/**
 * The mascot as a recurring "sticker" — the cut-out peeking in from an edge,
 * revealing once as it scrolls into view.
 *
 * On phones this replaces the hero figure entirely: shrunk to fit a 390px
 * column the standing mascot turns to mud, and as a 40%-opacity backdrop it
 * only made the headline harder to read. Broken into stickers it recurs down
 * the page instead of being one washed-out background.
 *
 * On desktop it fills the dead space the two-column layout leaves behind.
 *
 * Visibility is the caller's call — pass `sm:hidden` or `hidden lg:block` in
 * className — because the same sticker plays different roles per breakpoint.
 * Decorative only: aria-hidden, never in the tab order.
 */
export function MascotSticker({
  className,
  /** Resting rotation, in degrees. Sold as a sticker slapped on the page. */
  rotate = 0,
  /** Mirror horizontally so the figure can face into the page from either side. */
  flip = false,
  /** Slide-in direction — should point away from the edge it peeks from. */
  from = "right",
  opacity = 1,
  /**
   * `bust` for tight spots (phones, short bands); `full` only where there is
   * real vertical room, since the standing figure is nearly 1:2.
   */
  variant = "bust",
}: {
  className?: string
  rotate?: number
  flip?: boolean
  from?: "left" | "right" | "bottom"
  opacity?: number
  variant?: "full" | "bust"
}) {
  const art =
    variant === "full"
      ? {
          src: PYSA_ASSETS.mascotSticker,
          width: PYSA_ASSETS.mascotStickerWidth,
          height: PYSA_ASSETS.mascotStickerHeight,
        }
      : {
          src: PYSA_ASSETS.mascotBust,
          width: PYSA_ASSETS.mascotBustWidth,
          height: PYSA_ASSETS.mascotBustHeight,
        }

  const offset =
    from === "left" ? { x: -28, y: 0 } : from === "right" ? { x: 28, y: 0 } : { x: 0, y: 32 }

  return (
    <motion.div
      aria-hidden
      // Only the transform animates. Fading in from opacity:0 leaves the
      // sticker permanently invisible if the intersection callback never runs,
      // which is a silent failure for decoration — so opacity is a static
      // style and the reveal is a slide into place.
      style={{ opacity }}
      initial={{ rotate: rotate * 0.4, ...offset }}
      whileInView={{ rotate, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn("pointer-events-none absolute select-none", className)}
    >
      <Image
        src={art.src}
        alt=""
        width={art.width}
        height={art.height}
        sizes="(max-width: 640px) 50vw, 25vw"
        className={cn("h-auto w-full", flip && "-scale-x-100")}
      />
    </motion.div>
  )
}
