"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { allSpeakers } from "@/data/pysa/speakers"

const XIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="w-4 h-4">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M0.5 0.5H5.75L9.48421 5.71053L14 0.5H16L10.3895 6.97368L16.5 15.5H11.25L7.51579 10.2895L3 15.5H1L6.61053 9.02632L0.5 0.5ZM12.0204 14L3.42043 2H4.97957L13.5796 14H12.0204Z" 
      fill="currentColor"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="w-4 h-4">
    <path 
      id="Subtract" 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M2 0C0.895431 0 0 0.895431 0 2V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0H2ZM5 6.75V13H3V6.75H5ZM5 4.50008C5 5.05554 4.61409 5.5 3.99408 5.5H3.98249C3.38582 5.5 3 5.05554 3 4.50008C3 3.93213 3.39765 3.5 4.00584 3.5C4.61409 3.5 4.98845 3.93213 5 4.50008ZM8.5 13H6.5C6.5 13 6.53178 7.43224 6.50007 6.75H8.5V7.78371C8.5 7.78371 9 6.75 10.5 6.75C12 6.75 13 7.59782 13 9.83107V13H11V10.1103C11 10.1103 11 8.46616 9.7361 8.46616C8.4722 8.46616 8.5 9.93972 8.5 9.93972V13Z" 
      fill="currentColor"
    />
  </svg>
)

export default function SpeakersSection() {
  return (
    <section className="w-full" data-bg-type="light">
      <div className="flex flex-col gap-10 p-6 md:p-16 lg:p-20 min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] container mx-auto max-md:pb-6">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <p className="font-sans text-black leading-none text-2xl lg:text-4xl xl:text-6xl font-semibold uppercase">
            Speakers
          </p>
        </motion.header>

        {/* Speakers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:gap-x-8 lg:gap-y-10 grid grid-cols-2 lg:grid-cols-4 max-lg:bg-gray-300 max-lg:gap-0.5 max-lg:border-2 max-lg:border-gray-300"
        >
          {allSpeakers.map((speaker, index) => (
            <motion.div
              key={speaker.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-1 lg:flex lg:flex-col lg:gap-4 group h-full bg-white lg:bg-zinc-100"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-zinc-900 lg:bg-zinc-800 aspect-[4/5]">
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  fill
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90 transition-all duration-300"
                />
                
                {/* Social Links Overlay */}
                {speaker.social && (
                  <div className="absolute bottom-0 left-0 lg:p-2 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:has-[:focus]:opacity-100">
                    <div className="absolute -left-4 -bottom-4 top-0 right-0 opacity-50 blur-lg bg-white"></div>
                    <nav className="flex md:gap-2 relative z-10">
                      {speaker.social.linkedin && (
                        <a
                          href={speaker.social.linkedin}
                          rel="noopener"
                          target="_blank"
                          className="relative overflow-hidden uppercase font-mono font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-offset-4 focus-visible:outline-2 bg-transparent text-black hover:bg-gray-200 active:bg-gray-100 text-[15px] gap-3 h-auto rounded-md p-2.5"
                        >
                          <LinkedInIcon />
                        </a>
                      )}
                    </nav>
                  </div>
                )}
              </div>

              {/* Speaker Info */}
              <header className="max-lg:p-1 lg:flex lg:flex-col lg:gap-1">
                <p className="font-mono tracking-normal text-black text-base leading-normal lg:text-xl lg:leading-normal uppercase font-semibold">
                  {speaker.name}
                </p>
                <p className="font-mono font-normal tracking-normal text-gray-600 text-sm leading-normal lg:text-base lg:leading-normal uppercase">
                  {speaker.title}, {" "}
                  <a 
                    href={speaker.companyUrl} 
                    rel="noopener" 
                    target="_blank" 
                    className="font-mono whitespace-nowrap tracking-wider uppercase no-underline hover:text-black transition-colors"
                  >
                    <span>{speaker.company}</span>
                  </a>
                </p>
              </header>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}