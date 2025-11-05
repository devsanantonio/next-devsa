"use client"

import { motion } from "motion/react"
import Image from "next/image"

export default function ParkingSection() {
  return (
    <section className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 sm:px-8 xl:px-12 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 lg:space-y-10 text-left"
            >
              <h2 className="font-sans text-black leading-[0.85] sm:leading-[0.8] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold uppercase tracking-[-0.015em] sm:tracking-[-0.02em] lg:tracking-[-0.025em]">
                <span className="font-black tracking-[-0.02em] sm:tracking-[-0.025em] lg:tracking-[-0.03em]">Downtown Parking</span>
              </h2>
              
              <div className="max-w-4xl space-y-4 sm:space-y-6">
                <p className="text-gray-700 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl leading-[1.6] sm:leading-[1.5] lg:leading-[1.4] font-normal tracking-[-0.005em] sm:tracking-[-0.01em] text-left">
                  Parking downtown on the weekend is convenient and affordable! City of San Antonio parking garages charge a $10 flat rate.{" "}
                  <strong className="text-black font-semibold">On the day of the event, The St Mary&apos;s Garage will be charging $5</strong>. We recommend the nearest, short-walk options:{" "}
                  <span className="font-medium text-gray-800">City Tower Garage</span>,{" "}
                  <span className="font-medium text-gray-800">St. Mary&apos;s Garage</span>, or the{" "}
                  <span className="font-medium text-gray-800">Houston St. Garage</span>.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="pt-2"
                >
                  <a
                    href="https://sapark.sanantonio.gov/Parking-Locations/Affordable-Parking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base lg:text-lg transition-colors duration-200 tracking-[-0.005em]"
                  >
                    <span className="border-b border-blue-600/40 hover:border-blue-700/60 transition-colors duration-200 pb-0.5">
                      Learn more about city parking options  
                    </span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Image Side - Desktop Only */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md xl:max-w-lg">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/django-cake.png"
                    alt="Django Anniversary Cake"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 400px, (min-width: 1280px) 500px, 0px"
                  />
                  
                  {/* Subtle overlay for better integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 opacity-40" />
                </div>
                
                {/* Optional subtle shadow */}
                <div className="absolute inset-0 bg-black/10 rounded-2xl blur-2xl transform translate-y-4 scale-95 -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}