"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"

const sponsors = [
  {
    name: "Geekdom",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-geekdom.png",
    website: "https://geekdom.com/",
    description: "Providing the venue and infrastructure for our conference"
  },
  {
    name: "HEB",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-23-heb.png",
    website: "https://www.heb.com/",
    description: "Supporting the local community and events"
  },
  {
    name: "PyTexas Foundation",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-pytexas.png",
    website: "https://www.pytexas.org/",
    description: "Supporting the Python community across Texas"
  },
 
]

const communityPartners = [
  {
    name: "Alamo Python",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-alamo.png",
    website: "https://www.meetup.com/alamo-python/",
    description: "San Antonio's premier Python meetup group"
  },
    {
    name: "DEVSA",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-26-devsa.png",
    website: "https://devsa.community/",
    description: "Activating San Antonio's tech community"
  }
]

export default function SponsorsSection() {
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
            Sponsors
          </h2>
          <p className="text-gray-600 text-base md:text-lg lg:text-xl leading-relaxed max-w-md text-balance">
            We&apos;re incredibly grateful to our sponsors for making <strong>PySanAntonio</strong> possible! Huge thanks to <strong>Geekdom</strong> for allowing us to take over the 3rd floor, to <strong>HEB</strong> for sponsoring us through their Community Support program, and to the <strong>PyTexas Foundation</strong> for generously providing a ticket to <strong>PyTexas 2026</strong> for us to raffle off during the event.
          </p>
        </motion.header>

        {/* Main Sponsors - Grid of 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 lg:gap-6"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-all duration-300 aspect-square"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Community Partners - Grid of 2 */}
        {communityPartners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 lg:mt-12"
          >
            <h3 className="font-sans text-black text-lg md:text-xl lg:text-2xl font-semibold mb-6 lg:mb-8 uppercase tracking-tight">
              Community Partners
            </h3>
            <div className="grid grid-cols-2 gap-4 lg:gap-6 max-w-2xl">
              {communityPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-4 lg:p-6 transition-all duration-300  aspect-square"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}