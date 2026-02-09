"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

interface TerminalDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSocialMenuOpen: () => void
}

export function TerminalDropdown({ isOpen, onClose, onSocialMenuOpen }: TerminalDropdownProps) {
  const [currentUser] = useState("")

  const devsaAscii = `
██████╗ ███████╗██╗   ██╗███████╗ █████╗ 
██╔══██╗██╔════╝██║   ██║██╔════╝██╔══██╗
██║  ██║█████╗  ██║   ██║███████╗███████║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██╔══██║
██████╔╝███████╗ ╚████╔╝ ███████║██║  ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝

Your Direct Connection to the Tech Community`

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute right-0 top-full mt-2 z-50 bg-black border-2 border-rose-600 rounded-lg shadow-2xl overflow-hidden w-80`}

        >
          {/* Unified Terminal Menu */}
          <div className="bg-black text-rose-400 border-rose-600 font-mono">
            {/* Terminal Header */}
            <div className="bg-gray-900 px-3 py-2 border-b border-rose-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#00b2a9] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#ef426f] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#ff8200] rounded-full"></div>
                  </div>
                  <span className="text-[#ef426f] text-xs font-mono">
                    {currentUser}@devsa.community
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#ef426f] hover:text-[#ff6b8a] text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* ASCII Art - Full Width */}
            <div className="w-full border-b border-rose-900/30 px-4 py-2">
              <pre className="text-[#ef426f] text-[8px] whitespace-pre overflow-x-auto leading-tight text-left w-full font-mono">
                {devsaAscii}
              </pre>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/coworking-space"
                onClick={onClose}
                className="block px-4 py-3 text-[#ef426f] hover:bg-rose-900/20 transition-colors duration-150 border-b border-[#ef426f]/30 font-mono text-sm text-left"
              >
                {'>'} Coworking Space
              </Link>
              <Link
                href="/events"
                onClick={onClose}
                className="block px-4 py-3 text-[#ef426f] hover:bg-rose-900/20 transition-colors duration-150 border-b border-[#ef426f]/30 font-mono text-sm text-left"
              >
                {'>'} Events Calendar
              </Link>
              <Link
                href="/jobs"
                onClick={onClose}
                className="block px-4 py-3 text-[#ef426f] hover:bg-rose-900/20 transition-colors duration-150 border-b border-[#ef426f]/30 font-mono text-sm text-left"
              >
                {'>'} Job Board
              </Link>
              <Link
                href="/buildingtogether"
                onClick={onClose}
                className="block px-4 py-3 text-[#ef426f] hover:bg-rose-900/20 transition-colors duration-150 border-b border-[#ef426f]/30 font-mono text-sm text-left"
              >
                {'>'} Partners & Communities
              </Link>
              <button
                onClick={() => {
                  onSocialMenuOpen()
                  onClose()
                }}
                className="w-full text-left px-4 py-3 text-[#ef426f] hover:bg-rose-900/20 transition-colors duration-150 font-mono text-sm"
              >
                {'>'} Stay Connected
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}