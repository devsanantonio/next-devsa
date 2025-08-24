"use client"
import { useEffect, useRef } from "react"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Desktop Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        autoPlay
        muted
        loop
        playsInline
        poster="https://devsa-assets.s3.us-east-2.amazonaws.com/token-poster.jpg"
      >
        <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/token-horizontal.mp4" type="video/mp4" />
      </video>

      {/* Mobile Video */}
      <video className="absolute inset-0 w-full h-full object-cover block md:hidden" autoPlay muted loop playsInline poster="https://devsa-assets.s3.us-east-2.amazonaws.com/token-poster.jpg">
        <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/token-vertical.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
