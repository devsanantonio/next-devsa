"use client"

import { ShaderCanvas } from "@/components/sastw/shader-canvas"
import {
  SASTW_CIRCUIT_SWEEP,
  SASTW_LOGO,
  SASTW_MAGENTA,
} from "@/data/sastw/2026"

/**
 * The lightning bolt with the "current" flowing through it — next-sasw's
 * `BoltShader`, on this site's featured band.
 *
 * The sweep is the week's five circuits, so dragging across the mark runs
 * Founder → Tech & Builders → AI → Small Business → Capital exactly as it does
 * on sasw.co. It rests on magenta and eases back there when the cursor leaves.
 *
 * What is deliberately NOT carried over: on the SASTW homepage the bolt is a
 * link into /bolt-runner, a hidden page on that site. Here it is decoration —
 * a bolt that navigated to another domain's easter egg would be a surprise
 * nobody asked for, and the band already has its two real ways out.
 *
 * Not wrapped in the parent's `pointer-events-none`: the sweep is the whole
 * reason the shader is here rather than the flat SVG, and it needs the cursor.
 */
export function BoltShader({ className }: { className?: string }) {
  return (
    <ShaderCanvas
      color={SASTW_MAGENTA}
      sweep={SASTW_CIRCUIT_SWEEP}
      maskClassName="sastw-bolt-mask"
      fallbackSrc={SASTW_LOGO.bolt}
      className={className}
    />
  )
}
