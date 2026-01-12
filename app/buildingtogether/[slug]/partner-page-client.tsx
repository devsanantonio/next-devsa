"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { partners } from "@/data/partners"
import { ArrowLeft, ExternalLink, Globe } from "lucide-react"
import { motion } from "motion/react"

interface PartnerPageClientProps {
  slug: string
}

export function PartnerPageClient({ slug }: PartnerPageClientProps) {
  const router = useRouter()
  
  const partner = partners.find((p) => p.id === slug)

  if (!partner) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Partner Not Found</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            The partner you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d63760] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section data-bg-type="light">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
          {/* Back button using router.back() */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Partner header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            {/* Partner banner with logo */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 bg-[#ef426f]/5">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl bg-black p-4 shadow-md">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain p-2"
                  sizes="112px"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-sm font-medium text-[#ef426f] tracking-wide uppercase">Partner</span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">{partner.name}</h1>
              </div>
            </div>

            {/* Partner content */}
            <div className="p-6 sm:p-8">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">About</h2>
                <p className="text-base text-slate-600 whitespace-pre-wrap leading-7">{partner.description}</p>
              </div>

              {/* Partner Link */}
              {partner.website && (
                <div className="pt-6 border-t border-slate-100">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#d63760] hover:shadow-lg"
                  >
                    <Globe className="h-5 w-5" />
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
