"use client"

import { motion } from "motion/react"
import Image from "next/image"

const boardMembers = [
  {
    name: "Jesse Hernandez",
    role: "Founder & Executive Director",
    image:
      "https://devsa-assets.s3.us-east-2.amazonaws.com/coworking-space/admin-jesse.jpeg",
    linkedin: "https://www.linkedin.com/in/jessebubble/",
  },
  {
    name: "Zaquariah Holland",
    role: "Community Director ",
    image:
      "https://devsa-assets.s3.us-east-2.amazonaws.com/admin-holland.png",
    linkedin: "https://www.linkedin.com/in/zaquariah-holland/",
  },
  {
    name: "Ileana Gonzalez",
    role: "Board Member",
    image:
      "https://devsa-assets.s3.us-east-2.amazonaws.com/ileana.webp",
    linkedin: "https://www.linkedin.com/in/ileanagonzxlez/",
  },
]

export function MeetTheTeam() {
  return (
    <section className="bg-black border-b border-gray-800" data-bg-type="dark">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28">
        {/* Intro text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-14 md:mb-20"
        >
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Meet the Team
            </p>
            <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              A 501(c)(3) Nonprofit{" "}
              <span className="text-white/50 font-light italic">
                Built on
              </span>{" "}
              Education.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              DEVSA is a registered{" "}
              <strong className="font-semibold text-white">
                501(c)(3) nonprofit
              </strong>{" "}
              dedicated to growing San Antonio&apos;s tech community through
              education workshops, events, and resources.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              Our board of directors sets the vision and ensures every program
              serves the developers, learners, and organizers who make this
              ecosystem thrive.
            </p>
          </div>
        </motion.div>

        {/* Board members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
          {boardMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-3/4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-white/50 font-medium mt-1">
                    {member.role}
                  </p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-white/40 hover:text-white transition-colors mt-2"
                    >
                      LinkedIn &rarr;
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
