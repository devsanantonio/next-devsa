"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

export default function AfterPartySection() {
  return (
    <section className="w-full" data-bg-type="light">
      <div className="flex flex-col gap-10 p-6 md:p-16 lg:p-20 container mx-auto">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <h2 className="font-sans text-black leading-none text-2xl lg:text-4xl xl:text-6xl font-semibold uppercase">
            Afterparty
          </h2>
        </motion.header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 lg:space-y-8"
          >
            <div className="prose max-w-none">
              <p className="text-gray-600 text-base md:text-lg lg:text-xl leading-relaxed mb-6">
                We have two great afterparty options available:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3">Pub Mixer</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Hosted by the Datanauts (San Antonio Data Analytics and AI team) at The Double Standard. 
                    The patio is reserved for PySanAntonio from 5:00–7:00 PM, with a Raspberry Pi and swag giveaway.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3">Documentary Screening</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Stick around on the 3rd floor at Geekdom for a 90-minute Python documentary from the Cult-Repo team, 
                    chronicling Python's rise from an Amsterdam side project to a global programming powerhouse.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-4"
            >
              <Link
                href="https://www.meetup.com/datanauts/events/311684382/"
                className="group inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold text-white bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 rounded-xl hover:from-sky-700 hover:via-sky-800 hover:to-blue-800 transition-all duration-300 shadow-xl border border-sky-400/30 drop-shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="mr-3">RSVP for Afterparty</span>
                <svg 
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden">
              <Image
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-11-after.PNG"
                alt="Python San Antonio Afterparty"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}