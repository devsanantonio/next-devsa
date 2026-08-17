"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Partner } from "@/lib/partners"
import { ArrowLeft, ExternalLink, Globe } from "lucide-react"
import { motion } from "motion/react"

interface PartnerPageClientProps {
  /**
   * Resolved on the server and handed down, rather than looked up here.
   *
   * This used to find the partner in a module-scope array, which is why the
   * page kept rendering one that had been deleted in the admin. The server
   * already reads Firestore to build the metadata, so passing the record costs
   * nothing and removes the second source entirely.
   */
  partner: Partner
}

export function PartnerPageClient({ partner }: PartnerPageClientProps) {
  const router = useRouter()

  // No not-found branch. The server resolves the partner before rendering
  // this and calls notFound() when there isn't one, so a missing partner
  // never reaches the client — and a 404 shell rendered inside a 200 page
  // was the wrong answer anyway.

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
            {/* Partner banner with logo.
                No tinted ground. This carried `bg-[#ef426f]/5`, a pink wash the
                community and event pages have no equivalent of — so the three
                detail pages, which are otherwise the same card on the same
                grey, opened differently depending on which kind of record you
                had landed on. The rose still marks the "Partner" eyebrow and
                the link below, which is enough for it to read as the accent
                without colouring a whole panel. */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100">
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
