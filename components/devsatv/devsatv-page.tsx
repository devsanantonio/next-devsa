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
  Crown,
  Zap,
  Building2,
  Sparkles,
  Coffee,
  Target,
  CheckCircle2
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
  const annualTiers = [
    {
      name: "Documentary Story",
      tier: "Premier Tier",
      icon: Film,
      investment: "$50,000/year",
      goal: "2 Partners",
      target: "Local Pillars (Frost Bank, HEB, USAA, PortSA, UTSA, Spurs)",
      benefits: [
        "10–15 min cinematic documentary of your impact",
        "Premiere screening at DEVSA Conference",
        "Permanent placement in 434 MEDIA Library",
        "5 short-form vertical clips for social",
        "12-month branding on all documentary trailers",
      ],
    },
    {
      name: "Quarterly Conference",
      tier: "Event Tier",
      icon: Calendar,
      investment: "$25,000/event",
      goal: "4 Events = $100K",
      target: "Infrastructure/Dev Tools (Vercel, Cloudflare, Microsoft, Google)",
      benefits: [
        "Title sponsorship of one major conference",
        "Dedicated keynote or technical showcase slot",
        "Direct access to attendee list",
        "Professional 'Deep Dive' video for YouTube",
      ],
    },
    {
      name: "Sponsored Workshop",
      tier: "Growth Tier",
      icon: Mic2,
      investment: "$10,000/workshop",
      goal: "5 Workshops = $50K",
      target: "Local Tech Orgs (VIA, SWBC, 80/20) or Frameworks (Laravel, Cursor)",
      benefits: [
        "Focused workshop building with your tools",
        "'Sponsor Story' documentary recap video",
        "First-look access to local talent pipeline",
        "Bridge Builder recognition across all channels",
      ],
    },
  ]

  const eventTiers = [
    {
      name: "The Titan",
      subtitle: "Title Sponsor",
      icon: Crown,
      investment: "$25,000",
      exclusive: true,
      benefits: [
        "15-minute dedicated keynote stage time",
        "Spotlight segment in documentary film",
        "Branding on DEVSA TV interview set",
        "Premier logo on all conference assets",
      ],
    },
    {
      name: "The Agent",
      subtitle: "Track Sponsor",
      icon: Zap,
      investment: "$10,000",
      limit: "3 Partners",
      benefits: [
        "'Presented by' track ownership",
        "5-10 min Lightning Talk slot",
        "Two professional short-form clips",
        "Dedicated booth in Geekdom lounge",
      ],
    },
    {
      name: "The Builder",
      subtitle: "Community Sponsor",
      icon: Coffee,
      investment: "$5,000",
      benefits: [
        "Official networking sponsor recognition",
        "Logo in 'Architects' marquee",
        "Social media shout-outs",
        "Featured spotlight in TheFeed",
      ],
    },
  ]

  const conferences = [
    { date: "Feb 28", name: "More Human Than Human: AI Conference" },
    { date: "May", name: "Emerging Technology Conference" },
    { date: "Aug", name: "React Conference" },
    { date: "Nov", name: "PySanAntonio 2" },
  ]

  return (
    <main className="min-h-dvh bg-white overflow-x-hidden overflow-y-auto">
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200" data-bg-type="light">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-slate-100 border border-slate-200"
            >
              <Tv className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">Content Production Studio</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none mb-4"
            >
              DEVSA <span className="text-amber-500">TV</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-2"
            >
              Standard event sponsorships die when the lights go out.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl font-semibold text-slate-900 max-w-2xl mx-auto"
            >
              A DEVSA TV partnership lives forever.
            </motion.p>
          </div>

          {/* Featured Production Showcase - KEEPING AS IS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="relative bg-[#0a0a0a] p-5 sm:p-6 overflow-hidden">
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

          {/* 2026 Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {conferences.map((conf, index) => (
              <div 
                key={conf.name}
                className={`p-3 border text-center transition-all ${
                  index === 0 
                    ? 'border-amber-400 bg-amber-50' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${
                  index === 0 ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  {conf.date}
                </p>
                <p className={`text-xs font-semibold leading-tight ${
                  index === 0 ? 'text-amber-900' : 'text-slate-700'
                }`}>
                  {conf.name}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2026 Annual Sponsorship Tiers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200" data-bg-type="light">
        <div className="w-full max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold tracking-wider uppercase text-amber-600 mb-2">
              2026 Annual Partnerships
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-3">
              Sponsorship Tiers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              We capture the energy of events and transform them into a premium Content Library that your brand owns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {annualTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-900">
                      <tier.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600">
                        {tier.tier}
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {tier.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    <span className="font-medium text-slate-700">Target:</span> {tier.target}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">{tier.investment}</span>
                    <span className="text-xs text-slate-500">Goal: {tier.goal}</span>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="p-5">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-3">
                    What You Get
                  </p>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-600 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event-Specific Tiers: More Human Than Human */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200" data-bg-type="light">
        <div className="w-full max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold tracking-wider uppercase text-cyan-600 mb-2">
              Event Sponsorship Prospectus
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-3">
              More Human Than Human
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              February 28, 2026 at Geekdom, San Antonio — The inaugural event of the 2026 DEVSA TV season.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {eventTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border overflow-hidden transition-colors ${
                  tier.exclusive 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className={`p-5 border-b ${tier.exclusive ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${tier.exclusive ? 'bg-amber-500' : 'bg-slate-900'}`}>
                      <tier.icon className={`w-5 h-5 ${tier.exclusive ? 'text-slate-900' : 'text-cyan-400'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold leading-tight ${tier.exclusive ? 'text-white' : 'text-slate-900'}`}>
                        {tier.name}
                      </h3>
                      <p className={`text-xs ${tier.exclusive ? 'text-slate-400' : 'text-slate-500'}`}>
                        {tier.subtitle}
                      </p>
                    </div>
                  </div>
                  {tier.exclusive && (
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-500 mb-2">
                      Exclusive to One Partner
                    </p>
                  )}
                  {tier.limit && (
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-cyan-600 mb-2">
                      Limited to {tier.limit}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${tier.exclusive ? 'text-white' : 'text-slate-900'}`}>
                      {tier.investment}
                    </span>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="p-5">
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.exclusive ? 'text-amber-500' : 'text-cyan-500'}`} />
                        <span className={`text-xs leading-relaxed ${tier.exclusive ? 'text-slate-300' : 'text-slate-600'}`}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Strategic Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-100 border border-slate-200 p-6 sm:p-8"
          >
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Strategic Deliverables — What You Get After the Event
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Raw & Refined Footage</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Professional 4K recordings of your participation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">The &ldquo;Human&rdquo; Metric</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Engagement data from Discord and LinkedIn surveys</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">The Identity</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Alignment with the most authentic builder movement in South Texas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900" data-bg-type="dark">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-wider uppercase text-amber-500 mb-3">
              The Flywheel
            </p>
            <p className="text-sm sm:text-base text-slate-400 mb-6 leading-relaxed">
              Community → Content → Library → Sponsors → Growth
            </p>
            <Link
              href="mailto:hello@devsa.io"
              className="group inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-900 transition-all"
            >
              <span>Partner With DEVSA TV</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
