"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const communityGroups = [
  { id: "alamo-python", name: "Alamo Python" },
  { id: "acm-sa", name: "ACM SA" },
  { id: "defcongroup-sa", name: "DEFCON Group" },
  { id: "greater-gaming-society", name: "Greater Gaming Society" },
  { id: "atc", name: "Alamo Tech Collective" },
  { id: "gdg", name: "Google Developer Groups" },
  { id: "geeks-and-drinks", name: "Geeks && {...}" },
  { id: "dotnet-user-group", name: ".NET User Group" },
  { id: "datanauts", name: "Datanauts" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800/50 overflow-hidden">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-36">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          {/* Left Side - Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/4 shrink-0"
          >
            <Link href="/" className="inline-block mb-6">
              <img
                src="https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
                alt="DEVSA"
                className="w-14 h-14"
              />
            </Link>
            <p className="text-neutral-400 text-[13px] font-normal leading-normal">
              © {currentYear} DEVSA. All rights reserved.
            </p>
            <p className="text-neutral-400 text-[13px] font-normal mt-2 leading-normal">
              Part of the{" "}
              <Link
                href="https://www.digitalcanvas.community/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ef426f] hover:text-[#fbbf24] transition-colors"
              >
                Digital Canvas
              </Link>
              {" "}Network
            </p>
          </motion.div>

          {/* Right Side - Link Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {/* Pages */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Site Navigation</h3>
              <ul className="space-y-3.5">
                <li><Link href="/buildingtogether" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Building Together</Link></li>
                <li><Link href="/coworking-space" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Coworking Space</Link></li>
                <li><Link href="/events" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Community Calendar</Link></li>
                <li><Link href="/jobs" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Job Board <span className="inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/30">Testing</span></Link></li>
                <li><Link href="/shop" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Shop</Link></li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Stay Connected</h3>
              <ul className="space-y-3.5">
                <li><Link href="https://discord.gg/cvHHzThrEw" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Discord</Link></li>
                <li><Link href="https://linkedin.com/company/devsa" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">LinkedIn</Link></li>
                <li><Link href="https://instagram.com/devsatx" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Instagram</Link></li>
                <li><Link href="https://twitter.com/devsatx" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">Twitter (X)</Link></li>
                <li><Link href="https://github.com/devsanantonio" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors">GitHub</Link></li>
              </ul>
            </div>

            {/* Community Groups - spans 2 columns */}
            <div className="col-span-2">
              <h3 className="text-white text-[13px] font-semibold uppercase tracking-wider mb-5">Find Your Community</h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                {communityGroups.map((group) => (
                  <li key={group.id}>
                    <Link
                      href={`/buildingtogether/${group.id}`}
                      className="text-neutral-400 hover:text-white text-[13px] font-normal leading-normal transition-colors"
                    >
                      {group.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/buildingtogether"
                    className="inline-flex items-center gap-1.5 text-[#ef426f] hover:text-[#fbbf24] text-[13px] font-medium leading-normal transition-colors"
                  >
                    See All
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}