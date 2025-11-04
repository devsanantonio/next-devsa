"use client"

import { motion } from "motion/react"

export default function ParkingSection() {
  return (
    <section className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 sm:px-8 xl:px-12 py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 lg:space-y-10"
          >
            <h2 className="font-sans text-black leading-[0.85] text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-semibold uppercase tracking-[-0.01em] sm:tracking-[-0.02em]">
              <span className="font-black tracking-[-0.02em] sm:tracking-[-0.03em]">Downtown Parking</span>
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-600 text-lg sm:text-xl lg:text-2xl xl:text-3xl leading-[1.5] sm:leading-[1.4] font-normal text-balance tracking-[-0.01em]">
                Parking downtown on the weekend is convenient and affordable! City of San Antonio parking garages charge a{" "}
                <strong className="text-black font-semibold">$5 flat rate on weekends</strong>. We recommend the nearest, short-walk options:{" "}
                <span className="font-medium text-gray-800">City Tower Garage</span>,{" "}
                <span className="font-medium text-gray-800">St. Mary's Garage</span>, or the{" "}
                <span className="font-medium text-gray-800">Houston St. Garage</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}