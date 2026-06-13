"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import {
  DiscordIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  GitHubIcon,
} from "@/components/icons/social-icons"
import {
  BRAND_QUOTE,
  BRAND_VIDEO_POSTER,
  BRAND_VIDEO_URL,
  SOCIAL_LINKS,
  SPOTLIGHTS,
  type SocialLink,
} from "@/data/stay-connected"

const ICONS: Record<SocialLink["icon"], React.FC<React.SVGProps<SVGSVGElement>>> = {
  discord: DiscordIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  github: GitHubIcon,
}

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
}

type LinkItem = { key: string; title: string; href: string; accent: string; cta: string }

// A slide with multiple events expands into one link per event.
function toLinks(s: (typeof SPOTLIGHTS)[number]): LinkItem[] {
  return s.events
    ? s.events.map((e) => ({
        key: e.name,
        title: e.name,
        href: e.href,
        accent: e.accent,
        cta: "View event",
      }))
    : [{ key: s.key, title: s.title, href: s.href, accent: s.accent, cta: s.cta }]
}

function LinkList({ links }: { links: LinkItem[] }) {
  return (
    <div className="space-y-3">
      {links.map((s, i) => {
        const external = s.href.startsWith("http")
        const cardClass =
          "group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-left transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-100"
        const inner = (
          <>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.accent }}
            />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-neutral-900">
                {s.title}
              </span>
              <span className="block text-xs text-neutral-500">{s.cta}</span>
            </span>
            {external ? (
              <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-colors duration-200 group-hover:text-neutral-700" />
            ) : (
              <ArrowRight className="h-4 w-4 text-neutral-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-neutral-700" />
            )}
          </>
        )
        return (
          <motion.div
            key={s.key}
            {...fade}
            transition={{ duration: 0.5, delay: 0.05 * i }}
          >
            {external ? (
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                {inner}
              </a>
            ) : (
              <Link href={s.href} className={cardClass}>
                {inner}
              </Link>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export function Linktree() {
  const happening = SPOTLIGHTS.filter((s) => s.group === "happening").flatMap(toLinks)
  const explore = SPOTLIGHTS.filter((s) => s.group === "explore").flatMap(toLinks)

  return (
    <section
      data-bg-type="light"
      className="w-full bg-white px-6 py-16 md:py-24"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        {/* Core message */}
        <motion.div {...fade} transition={{ duration: 0.6 }} className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Building Together
          </p>
          <h2 className="text-balance font-sans text-3xl font-black leading-[1.1] tracking-[-0.02em] text-neutral-900 md:text-5xl">
            Find Your People.{" "}
            <span className="font-normal italic text-neutral-500">Build Your</span>{" "}
            Future.
          </h2>
          <p className="text-balance text-base leading-relaxed text-neutral-600 md:text-lg">
            DEVSA bridges the gap between{" "}
            <strong className="font-semibold text-neutral-900">passionate builders</strong>,
            local partners, and the growing tech ecosystem in San&nbsp;Antonio.
            Discover communities, events, and resources — all in one place.
          </p>
        </motion.div>

        {/* Video — leads the linktree */}
        <motion.div
          {...fade}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 w-full"
        >
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">
            <video
              src={BRAND_VIDEO_URL}
              poster={BRAND_VIDEO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="aspect-video w-full bg-neutral-100 object-cover"
            />
          </div>
          <figure className="mt-5">
            <blockquote className="text-balance text-lg font-light italic leading-relaxed text-neutral-700 md:text-xl">
              &ldquo;{BRAND_QUOTE}&rdquo;
            </blockquote>
          </figure>
        </motion.div>

        {/* What's happening — announcements & events */}
        <div className="mt-10 w-full">
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            What&apos;s happening
          </p>
          <LinkList links={happening} />
        </div>

        {/* Explore DEVSA — evergreen */}
        <div className="mt-8 w-full">
          <p className="mb-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Explore DEVSA
          </p>
          <LinkList links={explore} />
        </div>

        {/* Social links */}
        <div className="mt-8 w-full space-y-3">
          <p className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Follow along
          </p>
          {SOCIAL_LINKS.map((s, i) => {
            const Icon = ICONS[s.icon]
            return (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                {...fade}
                transition={{ duration: 0.5, delay: 0.05 * i }}
                className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-left transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white transition-colors group-hover:bg-neutral-800">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">
                    {s.label}
                  </span>
                  <span className="block text-xs text-neutral-500">{s.handle}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-all duration-200 group-hover:text-neutral-700" />
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
