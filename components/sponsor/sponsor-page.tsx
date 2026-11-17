"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, type ReactNode } from "react"
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { ArrowDown, ArrowUpRight, Download, Mail } from "lucide-react"
import { CommunityNetwork, type Community } from "@/components/community-network"

/**
 * The 2027 sponsor packet as a page (app/sponsor/page.tsx explains why it is link-only).
 *
 * The same nine beats as the PDF, in its order: the cover, who you reach, the record, SA Startup + Tech Week,
 * the stack, the four conferences, the levels, what's included, and where the money goes. The packet's
 * language is kept, with two changes: "career-changers" is gone from Learners (DEVSA has never described
 * itself that way), and the group counts, the network, the stack and the events total read the live
 * directory and calendar instead of the Nov 10 figures.
 *
 * Marketing idiom throughout (design-system skill): the sans eyebrow, the full h2 ramp with its light italic
 * clause, the neutral-900 card. Motion is one idea per section, all of it skipped under reduced motion: the
 * cover's photograph drifts on scroll, the lines that join things draw themselves as they come into view,
 * and numbers count up once.
 */

type Props = {
  groupCount: number
  network: Community[]
  stack: { label: string; groups: string[] }[]
  since2024: string
  thisYear: number | null
  discord: number
}

const TEAL = "#00b2a9", PINK = "#ef426f", ORANGE = "#ff8200"
const EASE = [0.16, 1, 0.3, 1] as const
// The packet's mark files are numbered 1 The Model, 2 Access Granted, 3 PySanAntonio, 4 More Human Than Human.
const PDF = "/sponsor/devsa-sponsor-packet-2027.pdf"
const MAIL = "jesse@devsanantonio.com"

/* ---------- pieces ---------- */

function Bars({ small = false }: { small?: boolean }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {[TEAL, PINK, ORANGE].map((c) => (
        <span key={c} className={small ? "h-1 w-7" : "h-1.5 w-10"} style={{ background: c }} />
      ))}
    </div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60 md:text-base">{children}</p>
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 text-balance font-sans text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-5xl lg:text-6xl xl:text-7xl">
      {children}
    </h2>
  )
}

function Mute({ children }: { children: ReactNode }) {
  return <span className="font-light italic text-white/50">{children}</span>
}

/** Rises into place the first time it scrolls into view. */
function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Counts up to `to` once it is in view; `suffix` follows ("+", "k"). */
function Count({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || !seen) return
    if (reduce) { el.textContent = to.toLocaleString("en-US") + suffix; return }
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString("en-US") + suffix) })
    return () => c.stop()
  }, [seen, to, suffix, reduce])
  return <span ref={ref} className={`tabular-nums ${className}`}>{to.toLocaleString("en-US") + suffix}</span>
}

/** A video that plays only while on screen, muted and looped. */
function InViewVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const on = useInView(ref, { amount: 0.4 })
  const reduce = useReducedMotion()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (on && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [on, reduce])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" className={className} />
}

/** A line that draws itself across (or down) as its section scrolls through. */
function DrawnLine({ vertical = false, className = "" }: { vertical?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const reduce = useReducedMotion()
  return (
    <span ref={ref} aria-hidden className={`absolute block overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.span
        className="block h-full w-full rounded-full"
        style={{
          background: `linear-gradient(${vertical ? "180deg" : "90deg"},${TEAL},${PINK},${ORANGE})`,
          transformOrigin: vertical ? "top" : "left",
          ...(reduce ? {} : vertical ? { scaleY: p } : { scaleX: p }),
        }}
      />
    </span>
  )
}

/* ---------- the page ---------- */

export function SponsorPage({ groupCount, network, stack, since2024, thisYear, discord }: Props) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })

  // The cover and "Who you reach" share one section: the copy scrolls on the left while the network stays
  // pinned on the right, so the picture of the bridge is the thing you hold onto while the page explains it.
  const bridge = useRef<HTMLElement>(null)
  const { scrollYProgress: bridgeP } = useScroll({ target: bridge, offset: ["start start", "end end"] })
  const netScale = useTransform(bridgeP, [0, 0.45, 1], [0.9, 1.02, 1])
  const netGlow = useTransform(bridgeP, [0, 0.5, 1], [0.35, 1, 0.6])

  const since = parseInt(since2024, 10) || 600

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* reading progress, in the brand gradient */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left"
        style={{ scaleX: progress, background: `linear-gradient(90deg,${TEAL},${PINK},${ORANGE})` }}
      />

      {/* 1–2 · the cover and who you reach, with the network pinned beside them */}
      <section ref={bridge} className="relative" data-bg-type="dark">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,66,111,.14),transparent_40%),radial-gradient(circle_at_8%_70%,rgba(0,178,169,.14),transparent_45%),radial-gradient(circle_at_85%_95%,rgba(255,130,0,.10),transparent_40%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1.2px,transparent_1.3px)] bg-size-[24px_24px]" />
        <div className="page-shell relative grid lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* left: scrolls */}
          <div>
            <div className="flex min-h-dvh flex-col justify-center py-28">
            <motion.img
              src="/branding/devsa-logo.svg"
              alt="DEVSA"
              className="w-24 md:w-32"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            />
            <h1 className="mt-10 font-sans text-6xl font-black leading-[0.92] tracking-[-0.03em] sm:text-7xl md:text-8xl lg:text-[5.75rem] xl:text-[6.5rem]">
              {["Sponsor", "the", "Bridge."].map((w, i) => (
                <motion.span
                  key={w}
                  className={`mr-[0.22em] inline-block ${w === "the" ? "font-light italic text-white/50" : ""}`}
                  initial={reduce ? false : { opacity: 0, y: "0.4em" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>
            <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: EASE }}>
              <p className="mt-8 max-w-2xl text-xl font-light leading-snug text-white/80 md:text-3xl">
                The bridge to San Antonio&rsquo;s <strong className="font-semibold text-white">learners and builders.</strong>
              </p>
              <p className="mt-10 text-sm font-medium uppercase tracking-[0.2em] text-white/60 md:text-base">2027 sponsorship &middot; four conferences, one a quarter</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#levels" className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:py-3">
                  See the levels
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </a>
                <a href={PDF} download className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5 sm:py-3">
                  <Download className="h-4 w-4" />
                  Download the PDF
                </a>
              </div>
            </motion.div>
              {/* below lg the network can't sit beside the copy, so it follows the cover instead */}
              <div className="mt-14 lg:hidden"><CommunityNetwork communities={network} className="w-full" /></div>
            </div>
            <div className="pb-24 pt-8 lg:pb-[30vh]">
              <Rise>
                <Bars />
                <div className="mt-6"><Eyebrow>Who you reach</Eyebrow></div>
                <H2>The Other <Mute>Altitude.</Mute></H2>
              </Rise>
              <Rise delay={0.1}>
                <blockquote className="mt-10 border-l-4 pl-6 text-xl italic leading-relaxed text-white md:text-2xl" style={{ borderColor: PINK }}>
                  &ldquo;People new to the city or working outside established circles may find it harder to identify the right contacts.&rdquo;
                  <footer className="mt-3 text-sm not-italic text-white/60">2026 San Antonio State of Innovation, Innovation SATX Consortium</footer>
                </blockquote>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
                  DEVSA is the 501(c)(3) bridge between San Antonio&rsquo;s tech groups: <strong className="font-semibold text-white">one shared calendar and one public directory</strong>, free to every group. You already know the directors and executives. This is <strong className="font-semibold text-white">the people doing the work.</strong>
                </p>
              </Rise>
              <div className="relative mt-12 grid gap-8 pl-12">
                <DrawnLine vertical className="left-[13px] top-2 bottom-2 w-1.5" />
                {[
                  { c: TEAL, t: "Learners", d: "Students and people new to the city, finding their way in" },
                  { c: PINK, t: "Organizers", d: `The people who run ${groupCount} tech groups, from Python to AI and security` },
                  { c: ORANGE, t: "Builders", d: "The engineers, analysts and designers who fill those rooms every week" },
                ].map((l, i) => (
                  <Rise key={l.t} delay={0.1 + i * 0.12} className="relative">
                    <span aria-hidden className="absolute -left-12 top-1 h-7 w-7 rounded-full border-[6px] border-[#0a0a0a]" style={{ background: l.c }} />
                    <p className="text-2xl font-black tracking-tight md:text-3xl">{l.t}</p>
                    <p className="mt-1 text-base text-white/70 md:text-lg">{l.d}</p>
                  </Rise>
                ))}
              </div>
            </div>
          </div>
          {/* right: the network, pinned for the length of both */}
          <div className="relative hidden lg:block">
            <div className="sticky top-0 flex h-dvh items-center">
              <motion.div aria-hidden className="absolute inset-[12%] rounded-full blur-3xl" style={{ opacity: reduce ? 0.6 : netGlow, background: `radial-gradient(circle, ${PINK}33, ${TEAL}22 45%, transparent 70%)` }} />
              <motion.div className="relative w-full" style={reduce ? undefined : { scale: netScale }}>
                <CommunityNetwork communities={network} className="w-full" />
                <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-white/50">{groupCount} community groups, one bridge</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · the record */}
      <section className="relative py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>The record &middot; our 2026 baseline</Eyebrow></div>
            <H2>Two and a Half Years <Mute>of</Mute> Rooms.</H2>
            <p className="mt-6 max-w-3xl text-lg text-white/70 md:text-xl">The first time DEVSA has measured its own work. Each year&rsquo;s packet tracks it from here.</p>
          </Rise>
          <div className="relative mt-14">
            <DrawnLine className="left-0 right-0 top-[10px] hidden h-1.5 md:block" />
            <div className="grid gap-10 md:grid-cols-4 md:gap-8">
              {[
                { c: TEAL, k: "Apr 2024", d: "DEVSA’s first event, with about ten community groups on the calendar" },
                { c: PINK, k: "2024", d: "214 events on the shared calendar" },
                { c: ORANGE, k: "2025", d: "204 events on the shared calendar" },
                { c: TEAL, k: "2026", d: `${thisYear ? `${thisYear}+` : "190+"} so far, ${groupCount} groups, on devsa.community` },
              ].map((m, i) => (
                <Rise key={m.k} delay={0.1 + i * 0.12} className="relative md:pt-12">
                  <span aria-hidden className="absolute left-0 top-0 hidden h-6 w-6 rounded-full border-[5px] bg-[#0a0a0a] md:block" style={{ borderColor: m.c }} />
                  <p className="text-4xl font-black tracking-tight md:text-5xl">{m.k}</p>
                  <p className="mt-3 text-base leading-relaxed text-white/70">{m.d}</p>
                </Rise>
              ))}
            </div>
          </div>
          <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-3">
            <Rise>
              <p className="text-7xl font-black tracking-[-0.03em] md:text-8xl"><Count to={since} suffix="+" /></p>
              <p className="mt-2 text-lg text-white/70">events since 2024</p>
            </Rise>
            <Rise delay={0.1}>
              <p className="text-7xl font-black tracking-[-0.03em] md:text-8xl"><Count to={39} /></p>
              <p className="mt-2 text-lg text-white/70">of them DEVSA&rsquo;s own</p>
            </Rise>
            <Rise delay={0.2}>
              <p className="text-7xl font-black tracking-[-0.03em] md:text-8xl"><Count to={groupCount} /></p>
              <p className="mt-2 text-lg text-white/70">community groups <span style={{ color: TEAL }}>&uarr; from about ten</span></p>
            </Rise>
          </div>
          <Rise delay={0.1}>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-5">
              <span className="font-mono text-xs uppercase tracking-widest text-white/60">DEVSA&rsquo;s channels</span>
              <span className="text-lg"><b className="font-black"><Count to={discord} /></b> <span className="text-white/70">on Discord</span></span>
              <span className="text-lg"><b className="font-black">993</b> <span className="text-white/70">on Instagram</span></span>
              <span className="text-lg"><b className="font-black">734</b> <span className="text-white/70">on LinkedIn</span></span>
              <span className="text-lg"><b className="font-black">DEVSA TV</b> <span className="text-white/70">on public access, from Dec 2026</span></span>
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/50">How we counted: Luma 2024&ndash;25, devsa.community 2026. Instagram and LinkedIn as of Nov 10, 2026.</p>
          </Rise>
        </div>
      </section>

      {/* 4 · SA Startup + Tech Week */}
      <section className="relative overflow-hidden py-16 md:py-24" data-bg-type="dark">
        <div aria-hidden className="absolute inset-0">
          <Image src="/hero/sastw-workshop.webp" alt="" fill sizes="100vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]" />
        </div>
        <div className="page-shell relative">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>Proven at SA Startup + Tech Week 2026</Eyebrow></div>
            <H2>DEVSA Ran <Mute>the</Mute> Tech Track.</H2>
            <p className="mt-6 max-w-3xl text-lg text-white/70 md:text-xl">The newcomers the region&rsquo;s own report says struggle to find their way in, in the room.</p>
          </Rise>
          <Rise delay={0.1}>
            <div className="mt-14 flex flex-wrap items-end gap-x-10 gap-y-4">
              <p className="font-black leading-none tracking-[-0.04em]" style={{ color: "#ffcf6a" }}>
                <span className="text-[7rem] md:text-[11rem]"><Count to={723} /></span>
                <span className="ml-3 text-3xl text-white/80 md:text-4xl">of 1,137</span>
              </p>
              <p className="max-w-md pb-4 text-2xl font-semibold leading-snug md:text-3xl">registrants came for the first time, in the week&rsquo;s eleventh year</p>
            </div>
          </Rise>
          <div className="mt-14 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-3">
            {[
              { n: 12, t: "events at the Rand", d: "PySanAntonio II, Access Granted, The Model and nine community groups" },
              { n: 1, t: "computer drive at the Central Library", d: "Give-a-LOT, with learnOPENtech and LaunchSA" },
              { n: 7, t: "speakers at Texas Public Radio", d: "sent by DEVSA to the week’s anchor venue" },
            ].map((s, i) => (
              <Rise key={s.t} delay={i * 0.1}>
                <p className="text-6xl font-black tracking-tight"><Count to={s.n} /></p>
                <p className="mt-2 text-xl font-semibold">{s.t}</p>
                <p className="mt-1 text-white/60">{s.d}</p>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · by stack, and already built */}
      <section className="py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>Who you reach, by stack</Eyebrow></div>
            <H2>Builders Who Ship <Mute>With</Mute> Your Tools.</H2>
          </Rise>
          <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((t, i) => (
              <Rise key={t.label} delay={(i % 3) * 0.08} className="border-t border-white/10 pt-4">
                <p className="text-lg font-black">{t.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{t.groups.join(" · ")}</p>
              </Rise>
            ))}
          </div>
          <Rise delay={0.1}>
            <p className="mt-10 max-w-4xl text-lg leading-relaxed text-white/75">
              {groupCount} groups, one calendar, including <strong className="text-white">Alamo Agents</strong>, San Antonio&rsquo;s agent builders, meeting monthly. San Antonio is the seventh-largest city in the US and one of its largest cybersecurity and military hubs. <strong className="text-white">DEVSA is how you reach its developers.</strong>
            </p>
          </Rise>

          <div className="mt-16"><Eyebrow>Already built with DEVSA</Eyebrow></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
            {[
              { img: "/photos/shebuilds-8o8a0032.webp", when: "Mar 8, 2026 · with Lovable", t: "SheBuilds", d: "Lovable started it worldwide. Anthropic and Stripe put credits in builders’ hands. DEVSA brought San Antonio’s builders, and they shipped." },
              { img: "/sponsor/zero-to-agent-room.webp", when: "Apr 25, 2026 · Vercel Global Build Week", t: "Zero to Agent", d: "DEVSA was the official San Antonio community partner: builders shipped AI agents with the Vercel AI SDK, v0 and AI Gateway." },
            ].map((c, i) => (
              <Rise key={c.t} delay={i * 0.12}>
                <div className="group h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-700">
                  <div className="relative aspect-16/10 w-full overflow-hidden">
                    <Image src={c.img} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex flex-col gap-3 p-6">
                    <p className="font-mono text-xs uppercase tracking-widest" style={{ color: ORANGE }}>{c.when}</p>
                    <p className="text-2xl font-black">{c.t}</p>
                    <p className="leading-relaxed text-white/70">{c.d}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · four conferences */}
      <section className="py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>What you can put your name on</Eyebrow></div>
            <H2>Four Conferences, <Mute>One a Quarter.</Mute></H2>
          </Rise>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {[
              { q: "Q1 · Feb 2027", mark: "/sponsor/mark-4.webp", href: "/events/morehumanthanhuman", d: "AI for developers and engineers building agents.", video: "/sponsor/more-human-head.mp4", poster: "/conferences/more-human-poster.webp" },
              { q: "Q2 · May 2027", mark: "/sponsor/mark-1.webp", href: "/events/the-model", d: "AI for creators, creatives, founders and builders.", photo: "/conferences/the-model/stage-wide.webp" },
              { q: "Q3 · Aug 2027", mark: "/sponsor/mark-2.webp", href: "/events/access-granted", d: "Security, hands on: the room where people take technology apart.", video: "/access-granted/padlock-loop.mp4", poster: "/access-granted/padlock-loop-poster.webp" },
              { q: "Q4 · Sept–Oct 2027", mark: "/sponsor/mark-3.webp", href: "/events/pysanantonio", d: "The city’s Python conference, back for year three.", video: "/pysa/mascot-clip.mp4", poster: "/pysa/mascot-video-poster.webp" },
            ].map((c, i) => (
              <Rise key={c.q} delay={i * 0.1}>
                <Link href={c.href} className="group block h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900/70">
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-black">
                    {c.video ? (
                      <InViewVideo src={c.video} poster={c.poster!} className="h-full w-full object-cover" />
                    ) : (
                      <Image src={c.photo!} alt="" fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.mark} alt="" className="h-7 w-auto self-start object-contain" />
                    <p className="font-mono text-xs uppercase tracking-widest" style={{ color: ORANGE }}>{c.q} &middot; at capacity, 80 seats</p>
                    <p className="flex-1 leading-relaxed text-white/75">{c.d}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white">
                      See the conference <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Rise>
            ))}
          </div>
          <Rise delay={0.1}>
            <p className="mt-10 text-xl text-white/75 md:text-2xl">Every one so far filled Geekdom&rsquo;s 80 seats. <strong className="text-white">Put your name on the next one.</strong></p>
          </Rise>
        </div>
      </section>

      {/* 7 · the levels */}
      <section id="levels" className="scroll-mt-20 py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>Sponsorship levels</Eyebrow></div>
            <H2>Put Your Name <Mute>on the</Mute> Bridge.</H2>
          </Rise>
          <div className="mt-12 grid gap-4 md:gap-6 lg:grid-cols-3">
            <Rise className="lg:row-span-2">
              <Level
                name="Founding sponsor" price="$25,000" per="/ year" note="Named across devsa.community · up to 6" color={TEAL}
                visual={<div className="flex h-full items-center justify-center p-4"><CommunityNetwork communities={network} className="w-full max-w-sm" /></div>}
                tall
              />
            </Rise>
            <Rise delay={0.08}>
              <Level name="A conference" price="$15,000" per="each" note="“Presented by” your name · venues like Stable Hall · 4 a year" color={PINK}
                visual={<div className="grid h-full grid-cols-2 place-items-center gap-3 p-6">{[4, 1, 2, 3].map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={n} src={`/sponsor/mark-${n}.webp`} alt="" className="max-h-7 w-auto object-contain" />))}</div>} />
            </Rise>
            <Rise delay={0.16}>
              <Level name="A build night" price="$7,500" per="each" note="In person or live on Discord · or co-host with up to 3 at $3,500" color={ORANGE}
                visual={<div className="relative h-full"><Image src="/hero/ltai-talk.webp" alt="" fill sizes="33vw" className="object-cover opacity-70" /><span className="absolute left-4 top-4 rounded-md bg-black/70 px-2 py-1 font-mono text-sm text-white">&gt; build_night _</span></div>} />
            </Rise>
            <Rise delay={0.08}>
              <Level name="The calendar" price="$10,000" per="/ year" note="“Supported by” your name, every page · exclusive" color={TEAL}
                visual={<div className="relative h-full"><Image src="/sponsor/calendar-widget.webp" alt="" fill sizes="33vw" className="object-cover object-top" /></div>} />
            </Rise>
            <Rise delay={0.16}>
              <Level name="Supporter" price="$2,500" per="/ year" note="Named among DEVSA’s supporters · open" color={PINK}
                visual={<div className="flex h-full items-center justify-center gap-2 p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sponsor/sticker-hello.webp" alt="" className="w-1/2 -rotate-6" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sponsor/sticker-love.webp" alt="" className="w-[42%] rotate-6" />
                </div>} />
            </Rise>
          </div>
        </div>
      </section>

      {/* 8 · what's included */}
      <section className="py-16 md:py-24" data-bg-type="dark">
        <div className="page-shell">
          <Rise>
            <Bars />
            <div className="mt-6"><Eyebrow>What&rsquo;s included</Eyebrow></div>
            <H2>What <Mute>Your Name</Mute> Goes On.</H2>
          </Rise>
          <Rise delay={0.1}>
            <div className="mt-12 overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm md:text-base">
                <thead>
                  <tr className="bg-neutral-900">
                    <th className="p-4" />
                    {INCLUDED_COLS.map((c, i) => (
                      <th key={c} className="border-l border-neutral-800 p-4 text-lg font-black" style={{ boxShadow: `inset 0 3px 0 ${[TEAL, PINK, ORANGE, TEAL, PINK][i]}` }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INCLUDED.map(([row, ...cells]) => (
                    <tr key={row} className="border-t border-neutral-800">
                      <th className="whitespace-nowrap p-4 font-mono text-xs font-normal uppercase tracking-widest text-white/60">{row}</th>
                      {cells.map((v, i) => (
                        <td key={i} className={`border-l border-neutral-800 p-4 align-top leading-snug ${v === "—" ? "text-white/40" : "text-white/85"}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rise>
          <Rise delay={0.1}>
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-8" style={{ borderColor: `${PINK}66`, background: `${PINK}12` }}>
              <p className="shrink-0 text-3xl font-black">Attendee lists: <span style={{ color: PINK }}>never.</span></p>
              <p className="leading-relaxed text-white/80">No sponsorship includes attendee contact details. You meet builders face to face, and anyone who wants to hear from you signs up through your own link. <strong className="text-white">That trust is what keeps the rooms full.</strong></p>
            </div>
          </Rise>
        </div>
      </section>

      {/* 9 · where it goes, and the ask */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-28" data-bg-type="dark">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(239,66,111,.16),transparent_45%),radial-gradient(circle_at_6%_96%,rgba(0,178,169,.14),transparent_45%)]" />
        <div className="page-shell relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Rise>
              <Bars />
              <div className="mt-6"><Eyebrow>Where your support goes</Eyebrow></div>
              <H2>Keeping <Mute>the</Mute> Bridge Open.</H2>
            </Rise>
            <div className="mt-10 grid gap-8">
              <Rise delay={0.1}>
                <p className="text-2xl font-black">A full-time director, and a team</p>
                <p className="mt-2 max-w-xl leading-relaxed text-white/70">The people behind DEVSA&rsquo;s channels: the calendar, Discord, DEVSA TV and the socials that speak to San Antonio&rsquo;s learners and builders.</p>
              </Rise>
              <Rise delay={0.2}>
                <p className="text-2xl font-black">Bigger rooms for the conferences</p>
                <p className="mt-2 max-w-xl leading-relaxed text-white/70">Every DEVSA conference has filled Geekdom&rsquo;s 80 seats. Venues like Stable Hall make room for everyone who wants in.</p>
              </Rise>
            </div>
          </div>
          <Rise delay={0.15}>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/branding/devsa-logo.svg" alt="DEVSA" className="w-20" />
              <p className="mt-8 text-4xl font-black leading-tight tracking-tight">Let&rsquo;s build it together.</p>
              <p className="mt-6 text-xl font-semibold">Jesse Hernandez</p>
              <p className="text-white/60">Founder, DEVSA</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={`mailto:${MAIL}?subject=${encodeURIComponent("DEVSA 2027 sponsorship")}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100">
                  <Mail className="h-4 w-4" /> {MAIL}
                </a>
                <a href={PDF} download className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5">
                  <Download className="h-4 w-4" /> The PDF
                </a>
              </div>
              <p className="mt-8 font-semibold" style={{ color: "#ffcf6a" }}>Commit by January 15, 2027 for a full year of recognition.</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">Invoiced by DEVSA, a 501(c)(3) nonprofit. Written acknowledgment provided for your records. EIN 99-2066455.</p>
            </div>
          </Rise>
        </div>
      </section>
    </main>
  )
}

const INCLUDED_COLS = ["Founding", "Conference", "Build night", "Calendar", "Supporter"]
const INCLUDED: string[][] = [
  ["Name credit", "Named across devsa.community", "“Presented by”, one conference", "“Presented by”, or co-hosted with up to 3", "“Supported by”, every calendar page", "Named among supporters"],
  ["Channels", "Thanked on DEVSA’s socials, all year", "Thanked on DEVSA’s socials, around the event", "Thanked on DEVSA’s socials, around the event", "Thanked monthly on DEVSA’s socials", "Thanked once on DEVSA’s socials"],
  ["Stage time", "Remarks at one conference", "5-min opening", "You lead or co-lead the session", "—", "—"],
  ["Table / hands-on", "Table at every conference", "Table at that conference", "Your tools and credits in every builder’s hands", "Table at one conference", "—"],
  ["Seats / team", "10 reserved seats", "6 reserved seats", "Your team in the room", "4 reserved seats", "2 reserved seats"],
  ["Report", "Quarterly report", "Report after the event", "Report after the event", "Yearly report", "Yearly thank-you"],
]

function Level({ name, price, per, note, color, visual, tall = false }: { name: string; price: string; per: string; note: string; color: string; visual: ReactNode; tall?: boolean }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-700">
      <div className={`relative w-full overflow-hidden bg-black/40 ${tall ? "aspect-square lg:aspect-auto lg:flex-1" : "aspect-16/10"}`}>{visual}</div>
      <div className="flex flex-col gap-2 border-t p-6" style={{ borderColor: `${color}55` }}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xl font-black">{name}</p>
          <p className="whitespace-nowrap text-2xl font-black tabular-nums md:text-3xl" style={{ color }}>
            {price} <span className="text-sm font-medium text-white/60">{per}</span>
          </p>
        </div>
        <p className="text-sm leading-relaxed text-white/65">{note}</p>
      </div>
    </div>
  )
}
