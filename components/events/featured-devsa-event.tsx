"use client"
import { motion } from "motion/react"
import { Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react"
import { upcomingDevsaEvent } from "@/data/events"

export function FeaturedDevsaEvent() {
  if (!upcomingDevsaEvent) {
    return (
      <section className="bg-black border-b border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
              Featured Event
            </h2>
            <p className="mt-4 text-base font-normal leading-7 text-gray-400 sm:text-lg">
              Join us at this upcoming event to connect with the community and DEVSA team.
            </p>
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/50 p-16">
            <div className="text-center">
              <p className="text-base font-medium text-gray-400">
                No upcoming event available at the moment.
              </p>
              <p className="mt-1 text-sm text-gray-500">Check back later for new events!</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black border-b border-gray-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
            Featured Event
          </h2>
          <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-gray-400 sm:text-lg sm:leading-8">
            Join us at this upcoming event to connect with the community and DEVSA team.
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm"
        >
          {/* Gradient accent */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#ef426f]/10 blur-3xl transition-all duration-500 group-hover:bg-[#ef426f]/20" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
          
          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#ef426f]/10 border border-[#ef426f]/20 px-4 py-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-[#ef426f]">
                    DEVSA TV Event
                  </span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#ef426f]" />
                </div>
                
                {/* Title */}
                <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl group-hover:text-[#ef426f] transition-colors duration-300">
                  {upcomingDevsaEvent.title}
                </h3>
                
                {/* Description */}
                <p className="max-w-2xl text-base font-normal leading-7 text-gray-400 sm:text-lg sm:leading-8">
                  {upcomingDevsaEvent.description}
                </p>
                
                {/* Meta info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef426f]/10">
                      <Calendar className="h-5 w-5 text-[#ef426f]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</p>
                      <p className="text-sm font-bold text-white">
                        {new Date(upcomingDevsaEvent.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef426f]/10">
                      <MapPin className="h-5 w-5 text-[#ef426f]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
                      <p className="text-sm font-bold text-white">{upcomingDevsaEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              {upcomingDevsaEvent.url && (
                <div className="shrink-0 lg:self-center">
                  <a
                    href={upcomingDevsaEvent.url}
                    className="group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-bold text-gray-900 shadow-lg transition-all duration-300 hover:bg-[#ef426f] hover:text-white hover:scale-105 hover:shadow-xl hover:shadow-[#ef426f]/20"
                  >
                    Register Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
