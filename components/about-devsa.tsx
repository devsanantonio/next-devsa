"use client"

import { motion } from "motion/react"
import { Play, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MORE_HUMAN_RECAP_VIDEO } from "@/data/events"
import { boardMembers } from "@/data/board"

// Resized 16:9 poster in public/photos/ — the S3 original is a 2180x1454 camera
// frame, ~40x the bytes for a poster that never renders above ~1100px.
const VIDEO_POSTER = "/photos/about-poster.webp"

export function AboutDevsa() {
  const [playing, setPlaying] = useState(false)

  return (
    <section
      id="about-devsa"
      className="w-full bg-white py-16 md:py-24 lg:py-28 relative overflow-hidden"
      data-bg-type="light"
    >
      <div className="relative z-10 page-shell space-y-10 md:space-y-14">
        {/* The video leads — carries the hero's visual momentum straight into
            About and introduces "who we are" before any framing copy. Founder
            quote overlays on desktop; sits below on mobile. */}
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-black/5"
        >
          {playing ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              autoPlay
              controls
              playsInline
              poster={VIDEO_POSTER}
              className="absolute inset-0 w-full h-full"
            >
              <source src={MORE_HUMAN_RECAP_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 h-full w-full cursor-pointer text-left"
              aria-label="Play the More Human Than Human recap"
            >
              <Image
                src={VIDEO_POSTER}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                decoding="async"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Scrim for caption legibility */}
              <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />

              {/* Play button */}
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white md:h-24 md:w-24">
                <Play className="ml-1 h-7 w-7 fill-gray-900 text-gray-900 md:h-8 md:w-8" />
              </span>

              {/* Founder quote — overlaid on the video on desktop only (on
                  mobile it sits below the video so the play button never
                  covers it) */}
              <span className="hidden md:block absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10 lg:p-12">
                <span className="block max-w-[96rem] text-balance text-base font-light italic leading-[1.4] text-white sm:text-lg md:text-xl lg:text-2xl">
                  &ldquo;DEVSA is never going to be the final destination.
                  It&apos;s the platform that allows you to find your people, to
                  help build your future, to build your network.&rdquo;
                </span>
                <span className="mt-3 block text-xs font-medium uppercase tracking-[0.15em] text-white/70 md:mt-4 md:text-sm">
                  Jesse Hernandez, Founder
                </span>
              </span>
            </button>
          )}
        </motion.div>

        {/* Founder quote — shown below the video on mobile (overlaid on desktop) */}
        <div className="md:hidden border-l-4 border-gray-900 pl-5 max-w-3xl">
          <p className="text-lg text-gray-900 leading-[1.4] font-light italic">
            &ldquo;DEVSA is never going to be the final destination. It&apos;s
            the platform that allows you to find your people, to help build
            your future, to build your network.&rdquo;
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
            Jesse Hernandez, Founder
          </p>
        </div>

        {/* Mission — the video earned the emotion; now the framing copy lands.
            The 501(c)(3) credential lives in the lead paragraph. */}
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Two lines, and a wider measure to hold them.

              At max-w-4xl this heading had 896px to run in while the shell
              around it is nearer 1380, so text-balance evened it into three
              short lines and left most of the row empty on a laptop or a
              monitor. Widening the measure and breaking it deliberately fills
              that space and puts the break where the sentence has its hinge —
              the city on one line, what DEVSA serves on the next.

              `block` rather than a <br />, so each line is still one element
              and can wrap inside itself at tablet and phone widths without the
              pair coming apart. text-balance stays for that case; with the
              lines explicit it does nothing at desktop width.

              The lead paragraph below keeps its own max-w-3xl: a 1280px
              measure is right for a 72px heading and much too wide for 24px
              body copy. */}
          <div className="space-y-6 max-w-7xl">
            <h2 className="text-balance font-sans text-gray-900 leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              <span className="block">
                Built to{" "}
                <span className="text-gray-600 font-light italic">Serve</span>{" "}
                San Antonio&apos;s
              </span>
              <span className="block">Tech Communities.</span>
            </h2>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-700 leading-[1.4] font-light">
              DEVSA is the 501(c)(3) bridge across San Antonio&apos;s tech
              ecosystem —{" "}
              <strong className="font-semibold text-gray-900">
                one shared calendar and one public directory
              </strong>
              , open to every grassroots group in the city.
            </p>
          </div>

          {/* The distinction, as two columns rather than one paragraph.

              This was a single block of about sixty words carrying three
              separate ideas — that DEVSA does not replace the groups, that the
              workshops are theirs, and that what DEVSA runs is conferences and
              pop-ups. All true, all load-bearing, and all of it skipped: it sat
              below a video on a page people scroll, in one undifferentiated
              run of prose at the size this section uses for supporting detail.

              Split, it is the page's own thesis made visible. A reader who
              stops for two seconds gets the two labels, which is the whole
              argument; a reader who stops for ten gets the detail under them.
              Nothing was cut.

              No count in the lead any more either. It said "20+ grassroots
              groups" against a Firestore figure of twenty-three — the last
              hardcoded one the homepage carried in copy — and a number cannot
              be read live here, because this is a client tree and the only
              /api/communities call on the page belongs to EcosystemShowcase.
              "Every grassroots group in the city" is both truer and the claim
              the site already makes on /events and in HeroCommunities.

              The conferences are not counted here on purpose: DevsaConferences
              says "Four Conferences. Built Here." two sections below, and a
              second hardcoded four is a second thing to update.

              The channels and the partner relationships are named in this
              column because without them it lists outputs and never the asset
              that produces them — a reader finishes it thinking DEVSA is a
              website and some events. The reach is the standing contribution
              to every group, and the relationships are what a group draws on
              when it asks for a venue or a speaker.

              Neither is asserted on its own. "Strategic partnerships" is the
              register this site has spent several passes removing, so the
              relationships are cashed out in the same sentence by the two
              pop-ups they produced, both of which a reader can click. */}
          <div className="grid max-w-4xl gap-8 sm:grid-cols-2 sm:gap-10">
            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                The Groups Run
              </p>
              {/* The order here is the correction.

                  This said "DEVSA brings the room, someone who can teach and
                  the network", which reads as three things supplied as a
                  matter of course. Only one of them is. What DEVSA does for
                  every group, every time, is carry their event to its own
                  audience — the calendar and the social channels reaching
                  people the group's own channels do not. The venue and the
                  speaker are the escalation: real, and provided when a group
                  asks, not standing. Listing all three flat overstated the
                  routine contribution and undersold the reach, which is the
                  one DEVSA actually controls. */}
              <p className="mt-3 text-base md:text-lg text-gray-600 leading-relaxed">
                Their own meetups and workshops, with their own people and their
                own subject. DEVSA carries it to the builders who would want to
                be there, and finds a room or someone to teach when a group asks
                for one.{" "}
                <span className="font-medium text-gray-900">
                  They run the session.
                </span>
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                DEVSA Runs
              </p>
              <p className="mt-3 text-base md:text-lg text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-900">
                  The calendar, the public directory and the channels that carry
                  them.
                </span>{" "}
                Its own conferences. And the partner relationships that become
                pop-ups:{" "}
                <Link
                  href="/buildingtogether#partner"
                  className="font-medium text-gray-700 underline underline-offset-2 decoration-gray-300 transition-colors hover:text-gray-900 hover:decoration-gray-500"
                >
                  SheBuilds
                </Link>{" "}
                with Lovable, and most recently{" "}
                <Link
                  href="/events/zero-to-agent"
                  className="font-medium text-gray-700 underline underline-offset-2 decoration-gray-300 transition-colors hover:text-gray-900 hover:decoration-gray-500"
                >
                  Zero to Agent
                </Link>{" "}
                with Vercel.
              </p>
            </div>
          </div>

          {/* CTAs — Community Calendar leads (subscribe / embed / RSS);
              Support DEVSA is the secondary action. It took the slot the
              coworking space held until the room closed. */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 pt-2">
            <Link
              href="/events"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg bg-gray-900 text-white font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-800"
            >
              Community Calendar
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/buildingtogether#donate"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold sm:font-medium text-sm transition-colors duration-200 hover:bg-gray-50 hover:border-gray-400"
            >
              Support DEVSA
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Who is accountable, directly under the ask.

              This page asks a stranger for money one button up and, until
              this, named nobody. The founder quote above is one voice; a
              donation is a question about governance. /buildingtogether has
              carried the board all along, which is the wrong way round — the
              people who need the credential most are the ones who have not
              clicked through yet.

              A strip, not a second copy of that section: three faces and a
              way through, so the homepage borrows the credibility without
              duplicating the page that holds it. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-6">
            <div className="flex -space-x-2.5">
              {boardMembers.map((member) => (
                <span
                  key={member.name}
                  className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              A volunteer board governs DEVSA and every program it funds.{" "}
              <Link
                href="/buildingtogether#team"
                className="font-medium text-gray-900 underline underline-offset-2 transition-colors hover:text-gray-700"
              >
                Meet them
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
