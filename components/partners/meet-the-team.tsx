"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { boardMembers } from "@/data/board"


export function MeetTheTeam() {
  return (
    <section
      id="team"
      className="scroll-mt-20 bg-black border-b border-gray-800"
      data-bg-type="dark"
    >
      <div className="page-shell py-16 sm:py-20 md:py-24 lg:py-28">
        {/* Intro text */}
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-14 md:mb-20"
        >
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm md:text-base font-medium text-white/40 uppercase tracking-[0.2em]">
              Meet the Team
            </p>
            <h2 className="font-sans text-white leading-[0.95] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.02em]">
              A 501(c)(3) Nonprofit{" "}
              <span className="text-white/50 font-light italic">
                Built for
              </span>{" "}
              the Active Builders.
            </h2>
          </div>

          <div className="space-y-6 max-w-3xl mt-8">
            {/* "Built for the Active Builders", not "Built on Education".
            
                The headline said education and the paragraph said "through
                education workshops, events, and resources" — the one claim
                this page spends three sections disowning. How It Works, two
                scrolls up, is explicit that the teaching is somebody else's:
                "The people who can teach — from the people DEVSA knows.
                learnOPENtech ran two and a half hours on Linux." A headline
                taking credit for it contradicted the argument underneath it.
            
                What replaced it is the thing every other block on this page is
                also pointed at. Partners want access to the active builders.
                The groups want to be found by them. The builders are looking
                for the groups, and for the learners coming up behind them.
                Three asks, one object — and DEVSA is the channel they meet on.
                Naming that is more useful than naming a charitable category,
                and it is the same object PartnerCta and DonationCta name.
            
                "resources" went with it — the vague noun already removed from
                the metadata, the footer and the hero — and so did "every
                program", which implies DEVSA operates programmes when the
                claim is that it operates a calendar, a directory, a room and
                its own conferences, and deliberately not the groups.
            
                The paragraph also carried a typo for as long as it existed:
                "through education workshops" was missing either a comma or the
                "al" on "educational". */}
            <p className="text-xl md:text-2xl text-white/70 leading-[1.4] font-light">
              DEVSA is a registered{" "}
              <strong className="font-semibold text-white">
                501(c)(3) nonprofit
              </strong>{" "}
              with one constituency: the people actually building here.
              Partners want to reach them. Community groups want to be found by
              them. The builders are looking for the groups — and for the
              learners coming up behind them.
            </p>
            <p className="text-base md:text-lg text-white/50 leading-relaxed">
              DEVSA is the channel all three meet on, and the board holds that
              line. The calendar, the public directory and the conferences are
              judged on one question: do they put those people in the same
              room?
            </p>
          </div>
        </motion.div>

        {/* Board members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
          {boardMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-3/4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-white/50 font-medium mt-1">
                    {member.role}
                  </p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm text-white/40 hover:text-white transition-colors mt-2"
                    >
                      LinkedIn &rarr;
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
