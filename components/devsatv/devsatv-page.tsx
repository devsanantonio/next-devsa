"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
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
  CheckCircle2,
  Play,
  BookOpen,
  Camera
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
  const [activeTab, setActiveTab] = useState<'conferences' | 'workshops' | 'documentaries'>('conferences')

  // YouTube video IDs - extract from URL:
  const workshopVideoId = "BOCU-seUXQ8"
  const documentaryVideoId = "8pDqJVdNa44"

  const revenueOutlets = [
    { id: 'conferences' as const, label: 'Quarterly Conferences', icon: Calendar, investment: '$25K/event' },
    { id: 'workshops' as const, label: 'Sponsored Workshops', icon: Mic2, investment: '$10K/workshop' },
    { id: 'documentaries' as const, label: 'Documentary Stories', icon: Film, investment: '$50K/year' },
  ]

  const annualTiers = [
    {
      name: "The Documentary Story",
      tier: "Premier Tier",
      icon: Film,
      investment: "$50,000/year",
      goal: "2 Partners",
      target: "Local Pillars (Frost, H-E-B, USAA, PortSA, UTSA, Spurs)",
      benefits: [
        "45-minute cinematic documentary chronicling your team's innovation, culture, and community impact",
        "Episodic flexibility: Option to break into a Limited Series (3 x 15-minute episodes)",
        "Exclusive red-carpet premiere screening at the DEVSA Annual Conference",
        "Permanent placement in the 434 MEDIA Library as a historical 'Source of Truth'",
        "10+ professional short-form vertical assets (Reels/TikToks) from feature content",
        "12-month 'Presented By' placement on all DEVSA TV documentary trailers and season teasers",
      ],
    },
    {
      name: "The Quarterly Conference",
      tier: "Event Tier",
      icon: Calendar,
      investment: "$25,000/event",
      goal: "4 Events per Season",
      target: "Infrastructure & Dev Tools (Vercel, Cloudflare, Microsoft, Cursor, Google)",
      benefits: [
        "Exclusive title sponsorship of one major conference (e.g., More Human Than Human)",
        "One 45-minute Main Stage Keynote or deep-dive technical showcase",
        "Professional 'Deep Dive' video of your session, edited for DEVSA TV YouTube channel",
        "Your logo featured on the DEVSA TV interview set",
      ],
    },
    {
      name: "The Sponsored Workshop",
      tier: "Growth Tier",
      icon: Mic2,
      investment: "$10,000/workshop",
      goal: "5 Workshops per Season",
      target: "Local Tech Orgs (VIA, SWBC, 80/20) or Frameworks (Laravel, Cursor, AWS)",
      benefits: [
        "A focused technical workshop where developers build using your tools or frameworks",
        "'Sponsor Story' documentary recap video (3–5 minutes) capturing builders in action",
        "Direct interaction with a 'vetted' local talent pipeline",
        "Official 'Bridge Builder' status across all channels and TheFeed",
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
        "45-minute Keynote slot to define the future of your industry",
        "Featured spotlight segment in the official documentary film",
        "Primary branding on the DEVSA TV live-recording set (visible in all 2026 distribution)",
        "Top-tier logo placement on all conference assets, digital and physical",
      ],
    },
    {
      name: "The Agent",
      subtitle: "Track Sponsor",
      icon: Zap,
      investment: "$10,000",
      limit: "3 Partners",
      benefits: [
        "\"Presented by [Your Brand]\" signage and digital intro for your track (Cyber, Healthcare, Aero, or Energy)",
        "15-minute high-impact Lightning Talk to showcase a technical breakthrough",
        "Two professional short-form video clips, edited for social distribution",
        "Dedicated demo booth in the Geekdom Lounge for direct interaction with builders",
      ],
    },
    {
      name: "The Social Architect",
      subtitle: "After-Party Host",
      icon: Sparkles,
      investment: "$7,500",
      exclusive: true,
      benefits: [
        "Sole branding of the Conference Happy Hour & After-Party",
        "5-minute opening remarks to \"kick off\" the networking session",
        "Curate a \"branded\" atmosphere (custom drink names, swag, or lighting)",
        "Featured in the 'Architects' section of all conference signage",
      ],
    },
    {
      name: "The Builder",
      subtitle: "Community Partner",
      icon: Coffee,
      investment: "$2,500",
      benefits: [
        "Featured spotlight in TheFeed (DEVSA's primary newsletter)",
        "Logo placement in the 'Architects' marquee on-site",
        "Social media shout-outs across the DEVSA ecosystem throughout the conference",
      ],
    },
  ]

  const conferences = [
    { date: "Feb 28", name: "More Human Than Human: AI Conference" },
    { date: "May 30", name: "Emerging Technology Conference" },
    { date: "Aug 29", name: "React Conference" },
    { date: "Nov 7", name: "PySanAntonio 2" },
  ]

  return (
    <main className="min-h-dvh bg-white overflow-x-hidden overflow-y-auto">
      
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200" data-bg-type="light">
        <div className="w-full max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-slate-100 border border-slate-200"
            >
              <Tv className="w-4 h-4 text-[#ef426f]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">From Community to Content</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-none mb-4"
            >
              DEVSA <span className="text-[#ef426f]">TV</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl font-medium text-slate-600 max-w-md mx-auto leading-relaxed"
            >
              Transform authentic community stories into premium, sponsor-ready content through documentary-style production.
            </motion.p>
          </div>

          {/* Revenue Outlets Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mb-4"
          >
            <div className="flex border border-slate-200 bg-slate-50 p-1">
              {revenueOutlets.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => setActiveTab(outlet.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                    activeTab === outlet.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <outlet.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{outlet.label}</span>
                  <span className="sm:hidden">{outlet.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Production Showcase - Tabbed Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <AnimatePresence mode="wait">
              {/* Quarterly Conferences Tab */}
              {activeTab === 'conferences' && (
                <motion.div
                  key="conferences"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-[#0a0a0a] p-5 sm:p-6 overflow-hidden"
                >
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
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#ef426f] via-[#00f2ff] to-[#ef426f] opacity-60" />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 border border-[#333] bg-[#111]/80">
                      <Tv className="w-3 h-3 text-[#ff9900]" />
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#a3a3a3] tracking-[0.12em] uppercase">Featured Production</span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 leading-tight">
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
                </motion.div>
              )}

              {/* Sponsored Workshops Tab */}
              {activeTab === 'workshops' && (
                <motion.div
                  key="workshops"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-[#0a0a0a] p-5 sm:p-6 overflow-hidden"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#10b981] via-[#3b82f6] to-[#10b981] opacity-60" />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 border border-[#333] bg-[#111]/80">
                      <Mic2 className="w-3 h-3 text-[#10b981]" />
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#a3a3a3] tracking-[0.12em] uppercase">Growth Tier • $10K/Workshop</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 leading-tight">
                      <span className="text-[#e5e5e5]">Sponsored </span>
                      <span className="text-[#10b981]">Workshops</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="font-mono text-[10px] sm:text-xs text-[#3b82f6] tracking-[0.12em] uppercase mb-4">
                      Hands-On Learning • Your Tools • Our Community
                    </p>

                    {/* YouTube Video Embed or Placeholder */}
                    {workshopVideoId ? (
                      <div className="relative aspect-video bg-[#111] border border-[#333] mb-4 overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${workshopVideoId}?rel=0&modestbranding=1`}
                          title="Workshop Recap Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-[#111] border border-[#333] mb-4 flex items-center justify-center group cursor-pointer hover:border-[#10b981] transition-colors">
                        <div className="absolute inset-0 bg-linear-to-br from-[#10b981]/5 to-[#3b82f6]/5" />
                        <div className="relative flex flex-col items-center gap-3">
                          <div className="w-16 h-16 flex items-center justify-center bg-[#10b981] rounded-full group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                          <p className="font-mono text-[10px] text-[#666] uppercase tracking-wider">Workshop Recap Video Coming Soon</p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
                      Partner with DEVSA to host focused workshops that showcase your tools and frameworks to San Antonio&apos;s tech community. Each workshop includes a professional &quot;Sponsor Story&quot; recap video.
                    </p>

                    {/* CTA */}
                    <Link
                      href="mailto:jesse@devsanantonio.com?subject=Sponsored%20Workshop%20Inquiry"
                      className="group inline-flex items-center gap-1.5 bg-[#10b981] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#3b82f6]"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span className="font-mono">Become a Workshop Sponsor</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Documentary Stories Tab */}
              {activeTab === 'documentaries' && (
                <motion.div
                  key="documentaries"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-[#0a0a0a] p-5 sm:p-6 overflow-hidden"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#f59e0b] via-[#ef4444] to-[#f59e0b] opacity-60" />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 border border-[#333] bg-[#111]/80">
                      <Film className="w-3 h-3 text-[#f59e0b]" />
                      <span className="font-mono text-[9px] sm:text-[10px] text-[#a3a3a3] tracking-[0.12em] uppercase">Premier Tier • $50K/Year</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 leading-tight">
                      <span className="text-[#e5e5e5]">Documentary </span>
                      <span className="text-[#f59e0b]">Stories</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="font-mono text-[10px] sm:text-xs text-[#ef4444] tracking-[0.12em] uppercase mb-4">
                      Cinematic Storytelling • Your Impact • Lasting Legacy
                    </p>

                    {/* YouTube Video Embed or Placeholder */}
                    {documentaryVideoId ? (
                      <div className="relative aspect-video bg-[#111] border border-[#333] mb-4 overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${documentaryVideoId}?rel=0&modestbranding=1`}
                          title="Documentary Trailer"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-[#111] border border-[#333] mb-4 flex items-center justify-center group cursor-pointer hover:border-[#f59e0b] transition-colors">
                        <div className="absolute inset-0 bg-linear-to-br from-[#f59e0b]/5 to-[#ef4444]/5" />
                        <div className="relative flex flex-col items-center gap-3">
                          <div className="w-16 h-16 flex items-center justify-center bg-[#f59e0b] rounded-full group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                          <p className="font-mono text-[10px] text-[#666] uppercase tracking-wider">Documentary Trailer Coming Soon</p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
                      Tell your organization&apos;s story through a 45-minute cinematic documentary. Premiere at DEVSA conferences with permanent placement in the 434 MEDIA Library.
                    </p>

                    {/* CTA */}
                    <Link
                      href="mailto:jesse@devsanantonio.com?subject=Documentary%20Story%20Inquiry"
                      className="group inline-flex items-center gap-1.5 bg-[#f59e0b] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#ef4444]"
                    >
                      <Camera className="w-3 h-3" />
                      <span className="font-mono">Tell Your Story</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              2026 DEVSA Annual Partnerships
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-3">
              Infrastructure. Narrative. Legacy.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              You are the protagonist of the San Antonio narrative. These tiers move beyond traditional marketing and into Full-Scale Production, documenting your technical evolution for the global stage.
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
                    <span className="text-xl font-extrabold text-slate-900">{tier.investment}</span>
                    <span className="text-xs text-slate-500 leading-relaxed">Goal: {tier.goal}</span>
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
            <p className="text-sm text-slate-500 mb-3">
              February 28, 2026 | Geekdom, San Antonio — The Season Premiere of DEVSA TV
            </p>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              As Texas transforms into a national production hub fueled by SB 22, the technical infrastructure behind that growth is being built here. More Human Than Human is where the builders, architects, and industry leaders converge to explore the synergy between human creativity and machine intelligence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
                    <span className={`text-2xl font-extrabold ${tier.exclusive ? 'text-white' : 'text-slate-900'}`}>
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
              href="mailto:jesse@devsanantonio.com?subject=DEVSA%20TV%20Partnership%20Inquiry"
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
