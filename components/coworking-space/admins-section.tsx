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
    <section className="py-16 md:py-24 lg:py-32 relative bg-gray-50">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.04'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <div className="space-y-6 max-w-7xl">
            <p className="text-sm md:text-base font-semibold text-gray-500 uppercase tracking-[0.2em]">
              Our Leadership Team
            </p>
            <h2 className="max-w-3xl font-sans text-gray-900 leading-[0.9] text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Meet the Community Space{" "}
              <span className="text-gray-600 font-light italic">Admin Team</span>
            </h2>
            <div className="space-y-4 max-w-3xl">
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-light leading-[1.3]">
                The dedicated individuals behind our thriving coworking community.
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
                Bringing vision to life in the heart of downtown San Antonio, these volunteers ensure our space remains welcoming, functional, and inspiring for every member of our tech community.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 max-lg:p-0.5">
          {admins.map((admin, index) => (
            <motion.div
              key={admin.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden aspect-[3/4] lg:aspect-[4/5]">
                <Image 
                  src={admin.image || "/placeholder.svg"} 
                  alt={admin.name} 
                  fill 
                  className="w-full h-full object-cover grayscale contrast-110 brightness-105 saturate-75 group-hover:contrast-100 group-hover:brightness-100 group-hover:saturate-100 transition-all duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-80 group-hover:opacity-40 transition-opacity duration-300" />
                
                {/* Social Links Overlay */}
                <div className="absolute bottom-3 left-3 right-3 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex justify-center">
                    {admin.linkedin && (
                      <a
                        href={admin.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center size-8 lg:size-10 text-white hover:text-gray-100 transition-colors rounded-lg hover:bg-white/50"
                        aria-label={`${admin.name} on LinkedIn`}
                      >
                        <LinkedInIcon className="size-4 lg:size-5" />
                      </a>
                    )}
                    {admin.instagram && (
                      <a
                        href={admin.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center size-8 lg:size-10 text-white hover:text-gray-100 transition-colors rounded-lg hover:bg-white/50"
                        aria-label={`${admin.name} on Instagram`}
                      >
                        <InstagramIcon className="size-4 lg:size-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-3 md:p-4 lg:p-5 space-y-2">
                <h3 className="font-black text-sm md:text-base lg:text-lg xl:text-xl text-gray-900 leading-tight tracking-[-0.01em] uppercase">
                  {admin.name}
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium leading-relaxed">
                  {admin.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
