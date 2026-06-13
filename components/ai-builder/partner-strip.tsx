"use client"

import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const PARTNERS = [
  {
    name: "DEVSA",
    role: "Community",
    logo: "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg",
    href: "https://www.devsa.community/",
  },
  {
    name: "Alamo Angels",
    role: "Investor Network",
    logo: "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/digitalcanvas%2Fangels-horizontal.png?alt=media",
    href: "https://alamoangels.com/",
  },
  {
    name: "434 Media",
    role: "Operator",
    logo: "https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/434media-light.svg",
    href: "https://434media.com/",
  },
]

/** The three partners the AI Builder Program connects. Dark-surface styling. */
export function PartnerStrip({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {PARTNERS.map((p, i) => (
        <motion.a
          key={p.name}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="group flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/25 hover:bg-white/10"
        >
          <div className="flex h-8 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.logo}
              alt={p.name}
              className="max-h-8 w-auto max-w-36 object-contain object-left"
            />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#88FF00" }}
              >
                {p.role}
              </p>
              <p className="mt-1 text-sm font-medium text-white">{p.name}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-white/70" />
          </div>
        </motion.a>
      ))}
    </div>
  )
}
