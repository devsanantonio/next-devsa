"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Users, Wifi, Coffee, Calendar } from "lucide-react"

export default function CoworkingSpacePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full bg-black text-white py-20 md:py-32">
        <div className="container mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-4 py-2 bg-white/10 rounded-full mb-6">
              <span className="text-white text-sm font-medium">Community Space</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">DevSA Community Space</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
              Your home base for building, learning, and connecting with San Antonio&apos;s tech community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wifi,
                title: "High-Speed Internet",
                description: "Blazing fast fiber internet to keep you productive and connected.",
              },
              {
                icon: Coffee,
                title: "Refreshments",
                description: "Complimentary coffee, tea, and snacks to fuel your creativity.",
              },
              {
                icon: Users,
                title: "Community Events",
                description: "Regular meetups, workshops, and networking opportunities.",
              },
              {
                icon: MapPin,
                title: "Prime Location",
                description: "Centrally located in downtown San Antonio with easy access.",
              },
              {
                icon: Clock,
                title: "Flexible Hours",
                description: "24/7 access for members to work on your schedule.",
              },
              {
                icon: Calendar,
                title: "Event Spaces",
                description: "Book meeting rooms and event spaces for your gatherings.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors"
              >
                <feature.icon className="size-10 text-black mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Join?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Become part of San Antonio&apos;s growing tech community. Contact us to learn more about membership options.
            </p>
            <a
              href="mailto:hello@devsa.community"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
