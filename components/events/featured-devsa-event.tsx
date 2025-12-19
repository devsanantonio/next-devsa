"use client"
import { motion } from "motion/react"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { upcomingDevsaEvent } from "@/data/events"

export function FeaturedDevsaEvent() {
  if (!upcomingDevsaEvent) {
    return (
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Upcoming Events</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us at these upcoming events to connect with the community and DEVSA team.
            </p>
          </div>
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-12">
            <p className="text-sm text-gray-500">
              No upcoming events available at the moment. Check back later for new events!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Upcoming Events</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us at these upcoming events to connect with the community and DEVSA team.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-8 sm:p-10"
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#ef426f]/5 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ef426f]" />
                Upcoming DEVSA TV Event
              </div>
              <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {upcomingDevsaEvent.title}
              </h2>
              <p className="max-w-2xl text-pretty text-base leading-relaxed text-gray-600 sm:text-lg">
                {upcomingDevsaEvent.description}
              </p>
              <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#ef426f]" />
                  <span className="font-medium">
                    {new Date(upcomingDevsaEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#ef426f]" />
                  <span className="font-medium">{upcomingDevsaEvent.location}</span>
                </div>
              </div>
            </div>
            {upcomingDevsaEvent.url && (
              <div className="shrink-0">
                <a
                  href={upcomingDevsaEvent.url}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
