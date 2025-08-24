"use client"
import { useState, useEffect, useRef } from "react"

interface TrailImage {
  id: number
  x: number
  y: number
  opacity: number
  scale: number
  rotation: number
  imageIndex: number
}

const TRAIL_IMAGES = [
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_1484.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_2756.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_3339.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4381.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4427.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4603.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4665.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_4964.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_5006.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_5053.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_5063.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/IMG_5086.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay10.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay1.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay12.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay13.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay14.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay2.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay3.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay5.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay6.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay7.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/replay9.jpg",
  "https://devsa-assets.s3.us-east-2.amazonaws.com/techday.jpg",
]

export function CursorTrailImages() {
  const [trails, setTrails] = useState<TrailImage[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const trailIdRef = useRef(0)
  const lastTrailTimeRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const now = Date.now()
      if (now - lastTrailTimeRef.current < 150) return // 150ms delay between trails
      lastTrailTimeRef.current = now

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePosition({ x, y })

      // Create new trail image
      const newTrail: TrailImage = {
        id: trailIdRef.current++,
        x: x - 100, // Center the larger image
        y: y - 75, // Center the larger image
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4, // Random scale between 0.8-1.2
        rotation: Math.random() * 20 - 10, // Random rotation between -10 and 10 degrees
        imageIndex: Math.floor(Math.random() * TRAIL_IMAGES.length),
      }

      setTrails((prev) => [...prev, newTrail])
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return

      const now = Date.now()
      if (now - lastTrailTimeRef.current < 200) return // 200ms delay for mobile
      lastTrailTimeRef.current = now

      const rect = containerRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      setMousePosition({ x, y })

      const newTrail: TrailImage = {
        id: trailIdRef.current++,
        x: x - 80,
        y: y - 60,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * 20 - 10,
        imageIndex: Math.floor(Math.random() * TRAIL_IMAGES.length),
      }

      setTrails((prev) => [...prev, newTrail])
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("touchmove", handleTouchMove)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("touchmove", handleTouchMove)
      }
    }
  }, [])

  // Animate and remove trails
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails((prev) =>
        prev
          .map((trail) => ({
            ...trail,
            opacity: trail.opacity - 0.008, // Much slower fade out
            scale: trail.scale * 0.998, // Very slight shrinking
          }))
          .filter((trail) => trail.opacity > 0),
      )
    }, 32) // Reduced to 30fps for smoother, slower animation

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-white overflow-hidden cursor-none"
      style={{ touchAction: "none" }}
    >
      {/* Central Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-community.svg"
          alt="San Antonio"
          className="w-full h-40 md:h-32"
        />
      </div>

      {/* Trail Images */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="absolute pointer-events-none transition-all duration-200 ease-out"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: `scale(${trail.scale}) rotate(${trail.rotation}deg)`,
          }}
        >
          <img
            src={TRAIL_IMAGES[trail.imageIndex] || "/placeholder.svg"}
            alt=""
            className="w-auto h-auto max-w-[120px] max-h-[90px] md:max-w-[200px] md:max-h-[150px] object-cover rounded-lg shadow-lg"
            draggable={false}
          />
        </div>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <p className="text-gray-600 text-sm md:text-base">
          <span className="hidden md:inline">Move your cursor around to explore San Antonio&apos;s tech scene</span>
          <span className="md:hidden">Touch and drag to explore San Antonio&apos;s tech scene</span>
        </p>
      </div>
    </div>
  )
}
