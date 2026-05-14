"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { LinkedInIcon, InstagramIcon } from "@/components/icons/social-icons"

interface Admin {
  name: string
  role: string
  image: string
  linkedin?: string
  instagram?: string
}

interface AdminsSectionProps {
  admins: Admin[]
}

export function AdminsSection({ admins }: AdminsSectionProps) {
  return (
    <section className="bg-black border-b border-gray-800" data-bg-type="dark">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-14 md:mb-20"
        >
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              The Space Admin Team
            </p>
            <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Meet the{" "}
              <span className="text-white/50 font-light italic">Volunteers</span>{" "}
              Behind the Space.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              The DEVSA coworking space is run entirely by{" "}
              <strong className="font-semibold text-white">volunteers</strong>{" "}
              from across San Antonio&apos;s tech communities.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              These are the organizers who keep the space open, stocked, and
              welcoming for anyone who shows up to build.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 lg:gap-8">
          {admins.map((admin, index) => (
            <motion.div
              key={admin.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-3/4">
                <Image
                  src={admin.image || "/placeholder.svg"}
                  alt={admin.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                    {admin.name}
                  </h3>
                  <p className="text-xs md:text-sm text-white/55 font-medium mt-0.5">
                    {admin.role}
                  </p>
                  {(admin.linkedin || admin.instagram) && (
                    <div className="flex items-center gap-3 mt-2.5">
                      {admin.linkedin && (
                        <a
                          href={admin.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-white transition-colors"
                          aria-label={`${admin.name} on LinkedIn`}
                        >
                          <LinkedInIcon className="size-4" />
                        </a>
                      )}
                      {admin.instagram && (
                        <a
                          href={admin.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-white transition-colors"
                          aria-label={`${admin.name} on Instagram`}
                        >
                          <InstagramIcon className="size-4" />
                        </a>
                      )}
                    </div>
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
