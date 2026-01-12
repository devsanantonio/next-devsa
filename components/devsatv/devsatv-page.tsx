"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { 
  Tv, 
  Calendar, 
  Film, 
  ArrowRight, 
  Mic2,
  Video,
  Clapperboard,
  Users,
  ArrowDown
} from "lucide-react"

// Aztec decorations only for the More Human Than Human card
function AztecCardCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }
  
  return (
    <div className={`w-6 h-6 ${rotations[position]}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M0 0h8v64H0z" fill="#333" />
        <path d="M0 0h64v8H0z" fill="#333" />
        <path d="M16 16h4v24h-4z" fill="#ff9900" opacity="0.6" />
        <path d="M16 16h24v4H16z" fill="#ff9900" opacity="0.6" />
      </svg>
    </div>
  )
}

export function DevsaTVPage() {
  const revenueOutlets = [
    {
      icon: Mic2,
      name: "Sponsored Workshops",
      description: "Enterprise partners fund workshops, we capture documentary-style content featuring DEVSA community members.",
    },
    {
      icon: Calendar,
      name: "Quarterly Conferences",
      description: "High-profile events generating fresh content with premium production value and engaged audiences.",
    },
    {
      icon: Film,
      name: "Documentary Stories",
      description: "Long-form content showcasing San Antonio's tech ecosystem—authentic stories sponsors cannot replicate.",
    },
  ]

  const conferences = [
    { date: "Feb 28", name: "More Human Than Human: AI Conference" },
    { date: "May", name: "Emerging Technology Conference" },
    { date: "Aug", name: "React Conference" },
    { date: "Nov", name: "PySanAntonio 2" },
  ]

  return (
    <main className="h-dvh bg-white overflow-x-hidden overflow-y-auto">
      {/* Hero Section - Full viewport storytelling */}
      <section className="min-h-dvh flex flex-col pt-16 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8" data-bg-type="light">
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
          
          {/* Header: Story + Title */}
          <div className="text-center mb-6 sm:mb-8">
            {/* The Story Lead */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-slate-500 mb-3 max-w-2xl mx-auto leading-relaxed"
            >
              DEVSA built a living ecosystem connecting 20+ tech organizations in San Antonio.
            </motion.p>
            
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-3"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[0.95]">
                DEVSA{" "}
                <span className="text-amber-500">TV</span>
              </h1>
            </motion.div>

            {/* Story Continuation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed"
            >
              Now we bring that ecosystem to life—transforming authentic community stories into sponsor-ready content.
            </motion.p>
          </div>

          {/* Three Revenue Models - The Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <p className="text-center text-xs sm:text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4">
              Three Revenue Outlets
            </p>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              {revenueOutlets.map((outlet, index) => (
                <motion.div
                  key={outlet.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group bg-slate-50 border border-slate-200 p-4 sm:p-5 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-amber-100 border border-amber-200 shrink-0">
                      <outlet.icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 leading-tight">
                        {outlet.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {outlet.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Row: Conferences + More Human Than Human Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid lg:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-0"
          >
            {/* 2026 Quarterly Conferences */}
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  2026 Quarterly Schedule
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {conferences.map((conf, index) => (
                  <div 
                    key={conf.name}
                    className={`p-3 border transition-all ${
                      index === 0 
                        ? 'border-amber-300 bg-amber-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-0.5 ${
                      index === 0 ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {conf.date}
                    </p>
                    <p className={`text-xs sm:text-sm font-medium leading-tight ${
                      index === 0 ? 'text-amber-900' : 'text-slate-700'
                    }`}>
                      {conf.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* More Human Than Human - Aztec-style Card */}
            <div className="relative bg-[#0a0a0a] p-4 sm:p-5 overflow-hidden">
              {/* Aztec corners */}
              <div className="absolute top-1 left-1">
                <AztecCardCorner position="top-left" />
              </div>
              <div className="absolute top-1 right-1">
                <AztecCardCorner position="top-right" />
              </div>
              <div className="absolute bottom-1 left-1">
                <AztecCardCorner position="bottom-left" />
              </div>
              <div className="absolute bottom-1 right-1">
                <AztecCardCorner position="bottom-right" />
              </div>
              
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#ff9900] via-[#00f2ff] to-[#ff9900] opacity-60" />
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 border border-[#333] bg-[#111]/80">
                  <Tv className="w-3 h-3 text-[#ff9900]" />
                  <span className="font-mono text-[9px] sm:text-[10px] text-[#a3a3a3] tracking-[0.12em] uppercase">Featured Production</span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 leading-[0.9]">
                  <span className="text-[#e5e5e5]">More Human </span>
                  <span className="text-[#ff9900]">Than Human</span>
                </h2>

                {/* Subtitle */}
                <p className="font-mono text-[10px] sm:text-xs text-[#00f2ff] tracking-[0.12em] uppercase mb-3">
                  DEVSA AI Conference
                </p>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-[#e5e5e5]">
                    <Calendar className="w-3 h-3 text-[#ff9900]" />
                    <span>Feb 28, 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-[#e5e5e5]">
                    <Video className="w-3 h-3 text-[#00f2ff]" />
                    <span>Full Documentary Coverage</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/events/morehumanthanhuman"
                  className="group inline-flex items-center gap-1.5 bg-[#ff9900] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#00f2ff]"
                >
                  <Clapperboard className="w-3 h-3" />
                  <span className="font-mono">Learn More</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Footer: The Flywheel + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 sm:mt-8 pt-5 border-t border-slate-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Flywheel Summary */}
              <div className="flex items-center gap-3 text-slate-500 text-xs sm:text-sm">
                <Users className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="leading-relaxed">
                  <span className="text-slate-700 font-medium">The Flywheel:</span>{" "}
                  Community → Content → Library → Sponsors → Growth
                </p>
              </div>
              
              {/* Partner CTA */}
              <Link
                href="mailto:hello@devsa.io"
                className="group inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all"
              >
                <span>Partner With DEVSA TV</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
