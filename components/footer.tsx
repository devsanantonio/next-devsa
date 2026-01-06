"use client"

import { motion } from "motion/react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/50 py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          {/* Left Side - Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-neutral-400 text-sm text-center md:text-left"
          >
            © {currentYear} DEVSA. All rights reserved.
          </motion.p>

          {/* Right Side - Digital Canvas Network */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-400 text-sm text-center md:text-right"
          >
            Part of the{" "}
            <Link
              href="https://www.digitalcanvas.community/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ef426f] hover:text-[#fbbf24] transition-colors font-medium"
            >
              Digital Canvas
            </Link>
            {" "}Network
          </motion.p>
        </div>
      </div>
    </footer>
  )
}