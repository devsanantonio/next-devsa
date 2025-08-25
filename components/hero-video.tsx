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
      {/* Mobile Portrait Video - xs to sm screens */}
      <video
        className="absolute inset-0 w-full h-full object-cover block sm:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="https://devsa-assets.s3.us-east-2.amazonaws.com/token-poster.jpg"
        aria-label="DEVSA community video - mobile version"
      >
        <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/token-vertical.mp4" type="video/mp4" />
      </video>

      {/* Tablet and Small Laptop Video - sm to lg screens */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover hidden sm:block lg:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="https://devsa-assets.s3.us-east-2.amazonaws.com/token-poster.jpg"
        aria-label="DEVSA community video - tablet version"
      >
        <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/token-horizontal.mp4" type="video/mp4" />
      </video>

      {/* Desktop and Large Screen Video - lg and above */}
      <video
        className="absolute inset-0 w-full h-full object-cover hidden lg:block"
        autoPlay
        muted
        loop
        playsInline
        poster="https://devsa-assets.s3.us-east-2.amazonaws.com/token-poster.jpg"
        aria-label="DEVSA community video - desktop version"
      >
        <source src="https://devsa-assets.s3.us-east-2.amazonaws.com/token-horizontal.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 container-responsive text-center">
        <div className="max-w-4xl mx-auto">{/* Content can be added here with proper responsive classes */}</div>
      </div>
    </div>
  )
}
