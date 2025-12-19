"use client"

import { motion } from "motion/react"

export function EventsHero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Events
          </h1>
          <p className="max-w-xl text-balance text-lg font-medium leading-relaxed text-gray-600 md:text-xl">
            Connect and learn with the DEVSA team and community.
          </p>
          
          {/* Progress bar indicator - styled like Vercel */}
          <div className="mt-4 flex w-full max-w-md items-center justify-center gap-0">
            <div className="h-2 flex-1 rounded-l-full bg-gray-200" />
            <div className="h-2 flex-1 bg-gray-200" />
            <div className="h-2 flex-1 bg-[#ef426f]" />
            <div className="h-2 flex-1 rounded-r-full bg-[#166534]" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
