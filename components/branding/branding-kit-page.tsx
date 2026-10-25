"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { conferences } from "@/data/conferences"
import { ConferenceMark } from "@/components/events/conference-mark"

const ORIGINAL_LOGO_SVG = "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.svg"
const ORIGINAL_LOGO_PNG = "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-logo.png"
const ALT_LOGO_SVG = "/branding/devsa-alt-logo.svg"
const ALT_LOGO_PNG = "https://devsa-assets.s3.us-east-2.amazonaws.com/devsa-altlogo.png"

/* The logo's three colors. Amber and cyan used to be listed here and appear in
   two files each; cyan is More Human Than Human's glitch, so it belongs to that
   conference's identity, not DEVSA's. */
const brandColors = [
  { name: "Rose", hex: "#ef426f", usage: "Primary accent, CTAs, links" },
  { name: "Teal", hex: "#00b2a9", usage: "Accents, status" },
  { name: "Orange", hex: "#ff8200", usage: "Warm accents" },
]

/* Each conference's rules, from its own components. Keep them in step with
   components/brand/, components/pysa/ and the Access Granted hero. */
const CONFERENCE_RULES: Record<string, string[]> = {
  "the-model": [
    "Geist Mono throughout, and labels open with //",
    "The wordmark is a half-finished selection: \"The\" plain, \"Model\" highlighted in lavender #C0B4FC. Never highlight the whole name, and never use a display weight",
  ],
  "access-granted": [
    "Geist Mono bold uppercase: ACCESS in terminal green #00ff66, GRANTED in white, then a block cursor",
    "The padlock is its symbol. Oswald appears only on its page headline",
  ],
  pysanantonio: [
    "The wordmark is drawn art (Amador). Use the files in /pysa; never retype it",
    "Never pixelate or restyle the mascot, and PyTexas keeps its blue and gold",
  ],
  "more-human-than-human": [
    "Two lines in Geist Black uppercase: MORE HUMAN in near-white, THAN HUMAN in amber #ff9900",
    "The glitch effect and its cyan belong to this conference",
  ],
}

/* Each conference's wordmark as files. The Model, Access Granted and More Human
   are set as live text on the site, so the files in public/branding/conferences/
   are outlines of exactly that lettering, built from the values in
   components/brand/the-model.tsx, components/brand/more-human.tsx,
   components/events/event-brand-lockup.tsx and lib/event-brands.ts. Change one
   of those and re-export its file. PySanAntonio's wordmark is drawn art and
   ships as-is. All four are made for black, where the brands live; PySA also
   has a version for light backgrounds. */
const CONFERENCE_DOWNLOADS: Record<string, { label: string; href: string }[]> = {
  "the-model": [
    { label: "SVG", href: "/branding/conferences/the-model-wordmark.svg" },
    { label: "PNG", href: "/branding/conferences/the-model-wordmark.png" },
  ],
  "access-granted": [
    { label: "SVG", href: "/branding/conferences/access-granted-wordmark.svg" },
    { label: "PNG", href: "/branding/conferences/access-granted-wordmark.png" },
  ],
  pysanantonio: [
    { label: "SVG", href: "/pysa/wordmark.svg" },
    { label: "PNG", href: "/pysa/wordmark.png" },
    { label: "SVG for light backgrounds", href: "/pysa/wordmark-dark.svg" },
  ],
  "more-human-than-human": [
    { label: "SVG", href: "/branding/conferences/more-human-than-human-wordmark.svg" },
    { label: "PNG", href: "/branding/conferences/more-human-than-human-wordmark.png" },
  ],
}

const neutralColors = [
  { name: "White", hex: "#ffffff", usage: "Primary text on dark" },
  { name: "Neutral 400", hex: "#a3a3a3", usage: "Secondary text, captions" },
  { name: "Neutral 800", hex: "#262626", usage: "Borders, dividers" },
  { name: "Neutral 900", hex: "#171717", usage: "Card backgrounds, surfaces" },
  { name: "Neutral 950", hex: "#0a0a0a", usage: "Page backgrounds" },
]

const gradientColors = [
  { hex: "#4d8eff", label: "Blue" },
  { hex: "#c87bff", label: "Purple" },
  { hex: "#ff4d9a", label: "Pink" },
  { hex: "#ff3366", label: "Red" },
  { hex: "#ff6b35", label: "Orange" },
]

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function ColorSwatch({ name, hex, usage, dark = false }: { name: string; hex: string; usage: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false)

  const copyHex = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copyHex}
      className="group text-left cursor-pointer"
    >
      <div
        className={`w-full aspect-3/2 rounded-xl border ${dark ? "border-neutral-700/50" : "border-neutral-200/20"} mb-3 transition-transform duration-200 group-hover:scale-[1.02]`}
        style={{ backgroundColor: hex }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
            {hex}
            {copied ? <CheckIcon /> : <CopyIcon />}
          </p>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-1">{usage}</p>
    </button>
  )
}

function downloadFile(url: string, filename: string) {
  const isExternal = url.startsWith("http")
  const fetchUrl = isExternal
    ? `/api/image-proxy?url=${encodeURIComponent(url)}&download=${encodeURIComponent(filename)}`
    : url
  fetch(fetchUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    })
    .catch(() => window.open(url, "_blank"))
}

function LogoCard({
  title,
  description,
  imgSrc,
  svgUrl,
  pngUrl,
  bgClass,
}: {
  title: string
  description: string
  imgSrc: string
  svgUrl: string
  pngUrl: string
  bgClass: string
}) {
  const slug = title.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="border border-neutral-800/50 rounded-2xl overflow-hidden">
      <div className={`${bgClass} p-12 flex items-center justify-center`}>
        <img src={imgSrc} alt={title} className="w-32 h-32 object-contain" />
      </div>
      <div className="p-5 bg-neutral-900/50">
        <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
        <p className="text-neutral-500 text-xs mb-4">{description}</p>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(svgUrl, `${slug}.svg`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-neutral-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <DownloadIcon /> SVG
          </button>
          <button
            onClick={() => downloadFile(pngUrl, `${slug}.png`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-neutral-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <DownloadIcon /> PNG
          </button>
        </div>
      </div>
    </div>
  )
}

function DevSAAltLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 735.7 551.77"
      {...props}
    >
      <defs>
        <style>{".cls-1{fill:#eee}"}</style>
      </defs>
      <path d="M0 107.29h735.7v413.83c0 16.85-13.8 30.65-30.65 30.65H30.65C13.8 551.77 0 537.97 0 521.12V107.29z" />
      <path className="cls-1" d="M250.28 0H485.25V91.95H250.28z" />
      <path
        className="cls-1"
        d="M234.97 0H30.65C13.8 0 0 13.8 0 30.65v61.3h234.97V0zM705.05 0H500.59v91.95H735.7v-61.3C735.7 13.8 721.9 0 705.05 0zM352.52 459.82c0 9.2 6.14 15.34 15.34 15.34h245.23c9.2 0 15.34-6.14 15.34-15.34v-45.99c0-9.2-6.14-15.34-15.34-15.34H367.83c-9.2 0-15.34 6.14-15.34 15.34v45.99h.03zM193.13 320.33l-95.04 95.04c-7.66 7.66-7.66 18.4 0 24.51l27.59 27.59c7.66 7.66 18.4 7.66 24.51 0l134.89-134.89c6.76-5.64 7.71-15.68 2.08-22.43-.62-.76-1.32-1.46-2.08-2.08L150.19 173.18c-6.14-6.14-18.4-6.14-24.51 0l-27.59 27.59c-7.66 6.14-7.66 16.85 0 24.51l95.04 95.04zM370.33 359.62c-11.28-8.54-17.23-20.81-17.83-36.83l49.22 1.13c.5 8.5 4.16 12.83 10.97 12.98 2.5.06 4.63-.48 6.4-1.63 1.76-1.14 2.68-2.96 2.73-5.47.08-3.47-1.73-6.33-5.44-8.58-3.71-2.24-9.49-4.84-17.35-7.81-9.38-3.55-17.13-7-23.24-10.34-6.12-3.34-11.33-8.12-15.63-14.34-4.31-6.22-6.28-14.13-5.92-23.72.22-9.59 2.88-17.71 7.97-24.34 5.09-6.63 11.95-11.58 20.58-14.86 8.63-3.28 18.3-4.8 29.01-4.55 18.07.42 32.34 4.92 42.78 13.51 10.45 8.59 15.77 20.47 15.98 35.63l-49.85-1.15c-.04-4.17-1.02-7.19-2.92-9.04-1.91-1.85-4.25-2.81-7.03-2.87-1.95-.05-3.56.58-4.84 1.87-1.28 1.29-1.95 3.12-2 5.48-.08 3.34 1.7 6.13 5.34 8.37 3.63 2.24 9.45 4.98 17.45 8.23 9.23 3.69 16.84 7.21 22.82 10.54 5.97 3.34 11.12 7.91 15.44 13.71 4.32 5.81 6.38 13.02 6.18 21.64-.21 9.04-2.62 17.09-7.23 24.15-4.62 7.06-11.21 12.51-19.78 16.34-8.58 3.84-18.7 5.62-30.38 5.35-17.66-.41-32.13-4.88-43.41-13.42zM573.28 348.25l-48.5-.28-7.32 21.95-47.88-.28 54.06-145.19 52.61.3 52.18 145.8-48.09-.28-7.07-22.03zm-11.87-30.27l-13.62-40.33-12.68 40.63 26.3-.31z"
      />
    </svg>
  )
}

export function BrandingKitPage() {
  return (
    <main className="min-h-screen bg-neutral-950 pt-20">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pt-16 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Branding Kit
        </h1>
        <p className="text-neutral-400 text-lg max-w-[96rem] leading-relaxed">
          Official brand guidelines for DEVSA — San Antonio&apos;s tech community.
          Use these assets for press, partnerships, events, and community collaborations.
        </p>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <div className="border border-neutral-800/50 rounded-2xl p-8 bg-neutral-900/30">
          <h2 className="text-xl font-semibold text-white mb-4">About DEVSA</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-3">
            DEVSA is a <span className="text-[#ef426f] font-medium">501(c)(3)</span> nonprofit that connects the people building San Antonio
            tech: one calendar, one public directory, one channel to follow, and one room a few times a year,
            governed by a volunteer board. The groups that use it still run themselves.
          </p>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Our tagline: <span className="text-white font-medium">&quot;Find Your People. Build Your Future.&quot;</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {["Tech Community", "Nonprofit", "San Antonio", "Conferences", "Community Calendar", "Open Source"].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs text-neutral-400 bg-white/5 border border-neutral-800/50 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Logos</h2>
        <p className="text-neutral-500 text-sm mb-8">
          Download the DEVSA logo in SVG or PNG format. These are the only two versions: the full-color logo, and the alt logo with its bars in off-white.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <LogoCard
            title="DEVSA Logo"
            description="Primary logo mark — use on dark backgrounds"
            imgSrc={ORIGINAL_LOGO_SVG}
            svgUrl={ORIGINAL_LOGO_SVG}
            pngUrl={ORIGINAL_LOGO_PNG}
            bgClass="bg-neutral-900"
          />
          <LogoCard
            title="DEVSA Alt Logo"
            description="Terminal-style alternative with SA branding"
            imgSrc={ALT_LOGO_SVG}
            svgUrl={ALT_LOGO_SVG}
            pngUrl={ALT_LOGO_PNG}
            bgClass="bg-neutral-800"
          />
        </div>

        {/* Logo on different backgrounds */}
        <h3 className="text-sm font-medium text-neutral-400 mb-4">Logo on backgrounds</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { bg: "bg-black", label: "Black" },
            { bg: "bg-neutral-900", label: "Dark" },
            { bg: "bg-neutral-700", label: "Mid" },
            { bg: "bg-white", label: "Light" },
          ].map(({ bg, label }) => (
            <div key={label} className={`${bg} rounded-xl p-6 flex flex-col items-center gap-3 border border-neutral-800/30`}>
              <img src={ORIGINAL_LOGO_SVG} alt="DEVSA" className="w-10 h-10" />
              <span className="text-[10px] text-neutral-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Usage guidelines */}
        <div className="mt-8 border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
          <h3 className="text-sm font-medium text-white mb-3">Usage Guidelines</h3>
          <ul className="text-xs text-neutral-400 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Use one of the two versions above, as downloaded
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              On black, the logo&apos;s body blends into the background and the bars and SA stand on their own. That&apos;s intended
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Keep clear space equal to the logo&apos;s height on all sides, and use SVG whenever you can
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Don&apos;t set the word &quot;DEVSA&quot; beside the logo. The mark already says DEVSA
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Don&apos;t recolor or invert it, and don&apos;t stretch, skew, rotate or add effects
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Don&apos;t place it on busy or low-contrast backgrounds
            </li>
          </ul>
        </div>
      </section>

      {/* Conferences and programs.

          Each conference already has its identity, set on its own page. The
          marks here come from ConferenceMark, the same component /events and
          the homepage render, so this page shows exactly what those pages show
          and cannot drift from them. The rules under each are the ones written
          into that conference's own components, which nobody outside the code
          could otherwise see. All four are DEVSA's: Access Granted and The
          Model ran at SA Startup + Tech Week, and borrow its Oswald display
          face on share cards, but they are DEVSA conferences. */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Conferences &amp; Programs</h2>
        <p className="text-neutral-500 text-sm mb-8">
          DEVSA&apos;s conferences each have their own identity. Use these files rather than retyping the names: the wordmarks are made for black backgrounds, where the conferences live.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conferences.map((conference) => (
            <div key={conference.key} className="border border-neutral-800/50 rounded-2xl overflow-hidden">
              <div className="bg-neutral-900 px-6 py-8 border-b border-neutral-800/50 min-h-32 flex items-center">
                <ConferenceMark conference={conference} size="card" />
              </div>
              <div className="p-6 bg-neutral-900/30">
                <ul className="text-xs text-neutral-400 space-y-2 leading-relaxed mb-4">
                  {(CONFERENCE_RULES[conference.key] ?? []).map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="text-neutral-500 mt-0.5">—</span>
                      {rule}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={conference.href ?? "/events"}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-[#ef426f] transition-colors"
                  >
                    {conference.name}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  {(CONFERENCE_DOWNLOADS[conference.key] ?? []).map(({ label, href }) => (
                    <a key={href} href={href} download className="text-xs text-neutral-400 hover:text-white transition-colors">
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* localhost:210 is a program, not a conference: DEVSA's open-data repo. */}
          <div className="border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="bg-neutral-900 px-6 py-8 border-b border-neutral-800/50 min-h-32 flex items-center">
              <img src="/branding/localhost/localhost-210-wordmark-dark.svg" alt="localhost:210" className="h-8 w-auto" />
            </div>
            <div className="p-6 bg-neutral-900/30">
              <ul className="text-xs text-neutral-400 space-y-2 leading-relaxed mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 mt-0.5">—</span>
                  Geist Mono SemiBold. The :210, San Antonio&apos;s area code, is always orange #ff8200
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 mt-0.5">—</span>
                  &quot;A DEVSA project,&quot; never &quot;data from DEVSA.&quot; The data is the City&apos;s, Bexar County&apos;s and VIA&apos;s
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/devsanantonio/localhost"
                  className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-[#ef426f] transition-colors"
                >
                  localhost on GitHub
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a href="/branding/localhost/localhost-210-lockup-dark.svg" download className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Lockup SVG (dark)
                </a>
                <a href="/branding/localhost/localhost-210-lockup-light.svg" download className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Lockup SVG (light)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Colors</h2>
        <p className="text-neutral-500 text-sm mb-8">
          Click any swatch to copy the hex value. The brand palette balances vibrant accents with a dark, minimal interface.
        </p>

        <h3 className="text-sm font-medium text-neutral-400 mb-4">Brand Accents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {brandColors.map((color) => (
            <ColorSwatch key={color.hex} {...color} />
          ))}
        </div>

        <h3 className="text-sm font-medium text-neutral-400 mb-4">Neutrals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {neutralColors.map((color) => (
            <ColorSwatch key={color.hex} {...color} dark={color.hex !== "#ffffff"} />
          ))}
        </div>

        <h3 className="text-sm font-medium text-neutral-400 mb-4">Brand Gradient</h3>
        <div className="rounded-2xl overflow-hidden mb-4">
          <div
            className="h-24 w-full"
            style={{
              background: "linear-gradient(135deg, #4d8eff 0%, #c87bff 30%, #ff4d9a 55%, #ff3366 80%, #ff6b35 100%)",
            }}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {gradientColors.map(({ hex, label }) => (
            <span key={hex} className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="w-3 h-3 rounded-full border border-neutral-700/50" style={{ backgroundColor: hex }} />
              <span className="font-mono">{hex}</span>
              <span className="text-neutral-600">({label})</span>
            </span>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Typography</h2>
        <p className="text-neutral-500 text-sm mb-8">
          DEVSA uses the Geist typeface family for a modern, technical feel across all touchpoints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Geist Sans */}
          <div className="border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Primary</p>
            <p className="text-3xl font-bold text-white mb-1 font-sans">Geist Sans</p>
            <p className="text-neutral-500 text-xs mb-5">
              Used for headings, body text, and UI elements
            </p>
            <div className="space-y-3 border-t border-neutral-800/50 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-white text-2xl font-black tracking-[-0.02em]">Headings — Black</span>
                <span className="text-[10px] text-neutral-600 font-mono">900</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-white text-lg font-medium">Subheadings — Medium</span>
                <span className="text-[10px] text-neutral-600 font-mono">500</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-400 text-base font-normal">Body text — Regular</span>
                <span className="text-[10px] text-neutral-600 font-mono">400</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-white/50 text-sm font-light italic">Muted clause — Light italic</span>
                <span className="text-[10px] text-neutral-600 font-mono">300</span>
              </div>
            </div>
          </div>

          {/* Geist Mono */}
          <div className="border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Secondary</p>
            <p className="text-3xl font-bold text-white mb-1 font-mono">Geist Mono</p>
            <p className="text-neutral-500 text-xs mb-5">
              Used for code, data, and the labels on event and conference pages
            </p>
            <div className="space-y-3 border-t border-neutral-800/50 pt-5">
              <p className="text-white text-sm font-mono">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </p>
              <p className="text-white text-sm font-mono">
                abcdefghijklmnopqrstuvwxyz
              </p>
              <p className="text-white text-sm font-mono">
                0123456789 !@#$%^&amp;*()
              </p>
              <p className="text-neutral-500 text-xs font-mono mt-4">
                {`const devsa = { community: "San Antonio" }`}
              </p>
            </div>
          </div>
        </div>

        {/* Type scale: the design system's, not a generic ladder. See
            .claude/skills/design-system/SKILL.md. */}
        <div className="mt-8 border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
          <h3 className="text-sm font-medium text-white mb-5">Headings and eyebrows</h3>
          <p className="text-[10px] text-neutral-600 font-mono mb-2">SECTION HEADING</p>
          <p className="text-balance font-sans leading-[0.95] font-black tracking-[-0.02em] text-white text-4xl md:text-5xl">
            Find Your People.{" "}
            <span className="font-light italic text-white/50">Build Your Future.</span>
          </p>
          <p className="text-xs text-neutral-500 mt-3 mb-8">
            Black, tight, with the second clause in light italic. On marketing pages it runs up to text-7xl.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-neutral-600 font-mono mb-2">EYEBROW · MARKETING PAGES</p>
              <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white/50">Building Together</p>
              <p className="text-xs text-neutral-500 mt-2">Sans, for the homepage and Building Together.</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-600 font-mono mb-2">EYEBROW · EVENT AND CONFERENCE PAGES</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">Community Calendar</p>
              <p className="text-xs text-neutral-500 mt-2">Mono, for /events and the conferences. Never mix the two.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice & Messaging */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Voice & Messaging</h2>
        <p className="text-neutral-500 text-sm mb-8">
          Consistent messaging guidelines for representing DEVSA across channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
            <h3 className="text-sm font-medium text-white mb-4">Core Messages</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Tagline</p>
                <p className="text-white font-medium">Find Your People. Build Your Future.</p>
              </div>
              <div>
                {/* This is the copy other people paste into their own
                    materials, so it is the last place a retired line should
                    survive — and it held two of them. The mission read "DEVSA
                    bridges the gap between passionate builders, local
                    partners, and the growing tech ecosystem", which is the
                    sentence the site's own metadata dropped for naming no
                    technology and describing any community organization. The
                    value proposition read "Your direct connection to the tech
                    community", retired from the title for the same reason, and
                    counted the groups by hand at 20+ against twenty-three.

                    Both now say what the site says. If the positioning moves
                    again, this is the page that hands the old version to
                    everybody else. */}
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Mission</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  DEVSA connects the people building San Antonio tech: one calendar, one public directory, one channel to follow, and one room a few times a year, governed by a volunteer board.
                </p>
              </div>
              {/* For grant forms and outreach. The same words as the problem
                  statement that opens /about; change them there and here
                  together. */}
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Short description</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  DEVSA is civic infrastructure for San Antonio&apos;s tech community: the shared calendar, the public directory, the channel to follow and the rooms where its builders find each other.
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Problem statement</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  San Antonio is one of the largest cities in the country, and it has never lacked people who build things. What it lacks is anything that connects them. Its tech groups run their own meetups, on their own calendars, for their own audiences, and most of them can&apos;t see each other. A student finishing a program, a developer new to the city, an engineer deciding whether to stay: none of them has one place to find the people doing the work they want to do. People stay where they&apos;ve found their people, and a city that can&apos;t show its builders to each other has a harder time keeping them.
                </p>
                <p className="mt-2 text-neutral-400 text-sm leading-relaxed">
                  DEVSA is the civic infrastructure for that first part: a shared calendar every group publishes to, a public directory anyone can search, one channel to follow for the groups that have none of their own, and a few rooms a year where all of it meets. A volunteer board runs it as a 501(c)(3), and the groups that use it still run themselves.
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Value Proposition</p>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  The rooms where San Antonio&apos;s builders find each other: DEVSA&apos;s conferences and the meetups of 25 community groups, from Python and Linux to AI, security, game dev and UX. One calendar makes every room easy to find, and nothing on it is a sales pitch.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
            <h3 className="text-sm font-medium text-white mb-4">Brand Voice</h3>
            <div className="space-y-3">
              {[
                { trait: "Plain and honest", desc: "Say the modest fact, and let the real one land. No sales pitch" },
                { trait: "Welcoming", desc: "Inclusive and approachable — everyone belongs" },
                { trait: "Technical", desc: "We speak developer — but keep it accessible" },
                { trait: "Community-first", desc: "People and connections over products" },
                { trait: "Action-oriented", desc: "Build, ship, contribute — not just talk" },
                { trait: "Local pride", desc: "Rooted in San Antonio, Alamo City energy" },
              ].map(({ trait, desc }) => (
                <div key={trait} className="flex gap-3">
                  <span className="text-[#ef426f] text-sm font-medium shrink-0 w-28">{trait}</span>
                  <span className="text-neutral-400 text-sm">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Writing examples */}
        <div className="border border-neutral-800/50 rounded-2xl p-6 bg-neutral-900/30">
          <h3 className="text-sm font-medium text-white mb-4">Writing Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Do</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>&quot;The next Alamo Python meetup is on the calendar&quot;</li>
                <li>&quot;25 tech groups, one calendar&quot;</li>
                <li>&quot;Find the room for what you&apos;re into&quot;</li>
              </ul>
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Don&apos;t</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>&quot;Leverage synergies in the innovation ecosystem&quot;</li>
                <li>&quot;We are the premier technology organization&quot;</li>
                <li>&quot;Disrupting the future of tech in Texas&quot;</li>
                <li>&quot;Join us at…&quot; for an event DEVSA lists but doesn&apos;t host</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Identity */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-2">Visual Identity</h2>
        <p className="text-neutral-500 text-sm mb-8">
          Key design patterns that define the DEVSA visual language.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Terminal Aesthetic */}
          <div className="border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="bg-neutral-900 p-4 border-b border-neutral-800/50">
              <div className="flex items-center gap-1 mb-3">
                <div className="w-8 h-1.5 bg-[#00b2a9] rounded-sm" />
                <div className="w-8 h-1.5 bg-[#ef426f] rounded-sm" />
                <div className="w-8 h-1.5 bg-[#ff8200] rounded-sm" />
              </div>
              <p className="text-xs font-mono text-neutral-500">
                <span className="text-[#00b2a9]">$</span> devsa --community
              </p>
            </div>
            <div className="p-4 bg-neutral-900/50">
              <p className="text-sm font-medium text-white mb-1">Terminal Aesthetic</p>
              <p className="text-xs text-neutral-500">The logo is a terminal window. Its three bars and its &gt; prompt carry into prompts and labels across the site.</p>
            </div>
          </div>

          {/* Dark-First Design */}
          <div className="border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800/50 flex items-center justify-center h-18">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/50" />
                <div className="w-8 h-8 rounded-lg bg-neutral-800" />
                <div className="w-8 h-8 rounded-lg bg-neutral-700" />
              </div>
            </div>
            <div className="p-4 bg-neutral-900/50">
              <p className="text-sm font-medium text-white mb-1">Dark-First Design</p>
              <p className="text-xs text-neutral-500">Neutral 950 pages, neutral 900 cards and quiet borders. Color comes from the logo&apos;s accents, used sparingly.</p>
            </div>
          </div>

          {/* Readable contrast: the measured floor from the design system. */}
          <div className="border border-neutral-800/50 rounded-2xl overflow-hidden">
            <div className="bg-neutral-900 p-4 border-b border-neutral-800/50 flex items-center justify-center gap-3 h-18">
              <span className="text-sm text-white">100</span>
              <span className="text-sm text-white/70">70</span>
              <span className="text-sm text-white/50">50</span>
              <span className="text-sm text-white/30 line-through">30</span>
            </div>
            <div className="p-4 bg-neutral-900/50">
              <p className="text-sm font-medium text-white mb-1">Readable Contrast</p>
              <p className="text-xs text-neutral-500">White text never drops below 50% opacity on dark backgrounds, the measured minimum for accessible contrast. Fainter is for dividers, never words.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 pb-24">
        <div className="border border-neutral-800/50 rounded-2xl p-8 bg-neutral-900/30 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Need something specific?</h2>
          <p className="text-neutral-500 text-sm mb-5 max-w-3xl mx-auto">
            For press inquiries, partnership materials, or custom assets, reach out to the DEVSA team.
          </p>
          <a
            href="mailto:jesse@devsanantonio.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#ef426f] hover:bg-[#d93a62] rounded-xl transition-colors"
          >
            Contact Us
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}
