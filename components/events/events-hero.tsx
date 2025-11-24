"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const carouselImages = [
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa7.jpg", alt: "Tech conference" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa4.jpg", alt: "Hackathon" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa2.jpg", alt: "Networking" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa.jpg", alt: "Workshop" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa3.jpg", alt: "Panel discussion" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa5.jpg", alt: "Community event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/pysa6.jpg", alt: "Tech meetup" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_6350.jpg", alt: "DEVSA TV Event" },
  { src: "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/IMG_5061.jpg", alt: "DEVSA TV Event" },
]

const infiniteImages = [...carouselImages, ...carouselImages, ...carouselImages]

export function EventsHero() {
  const [currentIndex, setCurrentIndex] = useState(carouselImages.length)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef<boolean>(false)

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const centerPosition = (container.scrollWidth - container.clientWidth) / 2
      container.scrollLeft = centerPosition
    }
  }, [])

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - 1
      if (newIndex < 0) {
        return infiniteImages.length - 1
      }
      return newIndex
    })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + 1
      if (newIndex >= infiniteImages.length) {
        return 0
      }
      return newIndex
    })
  }

  const handleScroll = () => {
    if (!scrollRef.current || isScrollingRef.current) return

    const container = scrollRef.current
    const containerCenter = container.scrollLeft + container.clientWidth / 2

    // Find which image is closest to viewport center
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    const images = container.children
    for (let i = 0; i < images.length; i++) {
      const img = images[i] as HTMLElement
      const imgCenter = img.offsetLeft + img.offsetWidth / 2
      const distance = Math.abs(containerCenter - imgCenter)

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    }

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex)
    }
  }

  const handleImageClick = (index: number) => {
    if (scrollRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true
      const img = scrollRef.current.children[index] as HTMLElement
      const container = scrollRef.current
      const scrollPosition = img.offsetLeft - (container.clientWidth - img.offsetWidth) / 2

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })

      setCurrentIndex(index)
      setTimeout(() => {
        isScrollingRef.current = false
      }, 600)
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_55%),radial-gradient(top,_rgba(16,185,129,0.06),_transparent_55%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pt-20 pb-0 text-center md:pt-20">
        <div className="grid w-full max-w-xs grid-cols-3 gap-3 pb-2 text-xs font-semibold text-neutral-500 sm:max-w-sm">
          <div className="h-6 rounded-l-md bg-[#00b2a9]" />
          <div className="h-6 bg-[#ef426f]" />
          <div className="h-6 rounded-r-md bg-[#ff8200]" />
        </div>
        <h1 className="text-balance text-6xl font-bold uppercase tracking-wide text-neutral-950 md:text-7xl">Events</h1>
        <p className="mb-8 max-w-sm text-balance text-xl font-medium leading-relaxed tracking-tight text-neutral-600 md:text-2xl">
          Experience upcoming community events aimed to connect you with active learners, builders, and local partners.
        </p>

        <div className="relative w-full -mx-6 pb-16 md:mx-0">
          {/* Desktop Coverflow */}
          <div className="hidden md:block relative h-[400px] overflow-hidden -mt-10">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center h-full overflow-x-scroll scrollbar-hide"
              style={{
                perspective: "2000px",
                perspectiveOrigin: "center center",
                paddingLeft: "50%",
                paddingRight: "50%",
              }}
            >
              {infiniteImages.map((image, index) => {
                const offset = index - currentIndex
                const absOffset = Math.abs(offset)
                const isCenter = offset === 0

                return (
                  <motion.div
                    key={`${index}-${image.src}`}
                    className="relative shrink-0 cursor-pointer"
                    style={{
                      width: "500px",
                      height: "320px",
                      marginLeft: index === 0 ? "0" : "-180px",
                      zIndex: isCenter ? 50 : 30 - absOffset * 5,
                    }}
                    animate={{
                      scale: isCenter ? 1 : 0.75 - absOffset * 0.05,
                      rotateY: offset * -45,
                      z: isCenter ? 0 : -absOffset * 100,
                      opacity: absOffset > 2 ? 0.2 : isCenter ? 1 : 0.6 - absOffset * 0.1,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    onClick={() => handleImageClick(index)}
                  >
                    <div
                      className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        priority={absOffset <= 2}
                      />
                      {!isCenter && (
                        <div
                          className="absolute inset-0 bg-black/30 transition-opacity duration-600"
                          style={{ opacity: absOffset * 0.15 }}
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative h-64 px-4 -mt-8">
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex % carouselImages.length}
                  className="relative w-full max-w-sm h-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                    <Image
                      src={carouselImages[currentIndex % carouselImages.length].src || "/placeholder.svg"}
                      alt={carouselImages[currentIndex % carouselImages.length].alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={handlePrevious}
                className="absolute -left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/95 shadow-lg hover:bg-white hover:scale-105 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-900" />
              </button>
              <button
                onClick={handleNext}
                className="absolute -right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-white/95 shadow-lg hover:bg-white hover:scale-105 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-neutral-900" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(carouselImages.length + index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex % carouselImages.length === index
                      ? "w-8 bg-neutral-900"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
