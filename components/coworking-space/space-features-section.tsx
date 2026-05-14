"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

interface SpaceFeature {
  id: string
  category: string
  title: string
  description: string
  link: string
  linkText: string
  image?: string
}

interface SpaceFeaturesSectionProps {
  features: SpaceFeature[]
}

function FeatureCard({ feature }: { feature: SpaceFeature }) {
  return (
    <a
      href={feature.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full rounded-2xl bg-gray-50 border border-gray-100 p-6 md:p-8 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200"
    >
      <div className="flex flex-col h-full space-y-5 md:space-y-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          {feature.category}
        </p>
        <h3 className="text-balance font-sans text-gray-900 leading-[1.05] text-2xl md:text-3xl lg:text-[2.25rem] font-black tracking-[-0.02em]">
          {feature.title}
        </h3>
        <p className="flex-1 text-base text-gray-600 leading-relaxed">
          {feature.description}
        </p>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 pt-2">
          {feature.linkText}
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  )
}

export function SpaceFeaturesSection({ features }: SpaceFeaturesSectionProps) {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white" data-bg-type="light">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 mb-12 md:mb-16"
        >
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium text-gray-500 uppercase tracking-[0.2em]">
              Getting Here
            </p>
            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              Before Your First{" "}
              <span className="text-gray-600 font-light italic">Visit</span>.
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 leading-[1.4] font-light max-w-2xl">
            Two of the most common questions about coming to the space —
            answered below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
