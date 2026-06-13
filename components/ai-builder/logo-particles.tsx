"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type LogoConfig = { src: string; aspect: number; scale?: number }

/** Digital Canvas logo, served same-origin so the canvas samples it without CORS taint. */
export const DIGITAL_CANVAS_LOGOS: LogoConfig[] = [
  { src: "/partners/digital-canvas.svg", aspect: 394.95 / 165.31 },
]

type ParticleRole = "normal" | "wanderer" | "scout"
interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  isTopRow: boolean
  life: number
  role: ParticleRole
  phase: number
}

/**
 * The Digital Canvas interactive particle hero, sized to its container (so it
 * works full-screen or inside a column). Top row is static but reacts to the
 * cursor; the bottom row is a living swarm — wanderers orbit, scouts sense the
 * cursor from farther out, and everything scatters in #88FF00 on interaction.
 */
export function LogoParticles({
  logos = DIGITAL_CANVAS_LOGOS,
  interactionColor = "#88FF00",
  className,
}: {
  logos?: LogoConfig[]
  interactionColor?: string
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const [isSmall, setIsSmall] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let disposed = false
    let particles: Particle[] = []
    let textImageData: ImageData | null = null
    let animationFrameId = 0
    let small = false

    const imgs = logos.map((l) => {
      const img = new Image()
      img.src = l.src
      return img
    })

    function resize() {
      const r = wrap!.getBoundingClientRect()
      canvas!.width = Math.max(1, Math.floor(r.width))
      canvas!.height = Math.max(1, Math.floor(r.height))
      small = canvas!.width < 700
      setIsSmall(small)
    }

    function drawLogos() {
      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)
      ctx!.fillStyle = "white"
      const padX = w * 0.08
      const availW = w - padX * 2
      const baseH = small ? Math.min(h * 0.6, 240) : Math.min(h * 0.42, 300)
      const gap = baseH * 0.5
      const items = logos.map((l, i) => {
        const lh = baseH * (l.scale ?? 1)
        return { img: imgs[i], h: lh, w: lh * l.aspect }
      })
      const totalW =
        items.reduce((s, it) => s + it.w, 0) + gap * (items.length - 1)
      const fit = Math.min(1, availW / totalW)
      let x = (w - totalW * fit) / 2
      const cy = h / 2
      for (const it of items) {
        const iw = it.w * fit
        const ih = it.h * fit
        try {
          ctx!.drawImage(it.img, x, cy - ih / 2, iw, ih)
        } catch {
          // ignore draws for not-yet-decoded images
        }
        x += iw + gap * fit
      }
      textImageData = ctx!.getImageData(0, 0, w, h)
      ctx!.clearRect(0, 0, w, h)
    }

    function createParticle(): Particle | null {
      if (!textImageData) return null
      const data = textImageData.data
      const w = canvas!.width
      const h = canvas!.height
      const midY = h / 2
      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * w)
        const y = Math.floor(Math.random() * h)
        if (data[(y * w + x) * 4 + 3] > 128) {
          const r = Math.random()
          const role: ParticleRole =
            r < 0.07 ? "wanderer" : r < 0.12 ? "scout" : "normal"
          return {
            x,
            y,
            baseX: x,
            baseY: y,
            size: Math.random() * (small ? 1 : 1.5) + (small ? 0.5 : 1),
            isTopRow: y < midY,
            life: Math.random() * 100 + 50,
            role,
            phase: Math.random() * Math.PI * 2,
          }
        }
      }
      return null
    }

    function targetCount() {
      const base = 12000
      return Math.floor(
        base * Math.sqrt((canvas!.width * canvas!.height) / (1920 * 1080))
      )
    }

    function seed() {
      particles = []
      const n = targetCount()
      for (let i = 0; i < n; i++) {
        const p = createParticle()
        if (p) particles.push(p)
      }
    }

    function animate() {
      if (disposed) return
      const w = canvas!.width
      const h = canvas!.height
      ctx!.fillStyle = "#050505"
      ctx!.fillRect(0, 0, w, h)
      const { x: mx, y: my } = mouseRef.current
      const baseDist = small ? 150 : 240
      const time = (performance.now() * 0.001) % 1000

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.hypot(dx, dy)

        if (p.isTopRow) {
          // Static at rest, but reacts to the cursor, then snaps back.
          if (dist < baseDist) {
            const force = (baseDist - dist) / baseDist
            const angle = Math.atan2(dy, dx)
            p.x = p.baseX - Math.cos(angle) * force * 60
            p.y = p.baseY - Math.sin(angle) * force * 60
          } else {
            p.x = p.baseX
            p.y = p.baseY
          }
          ctx!.fillStyle = "#ffffff"
        } else {
          // Alive: drift, wanderers orbit, scouts sense the cursor from afar.
          const detect = p.role === "scout" ? baseDist * 1.6 : baseDist
          if (dist < detect) {
            const force = (detect - dist) / detect
            const angle = Math.atan2(dy, dx)
            p.x = p.baseX - Math.cos(angle) * force * 60
            p.y = p.baseY - Math.sin(angle) * force * 60
            ctx!.fillStyle = interactionColor
          } else {
            let tx = p.baseX
            let ty = p.baseY
            if (p.role === "wanderer") {
              tx += Math.cos(time * 0.25 + p.phase) * 14
              ty += Math.sin(time * 0.25 + p.phase * 1.3) * 10
            } else {
              const amp = p.role === "scout" ? 4 : 2.5
              tx += Math.sin(time * 0.4 + p.phase) * amp
              ty += Math.cos(time * 0.28 + p.phase * 1.5) * amp * 0.8
            }
            p.x += (tx - p.x) * 0.08
            p.y += (ty - p.y) * 0.08
            ctx!.fillStyle = "#ffffff"
          }
        }

        ctx!.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const np = createParticle()
          if (np) particles[i] = np
          else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const tc = targetCount()
      while (particles.length < tc) {
        const np = createParticle()
        if (np) particles.push(np)
        else break
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    let loaded = 0
    let started = false
    function start() {
      if (started) return
      started = true
      resize()
      drawLogos()
      seed()
      animate()
    }
    function onOneLoaded() {
      loaded++
      if (loaded >= imgs.length) start()
    }
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth) onOneLoaded()
      else {
        img.onload = onOneLoaded
        img.onerror = onOneLoaded
      }
    })

    const ro = new ResizeObserver(() => {
      if (!started) return
      resize()
      drawLogos()
      seed()
    })
    ro.observe(wrap)

    function toLocal(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect()
      mouseRef.current = { x: clientX - r.left, y: clientY - r.top }
    }
    const onMouseMove = (e: MouseEvent) => toLocal(e.clientX, e.clientY)
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) toLocal(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)
    canvas.addEventListener("touchmove", onTouchMove, { passive: true })
    canvas.addEventListener("touchend", onTouchEnd)

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrameId)
      ro.disconnect()
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
    }
  }, [logos, interactionColor])

  return (
    <div
      ref={wrapRef}
      className={cn("relative overflow-hidden bg-[#050505]", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-label="Interactive particle effect displaying the Digital Canvas logo"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-5 select-none px-6 text-center">
        <p className="font-mono text-[10px] text-neutral-500 md:text-xs">
          {isSmall ? "Tap and drag" : "Move your cursor"} to interact
        </p>
      </div>
    </div>
  )
}
