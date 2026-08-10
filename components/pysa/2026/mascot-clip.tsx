"use client"

import { useReducedMotion } from "motion/react"
import { PYSA_ASSETS } from "@/data/pysa/2026"

/**
 * The looping mascot clip.
 *
 * Shared by the conference hero and the featured-event band on /events so the
 * two can never drift apart — they are the same footage in the same treatment,
 * and the only difference between placements is the box and mask the caller
 * hands it.
 *
 * Its own client component rather than a piece of either page: the reduced
 * motion check below is the only thing here that needs the client, and the
 * /events band is otherwise server-rendered. Inlining this there would have
 * pushed the whole promo — copy, CTAs, date rail — into the client bundle to
 * animate one decorative video.
 *
 * Purely decorative, so `aria-hidden` and no captions track: the clip is
 * silent and carries no information the copy beside it does not.
 *
 * Loops on the `loop` attribute. It used to seek back to a start offset on
 * every `timeupdate` to hold playback inside the stretch where the mascot is
 * on stage — but `timeupdate` only fires about four times a second, so the
 * loop overshot the end by up to a frame or six, and each seek risked a
 * re-buffer on a phone. The source is trimmed to that window now, so the
 * browser can just loop it.
 *
 * No `preload` hint either: an autoplaying element fetches regardless, and the
 * `metadata` value that was here only delayed the first frame.
 */
export function MascotClip({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  // Respect prefers-reduced-motion: hold the poster still rather than looping.
  // The poster is the two-fingers frame, so nothing is lost by not playing.
  const reduceMotion = useReducedMotion()

  return (
    <video
      aria-hidden
      src={PYSA_ASSETS.mascotVideo}
      poster={PYSA_ASSETS.mascotVideoPoster}
      autoPlay={!reduceMotion}
      loop={!reduceMotion}
      muted
      playsInline
      className={className}
      style={style}
    />
  )
}
