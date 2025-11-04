"use client"

import { motion } from "motion/react"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

export function GeekdomSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 to-black text-white" data-bg-type="dark">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="space-y-8 md:mb-12">
            {/* Mobile Layout - Stacked */}
            <div className="flex flex-col items-start gap-2 md:hidden">
              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.02em] text-white">
                Thank You
              </h2>
              <div className="w-full flex">
                <Image
                  src="https://devsa-assets.s3.us-east-2.amazonaws.com/geekdom_logo_full.svg"
                  alt="Geekdom Logo"
                  width={240}
                  height={72}
                  className="brightness-0 invert max-w-full h-auto"
                />
              </div>
            </div>
            
            {/* Desktop Layout - Inline */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <h2 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-[-0.02em] text-white">
                Thank You
              </h2>
              <Image
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/geekdom_logo_full.svg"
                alt="Geekdom Logo"
                width={300}
                height={90}
                className="brightness-0 invert"
              />
            </div>
          </div>
          
          <div className="space-y-6 mb-12 max-w-3xl">
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-200 leading-[1.4] md:leading-[1.3] font-light">
              When we first started <strong className="font-semibold">DEVSA</strong>, we never planned to have a physical community space. Thanks to <strong className="text-white font-semibold">Geekdom</strong> we have one right in the heart of downtown San Antonio that&apos;s available to our growing tech community. 
            </p>
          </div>
          
          <div className="flex justify-center md:justify-start">
            <a
              href="https://geekdom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Learn More About Geekdom
              <ExternalLink className="size-4 md:size-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
